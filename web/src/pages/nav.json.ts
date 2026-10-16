import type {APIRoute} from 'astro'
import {getSite, U, type Article} from '../lib/data'
import {imageUrl} from '../lib/sanity'

/* Data for the category-bar dropdowns, fetched when a reader first opens one. */
export const GET: APIRoute = async () => {
  const site = await getSite()
  const post = (a: Article) => ({title: a.title, url: a.url, date: a.publishedAt, seed: a.seed, img: imageUrl(a.mainImage, 400, 300)})
  const nav = Object.fromEntries(site.sections.map((s) => [s.slug, {
    name: s.name,
    url: U.section(s.slug),
    latest: site.inSection(s.slug).slice(0, 3).map(post),
    topics: s.topics.map((t) => ({name: t.name, url: U.topic(s.slug, t.slug), posts: site.inSection(s.slug, t.slug).slice(0, 3).map(post)})),
  }]))
  return new Response(JSON.stringify(nav), {headers: {'Content-Type': 'application/json'}})
}
