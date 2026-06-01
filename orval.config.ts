import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: 'http://localhost:3000/docs-json',
    output: {
      target: './src/api/generated/index.ts',
      schemas: './src/api/generated/model',
      client: 'fetch',
      baseUrl: '/api',
      clean: false,
      override: {
        mutator: {
          path: './src/api/request.ts',
          name: 'request',
        },
      },
    },
  },
})
