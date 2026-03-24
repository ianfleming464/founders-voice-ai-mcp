// Content types for generation
export type GenerationContentType = 'linkedin' | 'investor' | 'general';

// Tone options
export type ToneType = 'professional' | 'casual';

/**
 * Generation request payload.
 *
 * - `topK`: how many chunks to retrieve for context.
 * - `tone`: optional tone override for the generated output.
 */
export interface GenerationRequest {
  userId: string;
  contentType: GenerationContentType;
  prompt: string;
  topK?: number;
  tone?: ToneType;
}

/**
 * Generation response payload.
 *
 * - `content`: generated content returned to the caller.
 * - `sourceChunks`: number of chunks used as context.
 * - `prompt`: echoes the original prompt.
 */
export interface GenerationResponse {
  content: string;
  sourceChunks: number;
  userId: string;
  contentType: GenerationContentType;
  prompt: string;
}

// Template metadata
export interface TemplateConfig {
  contentType: GenerationContentType;
  minWords: number;
  maxWords: number;
  maxTokens: number;
  temperature: number;
  defaultTopK: number;
}

// Template configurations
export const TEMPLATE_CONFIGS: Record<GenerationContentType, TemplateConfig> = {
  linkedin: {
    contentType: 'linkedin',
    minWords: 150,
    maxWords: 300,
    maxTokens: 400,
    temperature: 0.8, // More creative for social media
    defaultTopK: 5,
  },
  investor: {
    contentType: 'investor',
    minWords: 400,
    maxWords: 600,
    maxTokens: 800,
    temperature: 0.6, // More structured for investor updates
    defaultTopK: 7,
  },
  general: {
    contentType: 'general',
    minWords: 150,
    maxWords: 300,
    maxTokens: 400,
    temperature: 0.7, // Balanced temperature for general content
    defaultTopK: 5,
  },
};
