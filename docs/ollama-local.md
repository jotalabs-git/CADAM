# Ollama provider (experimental)

CADAM can route **parametric** chat requests to a locally running Ollama instance using its OpenAI-compatible chat-completions endpoint and the Vercel AI SDK 6-compatible provider.

## Getting started

```bash
ollama serve
# In another terminal, download the model exposed in the selector:
ollama pull qwen3:8b
curl http://127.0.0.1:11434/api/tags
```

Start CADAM as usual with `pnpm dev`. Select **Qwen3 8B (local)** in the parametric model picker.

The server defaults to `http://127.0.0.1:11434/v1`. If CADAM's **server process** runs somewhere else, set `OLLAMA_BASE_URL` to the base endpoint (including `/v1`) in its environment before starting it. Inside Docker, `127.0.0.1` refers to the container, not the host. Do **not** expose Ollama publicly without access controls.

## Current scope / limitations

- Parametric model calls stream from Ollama, without API keys or billing token consumption.
- Tool calls are **automatic** rather than forced: Ollama's OpenAI-compatible chat endpoint does not support forced `tool_choice`. A small local model may answer with prose instead of calling `build_parametric_model`; choose a model with reliable tool-calling ability.
- Existing Supabase authentication, conversation persistence, and the rest of the SaaS services still run. This is **not yet offline desktop mode**.
- Creative/image-to-mesh generation still uses external services; this integration does not change it.
- The selector currently exposes `qwen3:8b`. Additional installed model selection and discovery will be added separately.
- Anthropic-powered titles, suggestions, and some auxiliary endpoints remain optional or unchanged. Local selection does not imply every operation is processed by Ollama.
- There is no end-to-end test against a running Ollama daemon yet.

## Verify

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

Use `pnpm sonar` to verify SonarQube after generating the LCOV report with `pnpm test:coverage`.
