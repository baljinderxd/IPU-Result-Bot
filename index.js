const { welcome } = require('./cse/start');
const { fetch, getResult } = require('./cse/result');
const { gethelp, sendhelp, feedback, sendfeedback, senderror } = require('./cse/help');
const { cummul, cummulData } = require('./cse/cummulative');

require('dotenv').config();
var express = require('express')
var app = express()
var bodyParser = require('body-parser')
const axios = require('axios');
const { compareReply, compareResults } = require('./cse/compare');
const { saveRoll, checkSaved } = require('./cse/saveRoll');
app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true
    })
)
const botToken = process.env.BOT_TOKEN
const myUserID = process.env.YOUR_CHAT_ID
const sendMessage = 'https://api.telegram.org/bot' + botToken + '/sendMessage'
const sendAction = 'https://api.telegram.org/bot' + botToken + '/sendChatAction'
const sendPhoto = 'https://api.telegram.org/bot' + botToken + '/sendPhoto'

app.post('/', function (req, res) {
    const { message } = req.body
    var flag = 1
    if (message.reply_to_message === undefined) {
        flag = 0
    }
    if (message.text === undefined) {
        senderror(message, res, sendMessage)
    }
    else if (message.text === '/start') {
        welcome(message, res, sendMessage)
    }
    else if (message.text === '/fetch') {
        fetch(message, res, sendMessage)
    }
    else if (message.text === '/gethelp') {
        gethelp(message, res, sendMessage)
    }
    else if (message.text.match(/^[0-9]{11}\s[1-4]{1}$/g)) {
        getResult(message, res, sendMessage, sendAction, sendPhoto)
    }
    else if (message.text === '/feedback') {
        feedback(message, res, sendMessage)
    }
    else if (message.text.match(/^\/sendhelp\s[0-9]+\s/gi)) {
        if (message.chat.id.toString() === myUserID)
            sendhelp(message, res, sendMessage, myUserID)
        else
            senderror(message, res, sendMessage)
    }
    else if (message.text === '/cummulative') {
        cummul(message, res, sendMessage)
    }
    else if (message.text === '/compare') {
        compareReply(message, res, sendMessage)
    }
    else if (message.text === '/save') {
        checkSaved(message, res, sendMessage, sendAction)
    }
    else if (flag === 1) {

        if (message.reply_to_message.text === 'Please enter your feedback and send') {
            sendfeedback(message, res, sendMessage, myUserID)
        }
        else if (message.reply_to_message.text === 'Please send your enrollment number') {
            if (message.text.match(/^[0-9]{11}$/))
                cummulData(message, res, sendMessage, sendPhoto)
            else {
                senderror(message, res, sendMessage)
            }
        }
        else if (message.reply_to_message.text === 'Please enter and send two enrollment numbers separated by a space') {
            if (message.text.match(/^[0-9]{11}.[0-9]{11}$/)) {
                compareResults(message, res, sendMessage, sendPhoto)
            }
            else {
                senderror(message, res, sendMessage)
            }
        }
        else if (message.reply_to_message.text === 'Please send me the enrollment number you want to save') {
            if (message.text.match(/^[0-9]{11}$/)) {
                saveRoll(message, res, sendMessage, sendAction)
            }
            else {
                senderror(message, res, sendMessage)
            }
        }
        else {
            senderror(message, res, sendMessage)
        }
    }
    else {
        senderror(message, res, sendMessage)
    }
})

app.listen(process.env.PORT || 3000, function () {
    console.log('Telegram app listening on port 3000!')
})