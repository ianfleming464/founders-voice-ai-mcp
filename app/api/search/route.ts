import { NextRequest, NextResponse } from 'next/server';
import { semanticSearch } from '@/lib/search/semantic';
import type { SearchRequest, SearchResponse, ErrorResponse } from '@/lib/types/search';

// Valid content types
const VALID_CONTENT_TYPES = ['linkedin', 'investor', 'newsletter', 'general'] as const;

// Validation constants
const MAX_QUERY_LENGTH = 1000;
const MIN_TOP_K = 1;
const MAX_TOP_K = 50;

/**
 * POST /api/search
 * Semantic search for founder content
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json() as Partial<SearchRequest>;

    // Validate userId
    if (!body.userId || typeof body.userId !== 'string') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing or invalid userId' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(body.userId)) {
      return NextResponse.json<ErrorResponse>(
        { error: 'userId can only contain letters, numbers, underscores, and hyphens' },
        { status: 400 }
      );
    }

    // Validate query
    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Missing or invalid query' },
        { status: 400 }
      );
    }

    if (body.query.length > MAX_QUERY_LENGTH) {
      return NextResponse.json<ErrorResponse>(
        { error: `Query too long (max ${MAX_QUERY_LENGTH} characters)` },
        { status: 400 }
      );
    }

    // Validate contentType (optional)
    if (body.contentType && !VALID_CONTENT_TYPES.includes(body.contentType as any)) {
      return NextResponse.json<ErrorResponse>(
        {
          error: 'Invalid contentType',
          details: `Must be one of: ${VALID_CONTENT_TYPES.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Validate topK (optional)
    if (body.topK !== undefined) {
      if (typeof body.topK !== 'number' || body.topK < MIN_TOP_K || body.topK > MAX_TOP_K) {
        return NextResponse.json<ErrorResponse>(
          { error: `topK must be a number between ${MIN_TOP_K} and ${MAX_TOP_K}` },
          { status: 400 }
        );
      }
    }

    // Perform search
    const results = await semanticSearch(body as SearchRequest);

    // Format response
    const response: SearchResponse = {
      results,
      query: body.query,
      userId: body.userId,
      count: results.length,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Search API error:', error);

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
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
