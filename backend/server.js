// ================================================================
// MEERA AI STUDIO — server.js
// Complete Node.js + Express backend
//
// WHAT THIS FILE DOES:
// - Connects to MongoDB (database for users, products, jobs)
// - Handles user registration, login, subscriptions
// - Verifies Paystack payments (cards, bank transfer, USSD)
// - Manages vendor products, payout requests
// - Sends emails (welcome, expiry warnings, job alerts)
// - Powers podcast publish to YouTube, TikTok, Facebook APIs
// - SEO page generator, email campaigns, trivia coin rewards
//
// HOW TO RUN:
//   1. Open terminal in VS Code (Ctrl + `)
//   2. cd backend
//   3. node server.js
//   4. You will see: MEERA Server running on port 5000
// ================================================================

// ── STEP 1: IMPORT PACKAGES ─────────────────────────────────────
// These are installed with: npm install (see GUIDE.md Step 7)
const express    = require('express');       // Web server framework
const mongoose   = require('mongoose');      // MongoDB database connector
const bcrypt     = require('bcryptjs');      // Password encryption
const jwt        = require('jsonwebtoken'); // Login token generator
const cors       = require('cors');          // Allow frontend to talk to backend
const multer     = require('multer');        // File upload handler
const nodemailer = require('nodemailer');    // Email sender
const axios      = require('axios');         // HTTP requests to external APIs
const path       = require('path');          // File path utilities
const fs         = require('fs');            // File system utilities
require('dotenv').config();                  // Load secret keys from .env file

// ── STEP 2: CREATE THE EXPRESS APP ──────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5000;

// ── STEP 3: MIDDLEWARE ───────────────────────────────────────────
// Allow requests from your HTML frontend
app.use(cors({
  origin: '*', // In production change to: 'https://your-site.netlify.app'
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON from request body (so req.body works)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files publicly
// e.g. http://localhost:5000/uploads/products/my-image.jpg
app.use(express.static('../'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create upload folders if they don't exist
['uploads', 'uploads/products', 'uploads/podcast', 'uploads/avatars'].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── STEP 4: FILE UPLOAD SETUP ────────────────────────────────────
// Multer handles image uploads from vendor product form
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Choose folder based on fieldname
    const folder = file.fieldname === 'podcast' ? 'uploads/podcast' : 'uploads/products';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    // Name file with timestamp to avoid duplicates
    const safeName = Date.now() + '-' + file.originalname.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    cb(null, safeName);
  }
});

// Only allow safe file types
const fileFilter = (req, file, cb) => {
  const allowedImages = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const allowedAudio  = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/mp4'];
  const allowedVideo  = ['video/mp4', 'video/webm'];
  const allowed       = [...allowedImages, ...allowedAudio, ...allowedVideo];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not allowed. Use JPG, PNG, MP3, MP4 or WAV.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // Max 50MB per file
});

// ── STEP 5: CONNECT TO MONGODB ───────────────────────────────────
// MongoDB Atlas (free cloud database) — get URI from mongodb.com/atlas
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/meera_ai';

mongoose.connect(MONGO_URI, {
  useNewUrlParser:    true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected!'))
.catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  console.log('📌 Add your MONGO_URI to .env file');
  console.log('📌 Get a free URI at: https://mongodb.com/atlas');
});

// ── STEP 6: DATABASE MODELS (Schemas) ────────────────────────────

// USER MODEL — stores all registered users
const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // Always hashed, never plain text

  // Role: user, vendor, or admin
  role: { type: String, default: 'user', enum: ['user', 'vendor', 'admin'] },

  // Subscription details
  tier:               { type: String, default: 'free', enum: ['none','free','basic','pro'] },
  subscriptionPlan:   { type: String, default: null },
  subscriptionStart:  { type: Date,   default: null },
  subscriptionExpiry: { type: Date,   default: null },

  // Free trial (2 weeks from registration)
  trialStart:  { type: Date, default: Date.now },
  trialExpiry: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },

  // Daily upload tracking (resets each day)
  dailyUploads:   { type: Number, default: 0 },
  lastUploadDate: { type: String, default: null }, // 'YYYY-MM-DD'

  // Gamification
  coins:       { type: Number, default: 0 },
  lastSpinDate:{ type: String, default: null },
  triviaScore: { type: Number, default: 0 },

  // Referral system
  refCode:          { type: String, default: null },
  referredBy:       { type: String, default: null },
  referralEarnings: { type: Number, default: 0 },
  referralCount:    { type: Number, default: 0 },

  // Vendor-specific fields
  social1:       { type: String, default: null },
  social2:       { type: String, default: null },
  vendorApproved:{ type: Boolean,default: false },
  balance:       { type: Number, default: 0 }, // Vendor earnings balance in USD

  // Job alerts
  jobAlerts: [{ type: String }], // Array of job categories they want alerts for
  alertEmail:{ type: String, default: null },

  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// PRODUCT MODEL — marketplace products uploaded by vendors
const productSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  desc:       { type: String, required: true },
  price:      { type: Number, required: true },
  category:   { type: String, required: true },
  type:       { type: String, default: 'digital', enum: ['digital', 'physical'] },
  imageUrl:   { type: String, default: null },  // Path to product thumbnail
  fileUrl:    { type: String, default: null },   // Path to digital download file
  whatsapp:   { type: String, default: null },   // WhatsApp number for physical products
  social1:    { type: String, default: null },
  social2:    { type: String, default: null },
  vendorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorName: { type: String },
  approved:   { type: Boolean, default: false }, // Admin must approve first
  downloads:  { type: Number,  default: 0 },
  views:      { type: Number,  default: 0 },
  clicks:     { type: Number,  default: 0 },
  rating:     { type: Number,  default: 5.0 },
  createdAt:  { type: Date,    default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// TRANSACTION MODEL — records all payments
const transactionSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type:      { type: String, enum: ['subscription','product','payout','course','vendor_fee'] },
  plan:      { type: String, default: null },
  amount:    { type: Number },
  currency:  { type: String, default: 'NGN' },
  reference: { type: String },
  status:    { type: String, default: 'pending', enum: ['pending','success','failed'] },
  createdAt: { type: Date,   default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// PAYOUT MODEL — vendor withdrawal requests
const payoutSchema = new mongoose.Schema({
  vendorId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount:    { type: Number },
  method:    { type: String, default: 'paystack' },
  bankCode:  { type: String, default: null },
  accountNo: { type: String, default: null },
  status:    { type: String, default: 'pending', enum: ['pending','processing','paid','failed'] },
  reference: { type: String, default: null },
  createdAt: { type: Date,   default: Date.now }
});

const Payout = mongoose.model('Payout', payoutSchema);

// JOB ALERT MODEL — users who signed up for job notifications
const jobAlertSchema = new mongoose.Schema({
  email:    { type: String, required: true },
  category: { type: String, default: 'all' },
  active:   { type: Boolean, default: true },
  createdAt:{ type: Date, default: Date.now }
});

const JobAlert = mongoose.model('JobAlert', jobAlertSchema);

// PODCAST MODEL — podcast episodes created by users
const podcastSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title:      { type: String, required: true },
  description:{ type: String },
  audioUrl:   { type: String, default: null },
  thumbnailUrl:{ type: String, default: null },
  duration:   { type: Number, default: 0 }, // in seconds
  language:   { type: String, default: 'en' },
  publishedTo: [{ type: String }], // ['youtube', 'tiktok', 'facebook']
  chapters:   [{ time: Number, title: String }],
  transcript: { type: String, default: null },
  views:      { type: Number, default: 0 },
  createdAt:  { type: Date, default: Date.now }
});

const Podcast = mongoose.model('Podcast', podcastSchema);

// ── STEP 7: HELPER FUNCTIONS ─────────────────────────────────────

// Generate a JWT login token for a user
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'meera_secret_key_change_this_in_production',
    { expiresIn: '30d' }
  );
}

// Middleware: protect routes that require login
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
  if (!token) return res.status(401).json({ success: false, message: 'Login required' });
  jwt.verify(token, process.env.JWT_SECRET || 'meera_secret_key_change_this_in_production', (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Token expired. Please login again.' });
    req.userId = decoded.id;
    next();
  });
}

// Check if a subscription is still active
function isSubscriptionActive(user) {
  if (user.tier === 'free') {
    return new Date() < new Date(user.trialExpiry);
  }
  if (user.subscriptionExpiry) {
    return new Date() < new Date(user.subscriptionExpiry);
  }
  return false;
}

// How many videos a user can upload per day based on tier
function getUploadLimit(tier) {
  const limits = { none: 0, free: 3, basic: 5, pro: 999 };
  return limits[tier] || 0;
}

// Generate a unique referral code
function generateRefCode(name) {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
  return 'MEERA_' + clean + Math.floor(1000 + Math.random() * 9000);
}

// ── STEP 8: EMAIL SETUP ──────────────────────────────────────────
// Uses Gmail to send welcome, expiry, and job alert emails
// Get Gmail App Password: myaccount.google.com → Security → App Passwords
const emailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your.email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your_gmail_app_password'
  }
});

async function sendEmail(to, subject, html) {
  try {
    await emailer.sendMail({
      from: `"MEERA AI Studio" <${process.env.EMAIL_USER}>`,
      to, subject, html
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error('📧 Email error (non-critical):', err.message);
    // Email errors don't crash the server
  }
}

// ── STEP 9: API ROUTES ───────────────────────────────────────────
// Routes = URLs your frontend calls to do things
// Format: METHOD /path → handler function

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// Test that server is running: http://localhost:5000/api/health
// ═══════════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🎬 MEERA AI Studio server is running!',
    version: '3.0',
    time:    new Date().toISOString()
  });
});

// ═══════════════════════════════════════════════════════════════
// USER REGISTRATION
// Called when user fills in the "Create Free Account" form
// ═══════════════════════════════════════════════════════════════
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, refCode } = req.body;

    // Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are all required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    // Check if email already registered
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Try logging in.' });
    }

    // Hash the password (NEVER store plain text passwords)
    const hashedPw = await bcrypt.hash(password, 12);

    // Create the user
    const user = new User({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password: hashedPw,
      tier:     'free',
      refCode:  generateRefCode(name),
      referredBy: refCode || null
    });
    await user.save();

    // Reward the person who referred this user
    if (refCode) {
      const referrer = await User.findOne({ refCode });
      if (referrer) {
        referrer.coins            += 100;  // 100 coins for referring
        referrer.referralEarnings += 2;    // $2 cash commission
        referrer.referralCount    += 1;
        await referrer.save();
        // Notify referrer by email
        await sendEmail(
          referrer.email,
          '🎉 Someone joined MEERA using your referral link!',
          `<h2>Hi ${referrer.name}!</h2>
           <p><strong>${name}</strong> just joined MEERA using your referral link.</p>
           <p>You earned: <strong>$2 commission + 100 MEERA coins!</strong></p>
           <p>Keep sharing your referral link to earn more: <strong>${referrer.refCode}</strong></p>`
        );
      }
    }

    // Send welcome email to new user
    await sendEmail(
      email,
      '🎬 Welcome to MEERA AI Studio — Your Free Trial Has Started!',
      `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#F5F0E8;padding:32px;border-radius:16px">
        <h1 style="color:#8B5E3C">Welcome to MEERA, ${name}! 🎉</h1>
        <p>Your <strong>2-week free trial</strong> has started. Here's what you can do right now:</p>
        <ul>
          <li>🎬 Make AI movies from text stories</li>
          <li>🎵 Generate music (hip-hop, afro, blues, sad songs)</li>
          <li>💬 Auto-subtitle any video in 50+ languages</li>
          <li>📱 Edit photos on mobile</li>
          <li>💼 Browse the jobs board free forever</li>
          <li>🧠 Take quizzes and win MEERA coins</li>
        </ul>
        <p><strong>After 14 days, upgrade to keep creating:</strong></p>
        <ul>
          <li>Basic Plan: $20/month (5 uploads/day + social tools)</li>
          <li>Pro Plan: $30/month (unlimited + ALL 38+ tools)</li>
        </ul>
        <p>Your referral code: <strong style="color:#8B5E3C">${user.refCode}</strong></p>
        <p>Share it and earn <strong>$2 per person who joins!</strong></p>
        <a href="${process.env.SITE_URL || 'http://localhost:5500'}#studio"
           style="background:#8B5E3C;color:white;padding:14px 28px;text-decoration:none;border-radius:99px;display:inline-block;margin-top:16px">
          Start Creating Now →
        </a>
      </div>`
    );

    // Return token and user data (without password)
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      message: 'Account created! Your 2-week free trial has started.',
      token,
      user: {
        id:           user._id,
        name:         user.name,
        email:        user.email,
        tier:         user.tier,
        trialExpiry:  user.trialExpiry,
        coins:        user.coins,
        refCode:      user.refCode
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// USER LOGIN
// ═══════════════════════════════════════════════════════════════
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email.' });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Incorrect password.' });
    }

    // Auto-downgrade if subscription expired
    if (user.tier !== 'free' && user.tier !== 'none' && user.subscriptionExpiry) {
      if (new Date() > new Date(user.subscriptionExpiry)) {
        user.tier = 'none';
        await user.save();
        // Send renewal reminder email
        await sendEmail(
          user.email,
          '⚠️ Your MEERA Subscription Has Expired',
          `<h2>Hi ${user.name},</h2>
           <p>Your MEERA subscription has expired. Your paid tools are now locked.</p>
           <p>Renew now to keep creating:</p>
           <a href="${process.env.SITE_URL || 'http://localhost:5500'}#pricing"
              style="background:#8B5E3C;color:white;padding:12px 24px;text-decoration:none;border-radius:99px">
              Renew My Plan →
           </a>`
        );
      }
    }

    // Also expire free trial if over
    if (user.tier === 'free' && new Date() > new Date(user.trialExpiry)) {
      user.tier = 'none';
      await user.save();
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id:                 user._id,
        name:               user.name,
        email:              user.email,
        tier:               user.tier,
        role:               user.role,
        subscriptionExpiry: user.subscriptionExpiry,
        trialExpiry:        user.trialExpiry,
        coins:              user.coins,
        balance:            user.balance,
        refCode:            user.refCode,
        uploadLimit:        getUploadLimit(user.tier)
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// ACTIVATE SUBSCRIPTION (after Paystack payment confirmed)
// Frontend calls this after Paystack callback
// ═══════════════════════════════════════════════════════════════
app.post('/api/subscribe', async (req, res) => {
  try {
    const { userId, plan, reference } = req.body;
    if (!userId || !plan || !reference) {
      return res.status(400).json({ success: false, message: 'userId, plan and reference are required.' });
    }

    // Verify payment with Paystack API
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    const txData = paystackRes.data.data;
    if (txData.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment not confirmed by Paystack.' });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Set subscription based on plan
    const now    = new Date();
    let expiry   = new Date(now);
    let tierName = 'basic';
    let label    = '';

    if (plan === 'basic_monthly') {
      expiry.setDate(expiry.getDate() + 30);
      tierName = 'basic';
      label    = 'Basic Plan ($20/month)';
    } else if (plan === 'pro_monthly') {
      expiry.setDate(expiry.getDate() + 30);
      tierName = 'pro';
      label    = 'Pro Plan ($30/month)';
    } else if (plan === 'vendor_monthly') {
      expiry.setDate(expiry.getDate() + 30);
      user.vendorApproved = true;
      user.role           = 'vendor';
      label               = 'Vendor Plan ($6/month)';
    }

    user.tier               = tierName;
    user.subscriptionPlan   = plan;
    user.subscriptionStart  = now;
    user.subscriptionExpiry = expiry;
    await user.save();

    // Save transaction record
    await new Transaction({
      userId:    user._id,
      type:      'subscription',
      plan,
      amount:    txData.amount / 100,
      currency:  txData.currency,
      reference: txData.reference,
      status:    'success'
    }).save();

    // Send confirmation email
    await sendEmail(
      user.email,
      `🎉 ${label} Activated — MEERA AI Studio`,
      `<h2>Hi ${user.name}! Your plan is now active 🚀</h2>
       <p><strong>Plan:</strong> ${label}</p>
       <p><strong>Valid until:</strong> ${expiry.toDateString()}</p>
       <p>All your tools are unlocked. Go create something amazing!</p>
       <a href="${process.env.SITE_URL || 'http://localhost:5500'}#studio"
          style="background:#8B5E3C;color:white;padding:12px 24px;text-decoration:none;border-radius:99px">
          Open Studio →
       </a>`
    );

    res.json({
      success: true,
      message: `${label} activated! Valid until ${expiry.toDateString()}.`,
      user:    { id: user._id, tier: tierName, subscriptionExpiry: expiry }
    });

  } catch (err) {
    console.error('Subscribe error:', err.message);
    res.status(500).json({ success: false, message: 'Could not activate subscription. Contact support.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// VERIFY PRODUCT PAYMENT
// Called after buyer pays for a marketplace product
// ═══════════════════════════════════════════════════════════════
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { reference, productId, userId } = req.body;

    // Verify with Paystack
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    if (paystackRes.data.data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Payment not confirmed.' });
    }

    // Update product download count
    const product = await Product.findById(productId);
    if (product) {
      product.downloads += 1;
      await product.save();

      // Add 80% of sale price to vendor balance (MEERA keeps 20%)
      const vendorEarnings = product.price * 0.8;
      await User.findByIdAndUpdate(product.vendorId, { $inc: { balance: vendorEarnings } });

      // Save transaction
      await new Transaction({
        userId,
        vendorId:  product.vendorId,
        type:      'product',
        amount:    product.price,
        reference,
        status:    'success'
      }).save();

      // Notify vendor of sale
      const vendor = await User.findById(product.vendorId);
      if (vendor) {
        await sendEmail(
          vendor.email,
          `💰 You just made a sale on MEERA!`,
          `<h2>Congratulations ${vendor.name}! 🎉</h2>
           <p>Your product <strong>"${product.name}"</strong> was just purchased!</p>
           <p>You earned: <strong>$${vendorEarnings.toFixed(2)}</strong> (added to your balance)</p>
           <p>Log in to your vendor dashboard to track your earnings.</p>`
        );
      }
    }

    res.json({ success: true, message: 'Payment verified! Product download unlocked.' });

  } catch (err) {
    console.error('Payment verify error:', err.message);
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// CHECK SUBSCRIPTION STATUS
// Frontend calls this on page load to check if tier is still valid
// ═══════════════════════════════════════════════════════════════
app.get('/api/subscription/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ success: false });

    let tier   = user.tier;
    const now  = new Date();

    // Check if free trial expired
    if (tier === 'free' && now > new Date(user.trialExpiry)) tier = 'none';

    // Check if paid subscription expired
    if (['basic','pro'].includes(tier) && user.subscriptionExpiry) {
      if (now > new Date(user.subscriptionExpiry)) {
        tier = 'none';
        await User.findByIdAndUpdate(user._id, { tier: 'none' });
      }
    }

    res.json({
      success:      true,
      tier,
      uploadLimit:  getUploadLimit(tier),
      expiry:       user.subscriptionExpiry || user.trialExpiry,
      daysLeft:     user.subscriptionExpiry
        ? Math.max(0, Math.ceil((new Date(user.subscriptionExpiry) - now) / (1000*60*60*24)))
        : null
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ═══════════════════════════════════════════════════════════════
// SUBMIT PRODUCT (Vendor uploads a product)
// ═══════════════════════════════════════════════════════════════
app.post('/api/products/submit',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'file',  maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { name, desc, price, category, whatsapp, social1, social2, vendorId } = req.body;
      if (!name || !desc || !price) {
        return res.status(400).json({ success: false, message: 'Name, description and price are required.' });
      }

      const imageUrl = req.files?.image ? `/uploads/products/${req.files.image[0].filename}` : null;
      const fileUrl  = req.files?.file  ? `/uploads/products/${req.files.file[0].filename}`  : null;

      let vendorName = 'Unknown Vendor';
      if (vendorId) {
        const v = await User.findById(vendorId);
        if (v) vendorName = v.name;
      }

      const product = new Product({
        name, desc,
        price:      parseFloat(price),
        category:   category?.toLowerCase() || 'general',
        type:       category === 'Physical Product' ? 'physical' : 'digital',
        whatsapp,   social1, social2,
        imageUrl,   fileUrl,
        vendorId:   vendorId || null,
        vendorName,
        approved:   false // Admin must approve before it goes live
      });
      await product.save();

      // Notify admin of new product submission
      await sendEmail(
        process.env.ADMIN_EMAIL || 'admin@meera.ai',
        `📦 New Product Submission: "${name}"`,
        `<h3>New product submitted for review</h3>
         <p><strong>Product:</strong> ${name}</p>
         <p><strong>Vendor:</strong> ${vendorName}</p>
         <p><strong>Price:</strong> $${price}</p>
         <p><strong>Category:</strong> ${category}</p>
         <p>Log in to admin panel to approve or reject.</p>`
      );

      res.json({ success: true, message: 'Product submitted! Awaiting admin approval.', productId: product._id });

    } catch (err) {
      console.error('Product submit error:', err);
      res.status(500).json({ success: false, message: 'Could not save product.' });
    }
  }
);

// ═══════════════════════════════════════════════════════════════
// GET ALL APPROVED PRODUCTS
// ═══════════════════════════════════════════════════════════════
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { approved: true };

    if (category) query.category = category;
    if (search)   query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { desc: { $regex: search, $options: 'i' } }
    ];

    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc')  sortObj = { price: 1 };
    if (sort === 'price-desc') sortObj = { price: -1 };
    if (sort === 'popular')    sortObj = { downloads: -1 };

    const products = await Product.find(query).sort(sortObj).limit(50);
    res.json({ success: true, products });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not fetch products.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// VENDOR APPLICATION
// ═══════════════════════════════════════════════════════════════
app.post('/api/vendor/apply', async (req, res) => {
  try {
    const { name, email, social1, social2 } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email required.' });
    }

    // Update user record with social links if they exist
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      if (social1) user.social1 = social1;
      if (social2) user.social2 = social2;
      await user.save();
    }

    // Email admin
    await sendEmail(
      process.env.ADMIN_EMAIL || 'admin@meera.ai',
      `📦 New Vendor Application from ${name}`,
      `<h3>Vendor Application Received</h3>
       <p><strong>Name:</strong> ${name}</p>
       <p><strong>Email:</strong> ${email}</p>
       <p><strong>Social 1:</strong> ${social1 || 'N/A'}</p>
       <p><strong>Social 2:</strong> ${social2 || 'N/A'}</p>`
    );

    res.json({ success: true, message: 'Application submitted! We will contact you within 24 hours.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN: APPROVE OR REJECT PRODUCT
// ═══════════════════════════════════════════════════════════════
app.put('/api/admin/products/:id/approve', requireAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    // Notify vendor
    const vendor = await User.findById(product.vendorId);
    if (vendor) {
      await sendEmail(
        vendor.email,
        `✅ Your product "${product.name}" is now live on MEERA Marketplace!`,
        `<h2>Great news, ${vendor.name}!</h2>
         <p>Your product <strong>"${product.name}"</strong> has been approved and is now live on MEERA Marketplace.</p>
         <p>Buyers can now discover and purchase it. Good luck with your sales!</p>`
      );
    }
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ═══════════════════════════════════════════════════════════════
// REQUEST PAYOUT (Vendor withdraws earnings)
// Uses Paystack Transfer API to send money to vendor bank account
// ═══════════════════════════════════════════════════════════════
app.post('/api/payout/request', requireAuth, async (req, res) => {
  try {
    const { amount, accountNo, bankCode } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (parseFloat(amount) < 10) {
      return res.status(400).json({ success: false, message: 'Minimum payout is $10.' });
    }
    if (user.balance < parseFloat(amount)) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }

    let transferRef = 'MEERA_PAYOUT_' + Date.now();

    // Try Paystack Transfer API
    try {
      // Step 1: Create transfer recipient
      const recipientRes = await axios.post(
        'https://api.paystack.co/transferrecipient',
        { type: 'nuban', name: user.name, account_number: accountNo, bank_code: bankCode, currency: 'NGN' },
        { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
      );
      const recipientCode = recipientRes.data.data.recipient_code;

      // Step 2: Initiate transfer (amount in NGN, so multiply by exchange rate)
      const amountNGN = parseFloat(amount) * 1600; // USD to NGN
      const transferRes = await axios.post(
        'https://api.paystack.co/transfer',
        { source: 'balance', reason: `MEERA Payout for ${user.name}`, amount: amountNGN * 100, recipient: recipientCode },
        { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
      );
      transferRef = transferRes.data.data.reference;
    } catch (paystackErr) {
      console.log('Paystack transfer API error (continuing with manual payout):', paystackErr.message);
      // Continue with manual payout record even if Paystack API call fails
    }

    // Deduct from vendor balance
    user.balance -= parseFloat(amount);
    await user.save();

    // Save payout record
    await new Payout({
      vendorId: user._id,
      amount:   parseFloat(amount),
      method:   'paystack',
      accountNo, bankCode,
      status:    'processing',
      reference: transferRef
    }).save();

    await sendEmail(
      user.email,
      '💰 MEERA Payout Processing',
      `<h2>Hi ${user.name}!</h2>
       <p>Your payout of <strong>$${amount}</strong> is being processed.</p>
       <p>Reference: <strong>${transferRef}</strong></p>
       <p>Funds will arrive in your bank account within 24–48 hours.</p>`
    );

    res.json({ success: true, message: `Payout of $${amount} is processing. Ref: ${transferRef}` });

  } catch (err) {
    console.error('Payout error:', err.message);
    res.status(500).json({ success: false, message: 'Payout failed. Check your account details.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// JOB ALERTS — Subscribe to job notifications
// ═══════════════════════════════════════════════════════════════
app.post('/api/jobs/alert', async (req, res) => {
  try {
    const { email, category } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required.' });

    // Check if already subscribed
    const existing = await JobAlert.findOne({ email: email.toLowerCase() });
    if (!existing) {
      await new JobAlert({ email: email.toLowerCase(), category: category || 'all' }).save();
    }

    await sendEmail(
      email,
      '🔔 MEERA Job Alerts Activated!',
      `<h2>You're subscribed to MEERA Job Alerts! 🎉</h2>
       <p>You'll receive email notifications whenever new <strong>${category || 'All'}</strong> jobs are posted.</p>
       <p>Browse current jobs now: <a href="${process.env.SITE_URL || 'http://localhost:5500'}#jobs">View Jobs</a></p>`
    );

    res.json({ success: true, message: `Job alerts activated for "${category || 'all'}" to ${email}!` });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// PODCAST: PUBLISH TO YOUTUBE
// Uses YouTube Data API v3
// Get API key: console.cloud.google.com → Enable YouTube Data API v3
// ═══════════════════════════════════════════════════════════════
app.post('/api/podcast/publish/youtube', requireAuth, async (req, res) => {
  try {
    const { title, description, videoUrl, accessToken } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, message: 'Title and video URL required.' });
    }

    const token = accessToken || process.env.YOUTUBE_ACCESS_TOKEN;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'YouTube access token required. Get one from: console.cloud.google.com',
        hint:    'Set YOUTUBE_ACCESS_TOKEN in your .env file'
      });
    }

    // Upload to YouTube using their API
    const ytRes = await axios.post(
      'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status',
      {
        snippet: {
          title:       title.slice(0, 100),
          description: description || 'Podcast episode published via MEERA AI Studio.',
          tags:        ['podcast', 'MEERA AI', 'Africa'],
          categoryId:  '22' // People & Blogs
        },
        status: { privacyStatus: 'public' }
      },
      {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success:   true,
      message:   'Published to YouTube!',
      videoId:   ytRes.data.id,
      videoUrl:  `https://www.youtube.com/watch?v=${ytRes.data.id}`
    });

  } catch (err) {
    console.error('YouTube publish error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: 'YouTube publish failed. Check your access token.',
      hint:    'Get a token at console.cloud.google.com → YouTube Data API v3'
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// PODCAST: PUBLISH TO TIKTOK
// Uses TikTok Content Posting API
// Apply at: developers.tiktok.com
// ═══════════════════════════════════════════════════════════════
app.post('/api/podcast/publish/tiktok', requireAuth, async (req, res) => {
  try {
    const { title, videoUrl, accessToken } = req.body;
    const token = accessToken || process.env.TIKTOK_ACCESS_TOKEN;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'TikTok access token required.',
        hint:    'Apply for access at: developers.tiktok.com → Content Posting API'
      });
    }

    // Initialise TikTok video upload
    const ttRes = await axios.post(
      'https://open.tiktokapis.com/v2/post/publish/video/init/',
      {
        post_info: {
          title:          title.slice(0, 150),
          privacy_level:  'PUBLIC_TO_EVERYONE',
          disable_duet:   false,
          disable_comment:false,
          disable_stitch: false
        },
        source_info: { source: 'URL', video_url: videoUrl }
      },
      {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json; charset=UTF-8'
        }
      }
    );

    res.json({
      success:   true,
      message:   'Published to TikTok!',
      publishId: ttRes.data?.data?.publish_id
    });

  } catch (err) {
    console.error('TikTok publish error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: 'TikTok publish failed. Check your access token.',
      hint:    'Get token at: developers.tiktok.com'
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// PODCAST: PUBLISH TO FACEBOOK
// Uses Facebook Graph API
// Get token: developers.facebook.com → Graph API Explorer
// ═══════════════════════════════════════════════════════════════
app.post('/api/podcast/publish/facebook', requireAuth, async (req, res) => {
  try {
    const { title, description, videoUrl, pageId, accessToken } = req.body;
    const token = accessToken || process.env.FACEBOOK_ACCESS_TOKEN;
    const page  = pageId      || process.env.FACEBOOK_PAGE_ID;

    if (!token || !page) {
      return res.status(400).json({
        success: false,
        message: 'Facebook access token and page ID required.',
        hint:    'Get token at: developers.facebook.com → Graph API Explorer'
      });
    }

    // Post video to Facebook Page
    const fbRes = await axios.post(
      `https://graph-video.facebook.com/v18.0/${page}/videos`,
      {
        title,
        description: description || 'Podcast episode via MEERA AI Studio.',
        file_url:    videoUrl,
        published:   true,
        access_token: token
      }
    );

    res.json({
      success:  true,
      message:  'Published to Facebook!',
      videoId:  fbRes.data.id,
      videoUrl: `https://www.facebook.com/video/${fbRes.data.id}`
    });

  } catch (err) {
    console.error('Facebook publish error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: 'Facebook publish failed. Check your access token and page ID.',
      hint:    'Get token at: developers.facebook.com'
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// SEO AUTO PAGES — Generate optimised landing pages
// ═══════════════════════════════════════════════════════════════
app.post('/api/seo/generate', requireAuth, async (req, res) => {
  try {
    const { keyword, targetCity, industry } = req.body;
    if (!keyword) return res.status(400).json({ success: false, message: 'Keyword required.' });

    const slug = keyword.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // In production, call OpenAI API here to generate real content
    // POST https://api.openai.com/v1/chat/completions with keyword as prompt
    const pageHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${keyword} ${targetCity ? '| ' + targetCity : ''} | MEERA AI Studio</title>
  <meta name="description" content="The best ${keyword} tool powered by AI. Create professional results in minutes. Try MEERA free for 2 weeks.">
  <meta name="keywords" content="${keyword}, AI ${keyword}${targetCity ? ', ' + targetCity + ' ' + keyword : ''}">
  <meta property="og:title" content="${keyword} — MEERA AI Studio">
  <meta property="og:description" content="Professional AI-powered ${keyword}.">
  <style>
    body{font-family:sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;color:#2C2C2A;background:#F5F0E8}
    h1{color:#8B5E3C;font-size:2rem;margin-bottom:1rem}
    .hero{background:linear-gradient(135deg,#2C2C2A,#8B5E3C);color:white;padding:48px 32px;border-radius:16px;margin-bottom:40px;text-align:center}
    .hero h1{color:white;font-size:2.5rem}
    .cta{background:#8B5E3C;color:white;padding:14px 28px;text-decoration:none;border-radius:99px;display:inline-block;font-weight:700;margin-top:16px}
    .feature{background:white;padding:20px;border-radius:12px;margin-bottom:12px;border-left:4px solid #D4A853}
    .features h2{color:#8B5E3C;margin-bottom:20px}
  </style>
</head>
<body>
  <div class="hero">
    <h1>${keyword} with MEERA AI Studio</h1>
    <p>Create professional ${keyword} results in minutes using AI technology${targetCity ? ' in ' + targetCity : ''}.</p>
    <a class="cta" href="${process.env.SITE_URL || 'https://meera.ai'}#studio">Try ${keyword} Free →</a>
  </div>
  <div class="features">
    <h2>Why MEERA for ${keyword}?</h2>
    <div class="feature">✅ No technical skills needed — just type and MEERA creates</div>
    <div class="feature">✅ 38+ AI tools in one platform — the most complete on the market</div>
    <div class="feature">✅ Start completely free for 2 weeks — no credit card</div>
    <div class="feature">✅ Used by creators in 50+ countries across Africa and worldwide</div>
    <div class="feature">✅ Podcast studio, marketplace, jobs board, quizzes all included</div>
  </div>
</body>
</html>`;

    res.json({ success: true, slug, html: pageHtml, keyword, targetCity });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not generate SEO page.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// EMAIL CAMPAIGN — Send to list of subscribers
// ═══════════════════════════════════════════════════════════════
app.post('/api/email/campaign', requireAuth, async (req, res) => {
  try {
    const { subject, html, recipients } = req.body;
    if (!subject || !html || !recipients?.length) {
      return res.status(400).json({ success: false, message: 'Subject, html and recipients required.' });
    }

    let sent = 0;
    // Send in batches to avoid email rate limits
    for (const email of recipients.slice(0, 50)) {
      await sendEmail(email, subject, html);
      sent++;
      // Small delay between emails to avoid spam filters
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    res.json({ success: true, message: `Campaign sent to ${sent} recipients.`, sent });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Campaign sending failed.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// TRIVIA — Award coins for correct answers
// ═══════════════════════════════════════════════════════════════
app.post('/api/trivia/answer', requireAuth, async (req, res) => {
  try {
    const { correct } = req.body;
    if (!correct) return res.json({ success: true, coins: 0 });

    const user = await User.findById(req.userId);
    user.coins      += 10;
    user.triviaScore += 10;
    await user.save();
    res.json({ success: true, coins: 10, totalCoins: user.coins });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ═══════════════════════════════════════════════════════════════
// SPIN WHEEL — Award coins
// ═══════════════════════════════════════════════════════════════
app.post('/api/coins/spin', requireAuth, async (req, res) => {
  try {
    const user  = await User.findById(req.userId);
    const today = new Date().toISOString().split('T')[0];

    if (user.lastSpinDate === today) {
      return res.status(400).json({ success: false, message: 'Already spun today. Come back tomorrow!' });
    }

    const prizes     = [50, 100, 150, 200, 0, 0, 75, 25];
    const coins      = prizes[Math.floor(Math.random() * prizes.length)];
    user.coins       += coins;
    user.lastSpinDate = today;
    await user.save();

    res.json({ success: true, coins, totalCoins: user.coins });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ═══════════════════════════════════════════════════════════════
// VENDOR DASHBOARD — Get vendor stats
// ═══════════════════════════════════════════════════════════════
app.get('/api/vendor/dashboard', requireAuth, async (req, res) => {
  try {
    const user     = await User.findById(req.userId).select('-password');
    const products = await Product.find({ vendorId: req.userId });
    const txns     = await Transaction.find({ vendorId: req.userId, status: 'success' });

    const totalRevenue = txns.reduce((sum, t) => sum + (t.amount * 0.8), 0);
    const totalSales   = txns.length;
    const totalViews   = products.reduce((sum, p) => sum + p.views, 0);

    res.json({
      success: true,
      stats: {
        balance:       user.balance,
        totalRevenue:  totalRevenue.toFixed(2),
        totalSales,
        totalViews,
        totalProducts: products.length,
        products:      products.slice(0, 10)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

// ═══════════════════════════════════════════════════════════════
// LIVE JOBS — Proxy to Remotive API (avoids CORS on frontend)
// ═══════════════════════════════════════════════════════════════
app.get('/api/jobs/live', async (req, res) => {
  try {
    const { search, limit } = req.query;
    const url = `https://remotive.com/api/remote-jobs?limit=${limit || 10}${search ? '&search=' + search : ''}`;
    const response = await axios.get(url, { timeout: 8000 });
    res.json({ success: true, jobs: response.data.jobs || [] });
  } catch (err) {
    // Return empty array if Remotive is down — frontend uses fallback data
    res.json({ success: true, jobs: [], fallback: true });
  }
});

// ═══════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/users', requireAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/admin/products', requireAuth, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, products });
  } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/admin/transactions', requireAuth, async (req, res) => {
  try {
    const txns = await Transaction.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, transactions: txns });
  } catch (err) { res.status(500).json({ success: false }); }
});

// ── STEP 10: ERROR HANDLER ───────────────────────────────────────
// Catches any errors that weren't handled above
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server. Please try again.'
  });
});

// ── STEP 11: 404 HANDLER ─────────────────────────────────────────
// Catches requests to routes that don't exist
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`
  });
});

// ── STEP 12: START THE SERVER ────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║        🎬  MEERA AI STUDIO  v3.0               ║');
  console.log(`║        Server running on port ${PORT}             ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  ✅ Health:    GET  /api/health                   ║');
  console.log('║  👤 Register:  POST /api/register                 ║');
  console.log('║  🔑 Login:     POST /api/login                    ║');
  console.log('║  💳 Subscribe: POST /api/subscribe                ║');
  console.log('║  📦 Products:  GET  /api/products                 ║');
  console.log('║  💰 Payout:    POST /api/payout/request           ║');
  console.log('║  🎙️  YouTube:  POST /api/podcast/publish/youtube  ║');
  console.log('║  🎵 TikTok:    POST /api/podcast/publish/tiktok   ║');
  console.log('║  👍 Facebook:  POST /api/podcast/publish/facebook ║');
  console.log('║  💼 Jobs:      GET  /api/jobs/live                ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  ⚠️  Create your .env file before using!         ║');
  console.log('║  📖 Read GUIDE.md for complete setup steps        ║');
  console.log('╚══════════════════════════════════════════════════╝');
  console.log('');
});