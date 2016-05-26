var restify = require('restify');
var builder = require('botbuilder');

var myAppId = process.env.MY_APP_ID || "Missing your app ID";
var myAppSecret = process.env.MY_APP_SECRET || "Missing your app secret"; 

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: myAppId, appSecret: myAppSecret });
bot.add('/', function (session) {
    session.send('Hello World');
});

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});