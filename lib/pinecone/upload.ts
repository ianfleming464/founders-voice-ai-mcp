import { getPineconeIndex } from './client';

// Types
type ContentType = 'linkedin' | 'investor' | 'newsletter';

export interface VectorRecord {
  id: string;
  values: number[];
  metadata: {
    userId: string;
    contentType: ContentType;
    text: string;
    chunkIndex: number;
    totalChunks: number;
    charCount: number;
    createdAt: string;
  };
}

export interface UploadOptions {
  /**
   * Batch size for upsert operations (default: 100)
   */
  batchSize?: number;

  /**
   * Index name (defaults to PINECONE_INDEX_NAME env var)
   */
  indexName?: string;
}

/**
 * Upload vectors to Pinecone with user-specific namespace
 *
 * @param userId - User ID for namespace isolation
 * @param records - Array of vector records to upload
 * @param options - Upload configuration
 * @returns Number of vectors uploaded
 */
export async function uploadVectors(
  userId: string,
  records: VectorRecord[],
  options: UploadOptions = {}
): Promise<number> {
  const { batchSize = 100, indexName } = options;

  if (records.length === 0) {
    return 0;
  }

  // Get index with user namespace
  const index = getPineconeIndex(indexName).namespace(userId);

  // Upload in batches
  let uploadedCount = 0;

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    await index.upsert(batch);

    uploadedCount += batch.length;
  }

  return uploadedCount;
}

/**
 * Query vectors from Pinecone
 *
 * @param userId - User ID for namespace
 * @param queryVector - Query embedding vector
 * @param topK - Number of results to return
 * @param filter - Optional metadata filter
 * @param indexName - Index name (optional)
 * @returns Query results
 */
export async function queryVectors(
  userId: string,
  queryVector: number[],
  topK: number = 5,
  filter?: Record<string, any>,
  indexName?: string
) {
  const index = getPineconeIndex(indexName).namespace(userId);

  const queryResponse = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
    filter,
  });

  return queryResponse.matches;
}

/**
 * Delete all vectors for a user
 *
 * @param userId - User ID for namespace
 * @param indexName - Index name (optional)
 */
export async function deleteUserVectors(userId: string, indexName?: string) {
  const index = getPineconeIndex(indexName).namespace(userId);

  await index.deleteAll();
}

/**
 * Get stats for a user's namespace
 *
 * @param userId - User ID for namespace
 * @param indexName - Index name (optional)
 */
export async function getUserStats(userId: string, indexName?: string) {
  const index = getPineconeIndex(indexName);

  const stats = await index.describeIndexStats();

  // Get stats for this user's namespace
  const namespaceStats = stats.namespaces?.[userId];

  return {
    vectorCount: namespaceStats?.recordCount || 0,
    totalVectors: stats.totalRecordCount || 0,
    dimension: stats.dimension,
  };
}
