import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Singleton Pinecone client instance
 */
let pineconeClient: Pinecone | null = null;

/**
 * Initialize and return Pinecone client
 *
 * @returns Pinecone client instance
 */
export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    const apiKey = process.env.PINECONE_API_KEY;

    if (!apiKey) {
      throw new Error('PINECONE_API_KEY environment variable is required');
    }

    pineconeClient = new Pinecone({
      apiKey,
    });
  }

  return pineconeClient;
}

/**
 * Get a Pinecone index by name
 *
 * @param indexName - Name of the index (defaults to PINECONE_INDEX_NAME env var)
 * @returns Pinecone index instance
 */
export function getPineconeIndex(indexName?: string) {
  const client = getPineconeClient();
  const name = indexName || process.env.PINECONE_INDEX_NAME;

  if (!name) {
    throw new Error('Index name must be provided or set in PINECONE_INDEX_NAME env var');
  }

  return client.index(name);
}
