const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react');

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  css: {
    postcss: './postcss.config.cjs',
  },
});

