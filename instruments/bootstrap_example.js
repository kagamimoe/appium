#import "helpers/console.js"
#import "helpers/curl.js"

// automation globals
var target      = UIATarget.localTarget();
var application = target.frontMostApp();
var host = target.host();
var mainWindow  = application.mainWindow();
var elements = {};

var endpoint = 'http://localhost:4723/instruments/';

function delay(secs)
{
    var date = new Date();
    var curDate = null;

    do { curDate = new Date(); }
    while(curDate-date < (secs * 1000.0));
}

doCurl('POST', endpoint + 'ready');

var runLoop = true;
target.setTimeout(1);

var getNextCommand = function() {
  var res = doCurl('GET', endpoint + 'next_command');
  if (res.status === 200) {
    var val = res.value;
    console.log("Result of get command is " + val);
    sepIndex = val.indexOf('|');
    commandId = val.substr(0, sepIndex);
    command = val.substr(sepIndex + 1);
    return {commandId: commandId, command: command};
  } else {
    console.log("There is no command to parse, or an error occurred");
    return null;
  }
};

var sendCommandResult = function(commandId, result) {
  var url = 'send_result/'+commandId;
  var res = doCurl('POST', endpoint + url, {result: result});
  res = JSON.parse(res.value);
  if (res.error) {
    console.log("Error: " + res.error);
  }
};

while(runLoop) {
  var cmd = getNextCommand();
  if (cmd) {
    console.log("Executing command " + cmd.commandId + ": " + cmd.command);
    var result = eval(cmd.command);
    if (typeof result === "undefined") {
      result = false;
    }
    console.log(cmd.commandId+": "+result);
    sendCommandResult(cmd.commandId, result);
  }
  delay(1);
}