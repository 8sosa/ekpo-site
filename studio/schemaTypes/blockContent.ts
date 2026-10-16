import {defineArrayMember, defineField, defineType} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'
import {ImageIcon} from '@sanity/icons/Image'

/** Rich text used for article bodies and simple pages. */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Body',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Paragraph', value: 'normal'},
        {title: 'Heading', value: 'h2'},
        {title: 'Subheading', value: 'h3'},
      ],
      lists: [
        {title: 'Bullets', value: 'bullet'},
        {title: 'Numbered', value: 'number'},
      ],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (r) => r.uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']}),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      name: 'pullQuote',
      title: 'Pull quote',
      type: 'object',
      icon: BlockquoteIcon,
      fields: [
        defineField({name: 'quote', type: 'text', rows: 3, validation: (r) => r.required()}),
        defineField({name: 'cite', title: 'Who said it', type: 'string', description: 'Name, role'}),
      ],
      preview: {select: {title: 'quote', subtitle: 'cite'}},
    }),
    defineArrayMember({
      name: 'figure',
      title: 'Image',
      type: 'object',
      icon: ImageIcon,
      fields: [
        defineField({name: 'image', type: 'image', options: {hotspot: true}}),
        defineField({name: 'alt', title: 'Alt text', type: 'string', description: 'Describe the image for people using screen readers.'}),
        defineField({name: 'caption', type: 'string'}),
      ],
      preview: {
        select: {media: 'image', title: 'caption'},
        prepare: ({media, title}) => ({media, title: title || 'Image', subtitle: media ? undefined : 'No photo yet: shows placeholder art'}),
      },
    }),
  ],
})
