/**
 * Pinecone Upload Script
 *
 * Uploads embedding vectors from JSON files to Pinecone
 *
 * Usage:
 *   DOTENV_CONFIG_PATH=.env.local npx tsx scripts/upload.ts --file=<path>
 *   DOTENV_CONFIG_PATH=.env.local npx tsx scripts/upload.ts --all
 *   DOTENV_CONFIG_PATH=.env.local npx tsx scripts/upload.ts --userId=<user_id>
 *
 * Examples:
 *   # Upload specific file
 *   DOTENV_CONFIG_PATH=.env.local npx tsx scripts/upload.ts \
 *     --file=data/output/founder_123_linkedin_1234567890.json
 *
 *   # Upload all files
 *   DOTENV_CONFIG_PATH=.env.local npx tsx scripts/upload.ts --all
 *
 *   # Upload all files for specific user
 *   DOTENV_CONFIG_PATH=.env.local npx tsx scripts/upload.ts --userId=founder_123
 */

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { uploadVectors, getUserStats, VectorRecord } from '../lib/pinecone/upload';

// Types matching embed.ts output
interface EmbeddingRecord {
  id: string;
  userId: string;
  contentType: 'linkedin' | 'investor' | 'newsletter';
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
  contentType: string;
  recordCount: number;
  dimensions: number;
  createdAt: string;
  records: EmbeddingRecord[];
}

// Parse command-line arguments
function parseArgs(): { mode: 'file' | 'all' | 'user'; value?: string } {
  const args = process.argv.slice(2);

  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      return { mode: 'file', value: arg.split('=')[1] };
    } else if (arg === '--all') {
      return { mode: 'all' };
    } else if (arg.startsWith('--userId=')) {
      return { mode: 'user', value: arg.split('=')[1] };
    }
  }

  console.error('❌ Invalid arguments');
  console.log('\nUsage:');
  console.log('  --file=<path>       Upload specific JSON file');
  console.log('  --all               Upload all files in data/output/');
  console.log('  --userId=<id>       Upload all files for specific user');
  process.exit(1);
}

// Get list of files to process
async function getFilesToProcess(mode: string, value?: string): Promise<string[]> {
  const outputDir = path.join(process.cwd(), 'data', 'output');

  if (mode === 'file') {
    if (!value) {
      throw new Error('File path required for --file mode');
    }
    return [value];
  }

  // Read all JSON files from output directory
  const files = await fs.readdir(outputDir);
  const jsonFiles = files
    .filter((f) => f.endsWith('.json'))
    .map((f) => path.join(outputDir, f));

  if (mode === 'all') {
    return jsonFiles;
  }

  if (mode === 'user' && value) {
    // Filter by userId prefix
    return jsonFiles.filter((f) => path.basename(f).startsWith(value + '_'));
  }

  return jsonFiles;
}

// Convert embedding output to vector records
function convertToVectorRecords(data: EmbeddingOutput): VectorRecord[] {
  return data.records.map((record) => ({
    id: record.id,
    values: record.embedding,
    metadata: {
      userId: record.userId,
      contentType: record.contentType,
      text: record.text,
      chunkIndex: record.metadata.chunkIndex,
      totalChunks: record.metadata.totalChunks,
      charCount: record.metadata.charCount,
      createdAt: record.metadata.createdAt,
    },
  }));
}

// Upload a single file
async function uploadFile(filePath: string): Promise<{ userId: string; count: number }> {
  const content = await fs.readFile(filePath, 'utf-8');
  const data: EmbeddingOutput = JSON.parse(content);

  const vectorRecords = convertToVectorRecords(data);
  const uploadedCount = await uploadVectors(data.userId, vectorRecords);

  return { userId: data.userId, count: uploadedCount };
}

// Main upload pipeline
async function runUploadPipeline() {
  console.log('🚀 Starting Pinecone upload pipeline...\n');

  // Step 1: Parse arguments
  const { mode, value } = parseArgs();

  // Step 2: Get files to process
  console.log('📂 Finding files to upload...');
  const files = await getFilesToProcess(mode, value);

  if (files.length === 0) {
    console.log('⚠️  No files found to upload');
    return;
  }

  console.log(`✓ Found ${files.length} file(s)\n`);

  // Step 3: Upload each file
  console.log('⬆️  Uploading to Pinecone...');
  const results: { userId: string; count: number; file: string }[] = [];

  for (const file of files) {
    const filename = path.basename(file);
    console.log(`  Processing: ${filename}`);

    try {
      const { userId, count } = await uploadFile(file);
      results.push({ userId, count, file: filename });
      console.log(`  ✓ Uploaded ${count} vectors for user: ${userId}`);
    } catch (error) {
      console.error(`  ✗ Failed to upload ${filename}:`, error);
    }
  }

  console.log('\n✅ Upload complete!\n');

  // Step 4: Show summary
  console.log('📊 Summary:');
  console.log(`   - Files processed: ${results.length}`);
  console.log(`   - Total vectors: ${results.reduce((sum, r) => sum + r.count, 0)}`);

  // Group by user
  const userCounts = results.reduce((acc, r) => {
    acc[r.userId] = (acc[r.userId] || 0) + r.count;
    return acc;
  }, {} as Record<string, number>);

  console.log(`   - Unique users: ${Object.keys(userCounts).length}`);

  // Step 5: Show user stats
  console.log('\n📈 Per-user stats:');
  for (const [userId] of Object.entries(userCounts)) {
    const stats = await getUserStats(userId);
    console.log(`   - ${userId}: ${stats.vectorCount} vectors in Pinecone`);
  }
}

// Run the pipeline
runUploadPipeline().catch((error) => {
  console.error('❌ Upload pipeline failed:', error);
  process.exit(1);
});
