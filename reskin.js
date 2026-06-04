const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('app/dashboard/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

const replacements = {
  // Backgrounds
  'bg-white': 'bg-slate-900',
  'bg-gray-50/50': 'bg-slate-950/50',
  'bg-gray-50': 'bg-slate-950',
  'bg-gray-100': 'bg-slate-800',
  'bg-gray-200': 'bg-slate-700',
  'bg-gray-900': 'bg-slate-900', // Keep dark elements dark, or maybe lighten? Let's leave as slate-900
  'bg-gray-800': 'bg-slate-800',
  
  // Borders
  'border-gray-100': 'border-slate-800/50',
  'border-gray-200': 'border-slate-800',
  'border-gray-300': 'border-slate-700',
  'border-gray-800': 'border-slate-700',
  
  // Text
  'text-gray-900': 'text-slate-50',
  'text-gray-800': 'text-slate-100',
  'text-gray-700': 'text-slate-200',
  'text-gray-600': 'text-slate-300',
  'text-gray-500': 'text-slate-400',
  'text-gray-400': 'text-slate-500',
  'text-gray-300': 'text-slate-400',

  // Blues
  'bg-blue-50': 'bg-blue-500/10',
  'border-blue-100': 'border-blue-500/20',
  'text-blue-900': 'text-blue-50',
  'text-blue-700': 'text-blue-400',
  'text-blue-600': 'text-blue-500',

  // Reds
  'bg-red-50': 'bg-red-500/10',
  'border-red-100': 'border-red-500/20',
  'text-red-700': 'text-red-400',
  
  // Ambers
  'bg-amber-50': 'bg-amber-500/10',
  'text-amber-700': 'text-amber-400',

  // Greens
  'bg-green-50': 'bg-green-500/10',
  'text-green-700': 'text-green-400',

  // Hovers
  'hover:bg-gray-50': 'hover:bg-slate-800',
  'hover:bg-gray-100': 'hover:bg-slate-800',
  'hover:bg-gray-200': 'hover:bg-slate-700',
  'hover:text-gray-900': 'hover:text-white',
  'hover:text-gray-800': 'hover:text-slate-200',
  'hover:text-gray-600': 'hover:text-slate-300',
};

// We need to apply replacements carefully to avoid replacing part of a class
// E.g. bg-gray-50 should not match inside bg-gray-500
// We use regex boundary \b
for (const [key, value] of Object.entries(replacements)) {
  // Escape string for regex
  const safeKey = key.replace(/([-\/\\^$*+?.()|[\]{}])/g, '\\$1');
  // Match prefix class bounded by spaces, quotes, or colons
  const regex = new RegExp(`(?<=[\\s"'\\\`:])${safeKey}(?=[\\s"'\\\`])`, 'g');
  content = content.replace(regex, value);
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully reskinned dashboard.');
