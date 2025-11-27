// Content types for generation
export type GenerationContentType = 'linkedin' | 'investor';

// Tone options
export type ToneType = 'professional' | 'casual';

// Generation request
export interface GenerationRequest {
  userId: string;
  contentType: GenerationContentType;
  prompt: string;
  topK?: number; // How many chunks to retrieve for context
  tone?: ToneType; // Optional tone parameter
}

// Generation response
export interface GenerationResponse {
  content: string; // Generated content
  sourceChunks: number; // Number of chunks used for context
  userId: string;
  contentType: GenerationContentType;
  prompt: string; // Echo back the prompt
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
};
