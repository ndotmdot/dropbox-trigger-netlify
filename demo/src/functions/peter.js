require('dotenv').config({ path: '.env' });
const dropboxTriggerNetlify = require('dropbox-trigger-netlify')

export function handler(event, context, callback) {
  const dbxWebHookChallenge = event.queryStringParameters.challenge

  // dropboxTriggerNetlify.handleEvent(event, {
  //   dropboxToken: process.env.DROPBOX_TOKEN,
  //   dropboxBuildFolder: process.env.DROPBOX_BUILD_FOLDER,
  //   buildHook: process.env.MOCK_BUILD_HOOK,
  // })
  
  callback(null, {
    // return null to show no errors
    statusCode: 200, // http status code
    body: dbxWebHookChallenge,
  })
}