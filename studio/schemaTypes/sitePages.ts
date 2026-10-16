import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentsIcon} from '@sanity/icons/Documents'

/* The fixed pages of the site (About, Services, Advertise, Contact, Careers).
   Each exists once; the layout is set by the website, the words are edited here. */

const paragraphsHelp = 'Leave an empty line between paragraphs.'

export const feature = defineType({
  name: 'feature',
  title: 'Feature box',
  type: 'object',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'text', type: 'text', rows: 3}),
    defineField({name: 'points', title: 'Bullet points (optional)', type: 'array', of: [{type: 'string'}]}),
  ],
  preview: {select: {title: 'title', subtitle: 'text'}},
})

export const cta = defineType({
  name: 'cta',
  title: 'Button',
  type: 'object',
  fields: [
    defineField({name: 'label', type: 'string', validation: (r) => r.required()}),
    defineField({
      name: 'href',
      title: 'Link',
      type: 'string',
      description: 'A page on the site like /careers/ or /contact/?subject=Services, or a full https:// address.',
      validation: (r) => r.required().regex(/^(\/|https?:\/\/|mailto:)/, {name: 'link starting with /, https:// or mailto:'}),
    }),
    defineField({
      name: 'style',
      type: 'string',
      initialValue: 'primary',
      options: {layout: 'radio', direction: 'horizontal', list: [{title: 'Solid', value: 'primary'}, {title: 'Outline', value: 'secondary'}]},
    }),
  ],
  preview: {select: {title: 'label', subtitle: 'href'}},
})

const base = [
  defineField({name: 'title', title: 'Page heading', type: 'string', validation: (r) => r.required()}),
  defineField({name: 'lede', title: 'Introduction', type: 'text', rows: 3, description: 'Shown under the heading.'}),
  defineField({name: 'description', title: 'Search and share description', type: 'text', rows: 2, description: 'Shown by Google and in link previews. One or two sentences.'}),
]
const features = (name: string, title: string) =>
  defineField({name, title, type: 'array', of: [defineArrayMember({type: 'feature'})], validation: (r) => r.max(6)})
const buttons = defineField({name: 'buttons', type: 'array', of: [defineArrayMember({type: 'cta'})], validation: (r) => r.max(3)})
const list = (name: string, title: string, description?: string) =>
  defineField({name, title, type: 'array', of: [{type: 'string'}], description, validation: (r) => r.required().min(1)})

const singleton = (name: string, title: string, fields: ReturnType<typeof defineField>[]) =>
  defineType({
    name,
    title,
    type: 'document',
    icon: DocumentsIcon,
    fields: [...base, ...fields],
    preview: {prepare: () => ({title})},
  })

export const aboutPage = singleton('aboutPage', 'About page', [
  defineField({name: 'quote', title: 'Large quote', type: 'text', rows: 2}),
  defineField({name: 'story', title: 'Our story', type: 'blockContent'}),
  defineField({name: 'coverageHeading', title: '"What we cover" heading', type: 'string'}),
  defineField({name: 'coverageIntro', title: '"What we cover" line', type: 'string'}),
  features('coverage', '"What we cover" boxes'),
  defineField({name: 'teamHeading', title: 'Team heading', type: 'string'}),
  defineField({name: 'teamIntro', title: 'Team line', type: 'string', description: 'The team itself comes from Writers.'}),
  defineField({name: 'workHeading', title: '"Work with us" heading', type: 'string'}),
  defineField({name: 'workText', title: '"Work with us" text', type: 'text', rows: 3}),
  buttons,
])

export const servicesPage = singleton('servicesPage', 'Services page', [
  features('services', 'Services'),
  defineField({name: 'howHeading', title: '"How we work" heading', type: 'string'}),
  defineField({name: 'howText', title: '"How we work" text', type: 'text', rows: 3, description: paragraphsHelp}),
  buttons,
])

export const advertisePage = singleton('advertisePage', 'Advertise page', [
  defineField({name: 'optionsHeading', title: 'Options heading', type: 'string'}),
  defineField({name: 'optionsIntro', title: 'Options line', type: 'string'}),
  features('options', 'Advertising options'),
  defineField({name: 'formHeading', title: 'Form heading', type: 'string'}),
  defineField({name: 'formText', title: 'Form text', type: 'text', rows: 3, description: `${paragraphsHelp} The advertising email from Site settings is added after it.`}),
  list('formats', 'Form: "Interested in" choices'),
  list('budgets', 'Form: budget choices'),
])

export const contactPage = singleton('contactPage', 'Contact page', [
  defineField({name: 'detailsHeading', title: 'Contact details heading', type: 'string', description: 'Emails and address come from Site settings.'}),
  list('subjects', 'Form: topic choices', 'The "What is it about?" list. Other pages link to /contact/?subject=… using these exact words.'),
])

export const careersPage = singleton('careersPage', 'Careers page', [
  defineField({name: 'rolesHeading', title: 'Open roles heading', type: 'string', description: 'The roles themselves come from Jobs.'}),
  defineField({name: 'noRolesText', title: 'Text when there are no open roles', type: 'string'}),
  defineField({name: 'applyHeading', title: 'Application heading', type: 'string'}),
  defineField({name: 'applyText', title: 'Application text', type: 'text', rows: 4, description: paragraphsHelp}),
  defineField({name: 'thanksText', title: 'Message after applying', type: 'string'}),
])
