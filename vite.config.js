import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Load built CSS without blocking first paint (preload + onload swap). */
function nonBlockingCss() {
  return {
    name: 'non-blocking-css',
    enforce: 'post',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        let result = html.replace(
          /<link rel="stylesheet"([^>]*?)href="([^"]+\.css)"([^>]*)>/g,
          (_match, before, href, after) => {
            const attrs = `${before || ''}${after || ''}`;
            return (
              `<link rel="preload" as="style" href="${href}"${attrs} ` +
              `onload="this.onload=null;this.rel='stylesheet'">` +
              `<noscript><link rel="stylesheet" href="${href}"${attrs}></noscript>`
            );
          }
        );

        // Preload the latin variable font early (non-blocking)
        if (ctx.bundle) {
          const latinFont = Object.keys(ctx.bundle).find((file) =>
            /inter-latin-wght-normal.*\.woff2$/.test(file)
          );
          if (latinFont) {
            const href = latinFont.startsWith('/') ? latinFont : `/${latinFont}`;
            result = result.replace(
              '</title>',
              `</title>\n  <link rel="preload" as="font" type="font/woff2" href="${href}" crossorigin>`
            );
          }
        }

        return result;
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), nonBlockingCss()],
  build: {
    cssCodeSplit: true,
    modulePreload: {
      polyfill: false,
    },
  },
});
