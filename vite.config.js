import { resolve } from 'path'
import glsl from 'vite-plugin-glsl'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    sourcemap: 'inline',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'blah',
      fileName: 'blah'
    }
  },
  plugins: [glsl()]
})
