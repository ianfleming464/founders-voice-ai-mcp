import { NextRequest, NextResponse } from 'next/server';
import { generateContent } from '@/lib/generation/generate';
import type {
  GenerationRequest,
  GenerationResponse,
  GenerationContentType,
  ToneType,
} from '@/lib/types/generation';
import type { ErrorResponse } from '@/lib/types/search';

// Valid content types
const VALID_CONTENT_TYPES: GenerationContentType[] = ['linkedin', 'investor'];

// Valid tone types
const VALID_TONE_TYPES: ToneType[] = ['professional', 'casual'];

// Validation constants
const MAX_PROMPT_LENGTH = 2000;
const MIN_TOP_K = 1;
const MAX_TOP_K = 20;

/**
 * POST /api/generate
 * Generate content in founder's voice using RAG
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = (await request.json()) as Partial<GenerationRequest>;

    // Validate userId
    if (!body.userId || typeof body.userId !== 'string') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing or invalid userId' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(body.userId)) {
      return NextResponse.json<ErrorResponse>(
        {
          error:
            'userId can only contain letters, numbers, underscores, and hyphens',
        },
        { status: 400 }
      );
    }

    // Validate contentType
    if (!body.contentType || typeof body.contentType !== 'string') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing or invalid contentType' },
        { status: 400 }
      );
    }

    if (!VALID_CONTENT_TYPES.includes(body.contentType as GenerationContentType)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Invalid contentType',
          details: `Must be one of: ${VALID_CONTENT_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

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

    if (body.prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json<ErrorResponse>(
        { error: `Prompt too long (max ${MAX_PROMPT_LENGTH} characters)` },
        { status: 400 }
      );
    }

    // Validate tone (optional)
    if (body.tone && !VALID_TONE_TYPES.includes(body.tone as ToneType)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Invalid tone',
          details: `Must be one of: ${VALID_TONE_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate topK (optional)
    if (body.topK !== undefined) {
      if (
        typeof body.topK !== 'number' ||
        body.topK < MIN_TOP_K ||
        body.topK > MAX_TOP_K
      ) {
        return NextResponse.json<ErrorResponse>(
          { error: `topK must be a number between ${MIN_TOP_K} and ${MAX_TOP_K}` },
          { status: 400 }
        );
      }
    }

    // Generate content
    const result = await generateContent(body as GenerationRequest);

    // Format response
    const response: GenerationResponse = {
      content: result.content,
      sourceChunks: result.sourceChunks,
      userId: result.userId,
      contentType: result.contentType,
      prompt: result.prompt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Generate API error:', error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json<ErrorResponse>(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
