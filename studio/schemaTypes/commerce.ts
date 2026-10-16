import {defineField, defineType} from 'sanity'
import {PlayIcon} from '@sanity/icons/Play'
import {BasketIcon} from '@sanity/icons/Basket'
import {CaseIcon} from '@sanity/icons/Case'
import {DocumentIcon} from '@sanity/icons/Document'

export const video = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'URL', type: 'slug', options: {source: 'title', maxLength: 60}, validation: (r) => r.required()}),
    defineField({
      name: 'category',
      type: 'string',
      options: {list: ['Studio visits', 'Fashion films', 'Live sessions', 'Behind the scenes', 'Food']},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'youtubeId',
      title: 'YouTube video ID',
      type: 'string',
      description: 'The part after "v=" in a YouTube link, e.g. dQw4w9WgXcQ. Leave empty if you use a video file instead.',
    }),
    defineField({name: 'videoUrl', title: 'Video file URL (.mp4)', type: 'url'}),
    defineField({
      name: 'duration',
      type: 'string',
      description: 'Minutes:seconds, e.g. 04:12',
      validation: (r) => r.regex(/^\d{1,3}:\d{2}$/, {name: 'mm:ss'}),
    }),
    defineField({name: 'publishedAt', title: 'Publish date', type: 'date', validation: (r) => r.required()}),
    defineField({name: 'description', type: 'text', rows: 3}),
    defineField({name: 'thumbnail', type: 'image', options: {hotspot: true}}),
    defineField({name: 'relatedArticle', title: 'Related story', type: 'reference', to: [{type: 'article'}]}),
  ],
  orderings: [{title: 'Newest first', name: 'newest', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {select: {title: 'title', subtitle: 'category', media: 'thumbnail'}},
})

export const product = defineType({
  name: 'product',
  title: 'Product',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'URL', type: 'slug', options: {source: 'name', maxLength: 60}, validation: (r) => r.required()}),
    defineField({
      name: 'category',
      type: 'string',
      options: {list: ['Print', 'Apparel', 'Accessories', 'Tickets']},
      validation: (r) => r.required(),
    }),
    defineField({name: 'price', title: 'Price (naira)', type: 'number', validation: (r) => r.required().min(0).integer()}),
    defineField({name: 'image', type: 'image', options: {hotspot: true}}),
    defineField({name: 'description', type: 'text', rows: 4, validation: (r) => r.required()}),
    defineField({name: 'details', type: 'array', of: [{type: 'string'}], description: 'Short facts, one per line: material, size, shipping.'}),
    defineField({name: 'optionLabel', title: 'Option name', type: 'string', description: 'e.g. Size or Day. Leave empty if there are no options.'}),
    defineField({name: 'optionValues', title: 'Option choices', type: 'array', of: [{type: 'string'}], hidden: ({document}) => !document?.optionLabel}),
    defineField({
      name: 'digital',
      title: 'Emailed, not shipped',
      type: 'boolean',
      initialValue: false,
      description: 'Turn on for tickets. Orders with only emailed items skip the delivery address.',
    }),
    defineField({name: 'available', title: 'In stock', type: 'boolean', initialValue: true}),
    defineField({name: 'relatedArticle', title: 'Related story', type: 'reference', to: [{type: 'article'}]}),
    defineField({name: 'order', title: 'Order in shop', type: 'number'}),
  ],
  preview: {
    select: {title: 'name', price: 'price', category: 'category', media: 'image', available: 'available'},
    prepare: ({title, price, category, media, available}) => ({
      title,
      subtitle: `${category} · ₦${Number(price || 0).toLocaleString('en-NG')}${available === false ? ' · out of stock' : ''}`,
      media,
    }),
  },
})

export const job = defineType({
  name: 'job',
  title: 'Job',
  type: 'document',
  icon: CaseIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'URL', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'type', title: 'Contract type', type: 'string', description: 'e.g. Full-time'}),
    defineField({name: 'location', type: 'string', description: 'e.g. Lagos (hybrid)'}),
    defineField({name: 'summary', type: 'text', rows: 2}),
    defineField({name: 'duties', title: 'What you will do', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'needs', title: 'What we are looking for', type: 'array', of: [{type: 'string'}]}),
    defineField({name: 'open', title: 'Accepting applications', type: 'boolean', initialValue: true}),
    defineField({name: 'order', type: 'number'}),
  ],
  preview: {
    select: {title: 'title', type: 'type', open: 'open'},
    prepare: ({title, type, open}) => ({title, subtitle: `${type || ''}${open === false ? ' · closed' : ''}`}),
  },
})

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  description: 'Simple text pages such as the privacy policy and terms of use.',
  fields: [
    defineField({name: 'title', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'URL', type: 'slug', options: {source: 'title'}, validation: (r) => r.required()}),
    defineField({name: 'intro', type: 'string'}),
    defineField({name: 'updatedAt', title: 'Last updated', type: 'date'}),
    defineField({name: 'body', type: 'blockContent'}),
  ],
})
