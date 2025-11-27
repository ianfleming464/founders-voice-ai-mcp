import { semanticSearch } from '../search/semantic';
import { createCompletion } from '../openai/completions';
import type {
  GenerationRequest,
  GenerationResponse,
  GenerationContentType,
  ToneType,
} from '../types/generation';
import { TEMPLATE_CONFIGS } from '../types/generation';

/**
 * Build system prompt for LinkedIn content generation
 */
function buildLinkedInSystemPrompt(
  context: string,
  tone: ToneType = 'professional'
): string {
  const toneGuidance =
    tone === 'casual'
      ? 'Use a conversational, authentic tone with occasional personality. You can use casual language but stay professional.'
      : 'Use a professional, polished tone suitable for a business audience. Be engaging but maintain gravitas.';

  return `You are a voice cloning AI that generates LinkedIn posts in the authentic voice of a startup founder.

CONTEXT FROM FOUNDER'S PAST CONTENT:
${context}

YOUR TASK:
- Write a LinkedIn post (150-300 words) that sounds exactly like this founder
- Match their writing style, vocabulary, sentence structure, and perspective
- Use phrases and patterns from their past content when relevant
- ${toneGuidance}
- Include a clear narrative or insight, not just generic advice
- End with a thoughtful takeaway or question to drive engagement

DO NOT:
- Copy-paste their exact content
- Use generic LinkedIn clichés unless the founder does
- Add emojis unless the founder frequently uses them
- Write in a style that doesn't match the founder's voice`;
}

/**
 * Build system prompt for Investor Update generation
 */
function buildInvestorUpdateSystemPrompt(context: string): string {
  return `You are a voice cloning AI that generates monthly investor updates in the authentic voice of a startup founder.

CONTEXT FROM FOUNDER'S PAST CONTENT:
${context}

YOUR TASK:
- Write a monthly investor update (400-600 words) that sounds exactly like this founder
- Match their writing style, vocabulary, tone, and way of communicating progress
- Structure the update with clear sections:
  1. Progress & Wins (what we achieved this month)
  2. Key Metrics (revenue, users, or other relevant KPIs)
  3. Challenges (what's hard, what we're working through)
  4. Next Steps (what's coming next month)
- Use their authentic voice throughout - if they're optimistic, be optimistic; if they're data-driven, be data-driven
- Include specific details and examples where appropriate
- Be transparent and honest in their style

DO NOT:
- Use generic startup jargon unless the founder does
- Sugarcoat challenges if the founder is typically candid
- Write in a formal tone if the founder is casual (or vice versa)
- Include placeholder metrics - focus on narrative and style`;
}

/**
 * Build context string from search results
 */
function buildContextString(results: Array<{ text: string; score: number }>): string {
  if (results.length === 0) {
    return 'No relevant past content found.';
  }

  return results
    .map((result, index) => `[${index + 1}] ${result.text} (relevance: ${result.score.toFixed(2)})`)
    .join('\n\n');
}

/**
 * Generate content using RAG pipeline
 *
 * @param request - Generation parameters
 * @returns Generated content with metadata
 */
export async function generateContent(
  request: GenerationRequest
): Promise<GenerationResponse> {
  const { userId, contentType, prompt, topK, tone = 'professional' } = request;

  // Get template config
  const config = TEMPLATE_CONFIGS[contentType];
  const searchTopK = topK ?? config.defaultTopK;

  // Step 1: Retrieve relevant context using semantic search
  const searchResults = await semanticSearch({
    userId,
    query: prompt,
    contentType, // Filter by content type for more relevant results
    topK: searchTopK,
  });

  // Step 2: Build context from retrieved chunks
  const context = buildContextString(searchResults);

  // Step 3: Build system prompt based on content type
  let systemPrompt: string;
  switch (contentType) {
    case 'linkedin':
      systemPrompt = buildLinkedInSystemPrompt(context, tone);
      break;
    case 'investor':
      systemPrompt = buildInvestorUpdateSystemPrompt(context);
      break;
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }

  // Step 4: Generate content using GPT-4
  const generatedContent = await createCompletion({
    systemPrompt,
    userPrompt: prompt,
    temperature: config.temperature,
    maxTokens: config.maxTokens,
  });

  // Step 5: Return response
  return {
    content: generatedContent,
    sourceChunks: searchResults.length,
    userId,
    contentType,
    prompt,
  };
}
