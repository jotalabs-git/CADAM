import { createFileRoute } from '@tanstack/react-router';
import { json, preflight, requireUser, isUnauthorizedError } from '@/server/api';
import { discoverOllamaModels } from '@/server/ollamaModels';

export const Route = createFileRoute('/api/ollama-models')({
  server: {
    handlers: {
      OPTIONS: preflight,
      GET: async ({ request }) => {
        try {
          await requireUser(request);
          return json({ models: await discoverOllamaModels(), available: true });
        } catch (error) {
          if (isUnauthorizedError(error)) return json({ error: 'Unauthorized' }, 401);
          return json({ models: [], available: false });
        }
      },
    },
  },
});
