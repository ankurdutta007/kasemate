import textToSpeech from '@google-cloud/text-to-speech';

// Check for credentials
const credentialsStr = process.env.GOOGLE_CREDENTIALS;
let client;

if (credentialsStr) {
  try {
    const credentials = JSON.parse(credentialsStr);
    client = new textToSpeech.TextToSpeechClient({ credentials });
  } catch (e) {
    console.error('Failed to parse GOOGLE_CREDENTIALS', e);
  }
} else {
  // Fallback for local development if auth is set up via ADC
  client = new textToSpeech.TextToSpeechClient();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, voiceName, ssml } = req.body;

  if ((!text && !ssml) || !voiceName) {
    return res.status(400).json({ error: 'Missing text/ssml or voiceName' });
  }

  try {
    const request: any = {
      input: ssml ? { ssml: ssml } : { text: text },
      voice: { languageCode: 'en-IN', name: voiceName },
      audioConfig: { audioEncoding: 'MP3' },
    };
    
    if (ssml) {
      request.enableTimePointing = ['SSML_MARK'];
    }

    const [response] = await client.synthesizeSpeech(request);
    
    // Convert Uint8Array to base64
    const base64Audio = Buffer.from(response.audioContent).toString('base64');
    
    res.status(200).json({ audioContent: base64Audio, timepoints: response.timepoints || [] });
  } catch (error) {
    console.error('TTS Error:', error);
    res.status(500).json({ error: 'Failed to synthesize speech', details: error.message });
  }
}
