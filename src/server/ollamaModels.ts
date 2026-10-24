import { env } from './env';

export type OllamaModel = {
  id: string;
  name: string;
  supportsTools: boolean;
  supportsVision: boolean;
};

type TagsResponse = { models?: { name?: string }[] };
type ShowResponse = { capabilities?: string[] };

export async function discoverOllamaModels(
  fetcher: typeof fetch = fetch,
): Promise<OllamaModel[]> {
  const base = (env('OLLAMA_BASE_URL') || 'http://127.0.0.1:11434/v1')
    .replace(/\\/v1\\/?$/, '')
    .replace(/\\/$/, '');
  const tags = await fetcher(`${base}/api/tags`, {
    signal: AbortSignal.timeout(3000),
  });
  if (!tags.ok) throw new Error('Ollama model list unavailable');
  const data = (await tags.json()) as TagsResponse;
  const names = [...new Set((data.models ?? [])
    .map((entry) => entry.name)
    .filter((name): name is string => typeof name === 'string' && name.length > 0))];
  const result: OllamaModel[] = [];
  // Limit concurrent /api/show calls for installations with many models.
  for (let index = 0; index < names.length; index += 4) {
    const batch = await Promise.all(names.slice(index, index + 4).map(async (name) => {
      try {
        const response = await fetcher(`${base}/api/show`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: name }),
          signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) throw new Error('Model capabilities unavailable');
        const info = (await response.json()) as ShowResponse;
        const capabilities = Array.isArray(info.capabilities) ? info.capabilities : [];
        return {
          id: `ollama/${name}`,
          name,
          supportsTools: capabilities.includes('tools'),
          supportsVision: capabilities.includes('vision'),
        };
      } catch {
        return { id: `ollama/${name}`, name, supportsTools: false, supportsVision: false };
      }
    }));
    result.push(...batch);
  }
  return result;
}
