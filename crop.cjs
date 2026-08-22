const sharp = require('sharp');

sharp('/Users/ankurdutta/.gemini/antigravity-ide/brain/6c92aaeb-4fb3-458c-bfdf-fe97234f3b66/turn_final_50.png')
  .extract({ left: 120, top: 400, width: 250, height: 250 })
  .toFile('/Users/ankurdutta/.gemini/antigravity-ide/brain/6c92aaeb-4fb3-458c-bfdf-fe97234f3b66/turn_final_50_topleft.png')
  .then(() => console.log('topleft done'));

sharp('/Users/ankurdutta/.gemini/antigravity-ide/brain/6c92aaeb-4fb3-458c-bfdf-fe97234f3b66/turn_final_50.png')
  .extract({ left: 1070, top: 400, width: 250, height: 250 })
  .toFile('/Users/ankurdutta/.gemini/antigravity-ide/brain/6c92aaeb-4fb3-458c-bfdf-fe97234f3b66/turn_final_50_topright.png')
  .then(() => console.log('topright done'));
