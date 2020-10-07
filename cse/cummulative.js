const a5 = require('axios')
const fs1 = require('fs');
const readline1 = require('readline')

function cummul(message, res, sendMessage) {
    var MongoClient = require('mongodb').MongoClient;
    var url = process.env.MONGO_URL;

    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, conn) {
        if (err) throw err;

        let connected = conn.db('tempHeroku');
        connected.collection('savedRollNos').findOne({ userId: message.chat.id }, function (err, result) {
            if (err) throw err;

            if (result === null) {
                a5.post(sendMessage, {
                    chat_id: message.chat.id,
                    text: `No saved enrollment number found. Use /save to save your enrollment number.\n\n`
                        + `Or reply with your enrollment number to the message below to get your cumulative result.`
                }).then(respons => {
                    a5.post(sendMessage, {
                        chat_id: message.chat.id,
                        text: `Please send your enrollment number`,
                        reply_markup: {
                            force_reply: true
                        }
                    }).then(respons => {
                        conn.close();
                        res.end('ok');
                    }).catch(err => {
                        console.log(err);
                        res.end(err);
                    })
                }).catch(err => {
                    console.log(err);
                    res.end(err);
                })
            }
            else {
                let msg = {
                    text: result.rollNo,
                    chat: { id: message.chat.id }
                }
                conn.close();
                cummulData(msg, res, sendMessage, sendPhoto)
            }
        });
    });
}

function cummulData(message, res, sendMessage, sendPhoto) {

    function displayCummuResult(flagarray, ttlmarks, cllgrank, unirank) {
        var percentage = [], sem = [], cmarks = 0, divider = 0
        if (flagarray[0] === 1) {
            let temp = ttlmarks[0] / 13
            percentage.push(temp.toFixed(2))
            sem.push("'Sem 1'")
            divider += 13
        }
        if (flagarray[1] === 1) {
            let temp = ttlmarks[1] / 12
            percentage.push(temp.toFixed(2))
            sem.push("'Sem 2'")
            divider += 12
        }
        if (flagarray[2] === 1) {
            let temp = ttlmarks[2] / 10
            percentage.push(temp.toFixed(2))
            sem.push("'Sem 3'")
            divider += 10
        }
        if (flagarray[3] === 1) {
            let temp = ttlmarks[3] / 12
            percentage.push(temp.toFixed(2))
            sem.push("'Sem 4'")
            divider += 12
        }

        for (let i = 0; i < 4; i++)
            cmarks += ttlmarks[i]

        cmarks = cmarks / divider

        a5.post(sendMessage, {
            chat_id: message.chat.id,
            text: "Enrollment Number: " + message.text + "\nCummulative Percentage: " + cmarks.toFixed(2) + "%"
                + "\n\nReport any inconsistency\nusing /feedback command."
        }).then(response => {
            a5.post(sendPhoto, {
                chat_id: message.chat.id,
                photo: "https://quickchart.io/chart?c={type:'line',data:{labels:[" + sem + "],"
                    + "datasets:[{label:'Percentage',data:[" + percentage + "],fill:false,borderColor:'rgb(75, 192, 192)',datalabels: {color: 'black'}}]},"
                    + "options:{plugins:{datalabels: {display: true,anchor: 'end',align: 'start'}}}}",
                caption: "Percentage Wise Graph"
            }).then(response => {
                a5.post(sendPhoto, {
                    chat_id: message.chat.id,
                    photo: "https://quickchart.io/chart?c={type:'line',data:{labels:[" + sem + "],"
                        + "datasets:[{label:'College Rank',data:[" + cllgrank + "],fill:false,borderColor:'rgb(75, 192, 192)',datalabels: {color: 'black'}}]},"
                        + "options:{plugins:{datalabels: {display: true,anchor: 'end',align: 'start'}},scales: {yAxes: [{ticks:{reverse: true,beginAtZero:true}}]}}}",
                    caption: "College Rank Wise Graph"
                }).then(response => {
                    a5.post(sendPhoto, {
                        chat_id: message.chat.id,
                        photo: "https://quickchart.io/chart?c={type:'line',data:{labels:[" + sem + "],"
                            + "datasets:[{label:'University Rank',data:[" + unirank + "],fill:false,borderColor:'rgb(75, 192, 192)',datalabels: {color: 'black'}}]},"
                            + "options:{plugins:{datalabels: {display: true,anchor: 'end',align: 'start'}},scales: {yAxes: [{ticks:{reverse: true,beginAtZero:true}}]}}}",
                        caption: "University Rank Wise Graph"
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
        }).catch(err => {
            console.log(err)
            res.end(err)
        })
    }


    async function processLineByLine() {

        var ttlmarks = [], unirank = [], cllgrank = [], flagarray = []

        for (let i = 1; i < 5; i++) {
            const fileStream = fs1.createReadStream(__dirname + '/sem' + i.toString() + '17.txt');
            const rl = readline1.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });
            var b = false,
                j = 2,
                flag = -1,
                instcode = message.text.substr(3, 3)

            var booluni = false, boolcllg = false,
                rankuni = [], rankcllg = [],
                cntrluni = 2, cntrlcllg = 2, stdntttl = 0,
                tempttluni = 0, tempttlcllg = 0, sbjct = 0,
                regex = new RegExp('^[0-9]{3}' + instcode + '[0-9]{3}1[7|8]$')


            for await (const line of rl) {
                if (line === message.text || b) {
                    flag = 1
                    b = true
                    if (line.match(/^[0-9]{1,3}\([A|B|C|F|O|P].*\).*$/)) {
                        sbjct = line.substr(0, line.indexOf('('))
                        stdntttl += parseInt(sbjct, 10)
                    }
                    if (line.match(/^[0-9]{11}$/g) || line.match(/^\(.+\)$/g) || line === 'RESULT TABULATION SHEET') {
                        j--
                        if (j === 0) {
                            b = false
                        }
                    }
                }

                if (line.match(/^[0-9]{9}1[0-9]$/) || booluni) {
                    booluni = true
                    if (line.match(/^[0-9]{1,3}\([A-P].*\).*$/)) {
                        sbjct = line.substr(0, line.indexOf('('))
                        tempttluni += parseInt(sbjct, 10)

                    }
                    if (line.match(/^[0-9]{9}1[1-9]$/g) || line === '(END OF LINE)') {

                        cntrluni--
                        if (cntrluni === 0) {
                            if (!rankuni.includes(tempttluni))
                                rankuni.push(tempttluni)
                            tempttluni = 0
                            cntrluni = 1
                        }
                    }
                }

                if (line.match(regex) || boolcllg) {
                    boolcllg = true
                    if (line.match(/^[0-9]{1,3}\([A-P].*\).*$/)) {
                        sbjct = line.substr(0, line.indexOf('('))
                        tempttlcllg += parseInt(sbjct, 10)

                    }
                    if (line.match(regex) || line.match(/^\(.+\)$/)) {

                        cntrlcllg--
                        if (cntrlcllg === 0) {
                            if (!rankcllg.includes(tempttlcllg))
                                rankcllg.push(tempttlcllg)
                            tempttlcllg = 0
                            cntrlcllg = 1
                            if (line.match(/^\(.+\)$/))
                                boolcllg = false
                        }
                    }
                }
            }
            flagarray.push(flag)
            if (flag === 1) {
                ttlmarks[i - 1] = stdntttl
                rankcllg = rankcllg.sort(function (a, b) { return b - a })
                let cr = rankcllg.indexOf(stdntttl)
                cllgrank.push(cr + 1)
                rankuni = rankuni.sort(function (a, b) { return b - a })
                let ur = rankuni.indexOf(stdntttl)
                unirank.push(ur + 1)
            }
            else {
                ttlmarks[i - 1] = 0
            }
        }
        if (flagarray.includes(1)) {
            displayCummuResult(flagarray, ttlmarks, cllgrank, unirank)
        }
        else {
            a5.post(sendMessage, {
                chat_id: message.chat.id,
                text: 'Sorry your result not found!' +
                    '\nPlease enter correct enrollment number or check if your stream or batch is included in results or not.'
            }).then(respons => {
                res.end('ok')

            }).catch(err => {
                console.log(err)
                res.end(err)
            })
        }
    }

    processLineByLine()
}

module.exports = {
    cummul,
    cummulData
}
