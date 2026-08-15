import fs from 'fs';
let chatTs = fs.readFileSync('api/chat.ts', 'utf8');
chatTs = chatTs.replace(
  "const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`\n    const response = await fetch(url, {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },",
  `let url = \`https://generativelanguage.googleapis.com/v1beta/models/\${GEMINI_MODEL}:generateContent\`;
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey && (apiKey.startsWith('ya29.') || apiKey.startsWith('AQ.'))) {
      headers['Authorization'] = \`Bearer \${apiKey}\`;
    } else {
      url += \`?key=\${apiKey}\`;
    }
    const response = await fetch(url, {
      method: 'POST',
      headers,`
);
fs.writeFileSync('api/chat.ts', chatTs);
console.log("Patched auth");
