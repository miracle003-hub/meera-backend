import 'dotenv/config'; // Loads your secret token safely
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';

async function uploadVideo() {
  // 1. This is the official Facebook background URL (safe to hardcode)
  const url = 'https://graph.facebook.com/v25.0/me/videos';
  
  // 2. Prepare the video file and caption
  const form = new FormData();
  form.append('access_token', process.env.FACEBOOK_ACCESS_TOKEN);
  form.append('description', 'This video was uploaded automatically using Node.js! 🚀');
  
  // Replace 'my-video.mp4' with the actual path to the video on your computer
  form.append('source', fs.createReadStream('./my-video.mp4')); 

  try {
    console.log('Uploading video to Facebook... Please wait...');
    
    // 3. Send the request directly to Facebook's servers
    const response = await axios.post(url, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    // If successful, Facebook returns a video ID
    console.log('✅ Success! Video uploaded successfully.');
    console.log('Facebook Video ID:', response.data.id);
    
  } catch (error) {
    console.error('❌ Upload failed:');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

uploadVideo();