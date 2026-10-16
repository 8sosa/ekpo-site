import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // After the first `npm run deploy`, add the appId it prints to
  // deployment below so later deploys go to the same Studio URL.
  deployment: {
    autoUpdates: true,
    appId: 'b1qsswgny0ux290fphzl7dwp'
  },
})
