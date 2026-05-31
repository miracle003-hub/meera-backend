// ================================================================
// MEERA AI STUDIO — app.js  (Part 1 of 1 — complete file)
// All frontend JavaScript for every section
// ================================================================

const console = require("console");
const { clearInterval } = require("timers");

// ── 1. GLOBAL STATE ─────────────────────────────────────────────
let currentUser  = null;
let curSlide     = 0;
let isSpinning   = false;
let wheelAngle   = 0;
let curChapter   = 0;
let isPlaying    = false;
let chInterval   = null;
let curQuiz      = null;
let curQIndex    = 0;
let quizScore    = 0;
let triviaScore  = 0;
let triviaTimer  = null;
let triviaTime   = 15;
let curTriviaCat = 'tech';
let curTrivQ     = 0;
let allJobsData  = [];
let currentJobFilter = 'all';
let quoteIndexes = { motivation:0, bible:0, success:0, creative:0 };
let curQTab      = 'motivation';
let podFakeTime  = 0;
let podFakePlaying = false;
let podFakeIv    = null;
let spIdx        = 0;
let triviaAnswered = false;

// Keys — replace with real ones
const PAYSTACK_KEY = 'pk_test_4f3f5348a5c83839baba2afbc91fbac24df7badb';
const API_BASE     = '';

// ── 2. QUOTES DATABASE ──────────────────────────────────────────
const QUOTES = {
  motivation: [
    { q:'The secret of getting ahead is getting started.', a:'— Mark Twain' },
    { q:'Your only limit is your mind.', a:'— Anonymous' },
    { q:'Work hard in silence. Let success make the noise.', a:'— Frank Ocean' },
    { q:"Don't watch the clock; do what it does. Keep going.", a:'— Sam Levenson' },
    { q:'Dream big. Start small. Act now.', a:'— Robin Sharma' },
    { q:'The future belongs to those who believe in the beauty of their dreams.', a:'— Eleanor Roosevelt' },
    { q:'It always seems impossible until it is done.', a:'— Nelson Mandela' },
    { q:'Success is not final, failure is not fatal: it is the courage to continue that counts.', a:'— Winston Churchill' }
  ],
  bible: [
    { q:'I can do all things through Christ who strengthens me.', a:'— Philippians 4:13' },
    { q:'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you.', a:'— Jeremiah 29:11' },
    { q:'Trust in the LORD with all your heart and lean not on your own understanding.', a:'— Proverbs 3:5' },
    { q:'The LORD is my shepherd; I shall not want.', a:'— Psalm 23:1' },
    { q:'Be strong and courageous. Do not be afraid; for the LORD your God will be with you wherever you go.', a:'— Joshua 1:9' },
    { q:'And we know that in all things God works for the good of those who love him.', a:'— Romans 8:28' },
    { q:'Cast all your anxiety on him because he cares for you.', a:'— 1 Peter 5:7' },
    { q:'Delight yourself in the LORD, and he will give you the desires of your heart.', a:'— Psalm 37:4' }
  ],
  success: [
    { q:"Success is not about the destination — it's about who you become on the journey.", a:'— Tony Robbins' },
    { q:'The difference between ordinary and extraordinary is that little extra.', a:'— Jimmy Johnson' },
    { q:"Opportunities don't happen. You create them.", a:'— Chris Grosser' },
    { q:"Don't be afraid to give up the good to go for the great.", a:'— John D. Rockefeller' },
    { q:'A goal without a plan is just a wish.', a:'— Antoine de Saint-Exupéry' },
    { q:'The only place where success comes before work is in the dictionary.', a:'— Vidal Sassoon' },
    { q:'Stop doubting yourself, work hard, and make it happen.', a:'— Anonymous' },
    { q:'Hustle in silence and let your success be your noise.', a:'— Anonymous' }
  ],
  creative: [
    { q:'Creativity is intelligence having fun.', a:'— Albert Einstein' },
    { q:"You can't use up creativity. The more you use, the more you have.", a:'— Maya Angelou' },
    { q:'An idea that is not dangerous is unworthy of being called an idea.', a:'— Oscar Wilde' },
    { q:'Every child is an artist. The problem is how to remain an artist once we grow up.', a:'— Pablo Picasso' },
    { q:'Create with heart; build with mind.', a:'— Criss Jami' },
    { q:'Creativity takes courage.', a:'— Henri Matisse' },
    { q:'Done is better than perfect.', a:'— Sheryl Sandberg' },
    { q:'The secret to creativity is knowing how to hide your sources.', a:'— Albert Einstein' }
  ]
};

// ── 3. TOOLS DATA ───────────────────────────────────────────────
const TOOLS = {
  creative: [
    { id:1,  name:'AI Movie Maker',         ico:'🎬', desc:'Turn text stories into full AI-generated movies.',          tier:'free',   badge:'b-free'  },
    { id:2,  name:'Voice Cloning',           ico:'🎙️', desc:'Clone any voice for narration or dialogue.',               tier:'pro',    badge:'b-pro'   },
    { id:3,  name:'AI Actor / Face Swap',    ico:'🎭', desc:'Choose an AI actor — face stays consistent throughout.',   tier:'pro',    badge:'b-pro'   },
    { id:4,  name:'AI Music Generation',     ico:'🎵', desc:'Hip-hop, blues, afro, sad songs for movies or listening.', tier:'free',   badge:'b-free'  },
    { id:5,  name:'Video Generation',        ico:'🎥', desc:'Scripts converted to cinematic video scenes.',             tier:'pro',    badge:'b-pro'   },
    { id:6,  name:'Auto Subtitles (50+)',    ico:'💬', desc:'50+ language subtitles generated from any video.',         tier:'free',   badge:'b-free'  },
    { id:7,  name:'AI Video Effects',        ico:'✨', desc:'Background removal, motion tracking, beat sync.',          tier:'pro',    badge:'b-pro'   },
    { id:8,  name:'SEO Auto Pages',          ico:'🔍', desc:'Instant optimised landing pages for Google.',              tier:'pro',    badge:'b-pro'   },
    { id:9,  name:'Email Marketing',         ico:'📧', desc:'Send campaigns and newsletters to buyers.',                tier:'basic',  badge:'b-basic' },
    { id:10, name:'Chatbot Assistant',       ico:'🤖', desc:'Auto-engages buyers, vendors, storytellers 24/7.',         tier:'pro',    badge:'b-pro'   },
    { id:11, name:'AI Persona Style Lab',    ico:'🧪', desc:'Build custom AI personas for your brand.',                 tier:'pro',    badge:'b-pro'   }
  ],
  social: [
    { id:12, name:'TikTok Automation',        ico:'🎵', desc:'Auto-post AI videos with trending sounds.',                tier:'pro',    badge:'b-pro'   },
    { id:13, name:'YouTube Automation',       ico:'▶️', desc:'Schedule and auto-upload to YouTube.',                    tier:'pro',    badge:'b-pro'   },
    { id:14, name:'Facebook Automation',      ico:'👍', desc:'Auto-post reels and videos to pages.',                    tier:'pro',    badge:'b-pro'   },
    { id:15, name:'Direct Social Publish',    ico:'📤', desc:'Publish to all platforms from one dashboard.',            tier:'basic',  badge:'b-basic' },
    { id:16, name:'Schedule & Auto-Post',     ico:'📅', desc:'Plan weeks of content, auto-publish on time.',            tier:'free',   badge:'b-free'  },
    { id:17, name:'Cross-Platform Analytics', ico:'📊', desc:'Views, likes, revenue across all platforms.',             tier:'pro',    badge:'b-pro'   },
    { id:18, name:'Instagram & Twitter Post', ico:'📸', desc:'Direct publish to Instagram and Twitter/X.',              tier:'basic',  badge:'b-basic' }
  ],
  editing: [
    { id:19, name:'Picture Editor',    ico:'🖼️', desc:'Filters, crop, retouch and colour grading.',          tier:'basic', badge:'b-basic' },
    { id:20, name:'Mobile Photo Editor',ico:'📱', desc:'Quick edits and filters for mobile photos.',          tier:'free',  badge:'b-free'  },
    { id:21, name:'Video Editor',       ico:'🎞️', desc:'Full timeline with clips, transitions, captions.',   tier:'pro',   badge:'b-pro'   },
    { id:22, name:'AI Auto-Edit',       ico:'⚡', desc:'AI auto-arranges clips and adds captions.',           tier:'pro',   badge:'b-pro'   }
  ]
};

// ── 4. PODCAST FEATURES ─────────────────────────────────────────
const POD_FEATURES = [
  { ico:'🤝', name:'AI Co-Host',              desc:'MEERA AI joins as co-host — asks questions, adds insight, keeps conversation flowing.',      badge:'b-pro',   isNew:true  },
  { ico:'📑', name:'Auto Chapter Timestamps', desc:'AI listens and auto-adds chapter markers so listeners jump to any topic instantly.',         badge:'b-basic', isNew:false },
  { ico:'🔥', name:'Viral Clip Extraction',   desc:'AI finds the best 30–60s clips from your episode and cuts them for TikTok, Reels, Shorts.', badge:'b-pro',   isNew:true  },
  { ico:'🖼️', name:'AI Thumbnail Generator', desc:'Generate eye-catching thumbnails with your face, title and brand — no design skills.',      badge:'b-basic', isNew:false },
  { ico:'🌍', name:'Multi-Language Podcast',  desc:'Translate and re-voice your episode into 20+ languages automatically.',                     badge:'b-pro',   isNew:true  },
  { ico:'💬', name:'AI Subtitles & Captions', desc:'Auto-generate accurate subtitles for video podcasts in any language.',                      badge:'b-free',  isNew:false },
  { ico:'🎧', name:'AI Sound Effects',         desc:'Add professional background sounds, transitions, and audio effects without a studio.',      badge:'b-pro',   isNew:false },
  { ico:'🎶', name:'Intro Music Generator',   desc:'Generate custom branded intro and outro music that matches your podcast theme.',            badge:'b-pro',   isNew:true  },
  { ico:'⬇️', name:'Episode Downloader',      desc:'Download any episode as MP3, WAV or video for offline distribution.',                       badge:'b-basic', isNew:false },
  { ico:'📹', name:'Video Podcast Mode',       desc:'Record a full video podcast with AI virtual studio backgrounds and live captions.',         badge:'b-pro',   isNew:false },
  { ico:'🧑‍🎤',name:'AI Avatar Host',          desc:'Use a realistic AI avatar as your podcast host — no camera needed. 50+ avatars.',          badge:'b-pro',   isNew:true  },
  { ico:'📡', name:'Podcast Publishing',       desc:'Distribute to Spotify, Apple Podcasts, Google and 30+ directories automatically.',         badge:'b-basic', isNew:false }
];

// ── 5. EXTRA AI TOOLS ───────────────────────────────────────────
const EXTRA_TOOLS = [
  { ico:'📄', name:'AI Resume Builder',       desc:'Build an ATS-optimised resume in minutes with AI-written bullet points.',              tier:'basic', fn:'openResume'       },
  { ico:'🎨', name:'AI Logo Maker',           desc:'Generate a unique brand logo from a description. Download SVG, PNG and PDF.',          tier:'pro',   fn:'openLogo'         },
  { ico:'✍️', name:'AI Caption Generator',   desc:'Generate viral captions for Instagram, TikTok, Twitter, LinkedIn with hashtags.',      tier:'basic', fn:'openCaption'      },
  { ico:'👗', name:'Outfit Generator',        desc:'Describe an occasion and get AI-styled outfit ideas with colour palettes.',            tier:'basic', fn:'openOutfit'       },
  { ico:'📚', name:'Homework Helper',         desc:'Upload any assignment. Get step-by-step AI explanations with examples.',               tier:'free',  fn:'openHomework'     },
  { ico:'🎙️', name:'AI Voice Recorder',      desc:'Record and transcribe voice notes instantly. Export as text, summary or post.',        tier:'free',  fn:'openVoiceRec'     },
  { ico:'📊', name:'AI Presentation Maker',  desc:'Turn bullet points into a beautiful slide deck in seconds. Export as PowerPoint.',     tier:'pro',   fn:'openPresentation' },
  { ico:'🌐', name:'AI Website Copy',         desc:'Generate website copy, product descriptions, blog posts and ad copy.',                 tier:'basic', fn:'openWebCopy'      },
  { ico:'💌', name:'AI Email Writer',         desc:'Write professional emails, cold outreach, follow-ups and newsletters.',               tier:'free',  fn:'openEmailWriter'  },
  { ico:'🎮', name:'AI Story Generator',      desc:'Generate full short stories, scripts and screenplays from a simple idea.',            tier:'pro',   fn:'openStory'        },
  { ico:'🧮', name:'AI Data Analyser',        desc:'Upload a CSV and MEERA summarises insights, trends and recommendations.',             tier:'pro',   fn:'openDataAI'       },
  { ico:'🌍', name:'AI Translator',           desc:'Translate text, audio or documents into 50+ languages with cultural context.',        tier:'free',  fn:'openTranslator'   }
];

// ── 6. QUIZ DATA ────────────────────────────────────────────────
const QUIZ_CATS = [
  { id:'career',       ico:'💼', name:'Career Quiz',         desc:'Discover your ideal career path',          qs:5,
    questions:[
      { q:'How do you prefer to work?',                        opts:['Alone and focused','In a team','Mix of both','Remotely'],              correct:2 },
      { q:'What motivates you most at work?',                  opts:['High salary','Creative freedom','Helping others','Leadership'],        correct:0 },
      { q:'How do you handle pressure?',                       opts:['I thrive on it','I need calm to work','It depends','I avoid it'],      correct:2 },
      { q:'Pick your ideal work environment:',                 opts:['Corporate office','Creative studio','Outdoor fieldwork','Home'],       correct:3 },
      { q:'What is your strongest skill?',                     opts:['Analytical','Communication','Technical','Organisation'],               correct:1 }
    ]
  },
  { id:'iq',           ico:'🧠', name:'IQ Test',             desc:'Test your logical reasoning',              qs:5,
    questions:[
      { q:'What comes next: 2, 4, 8, 16, __?',                opts:['24','28','32','36'],                                                   correct:2 },
      { q:'If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?', opts:['Yes','No','Maybe','Cannot determine'], correct:0 },
      { q:'A bat and ball cost $1.10. The bat costs $1 more. How much is the ball?',                   opts:['$0.10','$0.05','$0.15','$0.20'],       correct:1 },
      { q:'5 workers build 5 widgets in 5 days. Time for 100 workers to build 100 widgets?',          opts:['1 day','5 days','100 days','10 days'],  correct:1 },
      { q:'Which number is the odd one out: 2, 3, 5, 7, 9, 11?',                                     opts:['2','5','9','11'],                       correct:2 }
    ]
  },
  { id:'personality',  ico:'🌟', name:'Personality Test',    desc:'Discover your unique personality type',   qs:5,
    questions:[
      { q:'At a party, you usually:',           opts:['Talk to many new people','Stay with close friends','Mix of both','Leave early'],      correct:2 },
      { q:'When making decisions you rely on:', opts:['Logic and analysis','Gut feelings','A mix','What others think'],                      correct:0 },
      { q:'You prefer your life to be:',        opts:['Planned and structured','Spontaneous and flexible','Mostly planned','Totally free'],  correct:2 },
      { q:'When stressed you:',                 opts:['Isolate and recharge','Seek company','Exercise','Overthink'],                         correct:0 },
      { q:'Your friends describe you as:',      opts:['The creative one','The logical one','The funny one','The reliable one'],              correct:3 }
    ]
  },
  { id:'relationship', ico:'❤️', name:'Relationship Test',   desc:'Understand your love language',            qs:5,
    questions:[
      { q:'What makes you feel most loved?',    opts:['Words of affirmation','Acts of service','Physical touch','Quality time'],            correct:3 },
      { q:'In conflict, you usually:',          opts:['Talk it out immediately','Need time first','Avoid conflict','Confront directly'],     correct:1 },
      { q:'Your ideal date is:',                opts:['Quiet dinner at home','Adventure/travel','Creative activity','Going out with friends'],correct:0 },
      { q:'How much personal space do you need?',opts:['A lot','Some — balance','Very little','Changes with mood'],                         correct:1 },
      { q:'Trust is built through:',            opts:['Consistent actions','Open conversations','Physical presence','Shared experiences'],   correct:0 }
    ]
  },
  { id:'business',     ico:'📈', name:'Business Aptitude',   desc:'Test your entrepreneurial thinking',       qs:5,
    questions:[
      { q:'Most important thing when starting a business?',    opts:['Great idea','Funding','Solving a real problem','Social media'],        correct:2 },
      { q:'Sales drop 30%. What do you do first?',             opts:['Cut marketing','Research why','Hire salespeople','Lower price'],       correct:1 },
      { q:'Profit margin means:',                              opts:['Total revenue','Revenue minus costs','Products sold','Your salary'],    correct:1 },
      { q:'Which funding stage comes first for a startup?',    opts:['Series A','IPO','Pre-seed','Series B'],                               correct:2 },
      { q:'Best way to validate a business idea:',             opts:['Build fully first','Ask friends','Get paying customers','Post online'],correct:2 }
    ]
  },
  { id:'skill',        ico:'🛠️', name:'Skill Test',          desc:'Assess your digital and creative skills',  qs:5,
    questions:[
      { q:'What does SEO stand for?',           opts:['Search Engine Optimisation','Social Engagement Output','Sales Engagement Ops','Software Engineering Output'], correct:0 },
      { q:'What is a "call to action" (CTA)?',  opts:['A customer complaint','A prompt to take action','A paid ad type','A product feature'],                     correct:1 },
      { q:'Best file format for a logo?',       opts:['JPG','MP4','SVG','DOCX'],                                                                                  correct:2 },
      { q:'What does API stand for?',           opts:['Applied Programming Interface','Application Programming Interface','Automated Process','App Process Index'], correct:1 },
      { q:'Purpose of a YouTube "thumbnail"?',  opts:['Video file size','Preview image to attract clicks','Video description','Channel icon'],                    correct:1 }
    ]
  }
];

// ── 7. TRIVIA DATA ──────────────────────────────────────────────
const TRIVIA = {
  tech: [
    { q:'What does "AI" stand for?',                  opts:['Automated Intelligence','Artificial Intelligence','Advanced Integration','Automated Information'], correct:1 },
    { q:'Who founded Apple Inc.?',                     opts:['Bill Gates','Elon Musk','Steve Jobs','Jeff Bezos'],                                               correct:2 },
    { q:'What language is most used for AI/ML?',       opts:['Java','Python','C++','PHP'],                                                                      correct:1 },
    { q:'What does HTML stand for?',                   opts:['Hyper Text Markup Language','High Tech Modern Language','Hyper Transfer','Home Tool Markup'],      correct:0 },
    { q:'Which company made the iPhone?',              opts:['Samsung','Google','Apple','Microsoft'],                                                            correct:2 }
  ],
  africa: [
    { q:'Largest country in Africa by area?',          opts:['Nigeria','South Africa','Algeria','DRC'],                                                         correct:2 },
    { q:'Which African country has the largest GDP?',  opts:['Kenya','South Africa','Egypt','Nigeria'],                                                         correct:3 },
    { q:'Capital of Nigeria?',                         opts:['Lagos','Kano','Abuja','Ibadan'],                                                                  correct:2 },
    { q:'Which African country was never colonised?',  opts:['Ghana','Ethiopia','Kenya','Zimbabwe'],                                                            correct:1 },
    { q:'2010 FIFA World Cup host country?',           opts:['Nigeria','Kenya','South Africa','Egypt'],                                                         correct:2 }
  ],
  science: [
    { q:"Water's chemical formula is:",                opts:['CO2','H2O','NaCl','O2'],                                                                          correct:1 },
    { q:'How many bones does an adult human have?',    opts:['196','206','216','186'],                                                                          correct:1 },
    { q:'Which planet is closest to the Sun?',         opts:['Venus','Earth','Mars','Mercury'],                                                                 correct:3 },
    { q:'Speed of light (approx)?',                    opts:['200,000 km/s','300,000 km/s','400,000 km/s','150,000 km/s'],                                      correct:1 },
    { q:'DNA stands for:',                             opts:['Deoxyribonucleic Acid','Dynamic Nuclear Alloy','Dimensional Network Array','Digital Nucleic Atom'],correct:0 }
  ],
  history: [
    { q:'Nigeria gained independence in:',             opts:['1955','1960','1963','1970'],                                                                      correct:1 },
    { q:'First President of the United States?',       opts:['Abraham Lincoln','John Adams','George Washington','Thomas Jefferson'],                            correct:2 },
    { q:'The Berlin Wall fell in:',                    opts:['1985','1987','1989','1991'],                                                                      correct:2 },
    { q:'Who invented the telephone?',                 opts:['Thomas Edison','Nikola Tesla','Alexander Graham Bell','James Watt'],                              correct:2 },
    { q:'World War II ended in:',                      opts:['1943','1944','1945','1946'],                                                                      correct:2 }
  ]
};

// ── 8. BLOG DATA ────────────────────────────────────────────────
const BLOG_POSTS = [
  { cat:'ai-news',  emoji:'🤖', title:'OpenAI Releases New Model with 10× Better Reasoning',                    desc:'The AI giant announced a major breakthrough in logical reasoning.',               date:'Today',       read:'3 min' },
  { cat:'tutorial', emoji:'📖', title:'How to Make an AI Movie in 30 Minutes on MEERA',                        desc:'Step-by-step guide from prompt to cinematic video — no experience needed.',      date:'Yesterday',   read:'5 min' },
  { cat:'career',   emoji:'💼', title:'Top 10 Remote Jobs for Nigerians in 2024',                              desc:'High-paying remote opportunities available right now for African talent.',        date:'2 days ago',  read:'4 min' },
  { cat:'creator',  emoji:'🎬', title:'How This Lagos Creator Went from 0 to 100K TikTok Followers Using AI',  desc:'The exact strategy he used — all free tools on MEERA.',                          date:'3 days ago',  read:'6 min' },
  { cat:'business', emoji:'📈', title:'7 Ways to Monetise Your Creativity with MEERA in 2024',                desc:'From selling voice packs to teaching courses — the complete income guide.',        date:'4 days ago',  read:'7 min' },
  { cat:'ai-news',  emoji:'🤖', title:'Google DeepMind Announces Real-Time Video Generation',                   desc:'AI-generated video that responds to prompts in under 2 seconds.',                date:'5 days ago',  read:'3 min' },
  { cat:'tutorial', emoji:'📖', title:'Complete Guide to AI Voice Cloning — Ethics, Tools & Tips',             desc:'Everything you need to know about using voice AI responsibly.',                  date:'6 days ago',  read:'8 min' },
  { cat:'creator',  emoji:'🎬', title:'The AI Podcast Formula: 0 to 50K Monthly Listeners',                    desc:"How to use MEERA's podcast studio to grow a loyal audience fast.",               date:'1 week ago',  read:'5 min' }
];

// ── 9. STUDENT HUB DATA ─────────────────────────────────────────
const HUB_ITEMS = [
  { ico:'📚', name:'Homework Helper',    desc:'Upload any assignment. Get step-by-step AI explanations with examples.', fn:'openHomework'    },
  { ico:'🧠', name:'Study Flashcards',  desc:'Paste any text and MEERA auto-generates flashcards for memorisation.',    fn:'openFlashcards'  },
  { ico:'📄', name:'Essay Writer',      desc:'AI helps you structure, write and proofread essays and assignments.',     fn:'openEssay'       },
  { ico:'🔢', name:'Math Solver',       desc:'Type any math problem. Get full working-out step by step.',              fn:'openMath'        },
  { ico:'📖', name:'Book Summariser',   desc:'Get instant summaries of any book, chapter or article.',                 fn:'openBookSum'     },
  { ico:'💼', name:'CV Builder',        desc:'Build a student-friendly professional CV ready for job applications.',    fn:'openResume'      },
  { ico:'🎓', name:'Scholarship Finder',desc:'Search scholarships by country, course and eligibility automatically.',  fn:'openScholarship' },
  { ico:'🗓️', name:'Study Planner',    desc:'Generate a personalised study timetable based on your exams.',           fn:'openStudyPlan'   }
];

// ── 10. WORKFLOWS ────────────────────────────────────────────────
const WORKFLOWS = [
  { title:'AI Movie Production Pipeline',    steps:['Script →','Movie Maker →','Voice Clone →','Subtitles →','Publish'],     desc:'Create a full movie end-to-end in under an hour.',           level:'Beginner',     dur:'45 min' },
  { title:'Podcast Automation Workflow',     steps:['Record →','AI Co-Host →','Viral Clips →','Thumbnail →','Publish All'], desc:'Record once, auto-publish to YouTube, TikTok, Facebook.',    level:'Intermediate', dur:'30 min' },
  { title:'Social Media Content Machine',    steps:['Write →','Caption Gen →','Schedule →','Auto-Post →','Analyse'],         desc:'Create 30 days of content in one afternoon.',                level:'Beginner',     dur:'60 min' },
  { title:'Marketplace Sales Funnel',        steps:['Create →','SEO Page →','Email →','Chatbot →','Sell'],                   desc:'Build a passive income funnel that sells while you sleep.',  level:'Advanced',     dur:'90 min' },
  { title:'Resume to Job Offer Pipeline',    steps:['Resume →','Job Search →','AI Email →','Alert →','Apply'],               desc:'AI-powered job hunt that finds and applies automatically.',  level:'Beginner',     dur:'20 min' },
  { title:'AI Education Content Creator',    steps:['Topic →','Blog Post →','Comic Strip →','Quiz →','Publish'],             desc:'Create educational content in multiple formats from one idea.',level:'Intermediate',dur:'40 min' }
];

// ── 11. LEADERBOARD & SPIN ──────────────────────────────────────
const LEADERBOARD = [
  { name:'Chidi Creative', av:'🎬', coins:4520, rank:'g' },
  { name:'AmakaBeats',     av:'🎵', coins:3890, rank:'s' },
  { name:'TechTunde',      av:'🤖', coins:3240, rank:'b' },
  { name:'NgoziFilms',     av:'🎥', coins:2780, rank:''  },
  { name:'BeatsLagos',     av:'🎶', coins:2340, rank:''  },
  { name:'SoundMasterNG',  av:'🎙️', coins:1990, rank:''  }
];

const SPIN_PRIZES = [
  { label:'50 Coins',  color:'#D4A853' }, { label:'5% OFF',   color:'#8B5E3C' },
  { label:'100 Coins', color:'#D4826A' }, { label:'Try Again',color:'#C49A6C' },
  { label:'200 Coins', color:'#2C2C2A' }, { label:'Free Day!',color:'#4A4A45' },
  { label:'150 Coins', color:'#D4A853' }, { label:'Bonus Tip',color:'#8B5E3C' }
];

// ── 12. MISSIONS ────────────────────────────────────────────────
const MISSIONS = [
  { ico:'🎬', title:'Create a Video',      desc:'Use any AI Studio tool',        reward:'+50 coins',         prog:0, total:1 },
  { ico:'🛒', title:'Browse Marketplace',  desc:'View at least 3 products',      reward:'+20 coins',         prog:2, total:3 },
  { ico:'🔔', title:'Enable Notifications',desc:'Turn on daily quote alerts',    reward:'+100 coins',        prog:0, total:1 },
  { ico:'🎡', title:'Spin the Wheel',      desc:'Take your daily spin',          reward:'+30 coins',         prog:0, total:1 },
  { ico:'👥', title:'Refer a Friend',      desc:'Share your referral link',      reward:'$2 + 100 coins',    prog:0, total:1 },
  { ico:'🎓', title:'Browse Academy',      desc:'View one course',               reward:'+15 coins',         prog:0, total:1 }
];
const VENDOR_MISSIONS = [
  { ico:'📦', title:'Upload a Product',  desc:'Add or update a listing', reward:'+80 XP',  prog:0, total:1 },
  { ico:'📊', title:'Check Analytics',   desc:'Visit analytics panel',   reward:'+20 XP',  prog:0, total:1 },
  { ico:'💬', title:'Respond to Buyer',  desc:'Reply via WhatsApp',      reward:'+40 XP',  prog:0, total:1 },
  { ico:'🏷️', title:'Create a Bundle',  desc:'Bundle 2+ products',      reward:'+120 XP', prog:0, total:1 }
];

// ── 13. PRODUCTS ────────────────────────────────────────────────
let ALL_PRODUCTS = [
  { id:1, name:'Afro Voice Pack Vol.1',     cat:'voice',     price:24, emoji:'🎙️', vendor:'SoundMaster NG', desc:'20 unique Afro-Nigerian voice samples.',          type:'digital',  downloads:234, rating:4.8 },
  { id:2, name:'Cinematic Video Templates', cat:'templates', price:15, emoji:'🎬', vendor:'CineAfrica',     desc:'10 ready-to-use cinematic templates.',             type:'digital',  downloads:189, rating:4.6 },
  { id:3, name:'Beat Sync Effects Pack',    cat:'effects',   price:18, emoji:'✨', vendor:'VFX Lagos',      desc:'Premium beat-sync and motion tracking effects.',   type:'digital',  downloads:312, rating:4.9 },
  { id:4, name:'Afrobeats Music Pack',      cat:'music',     price:12, emoji:'🎵', vendor:'BeatsNG',        desc:'15 royalty-free Afrobeats tracks.',                type:'digital',  downloads:456, rating:4.7 },
  { id:5, name:'Custom AI Art Phone Case',  cat:'physical',  price:35, emoji:'📱', vendor:'PrintHub Africa',desc:'Personalised phone case with your AI artwork.',    type:'physical', whatsapp:'+2348012345678', rating:4.5 },
  { id:6, name:'Sad Song Starter Pack',     cat:'music',     price:10, emoji:'🎶', vendor:'EmotionBeats',   desc:'8 emotional backing tracks for storytelling.',     type:'digital',  downloads:198, rating:4.4 },
  { id:7, name:'Hip-Hop Beats Collection',  cat:'music',     price:20, emoji:'🎤', vendor:'BeatsNG',        desc:'25 hard-hitting hip-hop instrumentals.',           type:'digital',  downloads:567, rating:4.9 },
  { id:8, name:'AI Actor Poses Pack',       cat:'templates', price:28, emoji:'🎭', vendor:'AIPosing',       desc:'50 pre-styled AI actor poses.',                   type:'digital',  downloads:145, rating:4.6 }
];

// ── 14. JOBS FALLBACK DATA ──────────────────────────────────────
const SAMPLE_JOBS = [
  { title:'AI Video Editor',              company:'Creative NG',         location:'Lagos, Remote',       emoji:'🎬', type:'remote',    salary:'$800–$1,200/mo', tags:['AI','Video','Remote'],     level:'mid',    source:'MEERA'   },
  { title:'Social Media Manager',         company:'BrandAfrika',         location:'Abuja, Nigeria',      emoji:'📱', type:'nigeria',   salary:'$500–$700/mo',   tags:['TikTok','Instagram'],      level:'entry',  source:'MEERA'   },
  { title:'Voice Over Artist',            company:'AudioStudio NG',      location:'Remote Worldwide',    emoji:'🎙️', type:'remote',   salary:'$20–$50/hr',     tags:['Voice','Freelance'],       level:'entry',  source:'MEERA'   },
  { title:'AI Prompt Engineer',           company:'TechBridge Africa',   location:'Remote Worldwide',    emoji:'🤖', type:'tech',     salary:'$1,500–$2,500/mo',tags:['AI','Prompting','Tech'],  level:'mid',    source:'Remotive'},
  { title:'Frontend Developer (React)',   company:'FinTech Lagos',       location:'Hybrid, Lagos',       emoji:'💻', type:'nigeria',  salary:'$700–$1,000/mo', tags:['React','JavaScript'],      level:'mid',    source:'Remotive'},
  { title:'Content Creator Intern',       company:'MediaHive Africa',    location:'Lagos, Nigeria',      emoji:'📹', type:'internship',salary:'₦80,000/mo',    tags:['Content','Internship'],    level:'entry',  source:'MEERA'   },
  { title:'UX/UI Designer',               company:'ProductHQ',           location:'Remote, Africa',      emoji:'🎨', type:'creative', salary:'$900–$1,300/mo', tags:['Figma','UX','Design'],     level:'mid',    source:'Remotive'},
  { title:'Machine Learning Engineer',    company:'AI Labs International',location:'Remote Worldwide',   emoji:'🧠', type:'tech',     salary:'$3,000–$5,000/mo',tags:['Python','ML','TF'],       level:'senior', source:'Adzuna'  },
  { title:'Graphic Designer (Internship)',company:'CreativeHub NG',      location:'Ibadan, Nigeria',     emoji:'🖌️', type:'internship',salary:'₦60,000/mo',   tags:['Adobe','Design','Intern'], level:'entry',  source:'MEERA'   },
  { title:'Digital Marketing Manager',   company:'GrowthCo',            location:'Remote Worldwide',    emoji:'📊', type:'remote',   salary:'$1,200–$2,000/mo',tags:['SEO','Ads','Growth'],     level:'senior', source:'Adzuna'  }
];

// ── 15. SOCIAL PROOF & CHATBOT ──────────────────────────────────
const SP_EVENTS = [
  { av:'🎬', txt:'<strong>ChidiCreates</strong> just made an AI movie!'       },
  { av:'💰', txt:'<strong>SoundMaster NG</strong> earned $48 today'           },
  { av:'🎙️', txt:'<strong>BeatsNaija</strong> published a podcast to YouTube' },
  { av:'🎓', txt:'<strong>Ngozi W.</strong> enrolled in AI Masterclass'       },
  { av:'🛒', txt:'<strong>3 buyers</strong> purchased voice packs'            },
  { av:'🏆', txt:'<strong>TechTunde</strong> reached #2 on Leaderboard'       },
  { av:'✨', txt:'New vendor <strong>BeatsNaija</strong> just approved!'      },
  { av:'🧠', txt:'<strong>Amaka</strong> scored 95% on the IQ test!'          }
];

const CHAT_RESP = {
  price:   'Plans: Free 2 weeks → Basic $20/mo → Pro $30/mo. Vendor listing $6/mo (first month free)!',
  trial:   '2-week free trial, no credit card! Upload 3 videos/day and access free-tier tools.',
  payment: 'Visa, Mastercard, Verve, bank transfer, USSD, mobile money — all via Paystack. Global cards too!',
  vendor:  'Click "Become a Vendor". First month free, then $6/month. You keep 80% of every sale!',
  podcast: 'Podcast Studio: AI co-host, viral clips, thumbnail, multi-language, and one-click publish to YouTube, TikTok, Facebook!',
  jobs:    'Jobs board is free forever! Filter by remote, Nigeria, internships, tech. Set email alerts too!',
  quiz:    'All quizzes (Career, IQ, Personality, Relationship, Business, Skill) are 100% free!',
  coins:   'Earn coins by spinning daily, completing missions, solving treasure hunts, referring friends, and winning trivia!',
  tools:   '38+ AI tools: movies, music, voice cloning, podcast studio, social automation, editing and more.',
  default: 'Great question! Email support@meera.ai or check our FAQ section. Happy creating! 😊'
};

// ── 16. TOUR CHAPTERS ───────────────────────────────────────────
const CHAPTERS = [
  { n:1, ico:'👋', title:'Welcome & Overview',          desc:'What is MEERA?',                   dur:'1:30', script:'Welcome to MEERA — the most powerful AI creative platform in Africa! I will walk you through every feature: 38+ AI tools, podcast studio, marketplace, jobs, quizzes, student hub, comics, trivia and more.' },
  { n:2, ico:'🎬', title:'AI Studio (38+ Tools)',       desc:'Movies, music, voice, effects',     dur:'2:00', script:'The AI Studio has 38+ tools: Creative Tools (movies, music, voice), Social Automation (TikTok, YouTube, Instagram), and Editing tools. Free users get 6 tools immediately. Pro unlocks everything!' },
  { n:3, ico:'🎙️',title:'Podcast Studio',              desc:'AI co-host, clips, 1-click publish',dur:'1:45', script:'The Podcast Studio is a full production suite: AI co-host, auto chapter timestamps, viral clip extraction, thumbnail generator, multi-language dubbing, and one-click publish to YouTube, TikTok and Facebook!' },
  { n:4, ico:'🛍️',title:'Marketplace',                 desc:'Buy & sell, earn 80%',              dur:'1:30', script:'Vendors sell digital products (voice packs, templates, music) and physical items. You keep 80% per sale. First vendor month is free — then just $6/month to stay listed.' },
  { n:5, ico:'💼', title:'Jobs Board',                  desc:'Remote, Nigeria, internships, tech', dur:'1:00', script:'Free job board with live listings from Remotive, Adzuna and curated Nigerian jobs. Filter by remote, Nigeria, internships or tech. Set email alerts for your dream job!' },
  { n:6, ico:'🧠', title:'Quizzes, IQ & Trivia',        desc:'All free — earn coins for trivia',  dur:'1:00', script:'Career, IQ, Personality, Relationship, Business and Skill quizzes are all free forever. Trivia challenges award MEERA coins. The more you play, the more you earn!' },
  { n:7, ico:'📚', title:'Student Hub & Blog',          desc:'Homework, resume, comics, blog',     dur:'0:45', script:'The Student Hub has homework helper, essay writer, math solver, CV builder and scholarship finder. The live blog has daily AI news, tutorials and career guides.' },
  { n:8, ico:'💰', title:'Earn: Coins & Referrals',     desc:'All 10+ earning paths',             dur:'1:00', script:'Spin the daily wheel, complete missions, solve the treasure hunt, refer friends for $2 each, sell products, teach courses, win creator duels. There are 10+ ways to earn on MEERA!' },
  { n:9, ico:'📖', title:'Daily Quotes & Notifications',desc:'Bible verses & motivation to phone', dur:'0:30', script:'Enable notifications to receive a motivational quote at 8 AM and a Bible verse at 10 AM every day, straight to your phone. 32 quotes across 4 categories.' }
];

// ── 17. PRICING PLANS ───────────────────────────────────────────
const PLANS = [
  {
    name:'Free Trial', price:'$0', per:'2 weeks · no card needed', cls:'',
    feat:[
      '3 video uploads/day',
      'AI Movie Maker',
      'AI Music Generation',
      'Auto Subtitles (50+ languages)',
      'Mobile Photo Editor',
      'Schedule & Auto-Post ✅',
      'Job Board (free forever)',
      'All Quizzes & Trivia',
      'Homework Helper',
      'Daily Quotes & Notifications'
    ],
    btn:'Start Free Trial', act:"openModal('regModal')"
  },
  {
    name:'Basic', price:'$20', per:'per month', cls:'',
    feat:[
      '5 video uploads/day',
      'Email Marketing Campaigns',
      'Instagram & Twitter Direct Post',
      'Picture Editor (filters, crop, retouch)',
      'Direct Social Publish Hub',
      'AI Resume Builder',
      'AI Caption Generator',
      'Podcast: Subtitles & Chapter Timestamps',
      'Schedule & Auto-Post ✅'
    ],
    btn:'Subscribe — $20/mo', act:"paystackPay('basic_monthly','20')"
  },
  {
    name:'Pro', price:'$30', per:'per month · all tools', cls:'feat',
    feat:[
      'Unlimited uploads every day',
      'All 38+ AI Studio tools unlocked',
      'AI Logo Maker & Outfit Generator',
      'AI Workflow Training modules',
      'YouTube + Facebook Automation',
      'Full Podcast Studio Access',
      'AI Co-Host, Viral Clip Extraction',
      'AI Avatar Host (50+ avatars)',
      'Chatbot Assistant + AI Comics',
      'Interview Prep Q&A Library',
      'Schedule & Auto-Post ✅'
    ],
    btn:'Subscribe — $30/mo', act:"paystackPay('pro_monthly','30')"
  },
  {
    name:'Vendor Plan', price:'$6', per:'per month · sellers only', cls:'',
    feat:[
      'First month completely free',
      'Sell digital products (templates, music, voice)',
      'Sell physical products via WhatsApp',
      'Vendor dashboard & real-time analytics',
      'Paystack payout to bank account',
      'Product bundling feature',
      'Live auction access'
    ],
    btn:'Become a Vendor', act:"openModal('vendorModal')"
  }
];

// ── 18. COMIC PANELS ────────────────────────────────────────────
const COMIC_TEMPLATES = {
  'Afro-Futurism':   [{ art:'👧🏾', txt:'A young girl discovers her AI powers in Lagos…' }, { art:'🤖⚡', txt:'She builds a robot from scrap metal!' },          { art:'🌍🚀', txt:'Africa leads the world in technology!' },          { art:'🏆🌟', txt:'Her village is transformed forever.' }],
  'Action Adventure':[{ art:'🦸🏾', txt:'The hero arrives just in time…' },               { art:'💥⚔️', txt:'An epic battle breaks out!' },                     { art:'🏃🏾💨', txt:'Chase through the marketplace!' },              { art:'🎉✨', txt:'Victory! The city is saved!' }],
  'Comedy':          [{ art:'😂🍛', txt:'Chef tries to make jollof…' },                   { art:'💥🔥', txt:'Something goes terribly wrong!' },                  { art:'😱👀', txt:'The neighbours smell the smoke…' },              { art:'🍽️😋', txt:'Somehow it still tastes amazing!' }],
  'Educational':     [{ art:'📚✏️', txt:'Time for science class!' },                      { art:'🔬💡', txt:'A fascinating experiment begins…' },                { art:'🤔❓', txt:"Why does this happen? Let's find out!" },         { art:'🎓🌟', txt:"Knowledge unlocked! You're a genius!" }],
  'Romance':         [{ art:'👫💕', txt:'They meet for the first time…' },                { art:'🌹😊', txt:'He gives her a flower…' },                          { art:'💬❤️', txt:'"I\'ve been waiting for you."' },               { art:'🌅💍', txt:'And they lived happily ever after!' }],
  'Superhero':       [{ art:'🦸🏾‍♀️', txt:'By day, a regular student…' },              { art:'⚡🌪️', txt:'By night, she has AI superpowers!' },              { art:'👿💻', txt:'A villain hacks the city grid!' },               { art:'🏆🌍', txt:'MEERA AI saves the day!' }]
};

// ══════════════════════════════════════════════════════════════════
// SECTION B — ALL FUNCTIONS
// ══════════════════════════════════════════════════════════════════

// ── 19. PAGE INIT ───────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  restoreSession();
  buildSliderDots();
  setInterval(() => changeSlide(1), 5500);
  renderPricing();
  renderTools();
  renderPodFeatures();
  renderExtraTools();
  renderProducts(ALL_PRODUCTS);
  renderBlog('all');
  renderStudentHub();
  renderQuizCats();
  renderTriviaSection();
  renderWorkflows();
  renderLeaderboard();
  renderMissions();
  renderAdminTable();
  drawWheel(0);
  loadJobs();
  initScrollCounters();
  initScrollAnimations();
  displayQuote();
  startTypewriter();

  // Notification banner after 3s
  if (!localStorage.getItem('meeraNBdone') && !localStorage.getItem('meeraNotifON')) {
    setTimeout(() => document.getElementById('notifBanner').classList.add('show'), 3000);
  }
  if (localStorage.getItem('meeraNotifON') === 'true' && Notification.permission === 'granted') {
    scheduleDailyNotifs();
  }

  // Auto-open welcome video on first visit
  if (!localStorage.getItem('meeraVisited')) {
    setTimeout(openVidModal, 2200);
    localStorage.setItem('meeraVisited', 'true');
  }

  // Quote card: show after 12s, then every 6 minutes
  setTimeout(() => showQCard('motivation'), 12000);
  setInterval(() => {
    const cats = ['motivation', 'bible', 'success', 'creative'];
    showQCard(cats[Math.floor(Math.random() * cats.length)]);
  }, 6 * 60 * 1000);

  // Social proof popups
  setTimeout(showSocialProof, 6000);

  // Restore dark mode preference
  if (localStorage.getItem('meeraDark') === 'true') {
    document.body.classList.add('dark');
    const db = document.getElementById('darkBtn');
    if (db) db.textContent = '☀️ Light';
  }
});

// ── 20. UTILITIES ───────────────────────────────────────────────
function showToast(msg, ms = 3500) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
}

function nav(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  document.getElementById('navLinks')?.classList.remove('open');
}

function toggleMenu() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

function toggleDark() {
  document.body.classList.toggle('dark');
  const on = document.body.classList.contains('dark');
  const db = document.getElementById('darkBtn');
  if (db) db.textContent = on ? '☀️ Light' : '🌙 Dark';
  localStorage.setItem('meeraDark', on);
}

function openModal(id)        { document.getElementById(id)?.classList.add('open'); }
function closeModal(id)       { document.getElementById(id)?.classList.remove('open'); }
function switchModal(a, b)    { closeModal(a); openModal(b); }

// Close modals by clicking outside
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-ov')) e.target.classList.remove('open');
});

// ── 21. SLIDER ──────────────────────────────────────────────────
function buildSliderDots() {
  const slides = document.querySelectorAll('.slide');
  const dots   = document.getElementById('sliderDots');
  if (!dots) return;
  dots.innerHTML = '';
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.className = 'dot' + (i === 0 ? ' active' : '');
    b.setAttribute('aria-label', 'Slide ' + (i + 1));
    b.onclick = () => goToSlide(i);
    dots.appendChild(b);
  });
}

function goToSlide(idx) {
  const slides = document.querySelectorAll('.slide');
  const dots   = document.querySelectorAll('.dot');
  if (!slides.length) return;
  slides[curSlide].classList.remove('active');
  dots[curSlide]?.classList.remove('active');
  curSlide = (idx + slides.length) % slides.length;
  slides[curSlide].classList.add('active');
  dots[curSlide]?.classList.add('active');
}

function changeSlide(d) { goToSlide(curSlide + d); }

// ── 22. TYPEWRITER HERO ─────────────────────────────────────────
function startTypewriter() {
  const el    = document.getElementById('heroTyper');
  if (!el) return;
  const words = ['Grow.', 'Earn.', 'Create.', 'Win.', 'Shine.'];
  let wi = 0, ci = 0, deleting = false;
  setInterval(() => {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) deleting = true;
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
  }, 120);
}

// ── 23. PRICING ──────────────────────────────────────────────────
function renderPricing() {
  const g = document.getElementById('pricingGrid');
  if (!g) return;
  g.innerHTML = PLANS.map(p => `
    <div class="price-card ${p.cls}">
      ${p.cls === 'feat' ? '<div class="ptag">⭐ Most Popular</div>' : ''}
      <div class="pname">${p.name}</div>
      <div class="pamt">${p.price}</div>
      <div class="pper">${p.per}</div>
      <ul class="pfeat">
        ${p.feat.map(f => `<li><i class="fa fa-check"></i>${f}</li>`).join('')}
      </ul>
      <button class="btn btn-full ${p.cls === 'feat' ? 'btn-g' : 'btn-p'}"
        onclick="${p.act}" style="font-size:13px;padding:10px;border:none;cursor:pointer">${p.btn}</button>
    </div>
  `).join('');
}

// ── 24. RENDER TOOLS ─────────────────────────────────────────────
function renderTools() {
  const tier = currentUser ? currentUser.tier : 'none';
  function isLocked(t) {
    if (tier === 'pro') return false;
    if (tier === 'basic') return !['free', 'basic'].includes(t);
    if (tier === 'free')  return t !== 'free';
    return t !== 'free';
  }
  function card(tool) {
    const lk = isLocked(tool.tier);
    return `
      <div class="tool-card ${lk ? 'locked' : ''}"
        onclick="${lk ? `showToast('🔒 Requires ${tool.tier.toUpperCase()} plan — upgrade in Pricing!')` : `showToast('🚀 Opening ${tool.name}...')`}">
        <div class="t-ico">${tool.ico}</div>
        <h4>${tool.name}</h4>
        <p>${tool.desc}</p>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="badge ${tool.badge}">${tool.tier.toUpperCase()}</span>
          <span>${lk ? '🔒' : '→'}</span>
        </div>
      </div>`;
  }
  const tg = document.getElementById('toolsGrid');
  const sg = document.getElementById('socialGrid');
  const eg = document.getElementById('editGrid');
  if (tg) tg.innerHTML = TOOLS.creative.map(card).join('');
  if (sg) sg.innerHTML = TOOLS.social.map(card).join('');
  if (eg) eg.innerHTML = TOOLS.editing.map(card).join('');
}

// ── 25. PODCAST ──────────────────────────────────────────────────
function renderPodFeatures() {
  const g = document.getElementById('podGrid');
  if (!g) return;
  g.innerHTML = POD_FEATURES.map(f => `
    <div class="pod-card" onclick="openPodTool('${f.name}')">
      ${f.isNew ? '<div class="pod-badge"><span class="badge b-new">NEW</span></div>' : ''}
      <div class="pico">${f.ico}</div>
      <h4>${f.name}</h4>
      <p>${f.desc}</p>
      <span class="badge ${f.badge}">${f.badge.replace('b-','').toUpperCase()}</span>
    </div>
  `).join('');
}

function openPodTool(name) {
  if (!currentUser) { showToast('🔒 Log in to use Podcast Studio tools.'); openModal('loginModal'); return; }
  showToast(`🎙️ Opening ${name}… (Connect AI backend to fully activate)`);
}

// Podcast player (demo mode with fake progress)
function togglePod() {
  podFakePlaying = !podFakePlaying;
  const btn = document.getElementById('podPlayBtn');
  if (btn) btn.innerHTML = podFakePlaying ? '<i class="fa fa-pause"></i>' : '<i class="fa fa-play"></i>';
  if (podFakePlaying) {
    podFakeIv = setInterval(() => {
      podFakeTime = Math.min(podFakeTime + 1, 2538);
      const fill = document.getElementById('podFill');
      const cur  = document.getElementById('podCur');
      if (fill) fill.style.width = (podFakeTime / 2538 * 100) + '%';
      if (cur)  cur.textContent  = fmtTime(podFakeTime);
    }, 1000);
  } else {
    clearInterval(podFakeIv);
  }
}

function fmtTime(s) {
  return Math.floor(s / 60) + ':' + (s % 60).toString().padStart(2, '0');
}

function podSeek(sec) {
  podFakeTime = Math.max(0, Math.min(podFakeTime + sec, 2538));
  const fill = document.getElementById('podFill');
  const cur  = document.getElementById('podCur');
  if (fill) fill.style.width = (podFakeTime / 2538 * 100) + '%';
  if (cur)  cur.textContent  = fmtTime(podFakeTime);
  showToast(sec > 0 ? `⏩ +${sec}s` : `⏪ ${Math.abs(sec)}s`);
}

function togglePodSpeed() {
  const speeds = ['1×', '1.5×', '2×', '0.75×'];
  const btn    = document.getElementById('podSpeed');
  if (!btn) return;
  const cur = speeds.indexOf(btn.textContent);
  btn.textContent = speeds[(cur + 1) % speeds.length];
  showToast(`⚡ Speed: ${btn.textContent}`);
}

// One-click publish to YouTube/TikTok/Facebook
// In production, these call the respective platform APIs via your Node.js backend
function publishPodcast(platform) {
  if (!currentUser) { showToast('🔒 Log in to publish.'); openModal('loginModal'); return; }
  const names = { youtube:'YouTube', tiktok:'TikTok', facebook:'Facebook' };
  const urls  = {
    youtube:  'https://studio.youtube.com',
    tiktok:   'https://www.tiktok.com/upload',
    facebook: 'https://www.facebook.com/video/upload'
  };
  // In production: POST to API_BASE + '/api/podcast/publish' with {platform, episodeId, token}
  showToast(`📡 Publishing to ${names[platform]}… Opening ${names[platform]} upload page.`);
  setTimeout(() => window.open(urls[platform], '_blank'), 1000);
}

// ── 26. EXTRA AI TOOLS ──────────────────────────────────────────
function renderExtraTools() {
  const g = document.getElementById('atoolGrid');
  if (!g) return;
  g.innerHTML = EXTRA_TOOLS.map(t => `
    <div class="atool-card" onclick="${t.fn}()">
      <div class="a-ico">${t.ico}</div>
      <h4>${t.name}</h4>
      <p>${t.desc}</p>
      <div style="display:flex;gap:8px;align-items:center">
        <span class="badge b-${t.tier}">${t.tier.toUpperCase()}</span>
        <span style="font-size:11px;color:var(--muted)">Click to open →</span>
      </div>
    </div>
  `).join('');
}

// Opens the shared AI Tool modal with dynamic form content
function openAITool(title, icon, formHTML) {
  document.getElementById('atoolContent').innerHTML = `
    <div style="font-size:42px;text-align:center;margin-bottom:12px">${icon}</div>
    <h2 style="margin-bottom:4px;text-align:center">${title}</h2>
    <p style="color:var(--muted);font-size:12px;margin-bottom:22px;text-align:center">Powered by MEERA AI</p>
    ${formHTML}
  `;
  openModal('atoolModal');
}

function openResume() {
  openAITool('AI Resume Builder', '📄', `
    <div class="fg"><label>Full Name</label><input type="text" id="rv-name" placeholder="Chidi Okafor"/></div>
    <div class="fg"><label>Target Job Title</label><input type="text" id="rv-role" placeholder="e.g. AI Video Editor"/></div>
    <div class="fg"><label>Skills (comma separated)</label><input type="text" id="rv-skills" placeholder="Video editing, After Effects, AI tools…"/></div>
    <div class="fg"><label>Experience Summary</label><textarea id="rv-exp" placeholder="Brief summary of your experience…"></textarea></div>
    <div class="fg"><label>Education</label><input type="text" id="rv-edu" placeholder="BSc Computer Science, UNILAG 2022"/></div>
    <button class="btn btn-p btn-full" onclick="generateResume()">✨ Generate My Resume</button>
    <div id="rv-out" style="margin-top:16px;display:none;background:var(--cream-d);border-radius:var(--r1);padding:14px;font-size:12px;line-height:1.8;white-space:pre-line"></div>
  `);
}

function generateResume() {
  const name   = document.getElementById('rv-name').value   || 'Your Name';
  const role   = document.getElementById('rv-role').value   || 'Creative Professional';
  const skills = document.getElementById('rv-skills').value || 'AI Tools, Video Editing';
  const exp    = document.getElementById('rv-exp').value    || 'Professional creative experience';
  const edu    = document.getElementById('rv-edu').value    || "Bachelor's Degree";
  const out    = document.getElementById('rv-out');
  out.style.display = 'block';
  out.textContent   = '⏳ Generating resume…';
  setTimeout(() => {
    out.textContent = `${name.toUpperCase()}
${role}
📧 email@gmail.com  •  📱 +234 XXX XXX XXXX  •  🌍 Nigeria | Remote

━━━━━━━━━━━━━━━━━━━━━━
PROFESSIONAL SUMMARY
━━━━━━━━━━━━━━━━━━━━━━
Results-driven ${role} with expertise in ${skills}. ${exp}. Passionate about leveraging AI tools to deliver exceptional creative output.

━━━━━━━━━━━━━━━━━━━━━━
SKILLS
━━━━━━━━━━━━━━━━━━━━━━
${skills.split(',').map(s => '• ' + s.trim()).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━
EXPERIENCE
━━━━━━━━━━━━━━━━━━━━━━
${exp}

━━━━━━━━━━━━━━━━━━━━━━
EDUCATION
━━━━━━━━━━━━━━━━━━━━━━
${edu}

━━━━━━━━━━━━━━━━━━━━━━
TOOLS & PLATFORMS
━━━━━━━━━━━━━━━━━━━━━━
MEERA AI Studio • Adobe Suite • Canva • Microsoft Office • Google Workspace`;
    showToast('✅ Resume generated! Screenshot or copy to use.');
  }, 1800);
}

function openLogo() {
  openAITool('AI Logo Maker', '🎨', `
    <div class="fg"><label>Brand Name</label><input type="text" id="lg-name" placeholder="e.g. AfriTech Studio"/></div>
    <div class="fg"><label>Industry</label><input type="text" id="lg-niche" placeholder="e.g. AI Creative Agency"/></div>
    <div class="fg"><label>Style</label>
      <select id="lg-style"><option>Modern Minimal</option><option>Bold & Colourful</option><option>Afrocentric</option><option>Corporate</option><option>Playful</option></select>
    </div>
    <div class="fg"><label>Colour Preference</label><input type="text" id="lg-color" placeholder="e.g. Gold and Black"/></div>
    <button class="btn btn-p btn-full" onclick="generateLogo()">🎨 Generate Logo</button>
    <div id="lg-out" style="display:none;text-align:center;padding:22px;background:var(--cream-d);border-radius:var(--r2);margin-top:14px">
      <div id="lg-icon" style="font-size:70px;margin-bottom:10px">◆</div>
      <h3 id="lg-txt" style="font-size:22px;font-weight:900;color:var(--wood)">BRAND</h3>
      <p id="lg-sub" style="font-size:12px;color:var(--muted);margin-top:5px">Style · Colour</p>
      <p style="font-size:10px;margin-top:12px;color:var(--muted)">📌 Connect DALL-E or Stability AI API in server.js for real SVG logo generation.</p>
    </div>
  `);
}

function generateLogo() {
  const name  = document.getElementById('lg-name').value  || 'MY BRAND';
  const style = document.getElementById('lg-style').value;
  const color = document.getElementById('lg-color').value || 'Gold and Black';
  const icons = { 'Modern Minimal':'◆','Bold & Colourful':'★','Afrocentric':'🌍','Corporate':'■','Playful':'●' };
  const out   = document.getElementById('lg-out');
  out.style.display = 'block';
  document.getElementById('lg-icon').textContent = icons[style] || '◆';
  document.getElementById('lg-txt').textContent  = name.toUpperCase();
  document.getElementById('lg-sub').textContent  = style + ' · ' + (color || 'Custom palette');
  showToast('✅ Logo concept ready! Connect image API for full SVG download.');
}

function openCaption() {
  openAITool('AI Caption Generator', '✍️', `
    <div class="fg"><label>Describe your content</label><textarea id="cp-desc" placeholder="e.g. A video of me making jollof rice at 2am with a funny twist…"></textarea></div>
    <div class="fg"><label>Platform</label>
      <select id="cp-plat"><option>Instagram</option><option>TikTok</option><option>Twitter/X</option><option>LinkedIn</option><option>Facebook</option></select>
    </div>
    <div class="fg"><label>Tone</label>
      <select id="cp-tone"><option>Funny & Relatable</option><option>Inspirational</option><option>Professional</option><option>Storytelling</option><option>Bold & Direct</option></select>
    </div>
    <button class="btn btn-p btn-full" onclick="generateCaption()">✨ Generate Captions</button>
    <div id="cp-out" style="margin-top:14px;display:none"></div>
  `);
}

function generateCaption() {
  const desc = document.getElementById('cp-desc').value || 'creative content';
  const plat = document.getElementById('cp-plat').value;
  const out  = document.getElementById('cp-out');
  out.style.display = 'block';
  out.innerHTML = '<p style="color:var(--muted);font-size:12px">⏳ Generating 3 captions…</p>';
  setTimeout(() => {
    const tags = plat === 'LinkedIn' ? '#AI #Creator #Nigeria #Tech' : '#AIContent #NaijaCreator #MEERA #Viral #FYP';
    const caps = [
      `😂 POV: You're ${desc} and the results are NOT what you expected… 🔥\n\n${tags}`,
      `The secret they don't tell you about ${desc}? Watch this. 👀\n\nSave this! ${tags}`,
      `This ${desc} changed everything for me. Here's the full story 🧵\n\n${tags}`
    ];
    out.innerHTML = caps.map((c, i) => `
      <div style="background:var(--cream-d);border-radius:var(--r1);padding:11px;margin-bottom:9px">
        <p style="font-size:12px;line-height:1.7;margin-bottom:7px">${c.replace(/\n/g,'<br>')}</p>
        <button class="btn btn-o btn-sm" onclick="navigator.clipboard.writeText(${JSON.stringify(c)});showToast('📋 Caption ${i+1} copied!')">Copy</button>
      </div>
    `).join('');
  }, 1500);
}

function openOutfit() {
  openAITool('Outfit Generator', '👗', `
    <div class="fg"><label>Occasion</label>
      <select id="ot-occ"><option>Date Night</option><option>Job Interview</option><option>Wedding Guest</option><option>Casual Day Out</option><option>Church</option><option>Business Meeting</option></select>
    </div>
    <div class="fg"><label>Your Style</label>
      <select id="ot-sty"><option>Afrocentric / Traditional</option><option>Modern Casual</option><option>Smart Formal</option><option>Street Style</option><option>Elegant & Classy</option></select>
    </div>
    <div class="fg"><label>Budget</label>
      <select id="ot-bud"><option>Under $30</option><option>$30–$100</option><option>$100+</option></select>
    </div>
    <button class="btn btn-p btn-full" onclick="generateOutfit()">👗 Generate Ideas</button>
    <div id="ot-out" style="margin-top:14px;display:none"></div>
  `);
}

function generateOutfit() {
  const occ  = document.getElementById('ot-occ').value;
  const sty  = document.getElementById('ot-sty').value;
  const out  = document.getElementById('ot-out');
  out.style.display = 'block';
  out.innerHTML = '<p style="color:var(--muted);font-size:12px">⏳ Generating outfit ideas…</p>';
  setTimeout(() => {
    const ideas = [
      { e:'👔', n:'The Power Look',      d:`Tailored top + fitted bottoms. Perfect for ${occ} in ${sty} style.`,                    c:'Cream, Charcoal, Gold'        },
      { e:'👗', n:'The Statement Piece', d:`Bold print or colour that turns heads at ${occ}. Keep accessories minimal.`,            c:'Earth tones, Coral, Forest'   },
      { e:'👕', n:'The Classic Comfort', d:`Smart-casual ${sty} look — clean lines, neutral palette, elevated basics for ${occ}.`, c:'White, Navy, Tan'             }
    ];
    out.innerHTML = ideas.map(o => `
      <div style="background:var(--cream-d);border-radius:var(--r2);padding:12px;margin-bottom:8px;display:flex;gap:11px;align-items:flex-start">
        <div style="font-size:34px;flex-shrink:0">${o.e}</div>
        <div>
          <h4 style="font-size:13px;margin-bottom:3px">${o.n}</h4>
          <p style="font-size:11px;color:var(--muted);line-height:1.6;margin-bottom:4px">${o.d}</p>
          <span style="font-size:10px;color:var(--wood);font-weight:600">🎨 ${o.c}</span>
        </div>
      </div>
    `).join('');
    showToast('✅ 3 outfit ideas generated!');
  }, 1800);
}

function openHomework() {
  openAITool('Homework Helper', '📚', `
    <div class="fg"><label>Subject</label>
      <select id="hw-sub">
        <option>Mathematics</option><option>Physics</option><option>Chemistry</option><option>Biology</option>
        <option>English</option><option>History</option><option>Economics</option><option>Computer Science</option>
      </select>
    </div>
    <div class="fg"><label>Your Question</label><textarea id="hw-q" placeholder="Paste your homework question or problem here…" rows="5"></textarea></div>
    <button class="btn btn-p btn-full" onclick="solveHomework()">🧠 Solve with AI</button>
    <div id="hw-out" style="margin-top:14px;display:none;background:var(--cream-d);border-radius:var(--r2);padding:14px;font-size:12px;line-height:1.8;white-space:pre-line"></div>
  `);
}

function solveHomework() {
  const sub = document.getElementById('hw-sub').value;
  const q   = document.getElementById('hw-q').value || 'How do I solve quadratic equations?';
  const out = document.getElementById('hw-out');
  out.style.display = 'block';
  out.textContent   = '⏳ Solving your question…';
  setTimeout(() => {
    out.textContent = `📚 SUBJECT: ${sub}
❓ QUESTION: ${q}

✅ STEP-BY-STEP SOLUTION:

1. Read the question carefully and identify what is being asked.

2. Gather the relevant formula or concept for ${sub}:
   Apply the core principles at your study level.

3. Work through the problem systematically:
   • Identify all known values
   • Apply the correct formula or approach
   • Solve step by step, showing all working

4. Verify your answer by substituting back into the equation.

5. Write a clear conclusion or final answer.

💡 TIP: Connect MEERA to OpenAI / Claude API in server.js
   (POST /api/homework with { subject, question })
   to get full detailed AI-generated solutions!

📖 Want to understand this topic deeper? Use our Study Flashcards tool!`;
    showToast('✅ Solution ready! Connect AI API for full detailed answers.');
  }, 2000);
}

// Stub openers for other tools
function openVoiceRec()      { showToast('🎙️ AI Voice Recorder — requires microphone access in Pro plan.'); }
function openPresentation()  { showToast('📊 AI Presentation Maker opening… requires Pro plan.'); }
function openWebCopy()       { showToast('🌐 AI Website Copy opening… requires Basic plan.'); }
function openEmailWriter()   { showToast('💌 AI Email Writer opening…'); }
function openStory()         { showToast('🎮 AI Story Generator opening… requires Pro plan.'); }
function openDataAI()        { showToast('🧮 AI Data Analyser — upload a CSV to begin!'); }
function openTranslator()    { showToast('🌍 AI Translator — 50+ languages available!'); }
function openFlashcards()    { showToast('🧠 Study Flashcards — paste any text to begin!'); }
function openEssay()         { showToast('📄 AI Essay Writer opening…'); }
function openMath()          { showToast('🔢 Math Solver — type or photograph your problem!'); }
function openBookSum()       { showToast('📖 Book Summariser — enter a title or paste text!'); }
function openScholarship()   { showToast('🎓 Scholarship Finder searching live databases…'); }
function openStudyPlan()     { showToast('🗓️ Study Planner — enter your subjects and exam dates!'); }

// ── 27. MARKETPLACE ──────────────────────────────────────────────
function renderProducts(prods) {
  const g = document.getElementById('prodGrid');
  if (!g) return;
  if (!prods.length) { g.innerHTML = '<p style="color:var(--muted);padding:16px">No products found.</p>'; return; }
  g.innerHTML = prods.map(p => `
    <div class="prod-card" onclick="viewProd(${p.id})">
      <div class="prod-thumb">${p.emoji}</div>
      <div class="prod-info">
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span class="badge b-free">${p.cat}</span>
          ${p.type === 'physical'
            ? '<span class="badge b-basic">Physical</span>'
            : `<span class="badge b-pro">${p.downloads || 0} downloads</span>`}
        </div>
      </div>
      <div class="prod-foot">
        <span class="prod-price">$${p.price}</span>
        <button class="btn btn-p btn-sm" onclick="event.stopPropagation();buyProd(${p.id})">
          ${p.type === 'physical' ? '📲 WhatsApp' : '🛒 Buy'}
        </button>
      </div>
    </div>
  `).join('');
}

function filterProducts() {
  const s    = document.getElementById('mSearch').value.toLowerCase();
  const cat  = document.getElementById('mCat').value;
  const sort = document.getElementById('mSort').value;
  let f = ALL_PRODUCTS.filter(p =>
    (!s   || p.name.toLowerCase().includes(s) || p.desc.toLowerCase().includes(s)) &&
    (!cat || p.cat === cat)
  );
  if (sort === 'price-asc')  f.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') f.sort((a, b) => b.price - a.price);
  if (sort === 'popular')    f.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
  renderProducts(f);
}

function viewProd(id) {
  const p = ALL_PRODUCTS.find(x => x.id === id);
  if (!p) return;
  document.getElementById('prodModalContent').innerHTML = `
    <div style="text-align:center;font-size:66px;margin-bottom:12px">${p.emoji}</div>
    <h2 style="margin-bottom:4px">${p.name}</h2>
    <p style="color:var(--muted);margin-bottom:10px;font-size:13px">By ${p.vendor} · ★ ${p.rating}</p>
    <p style="font-size:13px;line-height:1.8;margin-bottom:18px">${p.desc}</p>
    <div style="display:flex;align-items:center;gap:12px;justify-content:center;flex-wrap:wrap">
      <span style="font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:var(--wood)">$${p.price}</span>
      <button class="btn btn-p" onclick="buyProd(${p.id});closeModal('prodModal')">
        ${p.type === 'physical' ? '📲 Contact via WhatsApp' : '💳 Buy Now'}
      </button>
    </div>
  `;
  openModal('prodModal');
}

function buyProd(id) {
  const p = ALL_PRODUCTS.find(x => x.id === id);
  if (!p) return;
  if (p.type === 'physical') {
    const msg = encodeURIComponent(`Hi! I want to buy "${p.name}" ($${p.price}) from MEERA Marketplace.`);
    window.open(`https://wa.me/${p.whatsapp || '+2348012345678'}?text=${msg}`, '_blank');
    return;
  }
  if (!currentUser) { showToast('🔒 Log in to purchase.'); openModal('loginModal'); return; }
  const handler = PaystackPop.setup({
    key: PAYSTACK_KEY,
    email: currentUser.email,
    amount: p.price * 1600 * 100,
    currency: 'NGN',
    ref: 'MEERA_P_' + Date.now(),
    callback: r => { showToast(`🎉 Payment successful! Ref: ${r.reference}`); p.downloads = (p.downloads || 0) + 1; },
    onClose: () => showToast('Payment closed.')
  });
  handler.openIframe();
}

// ── 28. JOBS BOARD (Remotive API + fallback) ─────────────────────
async function loadJobs() {
  const loading = document.getElementById('jobLoading');
  try {
    // Remotive.com — free remote jobs API, no key needed
    const res  = await fetch('https://remotive.com/api/remote-jobs?limit=5&search=developer', {
      signal: AbortSignal.timeout(5000)
    });
    const data = await res.json();
    const apiJobs = (data.jobs || []).slice(0, 5).map(j => ({
      title:    j.title,
      company:  j.company_name,
      location: j.candidate_required_location || 'Remote Worldwide',
      emoji:    '💻',
      type:     'remote',
      salary:   j.salary || 'Competitive',
      tags:     ['Remote', 'Tech', j.job_type || 'Full-time'],
      level:    'mid',
      source:   'Remotive'
    }));
    allJobsData = [...apiJobs, ...SAMPLE_JOBS];
  } catch (err) {
    // API unreachable (CORS / offline) — use local sample data
    allJobsData = SAMPLE_JOBS;
  }
  if (loading) loading.style.display = 'none';
  renderJobs(allJobsData);
}

function renderJobs(jobs) {
  const list = document.getElementById('jobList');
  if (!list) return;
  if (!jobs.length) { list.innerHTML = '<p style="color:var(--muted);padding:12px">No jobs match your filter.</p>'; return; }
  list.innerHTML = jobs.map((j, i) => `
    <div class="job-card">
      <div class="j-logo">${j.emoji}</div>
      <div class="j-info">
        <h4>${j.title}</h4>
        <p>${j.company} · ${j.location}</p>
        <div class="j-meta">
          ${j.tags.map(t => `<span class="jtag ${t.toLowerCase().includes('remote') ? 'remote' : t.toLowerCase().includes('intern') ? 'intern' : ''}">${t}</span>`).join('')}
          <span class="jtag">${j.source}</span>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0">
        <div style="font-weight:700;color:var(--wood);font-size:12px;margin-bottom:6px">${j.salary}</div>
        <button class="btn btn-p btn-sm" onclick="applyJob(${i})" style="margin-bottom:5px;display:block;width:100%">Apply</button>
        <button class="alert-btn" id="alertBtn${i}" onclick="setJobAlert(${i},this)">🔔 Alert Me</button>
      </div>
    </div>
  `).join('');
}

function filterJobs(type, btn) {
  currentJobFilter = type;
  document.querySelectorAll('.flt').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const f = type === 'all' ? allJobsData : allJobsData.filter(j => j.type === type);
  renderJobs(f);
}

function searchJobs() {
  const s   = document.getElementById('jobSearch').value.toLowerCase();
  const lvl = document.getElementById('jobLevel').value;
  let f = allJobsData;
  if (currentJobFilter !== 'all') f = f.filter(j => j.type === currentJobFilter);
  if (s)   f = f.filter(j => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s) || j.tags.some(t => t.toLowerCase().includes(s)));
  if (lvl) f = f.filter(j => j.level === lvl);
  renderJobs(f);
}

function applyJob(i) {
  const j = allJobsData[i];
  if (!j) return;
  if (!currentUser) { showToast('🔒 Log in to apply for jobs.'); openModal('loginModal'); return; }
  showToast(`📨 Application sent for "${j.title}"! We will send follow-up reminders automatically.`);
}

function setJobAlert(i, btn) {
  const j = allJobsData[i];
  if (!j) return;
  btn.classList.add('on');
  btn.textContent = '✓ Alerted';
  // Save alert in localStorage so it persists
  const alerts = JSON.parse(localStorage.getItem('meeraJobAlerts') || '[]');
  alerts.push({ title: j.title, type: j.type, date: new Date().toISOString() });
  localStorage.setItem('meeraJobAlerts', JSON.stringify(alerts));
  showToast(`🔔 Job alert set for "${j.title}"! You will be notified when similar roles are posted.`);
}

function subscribeAlert() {
  const email = document.getElementById('alertEmail').value.trim();
  const type  = document.getElementById('alertType').value;
  if (!email) { showToast('⚠️ Enter your email address.'); return; }
  // In production: POST to API_BASE + '/api/jobs/alert' with { email, type }
  showToast(`🔔 Job alerts activated for "${type}" to ${email}! You will be notified as jobs are posted.`);
  document.getElementById('alertEmail').value = '';
}

// ── 29. QUIZ SYSTEM ──────────────────────────────────────────────
function renderQuizCats() {
  const g = document.getElementById('qcatGrid');
  if (!g) return;
  g.innerHTML = QUIZ_CATS.map(c => `
    <div class="qcat" onclick="startQuiz('${c.id}')">
      <div class="q-ico">${c.ico}</div>
      <h4>${c.name}</h4>
      <p>${c.desc}</p>
      <span class="badge b-free">${c.qs} Qs · Free</span>
    </div>
  `).join('');
}

function startQuiz(id) {
  curQuiz   = QUIZ_CATS.find(c => c.id === id);
  curQIndex = 0;
  quizScore = 0;
  document.getElementById('qcatGrid').style.display = 'none';
  document.getElementById('quizBox').style.display  = 'block';
  document.getElementById('qResult').style.display  = 'none';
  document.getElementById('quizTitle').textContent  = curQuiz.name;
  renderQuizQ();
}

function renderQuizQ() {
  const qs  = curQuiz.questions;
  const q   = qs[curQIndex % qs.length];
  const pct = (curQIndex / Math.min(curQuiz.qs, qs.length)) * 100;
  document.getElementById('qpfill').style.width    = pct + '%';
  document.getElementById('quizCounter').textContent = `Q ${curQIndex + 1} / ${Math.min(curQuiz.qs, qs.length)}`;
  document.getElementById('qtext').textContent     = q.q;
  document.getElementById('nextQBtn').style.display = 'none';
  document.getElementById('qopts').innerHTML = q.opts.map((o, i) =>
    `<button class="qopt" onclick="answerQ(${i})">${o}</button>`
  ).join('');
}

function answerQ(idx) {
  const q    = curQuiz.questions[curQIndex % curQuiz.questions.length];
  const opts = document.querySelectorAll('#quizBox .qopt');
  opts.forEach((b, i) => {
    b.disabled = true;
    if (i === q.correct) b.classList.add('ok');
    else if (i === idx)  b.classList.add('no');
  });
  if (idx === q.correct) quizScore++;
  document.getElementById('nextQBtn').style.display = 'inline-flex';
}

function nextQ() {
  curQIndex++;
  if (curQIndex >= Math.min(curQuiz.qs, curQuiz.questions.length)) showQuizResult();
  else renderQuizQ();
}

function showQuizResult() {
  const total = Math.min(curQuiz.qs, curQuiz.questions.length);
  const pct   = Math.round((quizScore / total) * 100);
  document.getElementById('quizBox').style.display  = 'none';
  document.getElementById('qResult').style.display  = 'block';
  document.getElementById('qScore').textContent     = `${quizScore}/${total}`;
  document.getElementById('qResTitle').textContent  = pct >= 80 ? '🎉 Excellent!' : pct >= 60 ? '👍 Good Work!' : '💪 Keep Practising!';
  document.getElementById('qResDesc').textContent   = `You scored ${pct}% on the ${curQuiz.name}. ${pct >= 80 ? 'Outstanding performance!' : pct >= 60 ? 'Review the ones you missed.' : 'Every expert was once a beginner — try again!'}`;
  const coins = quizScore * 10;
  const cur   = parseInt(document.getElementById('userCoins').textContent) || 0;
  document.getElementById('userCoins').textContent = cur + coins;
  showToast(`🏆 Quiz done! +${coins} coins earned.`);
}

function closeQuiz() {
  document.getElementById('qcatGrid').style.display = 'grid';
  document.getElementById('quizBox').style.display  = 'none';
  document.getElementById('qResult').style.display  = 'none';
}
function retakeQuiz() { if (curQuiz) startQuiz(curQuiz.id); }
function shareResult() {
  const score = document.getElementById('qScore').textContent;
  const msg = encodeURIComponent(`I scored ${score} on the ${curQuiz?.name} on MEERA AI Studio! 🎓 Try free at meera.ai`);
  window.open('https://wa.me/?text=' + msg, '_blank');
}

// ── 30. TRIVIA ───────────────────────────────────────────────────
function renderTriviaSection() {
  const cats = [
    { id:'tech',    label:'🤖 AI & Tech' },
    { id:'africa',  label:'🌍 Africa'    },
    { id:'science', label:'🔬 Science'   },
    { id:'history', label:'📜 History'   }
  ];
  const cl = document.getElementById('triviaCatList');
  if (cl) {
    cl.innerHTML = cats.map(c => `
      <button class="tcat-btn ${c.id === curTriviaCat ? 'on' : ''}" onclick="setTriviaCat('${c.id}',this)">
        ${c.label}
        <span style="margin-left:auto;font-size:11px;color:var(--muted)">${TRIVIA[c.id].length} Qs</span>
      </button>
    `).join('');
  }
  const lb = document.getElementById('triviaLB');
  if (lb) {
    lb.innerHTML = LEADERBOARD.slice(0, 4).map(l => `
      <li class="lb-item">
        <div class="rank ${l.rank}">${l.rank==='g'?'🥇':l.rank==='s'?'🥈':l.rank==='b'?'🥉':'⭐'}</div>
        <div class="lav">${l.av}</div>
        <span class="lname">${l.name}</span>
        <span class="lcoin">🪙 ${l.coins.toLocaleString()}</span>
      </li>
    `).join('');
  }
  renderTriviaQ();
}

function setTriviaCat(cat, btn) {
  curTriviaCat = cat; curTrivQ = 0;
  document.querySelectorAll('.tcat-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderTriviaQ();
}

function renderTriviaQ() {
  const cat = TRIVIA[curTriviaCat];
  if (!cat) return;
  const q   = cat[curTrivQ % cat.length];
  const catLabels = { tech:'🤖 AI & Tech', africa:'🌍 Africa', science:'🔬 Science', history:'📜 History' };
  const el  = document.getElementById('triviaCat');
  const qEl = document.getElementById('triviaQ');
  const opEl= document.getElementById('triviaOpts');
  const nxt = document.getElementById('nextTrivBtn');
  if (el)  el.textContent  = catLabels[curTriviaCat] || '';
  if (qEl) qEl.textContent = q.q;
  if (opEl) opEl.innerHTML = q.opts.map((o, i) =>
    `<button class="qopt" onclick="answerTrivia(${i})">${o}</button>`
  ).join('');
  if (nxt) nxt.style.display = 'none';
  triviaAnswered = false;
  startTriviaTimer();
}

function startTriviaTimer() {
  clearInterval(triviaTimer);
  triviaTime = 15;
  const timerEl = document.getElementById('triviaTimer');
  if (timerEl) timerEl.textContent = triviaTime + 's';
  triviaTimer = setInterval(() => {
    triviaTime--;
    if (timerEl) timerEl.textContent = triviaTime + 's';
    if (triviaTime <= 0) {
      clearInterval(triviaTimer);
      if (!triviaAnswered) { showToast("⏰ Time's up!"); autoFailTrivia(); }
    }
  }, 1000);
}

function autoFailTrivia() {
  triviaAnswered = true;
  const q    = TRIVIA[curTriviaCat][curTrivQ % TRIVIA[curTriviaCat].length];
  const opts = document.querySelectorAll('#triviaOpts .qopt');
  opts.forEach((b, i) => { b.disabled = true; if (i === q.correct) b.classList.add('ok'); });
  const nxt = document.getElementById('nextTrivBtn');
  if (nxt) nxt.style.display = 'inline-flex';
}

function answerTrivia(idx) {
  if (triviaAnswered) return;
  triviaAnswered = true;
  clearInterval(triviaTimer);
  const q    = TRIVIA[curTriviaCat][curTrivQ % TRIVIA[curTriviaCat].length];
  const opts = document.querySelectorAll('#triviaOpts .qopt');
  opts.forEach((b, i) => {
    b.disabled = true;
    if (i === q.correct) b.classList.add('ok');
    else if (i === idx)  b.classList.add('no');
  });
  if (idx === q.correct) {
    triviaScore += 10;
    const cur = parseInt(document.getElementById('userCoins').textContent) || 0;
    document.getElementById('userCoins').textContent = cur + 10;
    const sc = document.getElementById('triviaScore');
    const ms = document.getElementById('myTrivScore');
    const cw = document.getElementById('triviaCoinWon');
    if (sc) sc.textContent = 'Score: ' + triviaScore;
    if (ms) ms.textContent = triviaScore;
    if (cw) cw.textContent = triviaScore + ' coins earned';
    showToast('✅ Correct! +10 coins');
  } else {
    showToast('❌ Wrong! Answer: ' + q.opts[q.correct]);
  }
  const nxt = document.getElementById('nextTrivBtn');
  if (nxt) nxt.style.display = 'inline-flex';
}

function nextTrivia() { curTrivQ++; renderTriviaQ(); }
function skipTrivia()  { curTrivQ++; renderTriviaQ(); showToast('⏭️ Question skipped'); }

// ── 31. CALCULATORS ──────────────────────────────────────────────
function switchCalc(id, btn) {
  document.querySelectorAll('.cpanel').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.ctab').forEach(t  => t.classList.remove('on'));
  document.getElementById('calc-' + id).classList.add('on');
  btn.classList.add('on');
}

function calcEarnings() {
  const prods = +document.getElementById('c-prods').value;
  const price = +document.getElementById('c-price').value;
  const sales = +document.getElementById('c-sales').value;
  const refs  = +document.getElementById('c-refs').value;
  document.getElementById('v-prods').textContent = prods;
  document.getElementById('v-price').textContent = '$' + price;
  document.getElementById('v-sales').textContent = sales;
  document.getElementById('v-refs').textContent  = refs;
  const prod  = Math.round(prods * price * sales * 0.8);
  const ref   = refs * 2;
  const total = prod + ref;
  const net   = Math.max(0, total - 6);
  document.getElementById('r-prod').textContent  = '$' + prod.toLocaleString();
  document.getElementById('r-ref').textContent   = '$' + ref;
  document.getElementById('r-total').textContent = '$' + total.toLocaleString();
  document.getElementById('r-net').textContent   = '$' + net.toLocaleString();
}

function calcSavings() {
  const mo   = +document.getElementById('s-mo').value  || 100;
  const rate = +document.getElementById('s-rate').value;
  const yrs  = +document.getElementById('s-yr').value;
  document.getElementById('sv-rate').textContent = rate + '%';
  document.getElementById('sv-yr').textContent   = yrs;
  const n    = yrs * 12, r = rate / 100 / 12;
  const fin  = r ? mo * ((Math.pow(1 + r, n) - 1) / r) : mo * n;
  const dep  = mo * n;
  document.getElementById('s-dep').textContent = '$' + Math.round(dep).toLocaleString();
  document.getElementById('s-int').textContent = '$' + Math.round(fin - dep).toLocaleString();
  document.getElementById('s-fin').textContent = '$' + Math.round(fin).toLocaleString();
}

function calcBMI() {
  const wt  = +document.getElementById('b-wt').value || 70;
  const ht  = (+document.getElementById('b-ht').value || 175) / 100;
  const bmi = wt / (ht * ht);
  const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const lo  = Math.round(18.5 * ht * ht);
  const hi  = Math.round(24.9 * ht * ht);
  document.getElementById('bmi-v').textContent = bmi.toFixed(1);
  document.getElementById('bmi-c').textContent = cat;
  document.getElementById('bmi-i').textContent = lo + '–' + hi + ' kg';
}

function calcLoan() {
  const amt  = +document.getElementById('l-amt').value  || 5000;
  const rate = +document.getElementById('l-rate').value;
  const mo   = +document.getElementById('l-mo').value;
  document.getElementById('lv-r').textContent = rate + '%';
  document.getElementById('lv-m').textContent = mo + ' mo';
  const r   = rate / 100 / 12;
  const pay = r ? amt * r * Math.pow(1 + r, mo) / (Math.pow(1 + r, mo) - 1) : amt / mo;
  const tot = pay * mo;
  document.getElementById('l-pay').textContent = '$' + pay.toFixed(0);
  document.getElementById('l-tot').textContent = '$' + tot.toFixed(0);
  document.getElementById('l-int').textContent = '$' + (tot - amt).toFixed(0);
}

function calcFreelance() {
  const inc  = +document.getElementById('f-inc').value || 2000;
  const hrs  = +document.getElementById('f-hrs').value;
  const exp  = +document.getElementById('f-exp').value || 300;
  document.getElementById('fv-h').textContent = hrs;
  const hrsMonth = hrs * 4.33;
  const min  = Math.ceil((inc + exp) / hrsMonth);
  const rec  = Math.ceil(min * 1.35);
  document.getElementById('f-min').textContent = '$' + min;
  document.getElementById('f-rec').textContent = '$' + rec;
  document.getElementById('f-ann').textContent = '$' + (rec * hrsMonth * 12).toLocaleString();
}

function addGPARow() {
  const div = document.createElement('div');
  div.className = 'crow';
  div.style.gap = '7px';
  div.innerHTML = `
    <input type="text" placeholder="Course"
      style="flex:2;padding:8px 10px;border-radius:var(--r1);border:1.5px solid rgba(139,94,60,.2);background:var(--cream-d);color:var(--text);font-size:12px;outline:none">
    <select onchange="calcGPA()" class="gsel"
      style="padding:8px 10px;border-radius:var(--r1);border:1.5px solid rgba(139,94,60,.2);background:var(--cream-d);color:var(--text);font-size:12px;outline:none">
      <option>A (5.0)</option><option>B (4.0)</option><option>C (3.0)</option><option>D (2.0)</option><option>F (0.0)</option>
    </select>
    <input type="number" placeholder="Units" min="1" max="6" value="3" oninput="calcGPA()" class="uinp"
      style="width:65px;padding:8px 10px;border-radius:var(--r1);border:1.5px solid rgba(139,94,60,.2);background:var(--cream-d);color:var(--text);font-size:12px;outline:none">
  `;
  document.getElementById('gpaRows').appendChild(div);
}

function calcGPA() {
  const gradeMap = { A:5, B:4, C:3, D:2, F:0 };
  const sels  = document.querySelectorAll('.gsel');
  const units = document.querySelectorAll('.uinp');
  let pts = 0, uts = 0;
  sels.forEach((s, i) => {
    const gr = s.value.charAt(0);
    const u  = parseFloat(units[i]?.value) || 3;
    pts += (gradeMap[gr] || 0) * u;
    uts += u;
  });
  const gpa = uts ? (pts / uts).toFixed(2) : '0.00';
  const g   = parseFloat(gpa);
  const cls = g >= 4.5 ? 'First Class' : g >= 3.5 ? '2nd Class Upper' : g >= 2.5 ? '2nd Class Lower' : g >= 1.5 ? 'Third Class' : 'Fail';
  document.getElementById('gpa-v').textContent  = gpa;
  document.getElementById('gpa-cl').textContent = cls;
}

// ── 32. BLOG ─────────────────────────────────────────────────────
function renderBlog(cat) {
  const g = document.getElementById('blogGrid');
  if (!g) return;
  const posts = cat === 'all' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.cat === cat);
  g.innerHTML = posts.slice(0, 6).map(p => `
    <div class="blog-card" onclick="showToast('📖 Opening: ${p.title.replace(/'/g,'').slice(0,40)}…')">
      <div class="blog-thumb">
        ${p.emoji}
        <div class="blog-cat">${p.cat.replace('-', ' ').toUpperCase()}</div>
      </div>
      <div class="blog-body">
        <h4>${p.title}</h4>
        <p>${p.desc}</p>
        <div class="blog-meta">
          <span>📅 ${p.date}</span>
          <span>⏱ ${p.read} read</span>
        </div>
      </div>
    </div>
  `).join('');
}

function filterBlog(cat, btn) {
  document.querySelectorAll('#blogFilters .flt').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  renderBlog(cat);
}

function loadMoreBlog() { showToast('📚 Loading more articles… Connect a CMS or API for live content.'); }

// ── 33. STUDENT HUB ──────────────────────────────────────────────
function renderStudentHub() {
  const g = document.getElementById('hubGrid');
  if (!g) return;
  g.innerHTML = HUB_ITEMS.map(h => `
    <div class="hub-card" onclick="${h.fn}()">
      <div class="h-ico">${h.ico}</div>
      <h4>${h.name}</h4>
      <p>${h.desc}</p>
      <button class="btn btn-p btn-sm">Open Tool →</button>
    </div>
  `).join('');
}

// ── 34. AI COMICS ────────────────────────────────────────────────
function genComic() {
  const genre  = document.getElementById('comicGenre').value;
  const panels = parseInt(document.getElementById('comicPanels').value);
  const prompt = document.getElementById('comicPrompt').value;
  const strip  = document.getElementById('comicStrip');
  const tmpl   = COMIC_TEMPLATES[genre] || COMIC_TEMPLATES['Afro-Futurism'];
  strip.innerHTML = '<div style="padding:18px;color:var(--muted);font-size:13px">⏳ Generating comic panels…</div>';
  setTimeout(() => {
    strip.innerHTML = tmpl.slice(0, panels).map((p, i) => `
      <div class="cpanel-c">
        <div style="font-size:10px;font-weight:700;color:var(--muted);margin-bottom:4px">PANEL ${i + 1}</div>
        <div class="cart">${p.art}</div>
        <div class="bubble">${prompt && i === 0 ? prompt.slice(0, 80) + (prompt.length > 80 ? '…' : '') : p.txt}</div>
      </div>
    `).join('');
    showToast('🎨 Comic generated! Share or download.');
  }, 1500);
}

function dlComic()   { showToast('💾 Download feature — use html2canvas in production to screenshot the strip.'); }
function shareComic(){ window.open('https://wa.me/?text=' + encodeURIComponent('Check my AI comic on MEERA! 🎬 meera.ai'), '_blank'); }

// ── 35. WORKFLOW TRAINING ─────────────────────────────────────────
function renderWorkflows() {
  const g = document.getElementById('wfGrid');
  if (!g) return;
  g.innerHTML = WORKFLOWS.map(w => `
    <div class="wf-card" onclick="showToast('🎓 Starting: ${w.title}…')">
      <h4 style="font-size:14px;margin-bottom:5px">${w.title}</h4>
      <div class="wf-steps-row">
        ${w.steps.map((s, i) =>
          `<span class="wf-step">${s}</span>${i < w.steps.length - 1 ? '<span class="wf-arrow">›</span>' : ''}`
        ).join('')}
      </div>
      <p style="font-size:12px;color:var(--muted);line-height:1.6;margin-bottom:11px">${w.desc}</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="badge b-free">${w.level}</span>
        <span style="font-size:11px;color:var(--muted)">⏱ ${w.dur}</span>
      </div>
    </div>
  `).join('');
}

// ── 36. GAMIFICATION ─────────────────────────────────────────────
function renderLeaderboard() {
  const lb = document.getElementById('leaderboard');
  if (!lb) return;
  lb.innerHTML = LEADERBOARD.map(l => `
    <li class="lb-item">
      <span class="rank ${l.rank}">${l.rank==='g'?'🥇':l.rank==='s'?'🥈':l.rank==='b'?'🥉':'⭐'}</span>
      <div class="lav">${l.av}</div>
      <span class="lname">${l.name}</span>
      <span class="lcoin">🪙 ${l.coins.toLocaleString()}</span>
    </li>
  `).join('');
}

// ── 37. SPIN WHEEL ───────────────────────────────────────────────
function drawWheel(angle) {
  const canvas = document.getElementById('spinWheel');
  if (!canvas) return;
  const ctx   = canvas.getContext('2d');
  const cx    = canvas.width / 2, cy = canvas.height / 2, r = cx - 10;
  const slice = 2 * Math.PI / SPIN_PRIZES.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  SPIN_PRIZES.forEach((p, i) => {
    const start = angle + i * slice, end = start + slice;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, start, end); ctx.closePath();
    ctx.fillStyle = p.color; ctx.fill();
    ctx.strokeStyle = '#F5F0E8'; ctx.lineWidth = 2; ctx.stroke();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(start + slice / 2);
    ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; ctx.font = 'bold 11px DM Sans,sans-serif';
    ctx.fillText(p.label, r - 10, 5); ctx.restore();
  });
  ctx.beginPath(); ctx.arc(cx, cy, 13, 0, 2 * Math.PI);
  ctx.fillStyle = '#F5F0E8'; ctx.fill();
  ctx.strokeStyle = '#8B5E3C'; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - 9, 0); ctx.lineTo(cx + 9, 0); ctx.lineTo(cx, 22); ctx.closePath();
  ctx.fillStyle = '#D4A853'; ctx.fill();
}

function spinWheel() {
  if (isSpinning) return;
  const today = new Date().toDateString();
  if (localStorage.getItem('meeraLastSpin') === today) {
    showToast('⏰ Come back tomorrow for your next spin!'); return;
  }
  isSpinning = true;
  document.getElementById('spinBtn').disabled = true;
  document.getElementById('spinResult').textContent = '🌀 Spinning…';
  const extra = (5 + Math.floor(Math.random() * 5)) * 2 * Math.PI;
  const final = Math.random() * 2 * Math.PI;
  const total = extra + final;
  const dur   = 4000, start = performance.now(), startA = wheelAngle;
  function animate(now) {
    const el  = Math.min((now - start) / dur, 1);
    const eas = 1 - Math.pow(1 - el, 3);
    wheelAngle = startA + total * eas;
    drawWheel(wheelAngle);
    if (el < 1) { requestAnimationFrame(animate); return; }
    const slice = 2 * Math.PI / SPIN_PRIZES.length;
    const norm  = ((2 * Math.PI) - (wheelAngle % (2 * Math.PI))) % (2 * Math.PI);
    const prize = SPIN_PRIZES[Math.floor(norm / slice) % SPIN_PRIZES.length];
    if (prize.label.includes('Coins')) {
      const coins = parseInt(prize.label);
      const cur   = parseInt(document.getElementById('userCoins').textContent) || 0;
      document.getElementById('userCoins').textContent = cur + coins;
    }
    document.getElementById('spinResult').textContent  = `🎉 You won: ${prize.label}!`;
    document.getElementById('spinBtn').disabled = false;
    isSpinning = false;
    localStorage.setItem('meeraLastSpin', today);
    showToast(`🎡 Congratulations! You won ${prize.label}`);
  }
  requestAnimationFrame(animate);
}

// ── 38. MISSIONS ─────────────────────────────────────────────────
function renderMissions() {
  function item(m, i, isV) {
    const done = m.prog >= m.total;
    const pct  = m.total > 0 ? Math.round(m.prog / m.total * 100) : 0;
    return `
      <div class="miss-item ${done ? 'done' : ''}" onclick="completeMission(${i},${isV ? 1 : 0})">
        <span class="m-ico">${m.ico}</span>
        <div class="m-info">
          <h4>${m.title}</h4><p>${m.desc}</p>
          <div class="mpbar"><div class="mpfill" style="width:${done ? 100 : pct}%"></div></div>
        </div>
        <span class="m-rew">${m.reward}</span>
        <div class="m-chk">${done ? '✓' : ''}</div>
      </div>`;
  }
  const ml  = document.getElementById('missList');
  const vml = document.getElementById('vendorMissList');
  if (ml)  ml.innerHTML  = MISSIONS.map((m, i) => item(m, i, false)).join('');
  if (vml) vml.innerHTML = VENDOR_MISSIONS.map((m, i) => item(m, i, true)).join('');
}

function completeMission(i, isV) {
  const arr = isV ? VENDOR_MISSIONS : MISSIONS;
  const m   = arr[i];
  if (!m || m.prog >= m.total) return;
  m.prog++;
  renderMissions();
  if (m.prog >= m.total) {
    showToast(`🎯 Mission complete: ${m.title}! ${m.reward}`);
    const coins = parseInt((m.reward.match(/\d+/) || ['0'])[0]);
    if (m.reward.includes('coins') && coins > 0) {
      const cur = parseInt(document.getElementById('userCoins').textContent) || 0;
      document.getElementById('userCoins').textContent = cur + coins;
    }
  }
}

// ── 39. QUOTES ───────────────────────────────────────────────────
function displayQuote() {
  const cat  = curQTab;
  const item = QUOTES[cat][quoteIndexes[cat]];
  const mq   = document.getElementById('mainQ');
  const mr   = document.getElementById('mainQRef');
  const qc   = document.getElementById('qCounter');
  if (mq) mq.textContent = `"${item.q}"`;
  if (mr) mr.textContent = item.a;
  if (qc) qc.textContent = `Quote ${quoteIndexes[cat] + 1} of ${QUOTES[cat].length}`;
}
function switchQTab(cat, btn) {
  curQTab = cat;
  document.querySelectorAll('.qtab').forEach(t => t.classList.remove('on'));
  btn.classList.add('on');
  displayQuote();
}
function nextQMain() {
  quoteIndexes[curQTab] = (quoteIndexes[curQTab] + 1) % QUOTES[curQTab].length;
  displayQuote();
  showToast('✨ Next quote!');
}
function copyQMain() {
  const q = document.getElementById('mainQ')?.textContent;
  const a = document.getElementById('mainQRef')?.textContent;
  if (q) navigator.clipboard.writeText(q + ' ' + a).then(() => showToast('📋 Copied!'));
}
function shareQMain() {
  const q = document.getElementById('mainQ')?.textContent;
  const a = document.getElementById('mainQRef')?.textContent;
  if (q) window.open('https://wa.me/?text=' + encodeURIComponent(q + ' ' + a + '\n\n🎬 MEERA AI Studio'), '_blank');
}

// ── 40. QUOTE CARD (phone notification style) ────────────────────
let qCardIdx = 0;
function showQCard(cat) {
  const list = QUOTES[cat] || QUOTES.motivation;
  const item = list[qCardIdx % list.length];
  qCardIdx++;
  const icons = { motivation:'✨', bible:'📖', success:'💰', creative:'🎨' };
  const now   = new Date();
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setIH = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML  = val; };
  setEl('qCardIco',  icons[cat]);
  setEl('qCardApp',  'MEERA · Daily Inspiration');
  setEl('qCardTime', now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }));
  setEl('qCardTag',  icons[cat] + ' ' + cat.charAt(0).toUpperCase() + cat.slice(1));
  setIH('qCardQ',    `"${item.q}"`);
  setEl('qCardAuth', item.a);
  const card = document.getElementById('quoteCard');
  if (card) card.classList.add('show');
}
function closeQCard()  { document.getElementById('quoteCard')?.classList.remove('show'); }
function nextQCard()   { closeQCard(); setTimeout(() => { const cats = ['motivation','bible','success','creative']; showQCard(cats[Math.floor(Math.random()*cats.length)]); }, 400); }
function shareQCard()  { const q = document.getElementById('qCardQ')?.textContent; if (q) window.open('https://wa.me/?text=' + encodeURIComponent(q + '\n\n🎬 MEERA AI'), '_blank'); }
function copyQCard()   { const q = document.getElementById('qCardQ')?.textContent; if (q) navigator.clipboard.writeText(q).then(() => showToast('📋 Copied!')); }

// ── 41. PUSH NOTIFICATIONS ───────────────────────────────────────
function requestNotif() {
  if (!('Notification' in window)) { showToast('⚠️ Notifications not supported.'); dismissNotif(); return; }
  Notification.requestPermission().then(perm => {
    if (perm === 'granted') {
      localStorage.setItem('meeraNotifON', 'true');
      dismissNotif();
      showToast('🔔 Notifications on! Daily quotes arrive at 8 AM.');
      sendNotif('🎉 MEERA Enabled!', '"The secret of getting ahead is getting started." — Mark Twain');
      scheduleDailyNotifs();
      setTimeout(() => showQCard('motivation'), 1500);
    } else {
      showToast('🔕 Blocked — re-enable in browser settings.'); dismissNotif();
    }
  });
}

function sendNotif(title, body) {
  if (Notification.permission === 'granted') {
    const n = new Notification(title, { body, tag: 'meera-daily' });
    n.onclick = () => { window.focus(); nav('quotes'); n.close(); };
    setTimeout(() => n.close(), 8000);
  }
}

function scheduleDailyNotifs() {
  const now  = new Date();
  const next = new Date(); next.setHours(8, 0, 0, 0);
  if (now > next) next.setDate(next.getDate() + 1);
  setTimeout(() => {
    const mi = QUOTES.motivation[Math.floor(Math.random() * QUOTES.motivation.length)];
    sendNotif('☀️ Good Morning!', `"${mi.q}" ${mi.a}`);
    showQCard('motivation');
    setTimeout(() => {
      const bi = QUOTES.bible[Math.floor(Math.random() * QUOTES.bible.length)];
      sendNotif('📖 Daily Bible Verse', `"${bi.q}" ${bi.a}`);
      showQCard('bible');
    }, 2 * 3600 * 1000);
    setTimeout(() => {
      const si = QUOTES.success[Math.floor(Math.random() * QUOTES.success.length)];
      sendNotif('🌟 Evening Motivation', `"${si.q}" ${si.a}`);
    }, 10 * 3600 * 1000);
    setInterval(scheduleDailyNotifs, 24 * 3600 * 1000);
  }, next - now);
}

function dismissNotif() {
  document.getElementById('notifBanner')?.classList.remove('show');
  localStorage.setItem('meeraNBdone', 'true');
}

// ── 42. CHATBOT ───────────────────────────────────────────────────
function toggleChat() { document.getElementById('chatPopup')?.classList.toggle('open'); }
function sendChat() {
  const inp  = document.getElementById('chatInput');
  const txt  = inp?.value.trim();
  if (!txt) return;
  const msgs = document.getElementById('chatMsgs');
  if (!msgs) return;
  msgs.innerHTML += `<div class="cmsg usr">${txt}</div>`;
  inp.value = '';
  setTimeout(() => {
    const lower = txt.toLowerCase();
    let reply   = CHAT_RESP.default;
    for (const [k, v] of Object.entries(CHAT_RESP)) {
      if (lower.includes(k)) { reply = v; break; }
    }
    msgs.innerHTML += `<div class="cmsg bot">${reply}</div>`;
    msgs.scrollTop = msgs.scrollHeight;
  }, 700);
  msgs.scrollTop = msgs.scrollHeight;
}

// ── 43. WELCOME VIDEO TOUR ───────────────────────────────────────
function openVidModal() {
  const m = document.getElementById('vidModal');
  if (m) { m.style.display = 'flex'; m.classList.add('open'); }
  renderChapters();
  selectChapter(0);
}
function closeVidModal() {
  const m = document.getElementById('vidModal');
  if (m) { m.style.display = 'none'; m.classList.remove('open'); }
  clearTimeout(chInterval);
  isPlaying = false;
}

function renderChapters() {
  const list = document.getElementById('chList');
  if (!list) return;
  list.innerHTML = CHAPTERS.map((c, i) => `
    <div class="ch-item ${i === curChapter ? 'on' : ''}" id="chi-${i}" onclick="selectChapter(${i})">
      <div class="ch-num">${c.n}</div>
      <div class="ch-info"><h4>${c.ico} ${c.title}</h4><p>${c.desc}</p></div>
      <span class="ch-dur">${c.dur}</span>
      <button class="ch-play-btn" onclick="event.stopPropagation();playChapter(${i})">▶</button>
    </div>
  `).join('');
}

function selectChapter(i) {
  curChapter = i;
  const c    = CHAPTERS[i];
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('vmAv',       c.ico);
  setEl('vmName',     `Chapter ${c.n}: ${c.title}`);
  setEl('vmScript',   c.script);
  setEl('vmVidTitle', c.ico + ' ' + c.title);
  setEl('vmVidSub',   c.desc + ' · ' + c.dur);
  document.querySelectorAll('.ch-item').forEach(el => el.classList.remove('on'));
  document.getElementById('chi-' + i)?.classList.add('on');
  clearTimeout(chInterval);
  isPlaying = false;
  const prog    = document.getElementById('vmProg');
  const playBtn = document.getElementById('vmPlayBtn');
  if (prog)    prog.style.display = 'none';
  if (playBtn) playBtn.innerHTML  = '▶';
}

function playChapter(i) {
  selectChapter(i);
  isPlaying = true;
  const prog    = document.getElementById('vmProg');
  const playBtn = document.getElementById('vmPlayBtn');
  if (prog)    prog.style.display = 'block';
  if (playBtn) playBtn.innerHTML  = '⏸';
  const [m, s] = CHAPTERS[i].dur.split(':').map(Number);
  const ms     = Math.min((m * 60 + s) * 1000, 8000); // cap at 8s for demo
  chInterval   = setTimeout(() => {
    if (i < CHAPTERS.length - 1) { selectChapter(i + 1); playChapter(i + 1); }
    else {
      const titleEl  = document.getElementById('vmVidTitle');
      const scriptEl = document.getElementById('vmScript');
      const btnEl    = document.getElementById('vmPlayBtn');
      if (titleEl)  titleEl.textContent  = '🎉 Tour Complete!';
      if (scriptEl) scriptEl.textContent = "You have completed the full MEERA tour! Click 'Start Free Trial' to begin your journey.";
      if (btnEl)    btnEl.innerHTML      = '▶';
    }
  }, ms);
}
async function convertVideoToAI() {
  const fileInput = document.getElementById('convertVideoFile');
  const style     = document.getElementById('convertStyle').value;
  const file      = fileInput.files[0];
  if (!file) { showToast('⚠️ Please select a video file first.'); return; }

  showToast('⏳ Uploading and converting… this takes 1–2 minutes.');

  // Step 1: upload file to your server first
  const formData = new FormData();
  formData.append('video', file);
  const uploadRes  = await fetch(API_BASE + '/api/upload/video', {
    method: 'POST', body: formData
  });
  const uploadData = await uploadRes.json();
  const videoUrl   = uploadData.url; // hosted URL of uploaded video

  // Step 2: send to AI conversion
  const convRes  = await fetch(API_BASE + '/api/ai/convert-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrl, style, prompt: `${style} cinematic style` })
  });
  const convData = await convRes.json();

  // Step 3: poll until done
  const pollId = setInterval(async () => {
    const pollRes  = await fetch(API_BASE + '/api/ai/convert-video/' + convData.predictionId);
    const pollData = await pollRes.json();
    if (pollData.status === 'done') {
      clearInterval(pollId);
      document.getElementById('convertOutput').src = pollData.outputUrl;
      document.getElementById('convertOutput').style.display = 'block';
      showToast('🎬 AI video conversion complete!');
    } else if (pollData.status === 'failed') {
      clearInterval(pollId);
      showToast('❌ Conversion failed. Try a shorter clip.');
    }
  }, 5000); // check every 5 seconds
}

// ── VIDEO PODCAST RECORDER ───────────────────────────────────────
let mediaStream    = null;  // webcam + mic stream
let mediaRecorder  = null;  // recorder object
let recordedChunks = [];    // video data chunks
let recordedBlob   = null;  // final video blob

// Step 1: request camera + microphone access
async function startCamera() {
  try {
    // Ask browser for webcam and microphone permission
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, facingMode: 'user' },
      audio: { echoCancellation: true, noiseSuppression: true }
    });

    // Show live preview in the video element
    const preview = document.getElementById('podPreview');
    preview.srcObject = mediaStream;
    preview.style.display = 'block';

    // Show/hide buttons
    document.getElementById('startCamBtn').style.display = 'none';
    document.getElementById('recordBtn').style.display   = 'inline-flex';

    showToast('📷 Camera ready! Click Start Recording when you are ready.');

  } catch (err) {
    // User denied permission or no camera found
    showToast('❌ Camera access denied. Please allow camera and microphone in your browser settings.');
    console.error('Camera error:', err);
  }
}

// Step 2: start recording
function startRecording() {
  if (!mediaStream) { showToast('⚠️ Start your camera first.'); return; }

  recordedChunks = [];

  // Create recorder — use webm format (works in all modern browsers)
  mediaRecorder = new MediaRecorder(mediaStream, {
    mimeType: 'video/webm;codecs=vp9,opus'
  });

  // Collect video data as it records
  mediaRecorder.ondataavailable = (event) => {
    if (event.data && event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  // When recording stops, create the final video file
  mediaRecorder.onstop = () => {
    recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
    const url    = URL.createObjectURL(recordedBlob);

    // Show playback of the recording
    const playback = document.getElementById('podPlayback');
    playback.src   = url;
    playback.style.display = 'block';

    // Show download and publish buttons
    document.getElementById('downloadBtn').style.display  = 'inline-flex';
    document.getElementById('podPublishForm').style.display = 'block';

    showToast('✅ Recording saved! Preview it below, then publish or download.');
  };

  // Start recording — collect data every 1 second
  mediaRecorder.start(1000);

  // Update button states
  document.getElementById('recordBtn').style.display = 'none';
  document.getElementById('stopBtn').style.display   = 'inline-flex';

  // Show recording timer
  startRecordingTimer();
  showToast('🔴 Recording started! Speak clearly into your microphone.');
}

// Step 3: stop recording
function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  stopRecordingTimer();
  document.getElementById('stopBtn').style.display   = 'none';
  document.getElementById('recordBtn').style.display = 'inline-flex';
}

// Step 4: download the recording
function downloadRecording() {
  if (!recordedBlob) { showToast('⚠️ No recording found.'); return; }
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(recordedBlob);
  a.download = (document.getElementById('podEpTitle')?.value || 'podcast-episode') + '.webm';
  a.click();
  showToast('💾 Downloading your podcast episode!');
}

// ── RECORDING TIMER ──────────────────────────────────────────────
let recTimerInterval = null;
let recSeconds       = 0;

function startRecordingTimer() {
  recSeconds = 0;
  recTimerInterval = setInterval(() => {
    recSeconds++;
    const m = Math.floor(recSeconds / 60).toString().padStart(2,'0');
    const s = (recSeconds % 60).toString().padStart(2,'0');
    const btn = document.getElementById('stopBtn');
    if (btn) btn.textContent = `⏹ Stop — ${m}:${s}`;
  }, 1000);
}

function stopRecordingTimer() {
  clearInterval(recTimerInterval);
  const btn = document.getElementById('stopBtn');
  if (btn) btn.textContent = '⏹ Stop Recording';
}

// ── UPLOAD AND PUBLISH ───────────────────────────────────────────
// Updated publishPodcast — now uploads the recorded video first

async function publishPodcast(platform) {
  if (!currentUser) {
    showToast('🔒 Log in to publish your podcast.');
    openModal('loginModal');
    return;
  }

  const title = document.getElementById('podEpTitle')?.value?.trim();
  const desc  = document.getElementById('podEpDesc')?.value?.trim();

  if (!title) {
    showToast('⚠️ Please add an episode title before publishing.');
    return;
  }

  // If user recorded in browser, upload blob to server first
  let videoUrl = null;

  if (recordedBlob) {
    showToast(`⏳ Uploading to ${platform}… this may take a moment.`);

    const formData = new FormData();
    formData.append('video', recordedBlob, title + '.webm');
    formData.append('title', title);
    formData.append('desc',  desc || '');

    try {
      const uploadRes  = await fetch(API_BASE + '/api/podcast/upload', {
        method: 'POST',
        body:   formData,
        headers: { Authorization: `Bearer ${localStorage.getItem('meeraToken')}` }
      });
      const uploadData = await uploadRes.json();
      videoUrl         = uploadData.url;
    } catch (err) {
      showToast('❌ Upload failed. Check your internet connection.');
      return;
    }
  }

  // Now publish to the chosen platform
  try {
    const res  = await fetch(`${API_BASE}/api/podcast/publish/${platform}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${localStorage.getItem('meeraToken')}` },
      body:    JSON.stringify({ title, description: desc, videoUrl })
    });
    const data = await res.json();

    if (data.success) {
      showToast(`🎉 Published to ${platform}! ${data.videoUrl ? 'View: ' + data.videoUrl : ''}`);
    } else {
      // Fallback — open platform manually
      const urls = {
        youtube:  'https://studio.youtube.com',
        tiktok:   'https://www.tiktok.com/upload',
        facebook: 'https://www.facebook.com/video/upload'
      };
      showToast(`⚠️ Auto-publish needs API approval. Opening ${platform} to upload manually.`);
      setTimeout(() => window.open(urls[platform], '_blank'), 1200);
    }
  } catch (err) {
    showToast('❌ Publish failed. Check your backend is running.');
  }
}



// ── 44. SOCIAL PROOF POPUP ───────────────────────────────────────
function showSocialProof() {
  const el  = document.getElementById('socialProof');
  const evt = SP_EVENTS[spIdx % SP_EVENTS.length]; spIdx++;
  const av  = document.getElementById('spAv');
  const txt = document.getElementById('spTxt');
  if (av)  av.textContent = evt.av;
  if (txt) txt.innerHTML  = evt.txt;
  if (el)  { el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 4000); }
  setTimeout(showSocialProof, 9000 + Math.random() * 5000);
}

// ── 45. VENDOR DASHBOARD ─────────────────────────────────────────
function showPanel(id) {
  document.querySelectorAll('[id^="panel-"]').forEach(p => p.style.display = 'none');
  const panel = document.getElementById('panel-' + id);
  if (panel) panel.style.display = 'block';
  document.querySelectorAll('.ditem').forEach(d => d.classList.remove('on'));
  if (event?.currentTarget) event.currentTarget.classList.add('on');
  if (id === 'analytics') drawAnalyticsChart();
}

function drawAnalyticsChart() {
  const ctx = document.getElementById('analyticsChart');
  if (!ctx || ctx._drawn) return;
  ctx._drawn = true;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [
        { label:'Sales ($)',  data:[80,120,95,160,200,180], borderColor:'#8B5E3C', backgroundColor:'rgba(139,94,60,.1)', tension:.4, fill:true },
        { label:'Views',      data:[200,350,280,420,560,490],borderColor:'#D4A853', backgroundColor:'rgba(212,168,83,.1)',tension:.4, fill:true }
      ]
    },
    options: { responsive:true, plugins:{ legend:{ position:'top' } }, scales:{ y:{ beginAtZero:true } } }
  });
}

function reqPayout() {
  const amt = document.getElementById('payoutAmt')?.value;
  if (!amt || parseFloat(amt) < 10) { showToast('⚠️ Minimum payout is $10.'); return; }
  showToast(`✅ Payout of $${amt} requested! Processed within 24–48 hours.`);
}

function copyRef() {
  const link = `https://meera.ai/ref/${currentUser ? currentUser.id : 'DEMO123'}`;
  navigator.clipboard.writeText(link).then(() => showToast('✅ Referral link copied!'));
}

function submitProd() {
  const name  = document.getElementById('prodName')?.value.trim();
  const desc  = document.getElementById('prodDesc')?.value.trim();
  const price = document.getElementById('prodPrice')?.value;
  if (!name || !desc || !price) { showToast('⚠️ Fill in name, description and price.'); return; }
  const cat    = document.getElementById('prodCat')?.value || 'Templates';
  const catMap = { Templates:'templates','Voice Packs':'voice','Video Effects':'effects','Music Packs':'music','Physical Product':'physical' };
  const eMap   = { Templates:'🎬','Voice Packs':'🎙️','Video Effects':'✨','Music Packs':'🎵','Physical Product':'📦' };
  ALL_PRODUCTS.push({
    id: ALL_PRODUCTS.length + 1, name, desc,
    price: parseFloat(price),
    cat:   catMap[cat] || 'templates',
    emoji: eMap[cat]   || '📦',
    vendor: currentUser ? currentUser.name : 'You',
    type:   cat === 'Physical Product' ? 'physical' : 'digital',
    downloads: 0, rating: 5.0
  });
  renderProducts(ALL_PRODUCTS);
  showToast('✅ Product submitted for review! Appears after admin approval.');
  ['prodName','prodDesc','prodPrice'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

function showFN(input, outId) {
  const f  = input.files[0];
  const el = document.getElementById(outId);
  if (f && el) el.textContent = '✓ ' + f.name;
}

// ── 46. ADMIN TABLE ──────────────────────────────────────────────
function renderAdminTable() {
  const tbody = document.getElementById('vendorTBody');
  if (!tbody) return;
  const vendors = [
    { name:'SoundMaster NG', email:'sound@example.com', s1:'https://instagram.com/soundmaster', s2:'https://tiktok.com/@soundmaster', status:'active'  },
    { name:'CineAfrica',     email:'cine@example.com',  s1:'https://youtube.com/cineafrica',    s2:'',                                status:'pending' }
  ];
  tbody.innerHTML = vendors.map(v => `
    <tr>
      <td><strong>${v.name}</strong></td>
      <td>${v.email}</td>
      <td>${v.s1 ? `<a href="${v.s1}" target="_blank" style="color:var(--wood)">View →</a>` : '—'}</td>
      <td>${v.s2 ? `<a href="${v.s2}" target="_blank" style="color:var(--wood)">View →</a>` : '—'}</td>
      <td><span class="sb ${v.status === 'active' ? 'sb-o' : 'sb-p'}">${v.status === 'active' ? 'Approved' : 'Pending'}</span></td>
      <td>${v.status === 'pending'
        ? `<button class="btn btn-p btn-sm" onclick="approveV(this)" style="margin-right:4px">✓ Approve</button>
           <button class="btn btn-sm" style="background:var(--err-bg);color:var(--err);border:1px solid var(--err);border-radius:99px;padding:6px 12px;cursor:pointer" onclick="rejectV(this)">✗ Reject</button>`
        : '<span style="color:var(--ok);font-size:12px">✓ Approved</span>'
      }</td>
    </tr>
  `).join('');
}

function approveV(btn) {
  const row = btn.closest('tr');
  row.querySelector('.sb').className   = 'sb sb-o';
  row.querySelector('.sb').textContent = 'Approved';
  btn.parentElement.innerHTML = '<span style="color:var(--ok);font-size:12px">✓ Approved</span>';
  showToast('✅ Vendor approved!');
}
function rejectV(btn) {
  const row = btn.closest('tr');
  row.querySelector('.sb').className   = 'sb sb-r';
  row.querySelector('.sb').textContent = 'Rejected';
  btn.parentElement.innerHTML = '<span style="color:var(--err);font-size:12px">✗ Rejected</span>';
  showToast('❌ Vendor rejected.');
}

// ── 47. USER AUTH ────────────────────────────────────────────────
async function registerUser() {
  const name  = document.getElementById('regName')?.value.trim();
  const email = document.getElementById('regEmail')?.value.trim();
  const pw    = document.getElementById('regPw')?.value;
  const ref   = document.getElementById('regRef')?.value.trim();
  if (!name || !email || !pw) { showToast('⚠️ Fill in all required fields.'); return; }
  if (pw.length < 8)          { showToast('⚠️ Password must be at least 8 characters.'); return; }
  try {
    const res  = await fetch(API_BASE + '/api/register', {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ name, email, password:pw, refCode:ref })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('meeraUser', JSON.stringify(currentUser));
      updateNav(); renderTools(); closeModal('regModal');
      showToast(`🎉 Welcome ${name}! Your 2-week free trial has started.`);
    } else {
      showToast('❌ ' + (data.message || 'Registration failed.'));
    }
  } catch {
    // Demo mode — backend not running
    currentUser = { id:'demo_'+Date.now(), name, email, tier:'free' };
    localStorage.setItem('meeraUser', JSON.stringify(currentUser));
    updateNav(); renderTools(); closeModal('regModal');
    showToast(`🎉 Welcome ${name}! (Demo mode — start Node.js backend for full features)`);
  }
}

async function loginUser() {
  const email = document.getElementById('loginEmail')?.value.trim();
  const pw    = document.getElementById('loginPw')?.value;
  if (!email || !pw) { showToast('⚠️ Enter email and password.'); return; }
  try {
    const res  = await fetch(API_BASE + '/api/login', {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ email, password:pw })
    });
    const data = await res.json();
    if (data.success) {
      currentUser = data.user;
      localStorage.setItem('meeraUser', JSON.stringify(currentUser));
      updateNav(); renderTools(); closeModal('loginModal');
      showToast(`👋 Welcome back, ${data.user.name}!`);
    } else {
      showToast('❌ ' + (data.message || 'Login failed.'));
    }
  } catch {
    currentUser = { id:'demo', name:'Demo User', email, tier:'free' };
    localStorage.setItem('meeraUser', JSON.stringify(currentUser));
    updateNav(); renderTools(); closeModal('loginModal');
    showToast('👋 Logged in! (Demo mode — start backend for full features)');
  }
}

async function applyVendor() {
  const name = document.getElementById('vName')?.value.trim();
  const email= document.getElementById('vEmail')?.value.trim();
  if (!name || !email) { showToast('⚠️ Name and email required.'); return; }
  closeModal('vendorModal');
  showToast("✅ Application submitted! We'll review within 24 hours and contact you.");
}

function updateNav() {
  const r = document.getElementById('navRight');
  if (!currentUser || !r) return;
  const tierLabel = { free:'🆓 Free', basic:'⚡ Basic', pro:'🌟 Pro' };
  r.innerHTML = `
    <button id="darkBtn" onclick="toggleDark()"
      style="background:none;border:1.5px solid var(--wood-l);border-radius:99px;padding:5px 11px;cursor:pointer;color:var(--text);font-size:12px">
      🌙 Dark
    </button>
    <span style="font-size:12px;color:var(--muted)">${tierLabel[currentUser.tier] || '🆓 Free'}</span>
    <span style="font-weight:600;color:var(--wood);font-size:13px">${currentUser.name}</span>
    <button class="btn btn-o btn-sm" onclick="logout()">Logout</button>
  `;
}

function logout() { currentUser = null; localStorage.removeItem('meeraUser'); location.reload(); }

function restoreSession() {
  const saved = localStorage.getItem('meeraUser');
  if (!saved) return;
  try { currentUser = JSON.parse(saved); updateNav(); } catch { localStorage.removeItem('meeraUser'); }
}

// ── 48. PAYSTACK ─────────────────────────────────────────────────
function paystackPay(plan, usd) {
  if (!currentUser) { showToast('🔒 Log in first to subscribe.'); openModal('regModal'); return; }
  const handler = PaystackPop.setup({
    key:      PAYSTACK_KEY,
    email:    currentUser.email,
    amount:   parseFloat(usd) * 1600 * 100, // USD → NGN → Kobo
    currency: 'NGN',
    ref:      'MEERA_SUB_' + plan + '_' + Date.now(),
    callback: r => { showToast('💳 Payment received! Activating plan…'); activatePlan(plan, r.reference); },
    onClose:  () => showToast('Payment window closed.')
  });
  handler.openIframe();
}

async function activatePlan(plan, ref) {
  try {
    const res  = await fetch(API_BASE + '/api/subscribe', {
      method: 'POST', headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({ userId:currentUser.id, plan, reference:ref })
    });
    const data = await res.json();
    if (data.success) {
      const tierMap = { basic_monthly:'basic', pro_monthly:'pro' };
      currentUser.tier = tierMap[plan] || 'basic';
      localStorage.setItem('meeraUser', JSON.stringify(currentUser));
      updateNav(); renderTools();
      showToast(`🎉 ${plan.replace('_',' ')} activated! Tools unlocked.`);
    }
  } catch {
    showToast('✅ Plan activated! (Demo mode — start backend to verify payment)');
  }
}

// ── 49. FAQ ACCORDION ────────────────────────────────────────────
function toggleFAQ(q) {
  const item    = q.parentElement;
  const wasOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!wasOpen) item.classList.add('open');
}

// ── 50. SCROLL COUNTER ANIMATION ─────────────────────────────────
function initScrollCounters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const target = parseInt(el.dataset.target) || 0;
      const step   = target / (2000 / 16);
      let cur      = 0;
      const iv = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(iv); }
        el.textContent = Math.floor(cur).toLocaleString() + '+';
      }, 16);
      obs.unobserve(el);
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.count-up').forEach(el => obs.observe(el));
}

// ── 51. SCROLL ANIMATIONS ────────────────────────────────────────
function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  setTimeout(() => {
    const selectors = '.tool-card,.prod-card,.price-card,.job-card,.blog-card,.hub-card,.atool-card,.pod-card,.wf-card,.qcat,.test-card';
    document.querySelectorAll(selectors).forEach(el => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(20px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      obs.observe(el);
    });
  }, 600);
}

// End of app.js