# dropbox-trigger-netlify
[![npm version](https://badge.fury.io/js/dropbox-trigger-netlify.svg)](https://badge.fury.io/js/dropbox-trigger-netlify)

This is a companion package for [gatsby-source-dropbox](https://www.npmjs.com/package/gatsby-source-dropbox) and enables automatic deploys of a Netlify hosted Gatsby site whenever there are files changes in a specific Dropbox folder.

## Requirements

Please make sure you have the following setup:
* [Gatsby](https://www.gatsbyjs.org/) app
* Hosted on [netlify](https://www.netlify.com/)
* [gatsby-source-dropbox](https://www.npmjs.com/package/gatsby-source-dropbox) installed

## How it works

The package needs to be applied in a Netlify function in your Gatsby app. It will then listens to webhooks from your dropbox app and from your Netlify project.

**1. The Module will watch your dropbox app folder for changes**
It expects your Dropbox app to have the following folder structure:

```markdown
+-- Dropbox App Root
|   +-- _Update
|   +-- Content
|   |   +--Whatever Files you need.md
|   |   +--Whatever Folders you need
```

Whenever you drop the *Content* folder into the  *_Update* folder the module will trigger a new deploy on Netlify. Make sure to this only once the files in *Content* are all synced to Dropbox.

**2. The module will move the files back**
When Netlify finished building your site, the module will move the *Content* folder back to the root level. Whenever this happens, you know that your site was updated

## Installation
The get the webhooks working, it is important to do the installation in the correct order.

**1. Prepare your Gatsby site** 
Create a new Dropbox App and install [gatsby-source-dropbox](https://www.npmjs.com/package/gatsby-source-dropbox) plugin to your site. Find a detailed description on the plugin page. Make sure that you can query your Dropbox before you proceed.

**2. Setup Netlify Functions**
To use this module, you need to setup Netlify Functions in your Gatsby site. If you need help, follow this [tutorial](https://www.gatsbyjs.org/blog/2018-12-17-turning-the-static-dynamic/).

**3. Install the module in the functions folder**
`yarn add dropbox-trigger-netlify` or `npm install dropbox-trigger-netlify`
*Note:* Modules used in a Netlify Function need to be installed in the `src/functions` folder.

**4. Create a new Function**
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

**6. Add environment Variables**
Add the following variables to your .env file

```text
DROPBOX_TOKEN=[Your_Dropbox_Token]
NETLIFY_BUILD_HOOK=[Your_Site_URL]/.netlify/functions/syncDropbox
```

**7. Deploy site to Netlify**
If you want to change your URL, do it as soon as possible since this will have an effect on the Dropbox webhook.

**8. Add Environment Variables to Netlify**
Add the same variables as you have done locally on Netlify under Settings > Build > Environment Variables 



