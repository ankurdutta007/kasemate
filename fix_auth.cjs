const fs = require('fs');

let content = fs.readFileSync('src/pages/Auth.tsx', 'utf8');

// FIX 1: Font
content = content.replace(/'"Newsreader", serif'/, '\'"Libre Baskerville", serif\'');

// FIX 2: Imports
if (!content.includes('import imgStrategy')) {
  content = content.replace(/import img9 from '@\/imports\/image-9\.webp'/, "import img9 from '@/imports/image-9.webp'\nimport imgStrategy from '@/imports/strategy.webp'\nimport imgStructure from '@/imports/structure-case.webp'");
}

// FIX 2: Features
content = content.replace(/img: null,\s*label: 'Personalized roadmap',/g, "img: imgStrategy,\n    label: 'Personalized roadmap',");
content = content.replace(/img: null,\s*label: 'Structured case solutions',/g, "img: imgStructure,\n    label: 'Structured case solutions',");

// FIX 3: Theme variables
const replacements = {
  'var(--bg)': 'var(--lv2-bg)',
  'var(--bg2)': 'var(--lv2-bg-elevated)',
  'var(--bg3)': 'var(--lv2-glass)',
  'var(--text-primary)': 'var(--lv2-text)',
  'var(--text-muted)': 'var(--lv2-text-muted)',
  'var(--border)': 'var(--lv2-hairline)',
  'var(--primary-glow)': 'var(--lv2-accent)',
  'linear-gradient(135deg, var(--primary-mid), var(--primary))': 'var(--lv2-accent)',
  'var(--primary-mid)': 'var(--lv2-accent)',
};

for (const [oldVal, newVal] of Object.entries(replacements)) {
  // Be careful with exact matches where needed, but global replace is mostly safe for these vars
  content = content.split(oldVal).join(newVal);
}

// FIX 3: Hardcoded hexes and ternaries
// Remove isDark definition since it's now always dark theme
// Actually, it's safer to just replace the specific strings.

// Left pane background
content = content.replace(
  /background: isDark\s*\?\s*'linear-gradient\(145deg, var\(--lv2-glass\) 0%, var\(--lv2-bg-elevated\) 60%, var\(--lv2-bg\) 100%\)'\s*:\s*'linear-gradient\(145deg, #fdf5fd 0%, #fdfafd 100%\)'/,
  "background: 'linear-gradient(145deg, var(--lv2-glass) 0%, var(--lv2-bg-elevated) 60%, var(--lv2-bg) 100%)'"
);

// Right pane background
content = content.replace(
  /background: isDark\s*\?\s*'linear-gradient\(160deg, #130e2e 0%, #0d0f14 60%\)'\s*:\s*'linear-gradient\(160deg, #f0ebff 0%, #f8f6ff 50%, #ffffff 100%\)'/,
  "background: 'linear-gradient(160deg, var(--lv2-bg-elevated) 0%, var(--lv2-bg) 60%)'"
);

// Toggle buttons
content = content.replace(
  /backgroundColor: mode === m \? \(isDark \? 'var\(--lv2-accent\)' : '#fff'\) : 'transparent'/,
  "backgroundColor: mode === m ? 'var(--lv2-accent)' : 'transparent'"
);
content = content.replace(
  /color: mode === m \? \(isDark \? '#fff' : 'var\(--lv2-text\)'\) : 'var\(--lv2-text-muted\)'/,
  "color: mode === m ? '#fff' : 'var(--lv2-text-muted)'"
);

// Stats boxes
content = content.replace(
  /backgroundColor: isDark \? 'rgba\(255,255,255,0\.06\)' : 'rgba\(255,255,255,0\.92\)'/,
  "backgroundColor: 'var(--lv2-glass)'"
);
content = content.replace(
  /border: `1px solid \$\{isDark \? 'rgba\(124,58,237,0\.3\)' : 'rgba\(124,58,237,0\.12\)'\}`/,
  "border: '1px solid var(--lv2-hairline)'"
);
content = content.replace(
  /boxShadow: isDark \? '0 8px 32px rgba\(0,0,0,0\.4\)' : '0 8px 24px rgba\(124,58,237,0\.06\)'/,
  "boxShadow: '0 8px 32px rgba(0,0,0,0.4)'"
);

// Features list items
content = content.replace(
  /backgroundColor: isDark \? 'rgba\(255,255,255,0\.035\)' : 'rgba\(255,255,255,0\.85\)'/g,
  "backgroundColor: 'var(--lv2-glass)'"
);
content = content.replace(
  /border: `1px solid \$\{isDark \? 'rgba\(255,255,255,0\.06\)' : 'rgba\(124,58,237,0\.1\)'\}`/g,
  "border: '1px solid var(--lv2-hairline)'"
);

// Icon boxes
content = content.replace(
  /background: isDark \? 'rgba\(124,58,237,0\.15\)' : '#ede8ff'/g,
  "background: 'var(--lv2-bg-elevated)'"
);
content = content.replace(
  /border: `1px solid \$\{isDark \? 'rgba\(124,58,237,0\.25\)' : 'rgba\(124,58,237,0\.18\)'\}`/g,
  "border: '1px solid var(--lv2-hairline)'"
);

fs.writeFileSync('src/pages/Auth.tsx', content, 'utf8');
console.log('Modifications applied');
