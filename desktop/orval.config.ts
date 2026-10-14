import { defineConfig } from 'orval';

export default defineConfig({
  bandrek: {
    input: '../contract/openapi.json',
    output: {
      mode: 'split',
      target: 'src/data/api/generated/endpoints.ts',
      schemas: 'src/data/api/generated/models',
      client: 'fetch',
      override: {
        mutator: {
          path: 'src/data/api/client.ts',
          name: 'customFetch',
        },
      },
    },
  },
});
