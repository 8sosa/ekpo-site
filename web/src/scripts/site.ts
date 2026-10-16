/* Site-wide behaviour: menus, drawer, search overlay, newsletter, pop-up, cart badge. */
import {$, $$, esc, store, Cart, sendForm} from './core'
import {art} from '../lib/art'
import {fmtDate} from '../lib/format'

const PAGE = document.body.dataset.page || 'page'

/* ---------- lazily loaded JSON built with the site ---------- */
const cache: Record<string, Promise<unknown>> = {}
const getJSON = <T>(url: string) => (cache[url] ??= fetch(url).then((r) => r.json())) as Promise<T>

interface NavPost { title: string; url: string; date: string; seed: number; img: string | null }
interface NavTopic { name: string; url: string; posts: NavPost[] }
type NavData = Record<string, {name: string; url: string; topics: NavTopic[]; latest: NavPost[]}>

/* ---------- category bar dropdowns ---------- */
const drop = $('#drop')!
let dropTimer: number | undefined, currentDrop: string | null = null
const mini = (p: NavPost) =>
  `<a class="mini" href="${p.url}"><div class="img">${p.img ? `<img class="media-img" src="${p.img}" alt="" loading="lazy">` : art(p.seed, {w: 400, h: 300})}</div><h3>${esc(p.title)}</h3><time datetime="${p.date}">${fmtDate(p.date)}</time></a>`

async function renderDrop(sec: string, idx = 0) {
  const s = (await getJSON<NavData>('/nav.json'))[sec]
  if (!s || currentDrop !== sec) return
  const t = s.topics[idx]
  const pick = [...(t?.posts || []), ...s.latest.filter((p) => !t?.posts.some((x) => x.url === p.url))].slice(0, 3)
  drop.innerHTML = `<div class="wrap">
    <ul class="subs">${s.topics.map((x, i) => `<li><a href="${x.url}" data-i="${i}" aria-current="${i === idx}">${esc(x.name)}<span aria-hidden="true">›</span></a></li>`).join('')}</ul>
    <div class="posts">${pick.map(mini).join('')}</div>
    <a class="all" href="${s.url}">See all ${esc(s.name)}</a></div>`
  $$('.subs a', drop).forEach((a) => {
    const i = Number(a.dataset.i)
    a.addEventListener('mouseenter', () => { if (i !== idx) renderDrop(sec, i) })
    a.addEventListener('focus', () => {
      if (i !== idx) renderDrop(sec, i).then(() => $<HTMLElement>(`.subs a[data-i="${i}"]`, drop)?.focus({preventScroll: true}))
    })
  })
}
function openDrop(btn: HTMLElement) {
  closeMega(); clearTimeout(dropTimer)
  $$('.catbar button').forEach((b) => b.setAttribute('aria-expanded', String(b === btn)))
  if (currentDrop !== btn.dataset.sec) { currentDrop = btn.dataset.sec!; renderDrop(currentDrop) }
  drop.classList.add('open')
}
function closeDrop() {
  drop.classList.remove('open'); currentDrop = null
  $$('.catbar button').forEach((b) => b.setAttribute('aria-expanded', 'false'))
}
$$('.catbar button').forEach((b) => {
  b.addEventListener('mouseenter', () => { if (matchMedia('(hover:hover)').matches) openDrop(b) })
  b.addEventListener('click', () => (b.getAttribute('aria-expanded') === 'true' ? closeDrop() : openDrop(b)))
})
$('.catbar')!.addEventListener('mouseleave', () => (dropTimer = window.setTimeout(closeDrop, 200)))
drop.addEventListener('mouseenter', () => clearTimeout(dropTimer))
drop.addEventListener('mouseleave', () => (dropTimer = window.setTimeout(closeDrop, 200)))

/* ---------- sections mega menu ---------- */
const mega = $('#mega')!, secBtn = $('#sectionsBtn')!
function closeMega() { mega.classList.remove('open'); secBtn.setAttribute('aria-expanded', 'false') }
secBtn.addEventListener('click', () => {
  const open = !mega.classList.contains('open')
  closeDrop(); mega.classList.toggle('open', open); secBtn.setAttribute('aria-expanded', String(open))
})
document.addEventListener('click', (e) => { if (!(e.target as Element).closest('header.site')) { closeMega(); closeDrop() } })

/* ---------- mobile drawer ---------- */
const drawer = $('#drawer')!, burger = $('#burger')!
function openDrawer() {
  drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); drawer.inert = false
  burger.setAttribute('aria-expanded', 'true'); $('#closeDrawer')!.focus(); document.body.style.overflow = 'hidden'
}
function closeDrawer() {
  if (!drawer.classList.contains('open')) return
  drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); drawer.inert = true
  burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; burger.focus()
}
burger.addEventListener('click', openDrawer)
$('#closeDrawer')!.addEventListener('click', closeDrawer)

/* ---------- search overlay ---------- */
export interface SearchItem { t: string; u: string; k: string; x: string; e?: string; d?: string; s: number; i?: string | null; type: 'post' | 'video' | 'product' }
export const searchIndex = () => getJSON<SearchItem[]>('/search.json')
export function searchFor(list: SearchItem[], term: string) {
  const words = term.toLowerCase().split(/\s+/).filter(Boolean)
  return words.length ? list.filter((r) => words.every((w) => r.x.includes(w))) : []
}
const searchEl = $('#search')!, q = $<HTMLInputElement>('#q')!, results = $('#results')!
async function renderResults() {
  const list = await searchIndex(), t = q.value.trim()
  const hits = t ? searchFor(list, t).slice(0, 10) : list.filter((r) => r.type === 'post').slice(0, 8)
  results.innerHTML = hits.length
    ? hits.map((r) => `<li><a href="${r.u}">${esc(r.t)}<small>${esc(r.k)}</small></a></li>`).join('')
    : `<li style="padding:14px 0">No results for "${esc(t)}". Try a section name like Fashion or Music.</li>`
}
let searchReturn: Element | null = null
function openSearch() {
  searchReturn = document.activeElement; searchEl.classList.add('open'); renderResults(); q.focus(); document.body.style.overflow = 'hidden'
}
function closeSearch() {
  if (!searchEl.classList.contains('open')) return
  searchEl.classList.remove('open'); q.value = ''; document.body.style.overflow = ''; (searchReturn as HTMLElement | null)?.focus()
}
$('#searchBtn')!.addEventListener('click', openSearch)
$('#closeSearch')!.addEventListener('click', closeSearch)
q.addEventListener('input', renderResults)
searchEl.querySelector('form')!.addEventListener('submit', (e) => { if (!q.value.trim()) { e.preventDefault(); q.focus() } })

/* ---------- newsletter (embedded, footer, pop-up) ---------- */
$$<HTMLFormElement>('.nl-form').forEach((f) => f.addEventListener('submit', async (e) => {
  e.preventDefault()
  const inp = $<HTMLInputElement>('input[type=email]', f)!, msg = f.nextElementSibling!, v = inp.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
    msg.textContent = 'Enter an email address like name@example.com.'; msg.classList.add('nl-err'); inp.focus(); return
  }
  msg.classList.remove('nl-err'); msg.textContent = 'Subscribing…'
  if (!(await sendForm(f))) { msg.textContent = 'Sorry, that did not go through. Please try again.'; msg.classList.add('nl-err'); return }
  store.set('ekpo_sub', true)
  msg.textContent = 'Subscribed. Your first newsletter arrives on Friday.'; f.reset()
  if (f.dataset.source === 'popup') setTimeout(closePop, 1600)
}))

/* ---------- newsletter pop-up ---------- */
const pop = $('#pop')!
let lastFocus: Element | null = null
function openPop() {
  if (pop.classList.contains('open')) return
  lastFocus = document.activeElement; pop.classList.add('open'); store.set('ekpo_pop_at', Date.now())
  setTimeout(() => $('#nlPop')!.focus(), 50)
}
function closePop() {
  if (!pop.classList.contains('open')) return
  pop.classList.remove('open'); (lastFocus as HTMLElement | null)?.focus()
}
$('#openPop')!.addEventListener('click', openPop)
$('#closePop')!.addEventListener('click', closePop)
$('#noThanks')!.addEventListener('click', closePop)
pop.addEventListener('click', (e) => { if (e.target === pop) closePop() })
// At most once every 14 days, never to subscribers, never in an iframe, not mid-checkout or mid-form
const popOk = () =>
  !store.get('ekpo_sub', false) && Date.now() - store.get('ekpo_pop_at', 0) > 14 * 864e5 &&
  window.self === window.top && !['bag', 'contact', 'careers', 'advertise'].includes(PAGE)
if (popOk()) {
  setTimeout(() => popOk() && openPop(), 15000)
  const onScroll = () => {
    if (scrollY > document.body.scrollHeight * 0.45) { removeEventListener('scroll', onScroll); if (popOk()) openPop() }
  }
  addEventListener('scroll', onScroll, {passive: true})
}

/* ---------- keyboard ---------- */
addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeMega(); closeDrop(); closePop(); closeSearch(); closeDrawer() }
  const a = document.activeElement as HTMLElement
  if (e.key === '/' && !/input|textarea|select/i.test(a.tagName) && !a.isContentEditable) { e.preventDefault(); openSearch() }
})

/* ---------- cart badge ---------- */
Cart.badge()
addEventListener('storage', (e) => { if (e.key === 'ekpo_cart') Cart.badge() })
