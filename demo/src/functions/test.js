var peter = 1;

var lastFunctionCall = undefined;
const timeTillNextFunctionCall = 10;


function getSecondsPassed(a, b) {
  return Math.abs(a - b) / 1000
}

function canProcessFunctionCall(ttnfc) {
  console.log("canProcessFunctionCall -> ttnfc", ttnfc)
  console.log("lastFunctionCall", lastFunctionCall)
  const thisFunctionCall = Date.now();

  if(lastFunctionCall === undefined) {
    lastFunctionCall = thisFunctionCall
    console.log("canProcessFunctionCall -> lastFunctionCall", lastFunctionCall)
    return true
  } else {

    const timePassed = getSecondsPassed(lastFunctionCall, thisFunctionCall);
    console.log("canProcessFunctionCall -> timePassed", timePassed)

    if(timePassed > ttnfc) {
      lastFunctionCall = thisFunctionCall
      return true
    } else {
      return false
    }
  }
}

function increment() {
  lastFunctionCall = Date.now()
}

export function handler(event, context, callback) {
  console.log("queryStringParameters", event.queryStringParameters)
  peter += 1


  let canCAll = canProcessFunctionCall(timeTillNextFunctionCall)
  console.log("handler -> canCAll", canCAll)
  // console.log("handler -> peter", peter)
  // console.log("handler -> lastFunctionCall", lastFunctionCall)
  // increment();
  // console.log("handler -> lastFunctionCall", lastFunctionCall)
  callback(null, {
    // return null to show no errors
    statusCode: 200, // http status code
    body: JSON.stringify({
      msg: "Hello, World! " + peter,
    }),
  })
}