const Dropbox = require("dropbox/dist/Dropbox-sdk.min").Dropbox;
const fetch = require('isomorphic-fetch'); // or another library of choice.


const defaultConfig = {
  dropboxToken: "",
  dropboxBuildFolder: "/_Update",
  buildHook: "",
}

let config = {}

// Netlify Functions
// ————————————————————————————————————————————————————

async function callBuildHook() {
  console.info("### Calling netlify buildhook")

  const res = await fetch(`${config.buildHook}`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
  })

  console.info(`### Buildhook response Status: ${res.status}, ${res.statusText}`)
}

async function getBuildStatus() {
  const url = `https://api.netlify.com/api/v1/sites/${process.env.SITE_ID}/deploys`
  const deploys = await fetch(url).then(res => res.json()).then(data => data.shift())
  const { state, published_at } = deploys
  
  const publishTime = new Date(published_at)
  const currentTime = new Date();
  const minutesPassed = Math.round((currentTime - publishTime) / 1000) / 60
  
  console.info("### Checking build state... ")
  console.info(" ## Current state: ", state)

  if(published_at !== null) {
    console.info(" ## Current time: ", currentTime)
    console.info(" ## Last publish: ", publishTime)
    console.info(" ## Minutes since last publish: ", minutesPassed)
  }
  

  return state === "ready" && minutesPassed > 1 && true
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
  
  console.info("### Files in build folder? ", hasFiles)
  
  if(hasFiles) {
    await callBuildHook()
  } else {
    return console.info("### aborting...")
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
      console.info("Moving files: ", response)
    } while (response['.tag'] === 'in_progress')  
    return response
  }  
}

// General Functions
// ————————————————————————————————————————————————————

async function cleanUp() {

  var dbx = new Dropbox({ accessToken: `${config.dropboxToken}`, fetch: fetch });

  const files = await listFiles(dbx, `${config.dropboxBuildFolder}`)
  const hasFiles = files.entries.length > 0 && true

  if(hasFiles) {
    const moveEntries = createMoveEntries(files)
    await moveFiles(dbx, moveEntries)
  } else {
    console.info("### No files to cleanup")
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
  config = {...defaultConfig, ...userConfig}

  const caller = getCaller(event)
  console.info("### Call from: ", caller)

  const canBuild = await getBuildStatus()
  console.info("handleEvent -> canBuild", canBuild)

  if(caller === `dropbox`) {
    const dbxWebHookChallenge = event.queryStringParameters.challenge

    if(canBuild) {
      // buildInProgress = true
      await attemptBuild()
      return dbxWebHookChallenge
    } else {
      console.info("### Build already in progress. Aborting...")
      return dbxWebHookChallenge
    }

    // if(canBuild) {
    //   console.info("### Build already in progress. Aborting...")
    //   return dbxWebHookChallenge
    // } else {
    //   // buildInProgress = true
    //   await attemptBuild()
    //   return dbxWebHookChallenge
    // }
  } 

  if(caller === `netlify`) {
    console.info("### Starting Cleanup...")
    await cleanUp()
    return "Cleanup done"
  }
}
