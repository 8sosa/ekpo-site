import {defineConfig} from 'sanity'
import {structureTool, type StructureResolver} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes, SINGLETONS} from './schemaTypes'

const newest = [{field: 'publishedAt', direction: 'desc' as const}]

const structure: StructureResolver = (S) => {
  const single = (type: string, title: string) =>
    S.listItem().title(title).id(type).schemaType(type).child(S.document().schemaType(type).documentId(type).title(title))
  return S.list()
    .title('EKPO')
    .items([
      single('homepage', 'Homepage'),
      single('siteSettings', 'Site settings'),
      S.listItem().title('Site pages').id('sitePages').child(
        S.list().title('Site pages').items([
          single('aboutPage', 'About'),
          single('servicesPage', 'Services'),
          single('advertisePage', 'Advertise'),
          single('contactPage', 'Contact'),
          single('careersPage', 'Careers'),
          S.divider(),
          S.documentTypeListItem('page').title('Privacy, terms and other text pages'),
        ]),
      ),
      S.divider(),
      S.listItem().title('Articles').schemaType('article').child(
        S.list().title('Articles').items([
          S.listItem().title('All articles').schemaType('article')
            .child(S.documentTypeList('article').title('All articles').defaultOrdering(newest)),
          S.listItem().title('By section').schemaType('section').child(
            S.documentTypeList('section').title('By section').defaultOrdering([{field: 'order', direction: 'asc'}])
              .child((id) => S.documentList().title('Articles').schemaType('article')
                .filter('_type == "article" && section._ref == $id').params({id}).defaultOrdering(newest)),
          ),
          S.listItem().title('By writer').schemaType('writer').child(
            S.documentTypeList('writer').title('By writer')
              .child((id) => S.documentList().title('Articles').schemaType('article')
                .filter('_type == "article" && writer._ref == $id').params({id}).defaultOrdering(newest)),
          ),
        ]),
      ),
      S.documentTypeListItem('section').title('Sections'),
      S.documentTypeListItem('topic').title('Topics'),
      S.documentTypeListItem('writer').title('Writers'),
      S.divider(),
      S.documentTypeListItem('video').title('Videos'),
      S.documentTypeListItem('product').title('Shop products'),
      S.documentTypeListItem('job').title('Jobs'),
    ])
}

export default defineConfig({
  name: 'default',
  title: 'EKPO',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'missing-project-id',
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    // Singletons can't be created from the "new document" menu
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETONS.includes(schemaType)),
  },

  document: {
    // Singletons can be published but not duplicated or deleted
    actions: (input, context) =>
      SINGLETONS.includes(context.schemaType)
        ? input.filter(({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action))
        : input,
  },
})
