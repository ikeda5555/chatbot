'use strict';
const cnf = require('./credentials.json');
const properties = require('./properties.json');
const emotions = new Map();
setEmotions();
const webclient = require("request");

exports.handler = function (event, context) {
  if (signatureIsValid(event)) {
    let body = JSON.parse(event.body);
    if (body.events[0].replyToken === '00000000000000000000000000000000') { //接続確認エラー回避
      respondForConnectCheck(context);
    } else {
      let text = body.events[0].message.text;
      webclient.post({
        url: properties.cotohaUrl,
      　headers: {
          "content-type": "application/json;charset=UTF-8",
          "Authorization":"Bearer " + cnf.cotoha
      　},
      　body: JSON.stringify({"sentence": text})  
    　},
      function (error, response, cotohaResBody){
         const info = JSON.parse(cotohaResBody);
        //console.log(emotion);
        const MessageObj = getMessageObject(info.result);
        var message = {};
        if(MessageObj) {
    　    message = MessageObj;
　      } else {
           var emotion = "判定不可";
           if(info.result.emotional_phrase.length!=0) {
            emotion = info.result.emotional_phrase[0].emotion;
           }
          message = {
            'type': 'text',
            'text': emotion
        };
　      }  
　        const line = require('@line/bot-sdk');
      const lineClient = new line.Client({channelAccessToken: cnf.accessToken});
        lineClient.replyMessage(body.events[0].replyToken, message)
        .then((response) => { 
          let lambdaResponse = {
            statusCode: 200,
            headers: { "X-Line-Status" : "OK"},
            body: '{"result":"completed"}'
          };
          context.succeed(lambdaResponse);
        }).catch((err) => console.log(err));
      });
    }
  }else{
    console.log('署名認証エラー');
  }
};

function setEmotions() {
  emotions.set("好ましい,安心", properties.thisIsLove);
  emotions.set("好ましい", properties.loveYou);
  emotions.set("悲しい", properties.sad);
  emotions.set("驚く", properties.surprise);
  emotions.set("恥ずかしい", properties.embarrassed);
  emotions.set("怒る", properties.angry);
  emotions.set("嫌", properties.no);
  emotions.set("喜ぶ", properties.glad);
}

function signatureIsValid(event) {
  const crypto = require('crypto');
  let signature = crypto.createHmac('sha256', "8d1d8db1e38a38036ee24d8105235e9c").update(event.body).digest('base64');
  let checkHeader = (event.headers || {})['X-Line-Signature'];
  return signature === checkHeader;
}

function respondForConnectCheck(context) {
  let lambdaResponse = {
    statusCode: 200,
    headers: { "X-Line-Status" : "OK"},
    body: '{"result":"connect check"}'
  };
  context.succeed(lambdaResponse);
}

function getMessageObject(result) {
  var replyUrl = "";
  for(const phrase of result.emotional_phrase) {
    if(emotions.has(phrase.emotion)) {
      replyUrl = emotions.get(phrase.emotion);
      break;
    }  
  }

  if(replyUrl=="") {
    return false;
  } else {
    var MessageObj = {
      "type": 'image',
      "originalContentUrl": replyUrl,
      "previewImageUrl": replyUrl
    };
    return MessageObj;
  }      
}
