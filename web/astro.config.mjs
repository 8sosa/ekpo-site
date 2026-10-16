// @ts-check
import {defineConfig} from 'astro/config'
import sitemap from '@astrojs/sitemap'

// SITE_URL is the public address, e.g. https://ekpo.com.ng. On Netlify, URL is set automatically.
const site = process.env.SITE_URL || process.env.URL || 'http://localhost:4321'

export default defineConfig({
  site,
  trailingSlash: 'always',
  integrations: [sitemap({filter: (page) => !/\/(bag|search)\/$/.test(page)})],
})
