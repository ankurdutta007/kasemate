const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('/Users/ankurdutta/Downloads/code/src');
let changed = 0;
files.forEach(f => {
    const content = fs.readFileSync(f, 'utf8');
    if (content.includes(' — ')) {
        const newContent = content.replace(/ — /g, ', ');
        fs.writeFileSync(f, newContent, 'utf8');
        changed++;
        console.log(`Updated ${f}`);
    } else if (content.includes('—')) {
        const newContent = content.replace(/—/g, ',');
        fs.writeFileSync(f, newContent, 'utf8');
        changed++;
        console.log(`Updated ${f}`);
    }
});
console.log(`Done. Changed ${changed} files.`);
