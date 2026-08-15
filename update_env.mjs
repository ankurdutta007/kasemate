import fs from 'fs';

const keyPath = '/Users/ankurdutta/Downloads/gen-lang-client-0923615173-237341f8b5de.json';
const envPath = '.env';

const newKey = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
const newKeyStr = JSON.stringify(newKey);

let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(/GOOGLE_CREDENTIALS='.*?'/s, `GOOGLE_CREDENTIALS='${newKeyStr}'`);

fs.writeFileSync(envPath, envContent);

console.log('NEW KEY PREFIX:', newKeyStr.substring(0, 30));
