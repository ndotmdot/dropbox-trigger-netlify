const { createProxyMiddleware } = require("http-proxy-middleware")
require('dotenv').config({ path: '.env' });


module.exports = {
  developMiddleware: app => {
    app.use(
      "/.netlify/functions/",
      createProxyMiddleware({
        target: "http://localhost:9000",
        secure: false, // Do not reject self-signed certificates.
        pathRewrite: {
          "/.netlify/functions/": "",
        },
      })
    )
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    // {
    //   resolve: `gatsby-source-dropbox`,
    //   options: {
    //     accessToken: process.env.DROPBOX_TOKEN,
    //   },
    // },
    `gatsby-transformer-remark`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
  ],
}


`dropbox-trigger-netlify`
