// Quick test to verify the prompt template system works
const { buildSystemPrompt, drawCards } = require('./src/lib/tarot.ts');

const testCards = [
  { enName: 'The Fool', cnName: '愚者', isUpright: true },
  { enName: 'The Magician', cnName: '魔术师', isUpright: false },
  { enName: 'The High Priestess', cnName: '女祭司', isUpright: true }
];

console.log('Testing Chinese prompt...\n');
const cnPrompt = buildSystemPrompt({
  question: '我的事业发展如何？',
  cardCount: 3,
  drawnCards: testCards,
  language: '中文'
});
console.log('✓ Chinese prompt generated');
console.log('  Length:', cnPrompt.length, 'characters');
console.log('  Starts with:', cnPrompt.substring(0, 50) + '...');

console.log('\nTesting English prompt...\n');
const enPrompt = buildSystemPrompt({
  question: 'How is my career development?',
  cardCount: 3,
  drawnCards: testCards,
  language: 'English'
});
console.log('✓ English prompt generated');
console.log('  Length:', enPrompt.length, 'characters');
console.log('  Starts with:', enPrompt.substring(0, 50) + '...');

console.log('\n✅ Both prompts generated successfully!');
console.log('\nTemplate variables replaced correctly:');
console.log('  - {{question}} replaced:', cnPrompt.includes('{{question}}') ? '❌ NO' : '✓ YES');
console.log('  - {{cardCount}} replaced:', cnPrompt.includes('{{cardCount}}') ? '❌ NO' : '✓ YES');
console.log('  - Contains actual question:', cnPrompt.includes('我的事业发展如何') ? '✓ YES' : '❌ NO');
console.log('  - English contains question:', enPrompt.includes('How is my career development') ? '✓ YES' : '❌ NO');
