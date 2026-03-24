/**
 * Text chunking utility for breaking down long content into embeddable segments
 */

/**
 * Chunking configuration.
 *
 * - `chunkSize`: target size for each chunk in characters. Default: `500`.
 * - `overlap`: characters shared between chunks to preserve context. Default: `50`.
 * - `minChunkSize`: chunks smaller than this are merged when possible. Default: `100`.
 */
export interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
  minChunkSize?: number;
}

/**
 * Split text into chunks at sentence boundaries
 *
 * @param text - Text to chunk
 * @param options - Chunking configuration
 * @returns Array of text chunks
 */
export function chunkText(text: string, options: ChunkOptions = {}): string[] {
  const {
    chunkSize = 500,
    overlap = 50,
    minChunkSize = 100,
  } = options;

  // Handle empty or very short text
  if (!text || text.trim().length === 0) {
    return [];
  }

  if (text.length <= chunkSize) {
    return [text.trim()];
  }

  // Split into sentences (., !, ?, followed by space or end of string)
  const sentenceRegex = /[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g;
  const sentences = text.match(sentenceRegex) || [text];

  const chunks: string[] = [];
  let currentChunk = '';

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();

    // If adding this sentence exceeds chunk size, save current chunk
    if (currentChunk && (currentChunk.length + sentence.length > chunkSize)) {
      chunks.push(currentChunk.trim());

      // Start new chunk with overlap from previous chunk
      if (overlap > 0) {
        const overlapText = currentChunk.slice(-overlap).trim();
        currentChunk = overlapText + ' ' + sentence;
      } else {
        currentChunk = sentence;
      }
    } else {
      // Add sentence to current chunk
      currentChunk = currentChunk ? currentChunk + ' ' + sentence : sentence;
    }
  }

  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  // Merge chunks that are too small with their neighbors
  const mergedChunks: string[] = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];

    if (chunk.length < minChunkSize && mergedChunks.length > 0) {
      // Merge with previous chunk if it exists
      mergedChunks[mergedChunks.length - 1] += ' ' + chunk;
    } else {
      mergedChunks.push(chunk);
    }
  }

  return mergedChunks;
}

/**
 * Chunk multiple texts and return with metadata
 *
 * @param texts - Array of text strings to chunk
 * @param options - Chunking configuration
 * @returns Array of chunks with source text index
 */
export function chunkTexts(
  texts: string[],
  options: ChunkOptions = {}
): Array<{ chunk: string; sourceIndex: number }> {
  const results: Array<{ chunk: string; sourceIndex: number }> = [];

  texts.forEach((text, index) => {
    const chunks = chunkText(text, options);
    chunks.forEach((chunk) => {
      results.push({ chunk, sourceIndex: index });
    });
  });

  return results;
}
