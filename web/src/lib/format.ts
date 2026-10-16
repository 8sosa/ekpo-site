/* Formatting helpers shared by server pages and browser scripts. */
export const fmtDate = (iso: string) => new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', {day: 'numeric', month: 'long', year: 'numeric'})
export const naira = (n: number) => '₦' + Number(n).toLocaleString('en-NG')
export const initials = (n: string) => n.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase()
export const slugify = (t: string) => t.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
