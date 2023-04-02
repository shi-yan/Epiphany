import { defineConfig } from 'vite'
import stringPlugin from 'vite-plugin-string';
// vite.config.js
export default defineConfig({
    build: {
        outDir: '../../src',
        minify: false,
        cssMinify: false
    },
    plugins: [
        stringPlugin({
          include: ['**/*.djot'],
          compress: false,
        })
      ],
    root: 'src'
})