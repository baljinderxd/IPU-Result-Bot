const a2 = require('axios')
function welcome(msg, res, sendMessage) {

    a2.post(
        sendMessage,
        {
            chat_id: msg.chat.id,
            text: "Hello user. Use the command /fetch to get your result." +
                "\nPlease confirm your result with result pdf before using this anywhere." +
                "\nCurrently I only support results for cse branch 2017 batch for affifliated institutes of ipu." +
                "\nUse /gethelp to get the list of commands and their usage."
        }
    ).then(response => {
        res.end('ok')
    }).catch(err => {
        console.log('Error :', err)
        res.end('Error :' + err)
    })
}

module.exports = {
    welcome
}