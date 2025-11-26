/**
 * Quick test script for OpenAI embeddings wrapper
 * Run with: npx tsx test-embeddings.ts
 */

import 'dotenv/config';
import { createEmbedding, createEmbeddings } from './lib/openai/embeddings';

async function testEmbeddings() {
  console.log('Testing OpenAI embeddings wrapper...\n');

  // Test 1: Single embedding
  console.log('Test 1: Single text embedding');
  const singleText = 'Hello, I am a startup founder building a revolutionary product.';
  const singleEmbedding = await createEmbedding(singleText);
  console.log(`✓ Generated embedding with ${singleEmbedding.length} dimensions`);
  console.log(`✓ First 5 values: [${singleEmbedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}...]`);

  // Test 2: Batch embeddings
  console.log('\nTest 2: Batch embeddings');
  const batchTexts = [
    'We raised $2M in seed funding last quarter.',
    'Our LinkedIn posts reach 10K+ founders weekly.',
    'Subscribe to my newsletter for startup insights.',
  ];
  const batchEmbeddings = await createEmbeddings(batchTexts);
  console.log(`✓ Generated ${batchEmbeddings.length} embeddings`);
  batchEmbeddings.forEach((emb, i) => {
    console.log(`  - Text ${i + 1}: ${emb.length} dimensions`);
  });

  // Test 3: Empty array
  console.log('\nTest 3: Empty array handling');
  const emptyResult = await createEmbeddings([]);
  console.log(`✓ Empty array returned: ${emptyResult.length} embeddings`);

  console.log('\n✅ All tests passed!');
}

testEmbeddings().catch((error) => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
