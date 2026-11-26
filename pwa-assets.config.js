import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
  images: ['public/favicon.svg'],
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, padding: 0 },
    maskable: {
      sizes: [512],
      padding: 0,
      resizeOptions: { background: '#101114', fit: 'contain' },
    },
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: { background: '#101114', fit: 'contain' },
    },
  },
})
