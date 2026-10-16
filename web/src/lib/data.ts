import {query, type SanityImage} from './sanity'
import {seedOf} from './art'
import {slugify, fmtDate, naira, initials} from './format'

export {slugify, fmtDate, naira, initials}

/* ---------- types ---------- */
export interface Topic { name: string; slug: string }
export interface Section { name: string; slug: string; note?: string; layout: 'lead' | 'strip' | '3' | '4' | 'spot' | 'tabs'; topics: Topic[] }
export interface Writer { name: string; slug: string; role?: string; bio?: string; photo?: SanityImage }
export interface PTBlock { _type: string; _key: string; [k: string]: unknown }
export interface Article {
  title: string; slug: string; excerpt: string; mainImage?: SanityImage; body: PTBlock[]; publishedAt: string
  section: string; sectionName: string; topic: Topic; writer: Writer
  url: string; seed: number
}
export interface Video {
  title: string; slug: string; category: string; youtubeId?: string; videoUrl?: string; duration?: string
  publishedAt: string; description?: string; thumbnail?: SanityImage; related?: {url: string} | null
  url: string; seed: number
}
export interface Product {
  name: string; slug: string; category: string; price: number; image?: SanityImage; description: string; details?: string[]
  optionLabel?: string; optionValues?: string[]; digital?: boolean; available?: boolean; related?: {url: string} | null
  url: string; seed: number
}
export interface Job { title: string; slug: string; type?: string; location?: string; summary?: string; duties?: string[]; needs?: string[] }
export interface Page { title: string; slug: string; intro?: string; updatedAt?: string; body: PTBlock[] }
export interface DeliveryOption { code: string; label: string; price: number; payOnDelivery?: boolean }
export interface Settings {
  tagline?: string; email: string; pitchesEmail?: string; partnersEmail?: string; careersEmail?: string; address?: string; hours?: string
  social?: Partial<Record<'instagram' | 'x' | 'tiktok' | 'youtube' | 'facebook', string>>; delivery?: DeliveryOption[]
  mission?: string; newsletterHeading?: string; popupHeading?: string; popupText?: string
}
export interface Feature { title: string; text?: string; points?: string[] }
export interface Cta { label: string; href: string; style?: 'primary' | 'secondary' }
interface SitePageBase { title: string; lede?: string; description?: string }
export interface SitePages {
  aboutPage: SitePageBase & { quote?: string; story?: PTBlock[]; coverageHeading?: string; coverageIntro?: string; coverage?: Feature[]; teamHeading?: string; teamIntro?: string; workHeading?: string; workText?: string; buttons?: Cta[] }
  servicesPage: SitePageBase & { services?: Feature[]; howHeading?: string; howText?: string; buttons?: Cta[] }
  advertisePage: SitePageBase & { optionsHeading?: string; optionsIntro?: string; options?: Feature[]; formHeading?: string; formText?: string; formats: string[]; budgets: string[] }
  contactPage: SitePageBase & { detailsHeading?: string; subjects: string[] }
  careersPage: SitePageBase & { rolesHeading?: string; noRolesText?: string; applyHeading?: string; applyText?: string; thanksText?: string }
}
/** Splits plain text into paragraphs on blank lines. */
export const paragraphs = (t?: string) => (t || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)

export interface Pinned { title: string; excerpt: string; article: Article }

/* ---------- urls ---------- */
export const U = {
  section: (s: string) => `/${s}/`,
  topic: (s: string, t: string) => `/${s}/topic/${t}/`,
  article: (s: string, slug: string) => `/${s}/${slug}/`,
  writer: (slug: string) => `/writers/${slug}/`,
  video: (slug: string) => `/videos/${slug}/`,
  videoCat: (c: string) => `/videos/category/${slugify(c)}/`,
  product: (slug: string) => `/shop/${slug}/`,
  shopCat: (c: string) => `/shop/category/${slugify(c)}/`,
}

/* ---------- formatting ---------- */
export function plainText(blocks: PTBlock[] = []) {
  return blocks.map((b) => {
    if (b._type === 'block') return ((b.children as {text: string}[]) || []).map((c) => c.text).join('')
    if (b._type === 'pullQuote') return String(b.quote || '')
    if (b._type === 'figure') return String(b.caption || '')
    return ''
  }).join(' ')
}
export const readTime = (a: Article) => Math.max(2, Math.round(plainText(a.body).split(/\s+/).length / 230)) + ' min read'

/* ---------- one query for the whole (small) site, cached per build ---------- */
const SITE_QUERY = `{
  "settings": *[_id == "siteSettings"][0],
  "pinned": *[_id == "homepage"][0].pinned[]{title, excerpt, "slug": article->slug.current},
  "sections": *[_type == "section"] | order(order asc){
    name, "slug": slug.current, note, layout,
    "topics": *[_type == "topic" && section._ref == ^._id] | order(order asc){name, "slug": slug.current}
  },
  "writers": *[_type == "writer"] | order(order asc){name, "slug": slug.current, role, bio, photo},
  "articles": *[_type == "article" && defined(slug.current) && defined(section)] | order(publishedAt desc){
    title, "slug": slug.current, excerpt, mainImage, body, publishedAt,
    "section": section->slug.current, "sectionName": section->name,
    "topic": topic->{name, "slug": slug.current},
    "writer": writer->{name, "slug": slug.current, role, bio, photo}
  },
  "videos": *[_type == "video" && defined(slug.current)] | order(publishedAt desc){
    title, "slug": slug.current, category, youtubeId, videoUrl, duration, publishedAt, description, thumbnail,
    "related": relatedArticle->{"s": section->slug.current, "a": slug.current}
  },
  "products": *[_type == "product" && defined(slug.current)] | order(order asc){
    name, "slug": slug.current, category, price, image, description, details, optionLabel, optionValues, digital, available,
    "related": relatedArticle->{"s": section->slug.current, "a": slug.current}
  },
  "jobs": *[_type == "job" && open != false] | order(order asc){title, "slug": slug.current, type, location, summary, duties, needs},
  "pages": *[_type == "page"]{title, "slug": slug.current, intro, updatedAt, body},
  "aboutPage": *[_id == "aboutPage"][0],
  "servicesPage": *[_id == "servicesPage"][0],
  "advertisePage": *[_id == "advertisePage"][0],
  "contactPage": *[_id == "contactPage"][0],
  "careersPage": *[_id == "careersPage"][0]
}`

type Rel = {s: string; a: string} | null
type Raw = {
  settings: Settings | null; pinned: {title?: string; excerpt?: string; slug: string}[] | null
  sections: Section[]; writers: Writer[]; articles: Omit<Article, 'url' | 'seed'>[]
  videos: (Omit<Video, 'url' | 'seed' | 'related'> & {related: Rel})[]
  products: (Omit<Product, 'url' | 'seed' | 'related'> & {related: Rel})[]
  jobs: Job[]; pages: Page[]
} & {[K in keyof SitePages]: SitePages[K] | null}

let cache: ReturnType<typeof load> | null = null
export const getSite = () => (cache ??= load())

async function load() {
  const raw = await query<Raw>(SITE_QUERY)
  const rel = (r: Rel) => (r?.s && r.a ? {url: U.article(r.s, r.a)} : null)
  const articles: Article[] = raw.articles
    .filter((a) => a.section && a.topic && a.writer)
    .map((a) => ({...a, body: a.body || [], url: U.article(a.section, a.slug), seed: seedOf(a.slug)}))
  const bySlug = new Map(articles.map((a) => [a.slug, a]))
  const videos: Video[] = raw.videos.map((v) => ({...v, related: rel(v.related), url: U.video(v.slug), seed: seedOf(v.slug)}))
  const products: Product[] = raw.products.map((p) => ({...p, related: rel(p.related), url: U.product(p.slug), seed: seedOf(p.slug)}))
  const pinned: Pinned[] = (raw.pinned || []).flatMap((p) => {
    const article = bySlug.get(p.slug)
    return article ? [{article, title: p.title || article.title, excerpt: p.excerpt || article.excerpt}] : []
  })
  const settings: Settings = raw.settings || {email: 'hello@ekpo.com.ng'}
  return {
    settings, pinned, articles, videos, products, jobs: raw.jobs, pages: raw.pages,
    sections: raw.sections, writers: raw.writers,
    section: (slug: string) => raw.sections.find((s) => s.slug === slug),
    inSection: (s: string, topic?: string) => articles.filter((a) => a.section === s && (!topic || a.topic.slug === topic)),
    byWriter: (w: string) => articles.filter((a) => a.writer.slug === w),
    videoCategories: [...new Set(videos.map((v) => v.category))],
    shopCategories: [...new Set(products.map((p) => p.category))],
    /** A fixed page's content. Fails the build with a clear message if it hasn't been created in Sanity. */
    sitePage<K extends keyof SitePages>(type: K): SitePages[K] {
      const doc = raw[type]
      if (!doc) throw new Error(`Sanity has no "${type}" document. Run "npm run import-seed" in studio/, or open Site pages in the Studio and publish it.`)
      return doc as SitePages[K]
    },
    socials: Object.entries(settings.social || {}).filter(([, url]) => url) as [string, string][],
  }
}
export type Site = Awaited<ReturnType<typeof load>>
