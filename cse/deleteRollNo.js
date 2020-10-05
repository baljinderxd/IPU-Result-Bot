const reply = require('axios');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGO_URL;

async function deleteSaved(message, res, sendMessage, sendAction) {

    reply.post(sendAction, {
        chat_id: message.chat.id,
        action: 'typing'
    })

    let conn = await MongoClient.connect(url, { useUnifiedTopology: true });
    let connected = conn.db('tempHeroku');
    let result = await connected.collection('savedRollNos').findOne({ userId: message.chat.id });

    if (result === null) {
        reply.post(sendMessage, {
            chat_id: message.chat.id,
            text: 'You do not have any enrollment number saved!'
        }).then(response => {
            conn.close();
            res.end('ok');
        }).catch(err => {
            console.log(err);
            res.end(err);
        });
    }
    else {
        let deletedRoll = result.rollNo;
        connected.collection('savedRollNos').findOneAndDelete({ userId: message.chat.id }, function (err, r) {
            reply.post(sendMessage, {
                chat_id: message.chat.id,
                text: `${deletedRoll} removed as your enrollment number`
            }).then(response => {
                conn.close();
                res.end('ok');
            }).catch(err => {
                console.log(err);
                res.end(err);
            });
        });
    }
}

module.exports = { deleteSaved }