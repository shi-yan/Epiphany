import { defineConfig } from 'vite'
import stringPlugin from 'vite-plugin-string';
// vite.config.ts
export default defineConfig({
    build: {
        outDir: '../../src',
        minify: false,
        cssMinify: false,
        rollupOptions: {
            input: 'src/main.js'
        }
    },
    plugins: [
        stringPlugin({
          include: ['**/*.djot'],
          compress: false,
        })
    ],
    resolve: {
        extensions: ['.ts', '.js', '.json']
    },
    esbuild: {
        target: 'es2020'
    },
    root: 'src'
})