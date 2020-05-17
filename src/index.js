const Dropbox = require("dropbox/dist/Dropbox-sdk.min").Dropbox;
const fetch = require('isomorphic-fetch'); // or another library of choice.

let buildInProgress = false

const defaultConfig = {
  dropboxToken: "",
  dropboxBuildFolder: "/_Update",
  buildHook: "",
}

let config = {}

// Netlify Functions
// ————————————————————————————————————————————————————

async function callBuildHook() {
  console.log("### Calling netlify buildhook")

  await fetch(`${config.buildHook}`, {
    method: 'post',
    body:    JSON.stringify({}),
    headers: { 'Content-Type': 'application/json' },
  })
}


// Dropbox Functions
// ————————————————————————————————————————————————————

async function listFiles(dbx, path) {
  const files = await dbx.filesListFolder({ path })
  return files
}

async function attemptBuild() {
  var dbx = new Dropbox({ accessToken: `${config.dropboxToken}`, fetch: fetch });
  const files = await listFiles(dbx, `${config.dropboxBuildFolder}`)
  const hasFiles = files.entries.length > 0 && true
  
  console.log("### Files in build folder? ", hasFiles)
  
  if(hasFiles) {
    callBuildHook()
  } else {
    buildInProgress = false
    console.log("### aborting...")
  }
}

function createMoveEntries(files) {
  return files.entries.map(file => {
    return {
      from_path: file.path_display,  
      to_path: file.path_display.substring(file.path_display.lastIndexOf('/'), file.path_display.length) 
    }
  })
}

async function moveFiles(dbx, entries){  
  let response = await dbx.filesMoveBatchV2({
    entries, 
    autorename: true,
  })  

  const { async_job_id } = response  

  if (async_job_id) {  
    do {  
      response = await dbx.filesMoveBatchCheckV2({ async_job_id })  
      console.log("Moving files: ", response)
    } while (response['.tag'] === 'in_progress')  
    return response
  }  
}

// General Functions
// ————————————————————————————————————————————————————

async function cleanUp() {
  buildInProgress = true

  var dbx = new Dropbox({ accessToken: `${config.dropboxToken}`, fetch: fetch });

  const files = await listFiles(dbx, `${config.dropboxBuildFolder}`)
  const hasFiles = files.entries.length > 0 && true

  if(hasFiles) {
    const moveEntries = createMoveEntries(files)
    await moveFiles(dbx, moveEntries)
    buildInProgress = false
  } else {
    console.log("### No files to cleanup")
    buildInProgress = false
  }
}

function getCaller(event) {
  const { headers } = event
  const isDropbox = JSON.stringify(headers).toLowerCase().includes('dropbox')
  const isNetlify = JSON.stringify(headers).toLowerCase().includes('netlify')
  
  if(isDropbox) return `dropbox`
  if(isNetlify) return `netlify`
}

export async function handleEvent(event, userConfig) {
  console.log("handleEvent -> event", event)
  config = {...defaultConfig, ...userConfig}

  const caller = getCaller(event)
  console.log("### Call from: ", caller)

  if(caller === `dropbox`) {
    const dbxWebHookChallenge = event.queryStringParameters.challenge
    console.log("handleEvent -> dbxWebHookChallenge", dbxWebHookChallenge)

    if(buildInProgress) {
      console.log("### Build already in progress. Aborting...")
      return dbxWebHookChallenge
    } else {
      buildInProgress = true
      await attemptBuild()
      return dbxWebHookChallenge
    }
  } 

  if(caller === `netlify`) {
    console.log("### Starting Cleanup...")
    await cleanUp()
    return "Cleanup done"
  }
}
