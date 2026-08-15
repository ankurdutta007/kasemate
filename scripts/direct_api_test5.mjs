// The AQ. token is expired (it was a short-lived OAuth access token, not a permanent API key).
// generate_solutions.mjs passed it to GoogleGenAI SDK which then used ADC to get a fresh token.
// The .env file key was never a real Gemini API key - it's a stale OAuth token.
// Let's check if there's a real AIza API key anywhere else in the project.
import { execSync } from 'child_process';

try {
  const result = execSync('grep -r "AIza" /Users/ankurdutta/Downloads/code --include="*.env" --include="*.json" --include="*.toml" -l 2>/dev/null || true').toString();
  console.log('Files with AIza keys:', result || 'none found');
} catch(e) {}

// Also check if there's a Vertex AI project setup
try {
  const result2 = execSync('grep -r "GOOGLE_CLOUD_PROJECT" /Users/ankurdutta/Downloads/code 2>/dev/null | head -5 || true').toString();
  console.log('GOOGLE_CLOUD_PROJECT references:', result2 || 'none');
} catch(e) {}

// Check if gcloud is set up and has a token
try {
  const token = execSync('gcloud auth print-access-token 2>/dev/null || true').toString().trim();
  if (token && token.startsWith('ya29.')) {
    console.log('gcloud token available, prefix:', token.substring(0, 20));
  } else {
    console.log('gcloud token result:', token.substring(0, 50) || 'none');
  }
} catch(e) { console.log('gcloud not available'); }
