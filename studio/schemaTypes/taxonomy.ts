import {defineField, defineType} from 'sanity'
import {FolderIcon} from '@sanity/icons/Folder'
import {TagIcon} from '@sanity/icons/Tag'
import {UserIcon} from '@sanity/icons/User'

export const section = defineType({
  name: 'section',
  title: 'Section',
  type: 'document',
  icon: FolderIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'URL', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({name: 'note', title: 'Short description', type: 'string', description: 'Shown under the section name.'}),
    defineField({
      name: 'layout',
      title: 'Homepage layout',
      type: 'string',
      initialValue: '3',
      options: {
        layout: 'radio',
        list: [
          {title: 'Lead story with three beside it', value: 'lead'},
          {title: 'Scrolling strip of tall images', value: 'strip'},
          {title: 'Three across', value: '3'},
          {title: 'Four across', value: '4'},
          {title: 'Spotlight (big colour block)', value: 'spot'},
          {title: 'Tabs by topic', value: 'tabs'},
        ],
      },
    }),
    defineField({name: 'order', title: 'Order in menus', type: 'number', validation: (r) => r.required().integer()}),
  ],
  orderings: [{title: 'Menu order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'name', subtitle: 'note'}},
})

export const topic = defineType({
  name: 'topic',
  title: 'Topic',
  type: 'document',
  icon: TagIcon,
  description: 'A sub-section, like Street style within Fashion.',
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'URL', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({name: 'section', type: 'reference', to: [{type: 'section'}], validation: (r) => r.required()}),
    defineField({name: 'order', title: 'Order within section', type: 'number', initialValue: 1}),
  ],
  preview: {select: {title: 'name', subtitle: 'section.name'}},
})

export const writer = defineType({
  name: 'writer',
  title: 'Writer',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'slug', title: 'URL', type: 'slug', options: {source: 'name'}, validation: (r) => r.required()}),
    defineField({name: 'role', type: 'string'}),
    defineField({name: 'bio', type: 'text', rows: 3}),
    defineField({name: 'photo', type: 'image', options: {hotspot: true}}),
    defineField({name: 'order', title: 'Order on About page', type: 'number'}),
  ],
  preview: {select: {title: 'name', subtitle: 'role', media: 'photo'}},
})
