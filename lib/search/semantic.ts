import { createEmbedding } from '../openai/embeddings';
import { queryVectors } from '../pinecone/upload';
import type { SearchRequest, SearchResult } from '../types/search';

/**
 * Perform semantic search on user's content
 *
 * @param params - Search parameters
 * @returns Array of search results sorted by relevance
 */
export async function semanticSearch(
  params: SearchRequest
): Promise<SearchResult[]> {
  const { userId, query, contentType, topK = 5 } = params;

  // Step 1: Convert query to embedding
  const queryEmbedding = await createEmbedding(query);

  // Step 2: Build filter if contentType specified
  const filter = contentType
    ? { contentType: { $eq: contentType } }
    : undefined;

  // Step 3: Query Pinecone
  const matches = await queryVectors(
    userId,
    queryEmbedding,
    topK,
    filter
  );

  // Step 4: Format results
  const results: SearchResult[] = matches.map((match) => ({
    text: match.metadata?.text as string,
    score: match.score || 0,
    contentType: match.metadata?.contentType as SearchResult['contentType'],
    createdAt: match.metadata?.createdAt as string,
    chunkIndex: match.metadata?.chunkIndex as number,
    totalChunks: match.metadata?.totalChunks as number,
    chunkId: match.id,
  }));

  return results;
}
