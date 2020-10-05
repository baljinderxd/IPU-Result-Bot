const reply = require('axios');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO_URL;

async function checkSaved(message, res, sendMessage, sendAction) {

    reply.post(sendAction, {
        chat_id: message.chat.id,
        action: 'typing'
    })


    let conn = await MongoClient.connect(url, { useUnifiedTopology: true });
    let connected = conn.db('users');
    let result = await connected.collection('savedRollNos').findOne({ userId: message.chat.id });

    if (result !== null) {
        reply.post(sendMessage, {
            chat_id: message.chat.id,
            text: 'You already have a saved enrollment number!'
        }).then(response => {
            conn.close();
            res.end('ok');
        }).catch(err => {
            console.log(err);
            res.end(err);
        });
    }
    else {
        reply.post(sendMessage, {
            chat_id: message.chat.id,
            text: 'Please send me the enrollment number you want to save',
            reply_markup: {
                force_reply: true
            }
        }).then(response => {
            conn.close();
            res.end('ok');
        }).catch(err => {
            console.log(err);
            res.end(err);
        });
    }
}

function saveRoll(message, res, sendMessage, sendAction) {

    reply.post(sendAction, {
        chat_id: message.chat.id,
        action: 'typing'
    })


    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, conn) {
        if (err) throw err;

        let connected = conn.db('users');

        connected.collection('savedRollNos').findOne({ userId: message.chat.id }, function (err, userFound) {
            if (err) throw err;

            if (userFound !== null) {
                reply.post(sendMessage, {
                    chat_id: message.chat.id,
                    text: 'You already have a saved enrollment number!'
                }).then(response => {
                    conn.close();
                    res.end('ok');
                }).catch(err => {
                    console.log(err);
                    res.end(err);
                });
            }
            else {

                connected.collection('savedRollNos').insertOne({
                    userId: message.chat.id,
                    rollNo: message.text
                }, function (err, result) {
                    if (err) throw err;

                    reply.post(sendMessage, {
                        chat_id: message.chat.id,
                        text: message.text + ' saved as your enrollment number.'
                    }).then(response => {
                        conn.close();
                        res.end('ok');
                    }).catch(err => {
                        console.log(err);
                        res.end(err);
                    });
                });
            }
        });
    });
}

module.exports = { checkSaved, saveRoll }