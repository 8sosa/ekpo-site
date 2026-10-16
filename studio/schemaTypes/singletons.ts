import {defineArrayMember, defineField, defineType} from 'sanity'
import {CogIcon} from '@sanity/icons/Cog'
import {HomeIcon} from '@sanity/icons/Home'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'contact', title: 'Contact', default: true},
    {name: 'social', title: 'Social'},
    {name: 'shop', title: 'Shop'},
    {name: 'copy', title: 'Footer and newsletter'},
  ],
  fields: [
    defineField({name: 'tagline', type: 'string', group: 'contact', description: 'Shown in the black strip at the top of every page.'}),
    defineField({name: 'mission', title: 'Footer mission statement', type: 'text', rows: 3, group: 'copy'}),
    defineField({name: 'newsletterHeading', title: 'Newsletter band heading', type: 'text', rows: 2, group: 'copy', description: 'The sign-up band above the footer.'}),
    defineField({name: 'popupHeading', title: 'Pop-up heading', type: 'string', group: 'copy'}),
    defineField({name: 'popupText', title: 'Pop-up text', type: 'text', rows: 2, group: 'copy'}),
    defineField({name: 'email', title: 'General email', type: 'string', group: 'contact', validation: (r) => r.required().email()}),
    defineField({name: 'pitchesEmail', title: 'Story pitches email', type: 'string', group: 'contact', validation: (r) => r.email()}),
    defineField({name: 'partnersEmail', title: 'Advertising email', type: 'string', group: 'contact', validation: (r) => r.email()}),
    defineField({name: 'careersEmail', title: 'Careers email', type: 'string', group: 'contact', validation: (r) => r.email()}),
    defineField({name: 'address', title: 'Office address', type: 'string', group: 'contact'}),
    defineField({name: 'hours', title: 'Office hours', type: 'string', group: 'contact'}),
    defineField({
      name: 'social',
      title: 'Social profiles',
      type: 'object',
      group: 'social',
      description: 'Full profile links. Networks left empty are hidden on the site.',
      fields: ['instagram', 'x', 'tiktok', 'youtube', 'facebook'].map((n) =>
        defineField({name: n, title: n === 'x' ? 'X' : n[0].toUpperCase() + n.slice(1), type: 'url'}),
      ),
    }),
    defineField({
      name: 'delivery',
      title: 'Delivery options',
      type: 'array',
      group: 'shop',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'deliveryOption',
          fields: [
            defineField({name: 'code', type: 'string', description: 'A short ID, e.g. lagos', validation: (r) => r.required()}),
            defineField({name: 'label', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'price', title: 'Price (naira)', type: 'number', validation: (r) => r.required().min(0)}),
            defineField({name: 'payOnDelivery', title: 'Allow pay on delivery', type: 'boolean', initialValue: false}),
          ],
          preview: {
            select: {title: 'label', price: 'price'},
            prepare: ({title, price}) => ({title, subtitle: price ? `₦${Number(price).toLocaleString('en-NG')}` : 'Free'}),
          },
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})

export const homepage = defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'pinned',
      title: 'Slider stories',
      type: 'array',
      description: 'The stories in the big slider at the top of the homepage, in order. Two to six works best.',
      validation: (r) => r.min(1).max(6),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pinnedStory',
          fields: [
            defineField({name: 'article', type: 'reference', to: [{type: 'article'}], validation: (r) => r.required()}),
            defineField({name: 'title', title: 'Shorter headline (optional)', type: 'string'}),
            defineField({name: 'excerpt', title: 'Shorter excerpt (optional)', type: 'text', rows: 2}),
          ],
          preview: {
            select: {title: 'title', original: 'article.title', media: 'article.mainImage'},
            prepare: ({title, original, media}) => ({title: title || original, media}),
          },
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Homepage'})},
})
