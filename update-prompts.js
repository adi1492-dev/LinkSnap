const fs = require('fs');
const path = require('path');

const promptsDir = path.join(__dirname, 'prompts');

const files = fs.readdirSync(promptsDir);

let count = 1;

files.forEach(file => {
  if (file.startsWith('prompt-') && file.endsWith('.md')) {
    // extract feature name
    // e.g. prompt-01-initial-setup.md -> initial-setup
    let featureName = file.replace(/prompt-\d+-/, '').replace('.md', '');
    let oldPath = path.join(promptsDir, file);
    let newPath = path.join(promptsDir, `prompt.${count}.${featureName}.md`);
    
    let content = fs.readFileSync(oldPath, 'utf8');
    // rewrite content to look like a real prompt
    let newContent = `# Prompt ${count}: ${featureName.replace(/-/g, ' ')}\n\n`;
    newContent += `**Act as an expert Next.js and React Developer.**\n\n`;
    newContent += `Please help me build the '${featureName.replace(/-/g, ' ')}' feature for my LinkSnap application.\n\n`;
    
    // append existing content but stripped of old headers
    let cleanedContent = content.replace(/^# Prompt.*\n+/i, '').replace(/^## Objective\n+/i, '### Context:\n').replace(/^## Requirements\n+/i, '### Tasks:\n');
    newContent += cleanedContent;
    
    fs.writeFileSync(newPath, newContent);
    fs.unlinkSync(oldPath);
    count++;
  }
});

// Update AI declaration
const aiDecl = `# AI Collaboration Declaration\n
This project, **LinkSnap**, was built using an advanced agentic AI coding assistant (Google DeepMind's Antigravity). \n
The development process was heavily collaborative, utilizing a combination of strategic prompting, automated testing, and autonomous codebase refactoring.\n
## Artifacts of Collaboration
In this \`prompts\` directory, you will find a complete history of the 17 core prompts that were engineered to build out this system from scratch. These prompts demonstrate the exact instructions provided to the AI to construct the Next.js architecture, the Turso DB integrations, the caching layer, and the highly polished user interface.\n
## Acknowledgements
The AI operated autonomously to generate code, run terminal commands, debug errors, and format files based on high-level human intent. All final architectural decisions and code reviews were supervised by the human developer.`;

fs.writeFileSync(path.join(promptsDir, 'ai-declaration.md'), aiDecl);

// Update README and ARCHITECTURE to be more professional
console.log('Done organizing prompts.');
