const cnf = require('./credentials.json');
const properties = require('./properties.json');
const likeAndRelax = "好ましい,安心";
const like = "好ましい";
var LineMsgApi = require('line-msg-api');
var webclient = require("request");

console.log("Listening on port ", process.env.PORT || cnf.port);
var bot = new LineMsgApi(cnf);

bot.on(function (msg) {

	if (msg.events[0].message.type == 'text') {
		console.log("Message ----");
		console.log(msg.events[0].message.text);
		replyMessage = msg.events[0].message.text;

		webclient.post({
			url: properties.cotohaUrl,
			headers: {
			  "content-type": "application/json;charset=UTF-8",
			  "Authorization":"Bearer " + cnf.cotoha
			},
			body: JSON.stringify({"sentence": msg.events[0].message.text})  
		},
		function (error, response, body){
			const info = JSON.parse(body);
			const emotion = info.result.emotional_phrase[0].emotion;
			console.log(emotion);
			const MessageObj = getMessageObject(emotion);
			if(MessageObj) {
				bot.replyMessageObject(msg.events[0].replyToken, MessageObj);
			} else {
				bot.replyMessage(msg.events[0].replyToken, emotion);
			}	
		});
	
		// Getting the user profile of the message sender
		bot.getProfile(msg.events[0].source.userId ,function(err,profile) {
			console.log("profile= ", profile);
			
			if ( replyMessage == 'Push') {
			// Pushing a message
			bot.pushMessage(profile.userId, "Hello Tokyo");
			}
		});
    } else if (msg.events[0].message.type == 'image') {
		// Getting a image file
		console.log("Image ----");
		MessageObj = {
			"type": 'image',
            "originalContentUrl": properties.defaultImage,
            "previewImageUrl": properties.defaultImage
		};
		bot.replyMessageObject(msg.events[0].replyToken, MessageObj);   
	} else if (msg.events[0].message.type == 'audio') {
		// Getting a sound file
		console.log("Sound ----");
		bot.getContent(msg.events[0].message.id,"test.au");
    } else if (msg.events[0].message.type == 'sticker') {
		// Getting a stikcer IDs
		console.log("Sticker ----");
		console.log(msg.events[0].message);
		MessageObj = {
			"type": "sticker",
			"packageId": "1",
			"stickerId": "3"
		};
		bot.replyMessageObject(msg.events[0].replyToken, MessageObj);
    } else {
		// Getting other info
		console.log("Other ----");
		console.log(msg.events[0]);
    }
});

function getMessageObject(replyMessage) {
	if(replyMessage == likeAndRelax || replyMessage == like) {
		var replyUrl = "";
		if(replyMessage == likeAndRelax) {
			replyUrl = properties.thisIsLove; 
		} else if(replyMessage == like){
			replyUrl = properties.loveYou;
		}
		MessageObj = {
			"type": 'image',
			"originalContentUrl": replyUrl,
			"previewImageUrl": replyUrl
		};
		return MessageObj;
	} else {
		return false;
	}
}