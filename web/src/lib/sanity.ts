import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'
import {parse, evaluate} from 'groq-js'
import fs from 'node:fs'
import path from 'node:path'

const projectId = process.env.SANITY_PROJECT_ID || import.meta.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || import.meta.env.SANITY_DATASET || 'production'

/**
 * Without SANITY_PROJECT_ID the site builds from seed/ekpo.ndjson, the same
 * content that gets imported into Sanity. Handy for local work and previews.
 */
export const usingSeed = !projectId

const client = projectId
  ? createClient({projectId, dataset, apiVersion: '2025-01-01', useCdn: false, perspective: 'published'})
  : null
const builder = client ? createImageUrlBuilder(client) : null

let seedDocs: unknown[] | null = null
function seed() {
  if (!seedDocs) {
    const file = path.resolve(process.cwd(), '../seed/ekpo.ndjson')
    seedDocs = fs.readFileSync(file, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
  }
  return seedDocs
}

export async function query<T>(groq: string, params: Record<string, unknown> = {}): Promise<T> {
  if (client) return client.fetch<T>(groq, params)
  const result = await evaluate(parse(groq, {params}), {dataset: seed(), params})
  return (await result.get()) as T
}

export interface SanityImage {
  asset?: {_ref: string}
  alt?: string
  hotspot?: unknown
  crop?: unknown
}

/** A cropped, resized URL for a Sanity image, or null if there is no photo yet. */
export function imageUrl(src: SanityImage | null | undefined, width: number, height?: number): string | null {
  if (!src?.asset || !builder) return null
  let img = builder.image(src).width(width).auto('format').quality(80)
  if (height) img = img.height(height).fit('crop')
  return img.url()
}
