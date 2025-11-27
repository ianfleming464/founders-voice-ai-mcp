import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

/**
 * Generate text completion using OpenAI GPT-4
 *
 * @param options - Completion configuration
 * @returns Generated text content
 */
export async function createCompletion(
  options: CompletionOptions
): Promise<string> {
  const {
    systemPrompt,
    userPrompt,
    temperature = 0.7,
    maxTokens = 1000,
    model = 'gpt-4',
  } = options;

  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    return content.trim();
  } catch (error) {
    console.error('Error creating completion:', error);
    throw new Error(
      `Failed to create completion: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}
