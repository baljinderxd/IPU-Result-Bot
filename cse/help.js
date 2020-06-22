const a3 = require('axios')

export const sendfeedback = (message, res, sendMessage) => {
    a3.post(sendMessage, {
        chat_id: '<YOUR_USER_ID>',
        text: '---Feedback/Query---\n' +
            'From User ID: ' + message.chat.id + '\n' +
            '\n---Message---'
    }).then(response => {
        a3.post(sendMessage, {
            chat_id: '<YOUR_USER_ID>',
            text: message.text
        }).then(response => {
            a3.post(sendMessage, {
                chat_id: message.chat.id,
                text: 'Feedback sent!! I will contact you in some time :)'
            }).then(response => {
                res.end('ok')
            }).catch(err => {
                console.log(err)
                res.end(err)
            })
        }).catch(err => {
            console.log(err)
            res.end(err)
        })
    }).catch(err => {
        console.log(err)
        res.end(err)
    })
}
export const feedback = (message, res, sendMessage) => {
    a3.post(sendMessage,{
        chat_id: message.chat.id,
        text: "Please enter your feedback and send",
        reply_markup: {
            force_reply: true
        }
    }).then(response=>{
        res.end('ok')
    }).catch(err=>{
        console.log(err)
        res.end(err)
    })
}

export const sendhelp = (msg, res, sendMessage) => {
    var sendhelptoid = msg.text.match(/[0-9]+/).toString()
    var helpmsgstart = msg.text.search(/[0-9]+/)
    var helpmessage = msg.text.substr(helpmsgstart + sendhelptoid.length)
    a3.post(sendMessage, {
        chat_id: sendhelptoid,
        text: 'Reply to your query:\n' + helpmessage
    }).then(response => {
            a3.post(sendMessage, {
                chat_id: '<YOUR_USER_ID>',
                text: 'Message sent to: ' + sendhelptoid
            }).then(response => {
                res.end('ok')
            }).catch(err => {
                console.log('error while responding:', err)
                res.end(err)
            })

    }).catch(err => {
        console.log('error while responding:', err)
        res.end(err)
    })
}

export const gethelp = (msg,res,sendMessage) =>{
    a3.post(sendMessage,{
        chat_id: msg.chat.id,
        text: "These are the following commands available in the bot:\n\n"+
        "1) /start : To start the bot.\n\n"+
        "2) /fetch : Use this command to fetch the result using enrollment number.\n"+
        "Just send me this command and you will be prompted to input your enrollment number and semester number.\n"+
        "Example: <pre>12345678912 4</pre>(Enrollment_No Semester_No)\n\n"+
        "3) /cummulative : Use this command to get your cummulative percentage and graphical representation of your results over the semesters.\n\n"+
        "4) /feedback : Use this command to send me your feedbacks or any other query or a doubt.\n"+
        "Please do not abuse this service. Only ask or provide genuine feedbacks or any suggestion for improvement.\n\n"+
        "5) /gethelp : Use this command to get the list of commands and to know how to use them.",
        parse_mode: "HTML"
    }).then(response => {
        res.end('ok')
    }).catch(err => {
        console.log('error while responding:', err)
        res.end(err)
    })
}

export const senderror = (message,res,sendMessage) =>{

    a3.post(sendMessage, {
        chat_id: message.chat.id,
        text: 'Sorry!! Unknown command or message, please try again or use /gethelp to see list of commands and how to use them.'
    }).then(response => {
        res.end('ok')
    }).catch(err => {
        res.end(err)
    })

}