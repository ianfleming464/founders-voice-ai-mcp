// Content types
export type ContentType = 'linkedin' | 'investor' | 'newsletter';

// Search request
export interface SearchRequest {
  userId: string;
  query: string;
  contentType?: ContentType;
  topK?: number;
}

// Search result from Pinecone
export interface SearchResult {
  text: string;
  score: number; // 0-1 similarity score
  contentType: ContentType;
  createdAt: string; // ISO timestamp
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
