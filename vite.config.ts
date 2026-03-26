import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { federation } from '@module-federation/vite'

/**
 * Workaround for @module-federation/vite injecting absolute filesystem paths
 * into index.html during dev mode (e.g., "/mnt/d/repos/.../node_modules/__mf__virtual/...").
 * This plugin rewrites them to valid relative paths (e.g., "/__mf__virtual/...").
 * See: https://github.com/module-federation/core/issues
 */
function fixMfDevPaths() {
  return {
    name: 'fix-mf-dev-paths',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(
        /(?<=["'])([^"']*?)\/node_modules\/__mf__virtual\//g,
        '/node_modules/__mf__virtual/'
      )
    },
  }
}

export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'shell',
      remotes: {
        swearJar: {
          type: 'module',
          name: 'swearJar',
          entry: 'http://localhost:5174/remoteEntry.js',
        },
      },
      // TODO: 轉 TypeScript 後啟用 dts 型別提示功能
      dts: false,
      shared: {
        vue: { singleton: true, eager: true },
        'vue-router': { singleton: true, eager: true },
        pinia: { singleton: true, eager: true },
      },
    }),
    fixMfDevPaths(),
  ],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5200',
        changeOrigin: true,
      },
    },
  },
})
