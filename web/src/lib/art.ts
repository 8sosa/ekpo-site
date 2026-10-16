/**
 * Placeholder artwork in EKPO's adire/raffia palette, drawn as inline SVG.
 * Used wherever an article, product or video has no photo yet.
 * Shared by server-rendered pages and client scripts.
 */
const PAL = [
  ['#1B2A6B', '#E0B45C', '#F0EEEA'], ['#C0341D', '#000', '#E0B45C'], ['#000', '#F0EEEA', '#C0341D'], ['#E0B45C', '#1B2A6B', '#fff'],
  ['#2F4A3A', '#E0B45C', '#F0EEEA'], ['#6B2D5C', '#F0B8A0', '#fff'], ['#F0EEEA', '#1B2A6B', '#C0341D'], ['#3A2A1E', '#E0B45C', '#C0341D'],
]
let n = 0

/** A stable number from 1 to 97 for any string, so each item keeps the same artwork. */
export const seedOf = (s: string) => ([...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 97) + 1

export function art(seed: number, {figure = true, w = 800, h = 600} = {}) {
  const [bg, fg, ac] = PAL[seed % PAL.length], id = `p${seed}_${n++}`, t = seed % 5
  let pat = ''
  if (t === 0) pat = `<pattern id="${id}" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="9" fill="none" stroke="${fg}" stroke-width="3"/><circle cx="20" cy="20" r="2" fill="${fg}"/></pattern>`
  if (t === 1) pat = `<pattern id="${id}" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="30" fill="${fg}" opacity=".55"/></pattern>`
  if (t === 2) pat = `<pattern id="${id}" width="48" height="24" patternUnits="userSpaceOnUse"><path d="M0 18L12 6L24 18L36 6L48 18" fill="none" stroke="${fg}" stroke-width="3"/></pattern>`
  if (t === 3) pat = `<pattern id="${id}" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M18 4v28M4 18h28" stroke="${fg}" stroke-width="3"/><circle cx="18" cy="18" r="6" fill="${bg}" stroke="${fg}" stroke-width="3"/></pattern>`
  if (t === 4) pat = `<pattern id="${id}" width="10" height="${h}" patternUnits="userSpaceOnUse"><rect width="4" height="${h}" fill="${fg}" opacity=".5"/></pattern>`
  const cx = w * (0.35 + ((seed * 37) % 30) / 100), s = h / 600
  const fig = figure
    ? `<g transform="translate(${cx} ${h}) scale(${s})"><ellipse cx="0" cy="-470" rx="46" ry="54" fill="${ac}"/><path d="M-60-500q60-90 120 0q10-60-60-80q-70 20-60 80z" fill="${fg}"/><path d="M-120 0q0-300 60-400h120q60 100 60 400z" fill="${fg}"/><path d="M-60-400h120l-10 70h-100z" fill="${ac}" opacity=".85"/></g>`
    : ''
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>${pat}</defs><rect width="${w}" height="${h}" fill="${bg}"/><rect width="${w}" height="${h}" fill="url(#${id})" opacity=".45"/><circle cx="${w * 0.78}" cy="${h * 0.3}" r="${h * 0.22}" fill="${ac}" opacity=".9"/>${fig}</svg>`
}
