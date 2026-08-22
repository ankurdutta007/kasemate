const fs = require('fs');

let content = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

// Add import
if (!content.includes('landing-v2.css')) {
  content = content.replace(
    "import { supabase } from '../lib/supabase'",
    "import { supabase } from '../lib/supabase'\nimport '../components/landing-v2/landing-v2.css'"
  );
}

// Add lv2-root to wrapper
content = content.replace(
  'className="auth-wrapper"',
  'className="auth-wrapper lv2-root"'
);

// Fix the KaseMate logo font (it didn't apply because Libre Baskerville doesn't actually have an italic axis available without adding it to the google fonts import, wait. "Libre Baskerville" does have italic, but maybe we should use the .lv2-display class or just use the font directly. The prompt said "Change the KaseMate wordmark's font-family from 'Newsreader', serif to 'Libre Baskerville', serif". I did that.
// Let's also ensure the color in the wordmark is rendering correctly. It was var(--text-primary) originally. I changed it to var(--lv2-text).

fs.writeFileSync('src/pages/Auth.tsx', content, 'utf8');
console.log('Modifications applied');
