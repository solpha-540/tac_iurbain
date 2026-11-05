import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const proxy = {}
  for (const [prefix, target] of [
    ['/api-urbain', env.VITE_URBAIN_BASE_URL],
    ['/api-kisalu', env.VITE_KISALU_BASE_URL]
  ]) {
    if (target) {
      proxy[prefix] = {
        target: target.replace(/\/+$/, ''),
        changeOrigin: true,
        rewrite: path => path.slice(prefix.length) || '/'
      }
    }
  }
  return {
    plugins: [react()],
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.[jt]sx?$/,
      exclude: []
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: { '.js': 'jsx' }
      }
    },
    define: { 'process.env': {} },
    server: { port: 3000, proxy },
    build: { outDir: 'build' }
  }
})
