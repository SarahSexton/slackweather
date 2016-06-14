 var restify = require('restify');
 var builder = require('botbuilder');
 var Wunderground = require('wundergroundnode');
 var http = require('http');

//var https = require('https');
//var Weather  = require('openweathermap'); 
//var weatherKey = process.env.WEATHER_KEY || "Missing weather API key"; 

var wundergroundKey = process.env.WUNDERGROUND || "Missing wunderground API key"; 
var wunderground = new Wunderground(wundergroundKey);

var myAppId = process.env.MY_APP_ID || "Missing your app ID";
var myAppSecret = process.env.MY_APP_SECRET || "Missing your app secret"; 

////Hello World code
// var bot = new builder.BotConnectorBot({appId: myAppId, appSecret: myAppSecret });
// bot.add('/', new builder.SimpleDialog(function(session){session.send('Hello World'); })); 

//Create bot and add dialogs
 var bot = new builder.BotConnectorBot({ appId: myAppId, appSecret: myAppSecret });
 bot.add('/', new builder.CommandDialog()
     .matches('^hi', builder.DialogAction.beginDialog('/hi'))
     .matches('^weather', builder.DialogAction.beginDialog('/weather'))
     .onDefault(function (session) {
         if (!session.userData.location) { session.beginDialog('/weather'); }
         else { session.send('Hello from %s', session.userData.location + "!"); }
     }));
 bot.add('/hi', 
 [
     function (session, results) 
     {
         if (session.userData.location) { session.beginDialog('/weather'); }
         else
         { builder.Prompts.text(session, "Hello. I can tell you about any city if you type, for example, 'weather London, UK'."); }
     }
 ]);
bot.add('/weather', 
[
     function (session, results) 
     {
        try {
        var txt = session.message.text;
        txt = txt.replace('weather ','');
        var city = txt.split(',')[0].trim().replace(' ','_');
        var state = txt.split(',')[1].trim();

        console.log(city + ', ' + state);
        var url = '/api/'+wundergroundKey+'/conditions/q/state/city.json'
        url = url.replace('state', state);
        url = url.replace('city', city);

        http.get(
            {
            host: 'api.wunderground.com',
            path: url
            }, function(response)
            {
                var body = '';
                response.on('data', function(d) { body += d; })
                response.on('end', function()
                {
                    var data = JSON.parse(body);
                    var conditions = data.current_observation.weather;
                    session.send("Conditions say '" + conditions + "' in "
                + city + " right now, and the temperature is "
                + data.current_observation.temp_f + " degrees F.   "
                + data.current_observation.observation_time);
                });
            })
         }
         catch (e) {
        session.send("Whoops, that didn't match! Try again.");
         }
    },
]);


//example of Weather code:
// exports.weather = function(cb) 
// {
//   if (this.message.names) 
//   {
//     var location = this.message.names[0]
//     https.get("https://api.openweathermap.org/data/2.5/find?q=" + location + "&units=imperial" + "&lang=en" + "&mode=json", function(res)
// 	{
// 		console.log('statusCode: ', res.statusCode);
// 		console.log('headers: ', res.headers);
// 		res.on('data', function (d) {
// 			process.stdout.write(d);
// 		});
// 	}).on('error', function (e) {
// 		console.error(e);
// 	});  
//   }
// } 
 
// Setup Restify Server
var server = restify.createServer();
server.use(bot.verifyBotFramework({appId: myAppId, appSecret: myAppSecret }));
server.get('/', restify.serveStatic({
    directory: __dirname,
    default: '/index.html'
}));
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(process.env.port || 3000, function () {
      console.log('%s listening to %s', server.name, server.url);
  });