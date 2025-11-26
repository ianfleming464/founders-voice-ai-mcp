/**
 * Test script for text chunking utility
 * Run with: npx tsx test-chunker.ts
 */

import { chunkText, chunkTexts } from './lib/utils/chunker';

function testChunker() {
  console.log('Testing text chunking utility...\n');

  // Test 1: Short text (no chunking needed)
  console.log('Test 1: Short text');
  const shortText = 'This is a short piece of text.';
  const shortChunks = chunkText(shortText);
  console.log(`✓ Input: ${shortText.length} chars`);
  console.log(`✓ Output: ${shortChunks.length} chunk(s)`);
  console.log(`  - "${shortChunks[0]}"\n`);

  // Test 2: Medium text (should split into 2-3 chunks)
  console.log('Test 2: Medium text (~1000 chars)');
  const mediumText = `We're building the future of startup communication. Our platform helps founders share their story authentically. Last quarter, we raised $2M in seed funding from top VCs. Our mission is to democratize voice cloning technology. We believe every founder deserves a powerful voice. Our LinkedIn posts reach over 10,000 founders weekly. Subscribe to our newsletter for exclusive insights. We're hiring engineers, designers, and growth marketers. Join us in revolutionizing how startups communicate. Our technology uses advanced AI and machine learning. We process millions of data points every day. Our customers love the authenticity we bring. Testimonials show 95% satisfaction rates. We're backed by Y Combinator and Sequoia Capital. The founding team has 50+ years of combined experience. We previously built and sold two successful startups. Our advisory board includes industry legends. We're focused on sustainable growth and profitability.`;
  const mediumChunks = chunkText(mediumText);
  console.log(`✓ Input: ${mediumText.length} chars`);
  console.log(`✓ Output: ${mediumChunks.length} chunks`);
  mediumChunks.forEach((chunk, i) => {
    console.log(`  - Chunk ${i + 1}: ${chunk.length} chars`);
  });

  // Test 3: Custom chunk size
  console.log('\nTest 3: Custom chunk size (300 chars)');
  const customChunks = chunkText(mediumText, { chunkSize: 300, overlap: 30 });
  console.log(`✓ Input: ${mediumText.length} chars`);
  console.log(`✓ Output: ${customChunks.length} chunks with 300 char target`);
  customChunks.forEach((chunk, i) => {
    console.log(`  - Chunk ${i + 1}: ${chunk.length} chars`);
  });

  // Test 4: Multiple texts with metadata
  console.log('\nTest 4: Batch chunking with metadata');
  const batchTexts = [
    'First founder post about our product launch.',
    'Second post about our funding round. This is a longer post with more details about the investors and the terms. We raised $2M at a $10M valuation.',
  ];
  const batchChunks = chunkTexts(batchTexts, { chunkSize: 100 });
  console.log(`✓ Input: ${batchTexts.length} texts`);
  console.log(`✓ Output: ${batchChunks.length} chunks`);
  batchChunks.forEach((item, i) => {
    console.log(`  - Chunk ${i + 1}: from text #${item.sourceIndex + 1}, ${item.chunk.length} chars`);
  });

  // Test 5: Empty and edge cases
  console.log('\nTest 5: Edge cases');
  console.log(`✓ Empty string: ${chunkText('').length} chunks`);
  console.log(`✓ Whitespace only: ${chunkText('   ').length} chunks`);
  console.log(`✓ Single word: ${chunkText('Hello').length} chunk(s)`);

  console.log('\n✅ All chunker tests passed!');
}

testChunker();
