# Setup & Development Workflow
**Style:** Brief context + code + next action (Option B)  
**Goal:** Get to working code fast, understand enough to debug

---

## Initial Repository Setup (Do This First)

### 1. Create GitHub Repo
```bash
# On GitHub.com: Create new repo "founders-voice-ai-mcp"
# Then locally:
mkdir founders-voice-ai-mcp
cd founders-voice-ai-mcp
git init
```

### 2. Initialize Next.js
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
# Answer prompts:
# - TypeScript: Yes
# - ESLint: Yes  
# - Tailwind: Yes
# - App Router: Yes
# - Import alias: No (keep default @/*)

git add .
git commit -m "Initial Next.js setup"
```

### 3. Add Core Dependencies
```bash
npm install @pinecone-database/pinecone openai zod
npm install -D @types/node

git add package.json package-lock.json
git commit -m "Add AI/vector dependencies"
```

### 4. Create Project Structure
```bash
mkdir -p app/api/{embed,search,generate}
mkdir -p lib/{openai,pinecone,utils}
mkdir -p scripts
mkdir -p mcp-server/src/{tools,rag}
mkdir -p data/output

touch .env.local
touch lib/openai/client.ts
touch lib/pinecone/client.ts
```

**What this does:** Separates concerns - `lib/` for reusable code, `scripts/` for one-time tasks, `mcp-server/` for MCP layer.

### 5. Environment Variables
Create `.env.local`:
```env
# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=founders-voice

# MCP Server (add later)
MCP_SERVER_URL=http://localhost:3001
MCP_API_KEY=dev-key-123
```

**Get API Keys:**
- OpenAI: https://platform.openai.com/api-keys (add $5 credit)
- Pinecone: https://app.pinecone.io/ (free tier, create index with 512 dimensions)

---

## Claude Code Workflow (How to Work with CC)

### When Starting a New Feature

**Your Prompt Template:**
```
I'm implementing [FEATURE] from 30_DAY_PLAN.md (Day X).

Context: [1-2 sentence description of what this does]

Check REFERENCE_REPO_CONTEXT.md for [specific pattern] if needed.

Please:
1. Show the code
2. Explain what it does (2-3 sentences)
3. Tell me how to test it
4. What's the next step
```

**Example:**
```
I'm implementing the embedding pipeline (Day 3-4).

Context: This takes founder content, chunks it into 500-char segments, 
and converts each chunk to a vector using OpenAI.

Check REFERENCE_REPO_CONTEXT.md for their chunking strategy.

Please:
1. Show the code for scripts/embed.ts
2. Explain what it does
3. Tell me how to test it
4. What's the next step
```

### When You Hit a Checkpoint

**Your Verification Prompt:**
```
I just finished [CHECKPOINT #X] from 30_DAY_PLAN.md.

Current status: [what you built]

Help me verify:
1. [specific thing to check]
2. [another thing to check]

If it works, what's next?
```

**Example:**
```
I just finished CHECKPOINT 2 (embeddings generated).

Current status: Ran embed script, got output/vectors.json file

Help me verify:
1. Are the vector dimensions correct? (should be 512)
2. Is the chunk metadata included?

If it works, what's next? (Checkpoint 3 is Pinecone upload)
```

### When You're Stuck

**Your Debug Prompt:**
```
I'm stuck on [specific error/issue].

What I'm trying to do: [goal]

Error message: [paste exact error]

What I've tried: [1-2 things]

Check REFERENCE_REPO_CONTEXT.md - did they handle this?
```

---

## Phase-by-Phase Implementation Guide

### Phase 1: Embedding Pipeline (Days 3-4)

**Goal:** Convert text to vectors

**Files to Create:**
1. `lib/openai/embeddings.ts` - Wrapper for OpenAI embedding calls
2. `scripts/embed.ts` - Reads text, chunks it, generates embeddings
3. `data/founder-content.txt` - Your source content (start with your own writing)

**How to Test:**
```bash
npm run embed  # Should output: "Generated 45 embeddings"
ls data/output/  # Should see: vectors.json
```

**What You're Learning:** How text becomes numbers (vectors) that capture semantic meaning.

**Next:** Upload these vectors to Pinecone (Phase 2)

---

### Phase 2: Vector Storage (Day 5)

**Goal:** Store embeddings in Pinecone for fast retrieval

**Files to Create:**
1. `lib/pinecone/client.ts` - Pinecone connection setup
2. `scripts/upload.ts` - Reads vectors.json, uploads to Pinecone

**How to Test:**
```bash
npm run upload  # Should output: "Uploaded 45 vectors"
# Then check Pinecone console - you should see vectors in your index
```

**What You're Learning:** Vector databases let you search by meaning, not keywords.

**Next:** Build retrieval to query these vectors (Phase 3)

---

### Phase 3: Retrieval System (Day 6)

**Goal:** Given a topic, find relevant founder content

**Files to Create:**
1. `lib/pinecone/search.ts` - Query Pinecone with embedded topic
2. `app/api/search/route.ts` - API endpoint that takes topic, returns chunks

**How to Test:**
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "startup advice"}'

# Should return 5 relevant text chunks
```

**What You're Learning:** RAG retrieval = convert query to vector, find similar vectors, return original text.

**Next:** Use retrieved content to generate new writing (Phase 4)

---

### Phase 4: Content Generation (Day 7)

**Goal:** Generate LinkedIn post in founder's voice

**Files to Create:**
1. `lib/openai/generate.ts` - Calls GPT-4 with founder context
2. `app/api/generate/route.ts` - Takes topic + template, returns generated content
3. `app/page.tsx` - Simple UI (textarea + button)

**How to Test:**
Visit http://localhost:3000, enter topic, click generate. Output should sound like the founder.

**What You're Learning:** RAG generation = retrieve context + prompt engineering = authentic voice.

**Next:** Start MCP integration (Phase 5)

---

### Phase 5: MCP Server Setup (Days 8-9)

**Goal:** Standalone MCP server that other apps can call

**Files to Create:**
1. `mcp-server/package.json` - Separate Node project
2. `mcp-server/src/index.ts` - MCP server initialization
3. `mcp-server/src/tools/linkedin.ts` - First tool definition

**How to Test:**
```bash
cd mcp-server
npm install @modelcontextprotocol/sdk
npm run dev  # Server should start on stdio

# Use MCP Inspector (separate tool) to test
npx @modelcontextprotocol/inspector mcp-server/src/index.ts
```

**What You're Learning:** MCP servers expose "tools" that AI assistants can discover and call.

**Next:** Connect MCP tools to your RAG backend (Phase 6)

---

### Phase 6: MCP Tools Implementation (Days 10-12)

**Goal:** MCP tools call your Next.js API routes

**Files to Create:**
1. `mcp-server/src/tools/linkedin.ts` - Calls /api/generate with template=linkedin
2. `mcp-server/src/tools/investor-update.ts` - Calls /api/generate with template=investor
3. `mcp-server/src/tools/hiring.ts` - Calls /api/generate with template=hiring

**How to Test:**
In MCP Inspector, call each tool with different parameters. Should return generated content.

**What You're Learning:** MCP tools are thin wrappers that bridge AI assistants to your backend.

**Next:** Test with Claude Desktop (Phase 7)

---

### Phase 7: Claude Desktop Integration (Days 13-14)

**Goal:** Use your MCP server from Claude Desktop

**Setup:**
1. Edit Claude Desktop config file:
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add your server:
```json
{
  "mcpServers": {
    "founders-voice": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/index.js"],
      "env": {
        "MCP_API_KEY": "dev-key-123"
      }
    }
  }
}
```

3. Restart Claude Desktop

**How to Test:**
Open Claude Desktop, try: "Write a LinkedIn post about AI trends in my voice"

Claude should call your MCP server → your server calls Next.js API → returns generated content.

**What You're Learning:** This is the magic - your voice is now accessible to AI assistants without copy-paste.

**Next:** Add authentication for multi-user (Phase 8)

---

## Key Commands Reference

```bash
# Development
npm run dev              # Start Next.js (port 3000)
npm run embed            # Generate embeddings
npm run upload           # Upload to Pinecone

# MCP Server
cd mcp-server
npm run dev              # Start MCP server (stdio mode)
npm run build            # Compile TypeScript
npm run start            # Production mode (HTTP)

# Git Workflow
git add .
git commit -m "Checkpoint X: [what you built]"
git push
```

---

## When to Reference the Cringe Influencer Repo

**Check REFERENCE_REPO_CONTEXT.md for:**
- Embedding script patterns (how they chunk text)
- Pinecone upload logic (batch operations)
- API route structure (Next.js organization)
- Error handling patterns

**Don't copy blindly** - their app doesn't have MCP, so you're extending their patterns.

---

## Debugging Tips

**Embeddings not working?**
- Check OpenAI API key has credits
- Verify dimensions match Pinecone index (512)
- Log the first vector to see its shape

**Pinecone queries returning nothing?**
- Check namespace (should match upload script)
- Verify index name in env vars
- Test with their web console first

**MCP server won't start?**
- Check Node version (requires 18+)
- Verify @modelcontextprotocol/sdk installed
- Look for stdio/stderr output

**Claude Desktop not seeing server?**
- Restart Claude Desktop after config change
- Check absolute paths in config (not relative)
- Look at Claude Desktop logs (Help > View Logs)

---

## Daily Workflow Pattern

**Start of session:**
1. Check 30_DAY_PLAN.md - what checkpoint am I on?
2. Pull latest code: `git pull`
3. Start dev server: `npm run dev`

**During development:**
1. Prompt Claude Code with feature goal
2. Implement code CC suggests
3. Test using verification steps
4. Commit when checkpoint passes: `git commit -m "Checkpoint X done"`

**End of session:**
1. Update 30_DAY_PLAN.md with any blockers
2. Push code: `git push`
3. Note what's next for tomorrow

**This keeps momentum, prevents "where was I?" moments.**
