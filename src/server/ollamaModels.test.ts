import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { discoverOllamaModels } from './ollamaModels.ts';

describe('discoverOllamaModels', () => {
  it('returns installed models with tool and vision capabilities', async () => {
    const requested: string[] = [];
    const fakeFetch = async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      requested.push(url);
      if (url.endsWith('/api/tags')) {
        return Response.json({ models: [{ name: 'qwen3:8b' }, { name: 'llava:7b' }] });
      }
      const name = JSON.parse(String(init?.body)).model as string;
      return Response.json({ capabilities: name === 'qwen3:8b'
        ? ['completion', 'tools']
        : ['completion', 'vision'] });
    };
    const models = await discoverOllamaModels(fakeFetch as typeof fetch);
    assert.deepEqual(models, [
      { id: 'ollama/qwen3:8b', name: 'qwen3:8b', supportsTools: true, supportsVision: false },
      { id: 'ollama/llava:7b', name: 'llava:7b', supportsTools: false, supportsVision: true },
    ]);
    assert.equal(requested.length, 3);
  });

  it('fails closed when capabilities cannot be determined', async () => {
    const fakeFetch = async (input: string | URL | Request) => String(input).endsWith('/api/tags')
      ? Response.json({ models: [{ name: 'unknown:latest' }] })
      : new Response('', { status: 503 });
    const models = await discoverOllamaModels(fakeFetch as typeof fetch);
    assert.equal(models[0].supportsTools, false);
  });
});
