import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "believe-christina-stretch-governance.trycloudflare.com",
      "layer-gabriel-vegetable-marshall.trycloudflare.com",
      "owen-polyester-reading-stands.trycloudflare.com",
      "organ-hampshire-namely-burning.trycloudflare.com",
    ],
    hmr: {
      overlay: false,
    },
    proxy: {
      '/ecos-api': {
        target: 'https://ecos.bok.or.kr',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ecos-api/, '/api'),
        secure: false,
      }
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // 🚀 Performance Optimization: Pre-bundling for faster dev server
  optimizeDeps: {
    include: [
      // lucide-react: Barrel import 최적화 (1,500+ 아이콘 모듈 사전 번들링)
      'lucide-react',
      // @radix-ui: 자주 사용되는 컴포넌트 사전 번들링
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-accordion',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-switch',
      '@radix-ui/react-slider',
      '@radix-ui/react-progress',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-separator',
      '@radix-ui/react-avatar',
      '@radix-ui/react-label',
      '@radix-ui/react-slot',
      '@radix-ui/react-toast',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-radio-group',
      // 기타 무거운 라이브러리
      'framer-motion',
      'recharts',
      'date-fns',
      '@tanstack/react-query',
      '@supabase/supabase-js',
    ],
    // 의존성 탐색 시 제외할 패키지 (순수 ESM 모듈)
    exclude: [],
  },
});
