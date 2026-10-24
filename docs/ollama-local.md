# Ollama provider (experimental)

CADAM can route **parametric** chat requests to a locally running Ollama instance using its OpenAI-compatible chat-completions endpoint and the Vercel AI SDK 6-compatible provider.

## Getting started

```bash
ollama serve
# In another terminal, download the model exposed in the selector:
ollama pull qwen3:8b
curl http://127.0.0.1:11434/api/tags
```

Start CADAM as usual with `pnpm dev`. Open the parametric model picker. CADAM fetches the installed models from Ollama and lists those that advertise tool calling as selectable options. Models without tool calling are displayed disabled. If Ollama is unavailable, only remote providers are listed.

The server defaults to `http://127.0.0.1:11434/v1`. If CADAM's **server process** runs somewhere else, set `OLLAMA_BASE_URL` to the base endpoint (including `/v1`) in its environment before starting it. Inside Docker, `127.0.0.1` refers to the container, not the host. Do **not** expose Ollama publicly without access controls.

## Current scope / limitations

- Parametric model calls stream from Ollama, without API keys or billing token consumption.
- Tool calls are **automatic** rather than forced: Ollama's OpenAI-compatible chat endpoint does not support forced `tool_choice`. A small local model may answer with prose instead of calling `build_parametric_model`; choose a model with reliable tool-calling ability.
- Existing Supabase authentication, conversation persistence, and the rest of the SaaS services still run. This is **not yet offline desktop mode**.
- Creative/image-to-mesh generation still uses external services; this integration does not change it.
- The selector loads model names via `/api/tags` and queries `/api/show` for `tools` and `vision` capabilities. It does not expose models that Ollama cannot inspect as enabled options.
- The list is fetched when the parametric chat input mounts or switches into parametric mode. Restart the app or revisit the editor after installing new models.
- CADAM currently hides image uploads for Ollama models, even if Ollama reports vision support; multimodal local chat requires separate integration and testing.
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
