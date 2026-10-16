import {toHTML, escapeHTML, uriLooksSafe} from '@portabletext/to-html'
import {art, seedOf} from './art'
import {imageUrl, type SanityImage} from './sanity'
import type {PTBlock} from './data'

/** Renders Sanity rich text (article bodies, pages) to HTML. */
export function renderBody(blocks: PTBlock[]) {
  return toHTML(blocks as never, {
    components: {
      types: {
        pullQuote: ({value}) =>
          `<blockquote><p>${escapeHTML(value.quote || '')}</p>${value.cite ? `<cite>${escapeHTML(value.cite)}</cite>` : ''}</blockquote>`,
        figure: ({value}) => {
          const src = imageUrl(value.image as SanityImage, 1360)
          const media = src
            ? `<img class="media-img" src="${src}" alt="${escapeHTML(value.alt || '')}" loading="lazy">`
            : art(seedOf(value._key || 'fig'), {w: 1200, h: 800})
          return `<figure><div class="img">${media}</div>${value.caption ? `<figcaption>${escapeHTML(value.caption)}</figcaption>` : ''}</figure>`
        },
      },
      marks: {
        link: ({children, value}) => {
          const href = String(value?.href || '')
          if (!uriLooksSafe(href)) return children
          const external = /^https?:/.test(href)
          return `<a href="${escapeHTML(href)}"${external ? ' target="_blank" rel="noopener"' : ''}>${children}</a>`
        },
      },
    },
  })
}
