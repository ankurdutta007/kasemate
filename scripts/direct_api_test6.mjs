// The generate_solutions.mjs works because GoogleGenAI SDK when given an AQ. token
// actually treats it as an access token and uses it as a Bearer internally,
// but these AQ. tokens expire. The one in .env is now stale/expired.
// Let's confirm this theory by checking the SDK source.
// Also check: what's the GoogleGenAI SDK doing with AQ. tokens?
import { readFileSync } from 'fs';

// Check @google/genai source for how it handles keys
try {
  const sdkSrc = readFileSync('node_modules/@google/genai/dist/index.js', 'utf-8');
  const authSection = sdkSrc.match(/.{200}AQ\..{200}/);
  if (authSection) console.log('SDK AQ. handling:', authSection[0].substring(0, 400));
  
  const apiKeyHandling = sdkSrc.match(/.{100}apiKey.{300}/);
  if (apiKeyHandling) console.log('SDK apiKey handling:', apiKeyHandling[0].substring(0, 400));
} catch(e) {
  console.log('Could not read SDK source:', e.message);
}

// The real fix: update the GEMINI_API_KEY in .env to a real persistent API key (AIza...)
// The user needs to create one at https://aistudio.google.com/apikey
// OR we switch generate_solutions.mjs to show how it worked - maybe it used ADC not the key

// Check if ADC is available
import { execSync } from 'child_process';
try {
  const adcPath = execSync('cat ~/.config/gcloud/application_default_credentials.json 2>/dev/null | head -3 || echo "NOT FOUND"').toString();
  console.log('ADC credentials:', adcPath.substring(0, 200));
} catch(e) {}
