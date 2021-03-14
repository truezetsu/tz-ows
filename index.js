// Import the node modules
const Discord = require("discord.js");
const Twit = require("twit");

// Create an instance of a Discord and a Twitter client
const client = new Discord.Client();
let T = new Twit({
  consumer_key: process.env.TKEY,
  consumer_secret: process.env.TSECRET,
  access_token: process.env.TATOKEN,
  access_token_secret: process.env.TATSECRET,
});

// The token of your bot - https://discordapp.com/developers/applications/me
const token = process.env.DISCORDTOKEN;

// create bot prefix
const prefix = "./";

// create other variables
let listening = false;
let returnStr = "";
let channel = null;

// func for rand int
let random = (min, max) => { return Math.floor(Math.random() * max) + min; };

// The ready event is vital, it means that your bot will only start reacting to information
// from Discord _after_ ready is emitted
client.on("ready", () => {
  client.user.setActivity("./start"); // set game upon login
  console.log("ready to hear your story!");
});

// create an event listener for messages
client.on("message", message => {
  // It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if (message.author.bot) return;    

  // shiny message chance
  if(random(0, 2048) == 69) message.react('502512240428187659');

  // Otherwise ignore any message that does not start with the prefix,
  // which is set above
  if (message.content.indexOf(prefix) !== 0) {
    // if listening is true, add new words to your story
    if (listening === true && channel === message.channel) {
      if (
        (message.content.indexOf(".") == 0 ||
          message.content.indexOf(",") == 0 ||
          message.content.indexOf('"') == 0 ||
          message.content.indexOf("?") == 0 ||
          message.content.indexOf("!") == 0 ||
          message.content.indexOf("™") == 0 ||
          message.content.indexOf("“") == 0 ||
          message.content.indexOf("”") == 0 ||
          message.content.indexOf(";") == 0 ||
          message.content.indexOf(":") == 0 ||
          message.content.indexOf("(") == 0 ||
          message.content.indexOf(")") == 0 ||
          message.content.indexOf("[") == 0 ||
          message.content.indexOf("]") == 0 ||
          message.content.indexOf("~") == 0 ||
          message.content.indexOf("-") == 0 ||
          message.content.indexOf("/") == 0) &&
        returnStr != ""
      )
        returnStr = returnStr.slice(0, returnStr.length - 1);

      returnStr += message.content + " ";
    } else return;
  } else {
	  const args = message.content
		.slice(prefix.length)
		.trim()
		.split(/ +/g);
	  const command = args.shift().toLowerCase();

	  if (command === "start") {
		if (listening === true && channel === message.channel)
		  return message.channel.send(
			"Already listening on this channel! I'll make sure this word isn't logged. :wink:"
		  );
		else if (listening === true && channel != message.channel)
		  return message.channel.send("Already listening on another channel!");

		listening = true;
		channel = message.channel;
		returnStr = "";
		return message.channel.send(
		  "Now listening! Type command `./end` to stop listening or command `./undo` to undo the last word added.\nRemember to end your sentences, close your quotes, write only one word at a time, and have fun!"
		);
	  }

	  if (command === "undo") {
		if (channel != message.channel)
		  return message.channel.send(
			"`./undo` must be run from the same channel that `./start` was called from."
		  );

		if (returnStr == "")
		  return message.channel.send("I can't undo what you haven't written yet.");

		const lastIndex = returnStr.lastIndexOf(" ", returnStr.length - 2);
		returnStr = returnStr.substring(0, lastIndex) + " ";
		return message.channel.send(
		  "Last word undone! Please continue writing your masterpiece."
		);
	  }

	  if (command === "end" || command === "send_tweet" || command === "stop") {
		if (channel != message.channel)
		  return message.channel.send(
			"`./end` must be run from the same channel that `./start` was called from."
		  );

		if (returnStr == "")
		  return message.channel.send(
			"You didn't write anything... But I'll keep listening!"
		  );

		listening = false;
		channel = null;

		if (returnStr.length <= 280) {
		  T.post("statuses/update", { status: returnStr }, function(
			err,
			data,
			response
		  ) {
			if (err && err.code != 187) throw err;
		  });

		  setTimeout(function() {
			T.get(
			  "statuses/user_timeline",
			  { screen_name: "TrueZetsubou" },
			  function(err, data, response) {
				if (err) throw err;

				message.channel.send(
				  "https://twitter.com/TrueZetsubou/status/" + data[0].id_str
				);
			  }
			);
		  }, 3000);
		} else
		  message.channel.send(
			"Sorry, this one was too long for Twitter... But here's your final story:"
		  );

		return message.channel.send(returnStr);
	  }

	  /*
	  if(command ==="dev-end") {
			if(channel != message.channel)
				return message.channel.send("`./end` must be run from the same channel that `./start` was called from.");
			
			if (returnStr == "")
				return message.channel.send("You didn't write anything... But I'll keep listening!");
			
			listening = false;
			channel = null;
		
		return message.channel.send(returnStr);
	  }
	  
	  */
  }
});

// log the bot in
client.login(token);
