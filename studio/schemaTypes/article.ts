import {defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'story', title: 'Story', default: true},
    {name: 'filing', title: 'Section and writer'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'story', validation: (r) => r.required().max(140)}),
    defineField({
      name: 'slug',
      title: 'URL',
      type: 'slug',
      group: 'story',
      description: 'The last part of the web address. Click Generate to make it from the title.',
      options: {source: 'title', maxLength: 60},
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'story',
      description: 'One or two sentences. Shown on cards, under the headline and in link previews.',
      validation: (r) => r.required().max(300),
    }),
    defineField({
      name: 'mainImage',
      title: 'Main image',
      type: 'image',
      group: 'story',
      options: {hotspot: true},
      description: 'Until a photo is added, the site shows placeholder art.',
      fields: [defineField({name: 'alt', title: 'Alt text', type: 'string'})],
    }),
    defineField({name: 'body', type: 'blockContent', group: 'story', validation: (r) => r.required()}),
    defineField({
      name: 'section',
      type: 'reference',
      to: [{type: 'section'}],
      group: 'filing',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'topic',
      type: 'reference',
      to: [{type: 'topic'}],
      group: 'filing',
      description: 'Choose the section first; topics are filtered to match it.',
      options: {
        disableNew: true,
        filter: ({document}) => {
          const ref = (document.section as {_ref?: string} | undefined)?._ref
          return ref ? {filter: 'section._ref == $s', params: {s: ref}} : {filter: 'false'}
        },
      },
      validation: (r) =>
        r.required().custom(async (value, context) => {
          const section = (context.document?.section as {_ref?: string} | undefined)?._ref
          if (!value?._ref || !section) return true
          const client = context.getClient({apiVersion: '2025-01-01'})
          const topicSection = await client.fetch('*[_id == $id][0].section._ref', {id: value._ref})
          return topicSection === section || 'This topic belongs to a different section.'
        }),
    }),
    defineField({name: 'writer', type: 'reference', to: [{type: 'writer'}], group: 'filing', validation: (r) => r.required()}),
    defineField({
      name: 'publishedAt',
      title: 'Publish date',
      type: 'date',
      group: 'filing',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required(),
    }),
  ],
  orderings: [{title: 'Newest first', name: 'newest', by: [{field: 'publishedAt', direction: 'desc'}]}],
  preview: {
    select: {title: 'title', writer: 'writer.name', section: 'section.name', date: 'publishedAt', media: 'mainImage'},
    prepare: ({title, writer, section, date, media}) => ({
      title,
      subtitle: [section, writer, date].filter(Boolean).join(' · '),
      media,
    }),
  },
})
