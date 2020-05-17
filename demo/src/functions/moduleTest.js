require('dotenv').config({ path: '.env' });
const dropboxTriggerNetlify = require('dropbox-trigger-netlify')

export async function handler(event, context, callback) {

  const response = await dropboxTriggerNetlify.handleEvent(event, {
    dropboxToken: process.env.DROPBOX_TOKEN,
    dropboxBuildFolder: process.env.DROPBOX_BUILD_FOLDER,
    buildHook: process.env.NETLIFY_BUILD_HOOK,
  })
  
  callback(null, {
    statusCode: 200,
    body: response,
  })
}