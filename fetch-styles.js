const https = require('https');

https.get('https://ismobiophotonics.com/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Find all style blocks
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let match;
    let styles = '';
    while ((match = styleRegex.exec(data)) !== null) {
      styles += match[1] + '\n';
    }

    // Find inline styles
    const inlineRegex = /style="([^"]+)"/gi;
    while ((match = inlineRegex.exec(data)) !== null) {
      styles += match[1] + '\n';
    }
    
    // Check for inline colors in HTML
    const colorRegex = /#[0-9a-fA-F]{3,6}/g;
    const colors = new Set(data.match(colorRegex));

    // Check for fonts
    const fontRegex = /font-family:\s*([^;]+)/g;
    const fonts = new Set();
    let fontMatch;
    while ((fontMatch = fontRegex.exec(styles)) !== null) {
      fonts.add(fontMatch[1].trim());
    }

    console.log("=== COLORS FOUND ===");
    console.log(Array.from(colors).join(', '));
    console.log("\n=== FONTS FOUND ===");
    console.log(Array.from(fonts).join(', '));
  });
}).on('error', err => {
  console.log("Error: " + err.message);
});
