
// require('dotenv').config({ path: '.env' });
// var fetch = require('isomorphic-fetch'); // or another library of choice.
// const Dropbox = require("dropbox/dist/Dropbox-sdk.min").Dropbox;

// // const buildHook = process.env.NODE_ENV == "development" ? process.env.MOCK_BUILD_HOOK : process.env.NETLIFY_BUILD_HOOK
// const buildHook = process.env.NETLIFY_BUILD_HOOK

// var lastFunctionCall = undefined;
// const timeTillNextFunctionCall = 10;


// function getSecondsPassed(a, b) {
//   return Math.abs(a - b) / 1000
// }

// async function createLockFolder(dbx, path) {
//   const response = await dbx.filesCreateFolderV2({ path })
//   return response
// }


// function canProcessFunctionCall(ttnfc) {
//   console.log("lastFunctionCall", lastFunctionCall)
//   const thisFunctionCall = Date.now();
//   console.log("canProcessFunctionCall -> thisFunctionCall", thisFunctionCall)

//   if(lastFunctionCall === undefined) {
//     lastFunctionCall = thisFunctionCall
//     return true
//   } else {

//     const timePassed = getSecondsPassed(lastFunctionCall, thisFunctionCall);
//     console.log("canProcessFunctionCall -> timePassed", timePassed)

//     if(timePassed > ttnfc) {
//       lastFunctionCall = thisFunctionCall
//       return true
//     } else {
//       return false
//     }
//   }
// }

// async function listFiles(dbx, path) {
//   const files = await dbx.filesListFolder({ path })
//   return files
// }

// async function callBuildHook() {
//   console.log("callling buildhook")
//   try {
//     await fetch(`${buildHook}`, {
//       method: 'post',
//       body:    JSON.stringify({}),
//       headers: { 'Content-Type': 'application/json' },
//   });
//     return {msg: "Build hook called"}
//   } catch (error) {
//     return {error: "Cant't call Build hook"}
//   }
// }

// function checkCanCallBuildHook(files) {
//   const hasFiles = files.entries.length > 0 && true  
//   const hasLockFolder = files.entries.find(file => file.name === "_Build_Lock") ? true : false

//   return hasFiles && !hasLockFolder
// }

// async function handleDropboxUpdate(dbx, path) {
//   const files = await listFiles(dbx, path)

//   const canCallBuildHook = checkCanCallBuildHook(files)
//   console.log("CAN BUILD? ", canCallBuildHook)

//   if(canCallBuildHook) {
//     const hookResponse = await callBuildHook()
//     return hookResponse
//   }
//   return {DropboxStatus: "No files in update folder. No need to trigger buildhook"}
// }

// export async function handler(event, context, callback) {

//   const dbxWebHookChallenge = event.queryStringParameters.challenge
//   var dbx = new Dropbox({ accessToken: `${process.env.DROPBOX_TOKEN}`, fetch: fetch });

//   const canCall = canProcessFunctionCall(timeTillNextFunctionCall)
//   console.log("canCall", canCall)
//   if(canCall) {
//       await handleDropboxUpdate(dbx, `${process.env.DROPBOX_BUILD_FOLDER}`)
//   }

//   callback(null, {
//     // return null to show no errors
//     statusCode: 200, // http status code
//     body: JSON.stringify({
//       msg: dbxWebHookChallenge
//     }),
//   })
// }

// // Dropbox Hook
// // 
// // handler -> event {
// //   path: '/checkDropbox',
// //   httpMethod: 'POST',
// //   queryStringParameters: [Object: null prototype] {},
// //   headers: {
// //     host: 'callbuildhook.ngrok.io',
// //     'user-agent': 'DropboxWebhooks/1.0',
// //     accept: '*/*',
// //     'accept-encoding': 'gzip,deflate',
// //     'x-dropbox-signature': 'a3a196266519e9924a7577b09344826aff1fdeab7c3303512cdec60128416a3f',
// //     'content-type': 'application/json',
// //     'content-length': '105',
// //     'x-forwarded-proto': 'https',
// //     'x-forwarded-for': '162.125.16.235'
// //   },
// //   body: '{"list_folder": {"accounts": ["dbid:AACjRzKi5cD0wVKK2FBdAohZg2z51kVOrEg"]}, "delta": {"users": [602793]}}',
// //   isBase64Encoded: false
// // }


// // Netlify Hook
// // 
// // handler -> event {
// //   path: '/.netlify/functions/moveDropboxFiles',
// //   httpMethod: 'POST',
// //   headers: {
// //     'client-ip': '34.71.8.243',
// //     connection: 'keep-alive',
// //     'content-length': '4015',
// //     'content-type': 'application/json',
// //     via: 'http/1.1 Netlify[135e767d-f08c-4daa-864b-911ab9fe5507] (ApacheTrafficServer/7.1.10)',
// //     'x-bb-ab': '0.130440',
// //     'x-bb-client-request-uuid': '135e767d-f08c-4daa-864b-911ab9fe5507-13105950',
// //     'x-bb-ip': '34.71.8.243',
// //     'x-bb-loop': '1',
// //     'x-cdn-domain': 'www.bitballoon.com',
// //     'x-country': 'US',
// //     'x-datadog-parent-id': '7498981638078819039',
// //     'x-datadog-sampling-priority': '1',
// //     'x-datadog-trace-id': '1860630503035390117',
// //     'x-forwarded-for': '34.71.8.243',
// //     'x-netlify-event': 'deploy_created',
// //     'x-nf-client-connection-ip': '34.71.8.243'
// //   },
// //   queryStringParameters: {},
// //   body: '{
// //          "id":"5eb80bb4dfd2a0d9d6e252a7",
//         // "site_id":"3cf4afde-4b7e-425b-abca-20b6de7d05df",
//         // "build_id":"5eb80bb4dfd2a0d9d6e252a5",
//         // "state":"ready",
//         // "name":"gatsby-starter-dropbox",
//         // "url":"http://gatsby-starter-dropbox.netlify.app",
//         // "ssl_url":"https://gatsby-starter-dropbox.netlify.app",
//         // "admin_url":"https://app.netlify.com/sites/gatsby-starter-dropbox",
//         // "deploy_url":"http://master--gatsby-starter-dropbox.netlify.app",
//         // "deploy_ssl_url":"https://master--gatsby-starter-dropbox.netlify.app",
//         // "created_at":"2020-05-10T14:12:04.766Z",
//         // "updated_at":"2020-05-10T14:13:22.572Z",
//         // "user_id":"5c911bda5fa91329417dc856",
//         // "error_message":null,
//         // "required":[],
//         // "required_functions":[],
//         // "commit_ref":null,
//         // "review_id":null,
//         // "branch":"master",
//         // "commit_url":null,
//         // "skipped":null,
//         // "locked":null,
//         // "log_access_attributes":{"type":"firebase",
//         // "url":"https://netlify-builds3.firebaseio.com/builds/5eb80bb4dfd2a0d9d6e252a5/log",
//         // "endpoint":"https://netlify-builds3.firebaseio.com",
//         // "path":"/builds/5eb80bb4dfd2a0d9d6e252a5/log",
//         // "token":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJpYXQiOjE1ODkxMjAwMDIsImQiOnsidWlkIjoiIn19.speyLqOiltjyW9wkY7SF4Z9IQVOxh9jJl0-srv9J7AY"},
//         // "title":"Deploy triggered by hook: buildMaster",
//         // "review_url":null,
//         // "published_at":"2020-05-10T14:13:22.478Z",
//         // "context":"production",
//         // "deploy_time":75,
//         // "available_functions":[{"n":"checkDropbox",
//         // "d":"08380cd1b29ce36f426d740b514f0e1bfb56eeb8bbfde868135009613340e9d1",
//         // "id":"17238e8955751b27573f0696dd36937c276d1ae74db2e92a363bae230b070f2e",
//         // "a":"837451400009",
//         // "c":"2020-05-10T14:08:56.444Z",
//         // "r":"nodejs12.x",
//         // "s":206768},
//         // {"n":"folderState",
//         // "d":"dc9f03ea92936d14a8d19f04285a60762086c768416c723471904ca82487c18e",
//         // "id":"1d764f443d8caa638530c5b30c7ad965bdc87906183dc5ed7c8325674332eed5",
//         // "s":205703,
//         // "r":"nodejs12.x",
//         // "c":"2020-05-10T09:20:28.102Z",
//         // "a":"063203110416"},
//         // {"n":"mockBuildHook",
//         // "d":"866a0a55b54918c23f8f3206557aa2ce2cb915ee20b3f3d0ef6b3a1b87b70405",
//         // "id":"b2e9f4cf6c524826e6c5b147ad02b203bfb1b5ac3206601cde1d664ad578fbcf",
//         // "a":"012533533302",
//         // "c":"2020-05-10T14:08:56.119Z",
//         // "r":"nodejs12.x",
//         // "s":2953},
//         // {"n":"moveDropboxFiles",
//         // "d":"3ddceb5983ac957a03b40bc0e398eda36fcd85de51cbbbd06f4151fbe42f7d08",
//         // "id":"465798372bcc13d5284a93d39ef50bd3c16bacf08a23f41705bf503b9c494d12",
//         // "a":"272797940975",
//         // "c":"2020-05-10T14:08:56.015Z",
//         // "r":"nodejs12.x",
//         // "s":206170},
//         // {"n":"test",
//         // "d":"92a14e82543a389c760307181fa5ba3a3abfeb17dc3040d33f71542491705403",
//         // "id":"338c44c4d1279b5c3fb38aaf3d03d3d2b9f8d2143866ba25a31384660569a77b",
//         // "s":1715,
//         // "r":"nodejs12.x",
//         // "c":"2020-05-09T20:02:38.232Z",
//         // "a":"849272951165"}],
//         // "summary":{"status":"ready",
//         // "messages":[{"type":"info",
//         // "title":"All files already uploaded",
//         // "description":"All files already uploaded by a previous deploy with the same commits.",
//         // "details":null},
//         // {"type":"info",
//         // "title":"No redirect rules processed",
//         // "description":"This deploy did not include any redirect rules. [Learn more about redirects](https://www.netlify.com/docs/redirects/).",
//         // "details":""},
//         // {"type":"info",
//         // "title":"No header rules processed",
//         // "description":"This deploy did not include any header rules. [Learn more about headers](https://www.netlify.com/docs/headers-and-basic-auth/).",
//         // "details":""},
//         // {"type":"info",
//         // "title":"All linked resources are secure",
//         // "description":"Congratulations! No insecure mixed content found in your files.",
//         // "details":null}]},
//         // "screenshot_url":null,
//         // "site_capabilities":{"title":"Netlify Team Free",
//         // "asset_acceleration":true,
//         // "form_processing":true,
//         // "cdn_propagation":"partial",
//         // "build_gc_exchange":"buildbot-gc",
//         // "build_node_pool":"buildbot-external-ssd",
//         // "domain_aliases":true,
//         // "secure_site":false,
//         // "prerendering":true,
//         // "proxying":true,
//         // "ssl":"custom",
//         // "rate_cents":0,
//         // "yearly_rate_cents":0,
//         // "cdn_network":"free_cdn_network",
//         // "ipv6_domain":"cdn.makerloop.com",
//         // "branch_deploy":true,
//         // "managed_dns":true,
//         // "geo_ip":true,
//         // "split_testing":true,
//         // "id":"nf_team_dev",
//         // "cdn_tier":"reg",
//         // "functions":{"invocations":{"included":125000,
//         // "unit":"requests",
//         // "used":850},
//         // "runtime":{"included":360000,
//         // "unit":"seconds",
//         // "used":418}}},
//         // "committer":null,
//         // "skipped_log":null,
//         // "manual_deploy":false,
//         // "file_tracking_optimization":true}',
//         // 
// //   isBase64Encoded: false
// // }



