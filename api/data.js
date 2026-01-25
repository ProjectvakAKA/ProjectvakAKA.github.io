// api/data.js
// Dit bestand haalt automatisch je JSON uit Dropbox wanneer iemand de API aanroept

import { Dropbox } from 'dropbox';

export default async function handler(req, res) {
  // CORS - zodat je frontend de API kan aanroepen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Alleen GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Maak Dropbox client met refresh token
    const dbx = new Dropbox({
      clientId: process.env.DROPBOX_APP_KEY,
      clientSecret: process.env.DROPBOX_APP_SECRET,
      refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
    });

    console.log('Fetching from Dropbox:', process.env.DROPBOX_JSON_PATH);

    // Download het JSON bestand
    const response = await dbx.filesDownload({ 
      path: process.env.DROPBOX_JSON_PATH || '/data.json'
    });

    // Parse de binary data naar JSON
    const fileContent = response.result.fileBinary.toString('utf-8');
    const jsonData = JSON.parse(fileContent);

    // Return de data met metadata
    return res.status(200).json({
      success: true,
      data: jsonData,
      metadata: {
        lastModified: response.result.server_modified,
        size: response.result.size,
        path: response.result.path_display
      }
    });

  } catch (error) {
    console.error('Dropbox API Error:', error);
    
    // Geef een duidelijke error message terug
    return res.status(500).json({
      success: false,
      error: error.message,
      details: error.error?.error_summary || 'Check Vercel logs for details'
    });
  }
}

// Optioneel: caching om niet elke keer Dropbox te raken
export const config = {
  maxDuration: 10, // Timeout na 10 seconden
};
