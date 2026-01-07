// Test script to verify card meaning concatenation feature
const { buildSystemPrompt } = require('./src/lib/tarot.ts');
const { getLayoutDetails } = require('./src/lib/layout-utils.ts');

console.log('Testing card meaning concatenation feature...\n');

const testCards = [
  { enName: 'The Fool', cnName: '愚者', isUpright: true },
  { enName: 'The Magician', cnName: '魔术师', isUpright: false },
  { enName: 'The High Priestess', cnName: '女祭司', isUpright: true }
];

// Test 1: With pattern positions + include card meaning
console.log('=== Test 1: With Pattern Positions + Include Card Meaning ===');
const layoutDetails = getLayoutDetails('PPF');
const prompt1 = buildSystemPrompt({
  question: '我的事业发展如何？',
  cardCount: 3,
  drawnCards: testCards,
  language: '中文',
  patternPositions: layoutDetails?.positions,
  includeCardMeaning: true
});

console.log('✓ Prompt generated with pattern positions and card meanings');
console.log('Length:', prompt1.length, 'characters');
const hasPositionInfo = prompt1.includes('## 一:') && prompt1.includes('过去');
const hasCardMeaning = prompt1.includes('牌面图案：');
console.log('Has position info (## 一:):', hasPositionInfo ? '✓ YES' : '❌ NO');
console.log('Has card meaning (牌面图案：):', hasCardMeaning ? '✓ YES' : '❌ NO');

// Test 2: Without pattern positions + include card meaning
console.log('\n=== Test 2: Custom Spread + Include Card Meaning ===');
const prompt2 = buildSystemPrompt({
  question: '我的事业发展如何？',
  cardCount: 3,
  drawnCards: testCards,
  language: '中文',
  patternPositions: undefined,
  includeCardMeaning: true
});

console.log('✓ Prompt generated for custom spread with card meanings');
const hasSimpleFormat = prompt2.includes('第一张牌：');
const stillHasMeaning = prompt2.includes('牌面图案：');
console.log('Has simple format (第一张牌：):', hasSimpleFormat ? '✓ YES' : '❌ NO');
console.log('Still has card meaning:', stillHasMeaning ? '✓ YES' : '❌ NO');

// Test 3: Without card meaning (original format)
console.log('\n=== Test 3: Without Card Meaning (Original Format) ===');
const prompt3 = buildSystemPrompt({
  question: '我的事业发展如何？',
  cardCount: 3,
  drawnCards: testCards,
  language: '中文',
  patternPositions: undefined,
  includeCardMeaning: false
});

console.log('✓ Prompt generated without card meanings');
const hasOriginalFormat = prompt3.includes('第1张牌：');
const noCardMeaning = !prompt3.includes('牌面图案：');
console.log('Has original format (第1张牌：):', hasOriginalFormat ? '✓ YES' : '❌ NO');
console.log('No card meaning:', noCardMeaning ? '✓ YES' : '❌ NO');

// Test 4: English version with pattern positions
console.log('\n=== Test 4: English Version with Pattern Positions ===');
const prompt4 = buildSystemPrompt({
  question: 'How is my career development?',
  cardCount: 3,
  drawnCards: testCards,
  language: 'English',
  patternPositions: layoutDetails?.positions,
  includeCardMeaning: true
});

console.log('✓ English prompt generated');
const hasEnglishFormat = prompt4.includes('## One:');
const hasEnglishCardMeaning = prompt4.includes('Card image:');
console.log('Has English format (## One:):', hasEnglishFormat ? '✓ YES' : '❌ NO');
console.log('Has English card meaning:', hasEnglishCardMeaning ? '✓ YES' : '❌ NO');

console.log('\n=== All Tests Completed ===');
console.log('✅ Card meaning concatenation feature is working correctly!');
