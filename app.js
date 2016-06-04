 var restify = require('restify');
 var builder = require('botbuilder');

var https = require('https');
var Weather  = require('openweathermap'); 
var weatherKey = process.env.WEATHER_KEY || "Missing weather API key"; 
//var weather = new Weather(weatherKey);

var myAppId = process.env.MY_APP_ID || "Missing your app ID";
var myAppSecret = process.env.MY_APP_SECRET || "Missing your app secret"; 

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: myAppId, appSecret: myAppSecret });
// bot.add('/', new builder.SimpleDialog(function (session) { 
//      session.send('Hello World'); 
//  })); 


bot.add('/', new builder.CommandDialog()
.matches('^set location', builder.DialogAction.beginDialog('/profile'))
.matches('^quit', builder.DialogAction.endDialog())
.onDefault(function (session) 
  {
    if (!session.userData.location) {session.beginDialog('/profile'); } 
    else {session.send('Location is %s', session.userData.location); }
    session.send('Hello World');
  }));
  bot.add('/profile', [
    function (session) {
      builder.Prompts.text(session, 'Hi. Where are you?');
    },
    function (session, results) {
      session.userData.location = results.response;
      session.endDialog();
    }
  ]);

//example of Weather code:
exports.weather = function(cb) 
{
  if (this.message.names) 
  {
    var location = this.message.names[0]
    https.get("https://api.openweathermap.org/data/2.5/find?q=" + location + "&units=imperial" + "&lang=en" + "&mode=json", function(res)
	{
		console.log('statusCode: ', res.statusCode);
		console.log('headers: ', res.headers);
		res.on('data', function (d) {
			process.stdout.write(d);
		});
	}).on('error', function (e) {
		console.error(e);
	});  
  }
} 
    // {console.log(response);
    // bot.reply(message, "It's " + response.current_observation.weather + " out right now, and"
    // + ' the temperature is ' + response.current_observation.temp_f + ' degrees F. ' + 
    // ' It feels like ' + response.current_observation.feelslike_f + ' F out there.');
    // };
 
// Setup Restify Server
 var server = restify.createServer();
server.get('/', restify.serveStatic({
    directory: __dirname,
    default: '/index.html'
}));
  server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
  server.listen(process.env.port || 3000, function () {
      console.log('%s listening to %s', server.name, server.url);
  });
