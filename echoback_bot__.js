const cnf = require('./credentials.json');
const properties = require('./properties.json');

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.set('port', (process.env.PORT || 8080));
// JSONの送信を許可
app.use(bodyParser.urlencoded({
    extended: true
}));
// JSONのパースを楽に（受信時）
app.use(bodyParser.json());

app.post('/webhook', function(req, res, next){
    res.status(200).end();
    for (var event of req.body.events){
        if (event.type == 'message' && event.message.text == 'ハロー'){
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + cnf.accessToken
            }
            var body = {
                replyToken: event.replyToken,
                messages: [{
                    type: 'text',
                    text: 'こんにちは'
                }]
            }
            var url = properties.lineApiUrl;
            request({
                url: url,
                method: 'POST',
                headers: headers,
                body: body,
                json: true
            });
        }
        if (event.type == 'message' && event.message.text == '画像'){
            var headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + cnf.accessToken
            }
            var body = {
                replyToken: event.replyToken,
                messages: [{
                    "type": 'image',
                    "originalContentUrl": properties.thisIsLove,
                    "previewImageUrl": properties.thisIsLove
                }]
            }
            request({
                url: properties.lineApiUrl,
                method: 'POST',
                headers: headers,
                body: body,
                json: true
            });
        }
    }
});

app.listen(app.get('port'), function() {
    console.log('Node app is running');
});