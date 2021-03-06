const a1 = require('axios')
const fs = require('fs');
const readline = require('readline')


function fetch(msg, res, sendMessage) {
    
    var MongoClient = require('mongodb').MongoClient;
    var url = process.env.MONGO_URL;

    MongoClient.connect(url, { useUnifiedTopology: true }, function (err, conn) {
        if (err) throw err;

        let connected = conn.db('tempHeroku');
        connected.collection('savedRollNos').findOne({ userId: msg.chat.id }, function (err, result) {
            if (err) throw err;

            if (result === null) {
                a1.post(sendMessage, {
                    chat_id: msg.chat.id,
                    text: 'No saved enrollment number found. Use /save to save your enrollment number.\n\n'
                        + 'Or send the enrollment number and the semester number separated by a space.\n'
                        + 'Example: 12345678912 5',
                    reply_markup: { force_reply: true }
                }).then(response => {
                    conn.close();
                    res.end('ok');
                }).catch(err => {
                    console.log("Error: ", err);
                    res.end(err);
                });
            }
            else {
                a1.post(sendMessage, {
                    chat_id: msg.chat.id,
                    text: `Result for ${result.rollNo} will be sent.\nPlease select the option for which to fetch the result:`,
                    reply_markup: {
                        keyboard: [
                            [
                                { text: `${result.rollNo} 1` },
                                { text: `${result.rollNo} 2` }
                            ],

                            [
                                { text: `${result.rollNo} 3` },
                                { text: `${result.rollNo} 4` }
                            ]
                        ]
                    }
                }).then(response => {
                    conn.close();
                    res.end('ok');
                }).catch(err => {
                    console.log("Error: ", err);
                    res.end(err);
                });
            }
        });
    });

}

function getResult(msg, res, sendMessage, sendAction, sendPhoto) {

    var b = false,
        j = 2,
        studentresult = new Array,
        flag = -1,
        resultOf = msg.text.toString().substr(0, 11),
        sem = msg.text.toString().substr(12),
        instcode = msg.text.toString().substr(3, 3)

    function displayResult(result, flag, sem, ttl, uni, cllg) {



        if (flag === -1) {
            a1.post(sendMessage, {
                chat_id: msg.chat.id,
                text: 'Sorry your result not found!' +
                    '\nPlease enter correct enrollment number or check if your stream or batch is included in results or not.'
            }).then(respons => {
                res.end('ok')

            }).catch(err => {
                console.log(err)
                res.end(err)
            })
        }

        let display, per, unirank = 0, cllgrank = 0
        display = 'Name: ' + result[1]
        display += '\nEnrollment No: ' + result[0]
        uni = uni.sort(function (a, b) { return b - a })
        unirank = uni.indexOf(ttl) + 1
        cllg = cllg.sort(function (a, b) { return b - a })
        cllgrank = cllg.indexOf(ttl) + 1

        let semSubject = [], semInt = [], semExt = []

        for (let i = 4; i < result.length - 2; i++) {
            if (result[i].match(/(\d{1,2}|-|A)\s+([0-9]{1,3}|A)/g)) {

                let temp = result[i].match(/\d{1,3}|-|A/g)

                if (temp[0] === '-' || temp[0] === 'A' || temp[0] === '0')
                    semInt.push('')
                else
                    semInt.push(temp[0])

                if (temp[1] === '-' || temp[1] === 'A' || temp[1] === '0')
                    semExt.push('')
                else
                    semExt.push(temp[1])
            }

            else if (result[i].match(/A|-|[0-9]{1,2}/) && result[i + 2].match(/^([0-9]{1,3}\([A-P].*\).*)|A$/)
                && result[i - 1].match(/^[0-9]{4,5}\([0-9]\)$/)) {

                let temp = result[i].match(/A|-|[0-9]{1,2}/g)

                if (temp[0] === 'A' || temp[0] === '-' || temp[0] === '0')
                    semInt.push('')
                else
                    semInt.push(temp)

            }

            else if (result[i].match(/A|-|[0-9]{1,3}/) && result[i + 1].match(/(^[0-9]{1,3}\([A-P].*\).*)|A$/)
                && result[i - 2].match(/^[0-9]{4,5}\([0-9]\)$/)) {

                let temp = result[i].match(/A|-|[0-9]{1,3}/g)

                if (temp[0] === 'A' || temp[0] === '-' || temp[0] === '0')
                    semExt.push('')
                else
                    semExt.push(temp)



            }
        }

        if (sem === '4') {
            semSubject = ["'AM-IV'", "'COA'", "'TOC'", "'DBMS'", "'OOP'", "'CS'",
                "'NCC/NSS'", "'AM LAB'", "'COA LAB'", "'DBMS LAB'", "'CS LAB'", "'OOP LAB'"]
            per = ttl / 1200 * 100
            display += '\nSemester: Fourth'
            display += '\nCredits: ' + result[result.length - 2]
            display += '\nTotal Marks: ' + ttl.toString() + '/1200'
            display += '\nPercentage: ' + per.toFixed(2) + '%'
            display += '\nCollege Rank: ' + cllgrank
            display += '\nUniversity Rank: ' + unirank
                + '\n\n<pre>Subject | Marks'
                + '\n--------|--------'
                + '\nAM-IV   | ' + result[result.indexOf('27204(4)') - 1]
                + '\n--------|--------'
                + '\nCOA     | ' + result[result.indexOf('27206(4)') - 1]
                + '\n--------|--------'
                + '\nTOC     | ' + result[result.indexOf('27208(4)') - 1]
                + '\n--------|--------'
                + '\nDBMS    | ' + result[result.indexOf('27210(3)') - 1]
                + '\n--------|--------'
                + '\nOOP     | ' + result[result.indexOf('28212(4)') - 1]
                + '\n--------|--------'
                + '\nCS      | ' + result[result.indexOf('99250(1)') - 1]
                + '\n--------|--------'
                + '\nNCC/NSS | ' + result[result.indexOf('99252(1)') - 1]
                + '\n--------|--------'
                + '\nAM LAB  | ' + result[result.indexOf('27254(1)') - 1]
                + '\n--------|--------'
                + '\nCOA LAB | ' + result[result.indexOf('27256(1)') - 1]
                + '\n--------|--------'
                + '\nDBMS LAB| ' + result[result.indexOf('28256(1)') - 1]
                + '\n--------|--------'
                + '\nCS LAB  | ' + result[result.indexOf('27258(1)') - 1]
                + '\n--------|--------'
                + '\nOOP LAB | ' + result[result.length - 3] + '</pre>'
        }

        else if (sem === '3') {
            per = ttl / 1000 * 100
            display += '\nSemester: Third'
            display += '\nCredits: ' + result[result.length - 2]
            display += '\nTotal Marks: ' + ttl.toString() + '/1000'
            display += '\nPercentage: ' + per.toFixed(2) + '%'
            display += '\nCollege Rank: ' + cllgrank
            display += '\nUniversity Rank: ' + unirank
                + '\n\n<pre>Subject | Marks'
                + '\n--------|--------'
                + '\nAM-III  | ' + result[result.indexOf('27203(4)') - 1]
                + '\n--------|--------'
                + '\nFCS     | ' + result[result.indexOf('28205(4)') - 1]
                + '\n--------|--------'
                + '\nSTLD    | ' + result[result.indexOf('49207(4)') - 1]
                + '\n--------|--------'
                + '\nCS      | ' + result[result.indexOf('27209(4)') - 1]
                + '\n--------|--------'
                + '\nDS      | ' + result[result.indexOf('27211(4)') - 1]
                + '\n--------|--------'
                + '\nCGM     | ' + result[result.indexOf('28253(1)') - 1]
                + '\n--------|--------'
                + '\nSTLD LAB| ' + result[result.indexOf('27255(1)') - 1]
                + '\n--------|--------'
                + '\nDS LAB  | ' + result[result.indexOf('27257(1)') - 1]
                + '\n--------|--------'
                + '\nCGM LAB | ' + result[result.indexOf('49257(1)') - 1]
                + '\n--------|--------'
                + '\nCS LAB  | ' + result[result.length - 3] + '</pre>'

        }

        else if (sem === '2') {
            per = ttl / 1200 * 100
            display += '\nSemester: Second'
            display += '\nCredits: ' + result[result.length - 2]
            display += '\nTotal Marks: ' + ttl.toString() + '/1200'
            display += '\nPercentage: ' + per.toFixed(2) + '%'
            display += '\nCollege Rank: ' + cllgrank
            display += '\nUniversity Rank: ' + unirank
                + '\n\n<pre>Subject | Marks'
                + '\n--------|--------'
                + '\nAM-II   | ' + result[result.indexOf('99104(3)') - 1]
                + '\n--------|--------'
                + '\nAP-II   | ' + result[result.indexOf('28106(3)') - 1]
                + '\n--------|--------'
                + '\nED      | ' + result[result.indexOf('27108(3)') - 1]
                + '\n--------|--------'
                + '\nITP     | ' + result[result.indexOf('36110(3)') - 1]
                + '\n--------|--------'
                + '\nEM      | ' + result[result.indexOf('98112(3)') - 1]
                + '\n--------|--------'
                + '\nCS      | ' + result[result.indexOf('56114(3)') - 1]
                + '\n--------|--------'
                + '\nEVS     | ' + result[result.indexOf('99152(1)') - 1]
                + '\n--------|--------'
                + '\nAP LAB  | ' + result[result.indexOf('27154(1)') - 1]
                + '\n--------|--------'
                + '\nITP LAB | ' + result[result.indexOf('28156(1)') - 1]
                + '\n--------|--------'
                + '\nED LAB  | ' + result[result.indexOf('36158(1)') - 1]
                + '\n--------|--------'
                + '\nEM LAB  | ' + result[result.indexOf('56160(1)') - 1]
                + '\n--------|--------'
                + '\nEVS LAB | ' + result[result.length - 3] + '</pre>'

        }

        else if (sem === '1') {
            per = ttl / 1300 * 100
            display += '\nSemester: First'
            display += '\nCredits: ' + result[result.length - 2]
            display += '\nTotal Marks: ' + ttl.toString() + '/1300'
            display += '\nPercentage: ' + per.toFixed(2) + '%'
            display += '\nCollege Rank: ' + cllgrank
            display += '\nUniversity Rank: ' + unirank
                + '\n\n<pre>Subject | Marks'
                + '\n--------|--------'
                + '\nAM-I    | ' + result[result.indexOf('99103(3)') - 1]
                + '\n--------|--------'
                + '\nAP-I    | ' + result[result.indexOf('36105(3)') - 1]
                + '\n--------|--------'
                + '\nMP      | ' + result[result.indexOf('49107(3)') - 1]
                + '\n--------|--------'
                + '\nET      | ' + result[result.indexOf('98109(1)') - 1]
                + '\n--------|--------'
                + '\nHVPE    | ' + result[result.indexOf('27111(2)') - 1]
                + '\n--------|--------'
                + '\nFOC     | ' + result[result.indexOf('99113(3)') - 1]
                + '\n--------|--------'
                + '\nAC      | ' + result[result.indexOf('99151(1)') - 1]
                + '\n--------|--------'
                + '\nAP LAB  | ' + result[result.indexOf('49153(1)') - 1]
                + '\n--------|--------'
                + '\nET LAB  | ' + result[result.indexOf('36155(2)') - 1]
                + '\n--------|--------'
                + '\nWP LAB  | ' + result[result.indexOf('27157(1)') - 1]
                + '\n--------|--------'
                + '\nFOC LAB | ' + result[result.indexOf('36157(2)') - 1]
                + '\n--------|--------'
                + '\nEG LAB  | ' + result[result.indexOf('99161(1)') - 1]
                + '\n--------|--------'
                + '\nAC LAB  | ' + result[result.length - 3] + '</pre>'
        }

        let foto = "https://quickchart.io/chart?h=500&c={type:'horizontalBar',data:{labels:[" + semSubject + "],"
            + "datasets:[{label:'Internal',data:[" + semInt + "],backgroundColor:'rgb(108, 212, 255)',datalabels: {color: 'black'}},"
            + "{label:'External',data:[" + semExt + "],backgroundColor:'rgb(255, 158, 0)',datalabels: {color: 'black'}}]},"
            + "options:{scales:{xAxes:[{stacked: true}],yAxes:[{stacked: true}]},"
            + "plugins:{datalabels: {display: true,anchor: 'end',align: 'start'}},"
            + "annotation:{annotations: [{type: 'line',scaleID: 'x-axis-0',value: 40,borderDash: [5, 2],"
            + "borderDashOffset: 0,borderColor: 'green',borderWidth: 1},{type: 'line',scaleID: 'x-axis-0',value: "+ per.toFixed(2) +",borderDash: [5, 2],"
            + "borderDashOffset: 0,borderColor: 'red',borderWidth: 1}]},}}"

        if (flag === 1) {

            display += "\n\nReport any inconsistency\nin your result by using\n/feedback command.\n" +
                "Use /cummulative\ncommand to get your\ncummulative percentage."

            a1.post(sendMessage, {
                chat_id: msg.chat.id,
                text: display,
                parse_mode: 'HTML',
                reply_markup: { remove_keyboard: true }
            }).then(response => {
                if (semSubject.length > 0) {
                    a1.post(sendPhoto, {
                        chat_id: msg.chat.id,
                        photo: foto,
                        caption: "Internal-External wise marks\nGreen Line: Passing Marks\nRed Line: Your Percentage"
                    }).then(response => {
                        res.end('ok')
                    }).catch(err => {
                        console.log(err)
                        res.end(err)
                    })
                }
                else
                    res.end('ok')
            }).catch(err => {
                console.log(err)
                res.end(err)
            })
        }

    }




    a1.post(sendAction, {
        chat_id: msg.chat.id,
        action: 'typing'
    }).then(response => {

        async function processLineByLine() {
            const fileStream = fs.createReadStream(__dirname + '/sem' + sem + '17.txt');
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            var booluni = false, boolcllg = false,
                rankuni = [], rankcllg = [],
                cntrluni = 2, cntrlcllg = 2, stdntttl = 0,
                tempttluni = 0, tempttlcllg = 0, sbjct = 0,
                regex = new RegExp('^[0-9]{3}' + instcode + '[0-9]{3}1[7|8]$')


            for await (const line of rl) {
                if (line === resultOf || b) {
                    flag = 1
                    studentresult.push(line)
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

            displayResult(studentresult, flag, sem, stdntttl, rankuni, rankcllg)


        }
        processLineByLine();



    }).catch(err => {
        res.end(err)
    })


}
module.exports = {
    fetch,
    getResult
}
