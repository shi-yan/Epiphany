import { defineConfig } from 'vite'
import stringPlugin from 'vite-plugin-string';
// vite.config.js
export default defineConfig({
    build: {
        outDir: '../../src'
    },
    plugins: [
        stringPlugin({
          include: ['**/*.djot'],
          compress: false,
        })
      ],
    root: 'src'
})