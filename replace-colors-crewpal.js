const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'app', 'src', 'screens');
const navigationDir = path.join(__dirname, 'app', 'src', 'navigation');

const replaceColors = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace Ismobiophotonics colors with CREWPAL colors
  content = content.replace(/#0b4cad/g, '#1a3626');
  content = content.replace(/#00aff2/g, '#2a5a3f');
  content = content.replace(/#03175b/g, '#1a3626'); 
  content = content.replace(/#f8f9fb/g, '#f7f4ec');

  fs.writeFileSync(filePath, content, 'utf8');
};

const replaceInDir = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.endsWith('.tsx')) {
      replaceColors(path.join(dir, file));
    }
  });
};

replaceInDir(screensDir);
replaceInDir(navigationDir);

console.log('Mobile colors replaced with CREWPAL scheme.');
