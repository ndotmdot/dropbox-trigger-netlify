# Dropbox Trigger Netlify
[![npm version](https://badge.fury.io/js/dropbox-trigger-netlify.svg)](https://badge.fury.io/js/dropbox-trigger-netlify)

This is a companion package for [gatsby-source-dropbox](https://www.npmjs.com/package/gatsby-source-dropbox) and enables automatic deploys of a Netlify hosted Gatsby site whenever there are files changes in a specific Dropbox folder.

This module is also implemented in [gatsby-starter-dropbox-workflow](https://github.com/niklas-may/gatsby-starter-dropbox-workflow/)


---

## How it works

**1. It watches your dropbox folder**
It expects your Dropbox app to have the following folder structure:

```markdown
+-- Your Dropbox App Root Name
|   +-- _Update
|   +-- Content
|   |   +--Whatever Files you need.md
|   |   +--Whatever Folders you need
```

Whenever you drop the *Content* folder into the  *_Update* folder the module will trigger a new deploy on Netlify. Make sure to do this only when the files in *Content* are uploaded to your Dropbox.

**2. It notifies your once the build is done**
When Netlify finished building your site, the module will move the *Content* folder back to the root level. Whenever this happens, you know that your site was updated

---

## Installation
The get the webhooks working, it is important to do the installation in the correct order.

**1. Prepare your Gatsby site**
Add [gatsby-source-dropbox](https://www.npmjs.com/package/gatsby-source-dropbox) to your Gatsby site.

**2. Setup Netlify Functions**
[Setup guide](https://www.gatsbyjs.org/blog/2018-12-17-turning-the-static-dynamic/).

**3. Install module in functions folder**
`yarn add dropbox-trigger-netlify` 
or
`npm install dropbox-trigger-netlify`

*Note:* Modules used in a Netlify Function need to be installed in the `src/functions` folder.

**4. Create function**
Create a new function called `syncDropbox.js` and add the following code:

```javaScript
const dropboxTriggerNetlify = require('dropbox-trigger-netlify')

exports.handler = async (event) => {
  try {

    const response = await dropboxTriggerNetlify.handleEvent(event, {
      dropboxToken: process.env.DROPBOX_TOKEN,
      buildHook: process.env.BUILD_HOOK,
    })

    return {
      statusCode: 200,
      body: response
    }
  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
```

**5. Create Dropbox App**
Go to [Dropbox App Console](https://www.dropbox.com/developers/apps/create) and create a new app, choose your account type, only folder permission (recommended), choose a name and hit create.

**6. Generate and Save Dropbox Token**
Scroll on app page to "OAuth 2" and click "Generate Token". Copy and save token to `.env` file in your projects root directory.
```
DROPBOX_TOKEN=Your-Dropbox-Token
```

**7. Deploy Site to Netlify**

**8. Create a new Netlify Build Hook**
Go to your Netlify project to `settings/deploys#build-hooks` and add a new hook

**9. Save Build Hook to `.env` file**
```
DROPBOX_TOKEN=Your-Dropbox-Token
NETLIFY_BUILD_HOOK=Your-Hook-You-Just-Added
```

**10. Create Netlify Deploy Notifications**
Got to your Netlify project to `settings/deploys#deploy-notifications` and add an outgoing webhook for succeeded and failed builds pointing to `[you-site-url]/.netlify/functions/syncDropbox`

**11. Add Environment Variables to Netlify**
Add the environment variables from your `.env` file to netlify at settings/deploys#environment-variables

**12. Add Webhook to Dropbox App**
Go to [Dropbox App Console](https://www.dropbox.com/developers/apps) to you app and add a webhook pointing to you `NETLIFY_BUILD_HOOK`



