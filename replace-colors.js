const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'app', 'src', 'screens');

const replaceColors = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace colors
  content = content.replace(/#007bff/g, '#0b4cad');
  content = content.replace(/#3498db/g, '#00aff2');
  content = content.replace(/#333('|")/g, '#03175b$1'); // dark text
  content = content.replace(/#f4f7f6/g, '#f8f9fb'); // main background

  fs.writeFileSync(filePath, content, 'utf8');
};

const files = fs.readdirSync(screensDir);
files.forEach(file => {
  if (file.endsWith('.tsx')) {
    replaceColors(path.join(screensDir, file));
  }
});

console.log('Mobile colors replaced.');
