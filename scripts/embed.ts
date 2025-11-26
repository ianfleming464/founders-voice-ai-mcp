/**
 * Embedding Pipeline Script
 *
 * Converts founder text into 512-dimensional vectors and saves to JSON
 *
 * Usage:
 *   DOTENV_CONFIG_PATH=.env.local npx tsx scripts/embed.ts \
 *     --userId=<user_id> \
 *     --contentType=<linkedin|investor|newsletter> \
 *     --text="<text>" OR --file=<path>
 *
 * Example:
 *   DOTENV_CONFIG_PATH=.env.local npx tsx scripts/embed.ts \
 *     --userId=founder_123 \
 *     --contentType=linkedin \
 *     --text="We just raised $2M in seed funding!"
 */

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { createEmbeddings } from '../lib/openai/embeddings';
import { chunkText } from '../lib/utils/chunker';

// Types
type ContentType = 'linkedin' | 'investor' | 'newsletter';

interface EmbeddingRecord {
  id: string;
  userId: string;
  contentType: ContentType;
  text: string;
  embedding: number[];
  metadata: {
    chunkIndex: number;
    totalChunks: number;
    charCount: number;
    createdAt: string;
  };
}

interface EmbeddingOutput {
  userId: string;
  contentType: ContentType;
  recordCount: number;
  dimensions: number;
  createdAt: string;
  records: EmbeddingRecord[];
}

// Parse command-line arguments
function parseArgs(): { userId: string; contentType: ContentType; text: string } {
  const args = process.argv.slice(2);
  let userId = '';
  let contentType = '';
  let text = '';
  let filePath = '';

  args.forEach((arg) => {
    if (arg.startsWith('--userId=')) {
      userId = arg.split('=')[1];
    } else if (arg.startsWith('--contentType=')) {
      contentType = arg.split('=')[1];
    } else if (arg.startsWith('--text=')) {
      text = arg.split('=')[1];
    } else if (arg.startsWith('--file=')) {
      filePath = arg.split('=')[1];
    }
  });

  if (!userId || !contentType) {
    console.error('❌ Missing required arguments: --userId and --contentType');
    console.log('\nUsage:');
    console.log('  DOTENV_CONFIG_PATH=.env.local npx tsx scripts/embed.ts \\');
    console.log('    --userId=<user_id> \\');
    console.log('    --contentType=<linkedin|investor|newsletter> \\');
    console.log('    --text="<text>" OR --file=<path>');
    process.exit(1);
  }

  if (!['linkedin', 'investor', 'newsletter'].includes(contentType)) {
    console.error('❌ Invalid contentType. Must be: linkedin, investor, or newsletter');
    process.exit(1);
  }

  if (!text && !filePath) {
    console.error('❌ Must provide either --text or --file');
    process.exit(1);
  }

  return { userId, contentType: contentType as ContentType, text: text || filePath };
}

// Main embedding pipeline
async function runEmbeddingPipeline() {
  console.log('🚀 Starting embedding pipeline...\n');

  // Step 1: Parse arguments
  const { userId, contentType, text: textOrPath } = parseArgs();

  // Step 2: Load text (from argument or file)
  let text = textOrPath;
  if (!text.includes(' ') && text.length < 200) {
    // Likely a file path
    try {
      text = await fs.readFile(textOrPath, 'utf-8');
      console.log(`✓ Loaded text from file: ${textOrPath}`);
    } catch (error) {
      console.error(`❌ Failed to read file: ${textOrPath}`);
      process.exit(1);
    }
  }

  console.log(`✓ User ID: ${userId}`);
  console.log(`✓ Content Type: ${contentType}`);
  console.log(`✓ Text length: ${text.length} characters\n`);

  // Step 3: Chunk text
  console.log('📄 Chunking text...');
  const chunks = chunkText(text, { chunkSize: 500, overlap: 50 });
  console.log(`✓ Created ${chunks.length} chunks\n`);

  // Step 4: Generate embeddings
  console.log('🧠 Generating embeddings...');
  const embeddings = await createEmbeddings(chunks, 512);
  console.log(`✓ Generated ${embeddings.length} embeddings (512 dimensions)\n`);

  // Step 5: Combine with metadata
  console.log('📦 Building records...');
  const timestamp = new Date().toISOString();
  const records: EmbeddingRecord[] = chunks.map((chunk, index) => ({
    id: `${userId}_${contentType}_${Date.now()}_${index}`,
    userId,
    contentType,
    text: chunk,
    embedding: embeddings[index],
    metadata: {
      chunkIndex: index,
      totalChunks: chunks.length,
      charCount: chunk.length,
      createdAt: timestamp,
    },
  }));

  const output: EmbeddingOutput = {
    userId,
    contentType,
    recordCount: records.length,
    dimensions: 512,
    createdAt: timestamp,
    records,
  };

  console.log(`✓ Created ${records.length} records\n`);

  // Step 6: Save to JSON
  const outputDir = path.join(process.cwd(), 'data', 'output');
  const filename = `${userId}_${contentType}_${Date.now()}.json`;
  const outputPath = path.join(outputDir, filename);

  await fs.writeFile(outputPath, JSON.stringify(output, null, 2));
  console.log(`✅ Saved embeddings to: ${outputPath}\n`);

  // Summary
  console.log('📊 Summary:');
  console.log(`   - Records: ${output.recordCount}`);
  console.log(`   - Dimensions: ${output.dimensions}`);
  console.log(`   - Total vectors: ${output.recordCount * output.dimensions}`);
  console.log(`   - File size: ${(JSON.stringify(output).length / 1024).toFixed(2)} KB`);
}

// Run the pipeline
runEmbeddingPipeline().catch((error) => {
  console.error('❌ Pipeline failed:', error);
  process.exit(1);
});
