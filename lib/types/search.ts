// Content types
export type ContentType = 'linkedin' | 'investor' | 'newsletter' | 'general';

// Search request
export interface SearchRequest {
  userId: string;
  query: string;
  contentType?: ContentType;
  topK?: number;
}

// Search result from Pinecone
/**
 * Search result item.
 *
 * - `score`: similarity score from `0` to `1`.
 * - `createdAt`: ISO timestamp for when the source record was created.
 */
export interface SearchResult {
  text: string;
  score: number;
  contentType: ContentType;
  createdAt: string;
  chunkIndex: number;
  totalChunks: number;
  chunkId: string;
}

// Search API response
export interface SearchResponse {
  results: SearchResult[];
  query: string;
  userId: string;
  count: number;
}

// Error response
export interface ErrorResponse {
  error: string;
  details?: string;
}
