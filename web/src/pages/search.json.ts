import type {APIRoute} from 'astro'
import {getSite, naira} from '../lib/data'
import {imageUrl} from '../lib/sanity'

/* Search index for the search overlay and /search/ page. `x` is the lower-cased text that gets matched. */
export const GET: APIRoute = async () => {
  const site = await getSite()
  const items = [
    ...site.articles.map((a) => ({
      type: 'post', t: a.title, u: a.url, k: a.sectionName, e: a.excerpt, d: a.publishedAt, s: a.seed, i: imageUrl(a.mainImage, 800, 600),
      x: [a.title, a.excerpt, a.sectionName, a.topic.name, a.writer.name].join(' ').toLowerCase(),
    })),
    ...site.videos.map((v) => ({
      type: 'video', t: v.title, u: v.url, k: 'Video', e: v.description, s: v.seed, i: imageUrl(v.thumbnail, 800, 500),
      x: [v.title, v.description, v.category].join(' ').toLowerCase(),
    })),
    ...site.products.map((p) => ({
      type: 'product', t: p.name, u: p.url, k: 'Shop', e: naira(p.price), s: p.seed, i: imageUrl(p.image, 640, 800),
      x: [p.name, p.description, p.category].join(' ').toLowerCase(),
    })),
  ]
  return new Response(JSON.stringify(items), {headers: {'Content-Type': 'application/json'}})
}
