import {blockContent} from './blockContent'
import {article} from './article'
import {section, topic, writer} from './taxonomy'
import {video, product, job, page} from './commerce'
import {siteSettings, homepage} from './singletons'
import {feature, cta, aboutPage, servicesPage, advertisePage, contactPage, careersPage} from './sitePages'

export const schemaTypes = [
  blockContent, feature, cta,
  article, section, topic, writer, video, product, job, page,
  siteSettings, homepage, aboutPage, servicesPage, advertisePage, contactPage, careersPage,
]

/** Document types that exist exactly once (fixed IDs equal to the type name). */
export const SINGLETONS = ['siteSettings', 'homepage', 'aboutPage', 'servicesPage', 'advertisePage', 'contactPage', 'careersPage']
