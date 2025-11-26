import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate embeddings for an array of text strings using OpenAI's text-embedding-3-small model
 *
 * @param texts - Array of text strings to embed
 * @param dimensions - Embedding dimensions (default: 512)
 * @returns Promise resolving to array of embedding vectors
 */
export async function createEmbeddings(
  texts: string[],
  dimensions: number = 512
): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      dimensions,
    });

    // Extract embedding vectors in the same order as input
    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.error('Error creating embeddings:', error);
    throw new Error(`Failed to create embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate a single embedding for one text string
 *
 * @param text - Text string to embed
 * @param dimensions - Embedding dimensions (default: 512)
 * @returns Promise resolving to embedding vector
 */
export async function createEmbedding(
  text: string,
  dimensions: number = 512
): Promise<number[]> {
  const embeddings = await createEmbeddings([text], dimensions);
  return embeddings[0];
}
