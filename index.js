"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handleEvent = handleEvent;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const Dropbox = require("dropbox/dist/Dropbox-sdk.min").Dropbox;

const fetch = require('isomorphic-fetch'); // or another library of choice.


let buildInProgress = false;
const defaultConfig = {
  dropboxToken: "",
  dropboxBuildFolder: "/_Update",
  buildHook: ""
};
let config = {}; // Netlify Functions
// ————————————————————————————————————————————————————

function callBuildHook() {
  return _callBuildHook.apply(this, arguments);
} // Dropbox Functions
// ————————————————————————————————————————————————————


function _callBuildHook() {
  _callBuildHook = _asyncToGenerator(function* () {
    console.log("### Calling netlify buildhook");
    yield fetch(`${config.buildHook}`, {
      method: 'post',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json'
      }
    });
  });
  return _callBuildHook.apply(this, arguments);
}

function listFiles(_x, _x2) {
  return _listFiles.apply(this, arguments);
}

function _listFiles() {
  _listFiles = _asyncToGenerator(function* (dbx, path) {
    const files = yield dbx.filesListFolder({
      path
    });
    return files;
  });
  return _listFiles.apply(this, arguments);
}

function attemptBuild() {
  return _attemptBuild.apply(this, arguments);
}

function _attemptBuild() {
  _attemptBuild = _asyncToGenerator(function* () {
    var dbx = new Dropbox({
      accessToken: `${config.dropboxToken}`,
      fetch: fetch
    });
    const files = yield listFiles(dbx, `${config.dropboxBuildFolder}`);
    const hasFiles = files.entries.length > 0 && true;
    console.log("### Files in build folder? ", hasFiles);

    if (hasFiles) {
      callBuildHook();
    } else {
      buildInProgress = false;
      console.log("### aborting...");
    }
  });
  return _attemptBuild.apply(this, arguments);
}

function createMoveEntries(files) {
  return files.entries.map(file => {
    return {
      from_path: file.path_display,
      to_path: file.path_display.substring(file.path_display.lastIndexOf('/'), file.path_display.length)
    };
  });
}

function moveFiles(_x3, _x4) {
  return _moveFiles.apply(this, arguments);
} // General Functions
// ————————————————————————————————————————————————————


function _moveFiles() {
  _moveFiles = _asyncToGenerator(function* (dbx, entries) {
    let response = yield dbx.filesMoveBatchV2({
      entries,
      autorename: true
    });
    const _response = response,
          async_job_id = _response.async_job_id;

    if (async_job_id) {
      do {
        response = yield dbx.filesMoveBatchCheckV2({
          async_job_id
        });
        console.log("Moving files: ", response);
      } while (response['.tag'] === 'in_progress');

      return response;
    }
  });
  return _moveFiles.apply(this, arguments);
}

function cleanUp() {
  return _cleanUp.apply(this, arguments);
}

function _cleanUp() {
  _cleanUp = _asyncToGenerator(function* () {
    buildInProgress = true;
    var dbx = new Dropbox({
      accessToken: `${config.dropboxToken}`,
      fetch: fetch
    });
    const files = yield listFiles(dbx, `${config.dropboxBuildFolder}`);
    const hasFiles = files.entries.length > 0 && true;

    if (hasFiles) {
      const moveEntries = createMoveEntries(files);
      yield moveFiles(dbx, moveEntries);
      buildInProgress = false;
    } else {
      console.log("### No files to cleanup");
      buildInProgress = false;
    }
  });
  return _cleanUp.apply(this, arguments);
}

function getCaller(event) {
  const headers = event.headers;
  const isDropbox = Object.keys(headers).some(key => key.includes(`dropbox`));
  const isNetlify = Object.keys(headers).some(key => key.includes(`netlify`));
  if (isDropbox) return `dropbox`;
  if (isNetlify) return `netlify`;
}

function handleEvent(_x5, _x6) {
  return _handleEvent.apply(this, arguments);
}

function _handleEvent() {
  _handleEvent = _asyncToGenerator(function* (event, userConfig) {
    config = _objectSpread(_objectSpread({}, defaultConfig), userConfig);
    const caller = getCaller(event);
    console.log("### Call from: ", caller);

    if (caller === `dropbox`) {
      const dbxWebHookChallenge = event.queryStringParameters.challenge;

      if (buildInProgress) {
        console.log("### Build already in progress. Aborting...");
        return dbxWebHookChallenge;
      } else {
        buildInProgress = true;
        yield attemptBuild();
        return dbxWebHookChallenge;
      }
    }

    if (caller === `netlify`) {
      console.log("### Starting Cleanup...");
      yield cleanUp();
      return "Cleanup done";
    }
  });
  return _handleEvent.apply(this, arguments);
}