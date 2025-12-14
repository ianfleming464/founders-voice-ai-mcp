import { NextRequest, NextResponse } from 'next/server';
import { createCompletion } from '@/lib/openai/completions';

interface GenericGenerationRequest {
  prompt: string;
}

interface GenericGenerationResponse {
  content: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
}

/**
 * POST /api/generate-generic
 * Generate content using GPT-4 without RAG (no retrieval, no context)
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<GenericGenerationRequest>;

    // Validate prompt
    if (!body.prompt || typeof body.prompt !== 'string') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing or invalid prompt' },
        { status: 400 }
      );
    }

    if (body.prompt.trim().length === 0) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Prompt cannot be empty' },
        { status: 400 }
      );
    }

    // Simple generic system prompt - no personalization, no context
    const systemPrompt = `You are a helpful AI assistant that generates LinkedIn posts.
Write a professional LinkedIn post (150-300 words) about the topic provided.
Be clear, engaging, and informative.
End with a question or call-to-action to drive engagement.`;

    // Generate content using GPT-4 (no RAG)
    const content = await createCompletion({
      systemPrompt,
      userPrompt: body.prompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    const response: GenericGenerationResponse = {
      content,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Generic generation API error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
