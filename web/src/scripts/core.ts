/* Shared browser helpers: DOM, storage, toast, cart and forms. */

export const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s)
export const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)]
export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c]!)

export const store = {
  get<T>(k: string, d: T): T {
    try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v) } catch { return d }
  },
  set(k: string, v: unknown) {
    try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage blocked: degrade quietly */ }
  },
}

/* ---------- toast ---------- */
let toastT: number | undefined
export function toast(html: string) {
  const el = $('#toast')!
  el.innerHTML = html
  el.classList.add('show')
  clearTimeout(toastT)
  toastT = window.setTimeout(() => el.classList.remove('show'), 3200)
}

/* ---------- cart (kept in this browser) ---------- */
export interface CartItem { slug: string; opt: string; qty: number }
export const Cart = {
  items: () => store.get<CartItem[]>('ekpo_cart', []),
  save(list: CartItem[]) { store.set('ekpo_cart', list.filter((i) => i.qty > 0)); Cart.badge() },
  add(slug: string, opt: string, qty: number) {
    const list = Cart.items(), hit = list.find((i) => i.slug === slug && i.opt === opt)
    if (hit) hit.qty = Math.min(20, hit.qty + qty)
    else list.push({slug, opt, qty})
    Cart.save(list)
  },
  count: () => Cart.items().reduce((n, i) => n + i.qty, 0),
  badge() {
    const n = Cart.count(), b = $('#cartCount')
    if (!b) return
    b.textContent = n ? String(n) : ''
    b.closest('a')!.setAttribute('aria-label', `Shopping bag, ${n} item${n === 1 ? '' : 's'}`)
  },
}

/* ---------- forms (Netlify Forms) ----------
   Netlify stores submissions and can email them on. On localhost
   they are simulated and logged to the console.                 */
const isLocal = /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(location.hostname)

export async function sendForm(form: HTMLFormElement, extra: Record<string, string> = {}) {
  const fd = new FormData(form)
  fd.set('form-name', form.getAttribute('name')!)
  Object.entries(extra).forEach(([k, v]) => fd.set(k, v))
  // join repeated fields (several ticked checkboxes) into one value
  new Set([...fd.keys()]).forEach((k) => {
    const all = fd.getAll(k)
    if (all.length > 1 && all.every((v) => typeof v === 'string')) fd.set(k, all.join(', '))
  })
  if (isLocal) {
    console.info(`[EKPO] Form "${form.getAttribute('name')}" (simulated locally):`, Object.fromEntries(fd))
    await new Promise((r) => setTimeout(r, 400))
    return true
  }
  const hasFile = [...fd.values()].some((v) => v instanceof File && v.size)
  try {
    const res = hasFile
      ? await fetch('/', {method: 'POST', body: fd})
      : await fetch('/', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams([...fd].filter(([, v]) => typeof v === 'string') as [string, string][]).toString(),
        })
    return res.ok
  } catch {
    return false
  }
}

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
function fieldError(el: Field) {
  const v = el.validity
  if (v.valid) return ''
  if (v.valueMissing) return 'This field is required.'
  if (v.typeMismatch) return el.type === 'email' ? 'Enter an email address like name@example.com.' : 'Enter a full link starting with https://'
  if (v.tooShort) return 'Please write a little more.'
  if (v.patternMismatch) return el.title || 'Check the format of this field.'
  return el.validationMessage
}

/** Shows an inline message under each invalid field and focuses the first. */
export function validate(form: HTMLFormElement) {
  let first: Field | null = null
  $$<Field>('input, select, textarea', form).forEach((el) => {
    const f = el.closest('.field')
    if (!f || el.type === 'hidden') return
    let m = $('.msg', f)
    if (!m) { m = document.createElement('span'); m.className = 'msg'; f.appendChild(m) }
    const target = el.type === 'radio' || el.type === 'checkbox' ? f.querySelector<Field>(':invalid') : el
    const err = target && !target.disabled ? fieldError(target) : ''
    f.classList.toggle('err', !!err)
    m.textContent = err
    if (el === target) el.setAttribute('aria-invalid', String(!!err))
    if (err && !first) first = target
  })
  if (first) (first as Field).focus()
  return !first
}

interface BindOpts { extra?: () => Record<string, string>; onSuccess?: () => void; okText?: string }
/** Validates, submits to Netlify and reports the result inside the form. */
export function bindForm(form: HTMLFormElement, {extra, onSuccess, okText}: BindOpts = {}) {
  const status = $('.form-status', form)!, btn = $<HTMLButtonElement>('button[type=submit]', form)!
  form.noValidate = true
  form.addEventListener('input', (e) => {
    const el = e.target as Field, f = el.closest('.field.err')
    if (f && el.validity?.valid) { f.classList.remove('err'); const m = $('.msg', f); if (m) m.textContent = '' }
  })
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (!validate(form)) return
    const label = btn.textContent
    btn.disabled = true; btn.textContent = 'Sending…'
    status.className = 'form-status'; status.textContent = ''
    const ok = await sendForm(form, extra ? extra() : {})
    btn.disabled = false; btn.textContent = label
    if (ok) {
      if (onSuccess) return onSuccess()
      status.className = 'form-status ok'
      status.textContent = okText || 'Thank you. We have received your message.'
      form.reset()
      status.tabIndex = -1; status.focus()
    } else {
      const email = document.body.dataset.email || 'hello@ekpo.com.ng'
      status.className = 'form-status bad'
      status.innerHTML = `Sorry, that did not send. Please try again, or email us at <a href="mailto:${email}">${email}</a>.`
    }
  })
}

/** Reads JSON embedded in the page with <script type="application/json" id="...">. */
export const pageData = <T>(id: string): T => JSON.parse($(`#${id}`)!.textContent || 'null')
