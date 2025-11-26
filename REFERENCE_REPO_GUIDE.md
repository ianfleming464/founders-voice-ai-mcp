# Reference Repository Guide
**Repo:** https://github.com/projectshft/cringe-influencer  
**Purpose:** Technical reference for RAG patterns, NOT a template to copy  
**Our Fork:** /Users/ianfleming/Desktop/Ian/cringe-influencer
**Context Document:** See REFERENCE_REPO_CONTEXT.md for detailed analysis

---

## What This Repo Does

A Next.js app that:
1. Embeds LinkedIn posts from an influencer ("Brian")
2. Stores vectors in Pinecone
3. Lets users search/generate content in Brian's voice
4. Uses RAG (retrieval augmented generation)

**Tech Stack:** Next.js, TypeScript, OpenAI, Pinecone, Yarn

---

## Key Differences from Our Project

| Aspect | Cringe Influencer | Founders Voice AI |
|--------|------------------|-------------------|
| **Scope** | Single influencer (Brian) | Multi-user (any founder) |
| **Integration** | Standalone web app | MCP-native infrastructure |
| **Content Source** | Pre-scraped LinkedIn posts | User-provided text |
| **Architecture** | Monolithic Next.js | Next.js + separate MCP server |
| **Templates** | Search + regenerate | 3 specific templates (LinkedIn, investor, hiring) |

**Our Advantage:** You're building infrastructure, not just an app.

---

## How to Extract Knowledge from This Repo

### Method 1: Manual Review (Recommended)
**When you need specific implementation details:**

1. Open your local fork
2. Navigate to the file you need guidance on
3. Read the code, understand the pattern
4. Adapt it to your needs (don't copy-paste)

**Example Flow:**
```
You're on Day 3 (embedding pipeline).
→ Open: cringe-influencer/scripts/embed.ts
→ See how they chunk text (~500 chars)
→ See how they call OpenAI embeddings
→ Adapt their chunking logic for your use case
→ Don't copy their Brian-specific metadata
```

### Method 2: Claude Code Context (When Needed)
**For complex patterns you don't understand:**

1. In your forked repo directory, open Claude Code
2. Ask: "Explain how the embedding script works in this repo"
3. Claude Code can see the full codebase
4. Copy the explanation to your notes
5. Implement your version in your project

**Don't paste their code directly - use it as learning material.**

---

## When to Reference Specific Files

### Embeddings (Day 3-4)
**Check:** `scripts/embed.ts` or similar
**Look for:**
- Text chunking strategy (how they split content)
- OpenAI SDK usage (embedding model, parameters)
- Output format (how vectors are structured)
- Error handling patterns

**Your adaptation:**
- Use similar chunking (500 chars)
- Same embedding model (text-embedding-3-small)
- Add user_id metadata (they don't have this)

---

### Pinecone Upload (Day 5)
**Check:** `scripts/upload.ts` or Pinecone lib files
**Look for:**
- Batch upload logic (Pinecone prefers batches of 100)
- Index creation parameters (dimensions, metric)
- Metadata structure (what they store with vectors)
- Namespace usage (if any)

**Your adaptation:**
- Add per-user namespaces (one namespace = one founder)
- Include content_type in metadata (linkedin/investor/hiring)
- Add timestamp for versioning

---

### Search/Retrieval (Day 6)
**Check:** `app/api/search/route.ts` or lib/pinecone files
**Look for:**
- How they convert query to embedding
- Query parameters (topK, filter)
- Re-ranking logic (if they use it)
- Response formatting

**Your adaptation:**
- Filter by user namespace
- Return top 5 chunks (they might do 10)
- Include similarity scores in response

---

### Content Generation (Day 7)
**Check:** `app/api/generate/route.ts` or OpenAI lib
**Look for:**
- Prompt engineering (how they structure the system prompt)
- Context injection (how retrieved chunks are added)
- OpenAI parameters (temperature, max_tokens)
- Streaming vs non-streaming

**Your adaptation:**
- Different system prompts per template type
- Add tone parameter (professional/casual)
- Adjust max_tokens based on template

---

### UI Patterns (Day 7, 19)
**Check:** `app/page.tsx` or components folder
**Look for:**
- Form structure (textarea, buttons)
- Loading states
- Error handling
- Results display

**Your adaptation:**
- Simpler UI (single textarea, no comparison view)
- Add template selector (dropdown for 3 templates)
- Focus on MCP setup instructions (not just web UI)

---

## What NOT to Copy

❌ **Brian-specific content** (their data files)  
❌ **Scraping logic** (you're doing manual input)  
❌ **Their exact prompts** (you need founder-specific prompts)  
❌ **UI styling** (make your own brand)  
❌ **Package.json scripts** (you have different needs)

**Copy concepts, not code.**

---

## Alternative: Generate REFERENCE_REPO_CONTEXT.md

If you want Claude Code to analyze the entire repo for you:

### Step 1: In Your Forked Repo
```bash
cd path/to/cringe-influencer
code .  # Open in VS Code with Claude Code extension
```

### Step 2: Ask Claude Code
```
Please analyze this RAG application and create a REFERENCE_REPO_CONTEXT.md file 
that documents:

1. Architecture overview (how components connect)
2. Key files and their purpose
3. Embedding pipeline implementation details
4. Pinecone integration patterns
5. OpenAI API usage patterns
6. Any gotchas or important design decisions

Format it as a reference guide that I can copy to my new project.
```

### Step 3: Copy to Your Project
```bash
cp REFERENCE_REPO_CONTEXT.md /path/to/founders-voice-ai-mcp/
```

### Step 4: Reference When Needed
In your project, when implementing a feature:
```
Claude Code, I'm implementing [FEATURE].

Check ../REFERENCE_REPO_CONTEXT.md section [X] for how the reference 
repo handled this.

Adapt their approach for my MCP-native architecture.
```

---

## Recommended Reading Order

**Before you start coding:**
1. Read their README (understand the goal)
2. Skim the folder structure (see how they organize)
3. Look at package.json dependencies (what libraries they use)

**When implementing each phase:**
1. Read the relevant file from their repo
2. Take notes on key patterns
3. Close their repo
4. Implement your version from scratch
5. Only refer back if stuck

**This prevents copy-paste coding and forces understanding.**

---

## Key Patterns to Learn

### Pattern 1: Text Chunking
**Their approach:** Split at sentence boundaries, target ~500 chars
**Why it matters:** Smaller chunks = more precise retrieval
**Your use:** Same strategy, add template type to metadata

### Pattern 2: Batch Operations
**Their approach:** Upload vectors in batches of 100 to Pinecone
**Why it matters:** API rate limits + efficiency
**Your use:** Same, but wrap in try-catch for partial failures

### Pattern 3: Context Injection
**Their approach:** Prepend retrieved chunks to generation prompt
**Why it matters:** Model sees actual founder phrases
**Your use:** Same, but format differently per template type

### Pattern 4: Error Boundaries
**Their approach:** Graceful fallbacks when APIs fail
**Why it matters:** User doesn't see raw errors
**Your use:** Similar, plus MCP-specific error codes

---

## When You're Stuck: Decision Tree

**Problem:** "I don't know how to implement [X]"

```
1. Is it covered in 30_DAY_PLAN.md?
   ↳ Yes → Follow the plan
   ↳ No → Continue

2. Did the reference repo solve this?
   ↳ Yes → Check their implementation (this guide)
   ↳ No → Continue

3. Is it MCP-specific?
   ↳ Yes → Check MCP docs (modelcontextprotocol.io)
   ↳ No → Continue

4. Ask Claude Code in your project:
   "I'm stuck on [X]. The reference repo did [Y]. 
   How should I adapt this for MCP architecture?"
```

---

## Final Notes

**This repo is training wheels, not a crutch.**

- Use it to understand RAG patterns
- Don't copy it line-by-line
- Your MCP layer is the innovation (they don't have this)
- By Week 2, you'll rarely need to reference it

**You're building something different and better.**

The reference repo helped you learn RAG.  
Now you're building AI infrastructure.
