const reply = require('axios');
const filesys = require('fs');
const rdline = require('readline');

function compareReply(message, res, sendMessage) {
    reply.post(sendMessage, {
        chat_id: message.chat.id,
        text: `Please enter and send two enrollment numbers separated by a space`,
        reply_markup: {
            force_reply: true
        }
    }).then(respons => {
        res.end('ok')
    }).catch(err => {
        console.log(err)
        res.end(err)
    });
}

async function processLineByLine(rollNo, rollNo2) {

    var ttlmarks = [], flagarray = [];
    var ttlmarks2 = [], flagarray2 = [];

    for (let i = 1; i < 5; i++) {
        const fileStream = filesys.createReadStream(__dirname + '/sem' + i.toString() + '17.txt');
        const rl = rdline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        var b = false, j = 2, flag = -1;

        var stdntttl = 0, sbjct = 0;

        var b2 = false, j2 = 2, flag2 = -1;

        var stdntttl2 = 0, sbjct2 = 0;

        for await (const line of rl) {
            if (line === rollNo || b) {
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
            if (line === rollNo2 || b2) {
                flag2 = 1
                b2 = true
                if (line.match(/^[0-9]{1,3}\([A|B|C|F|O|P].*\).*$/)) {
                    sbjct2 = line.substr(0, line.indexOf('('))
                    stdntttl2 += parseInt(sbjct2, 10)
                }
                if (line.match(/^[0-9]{11}$/g) || line.match(/^\(.+\)$/g) || line === 'RESULT TABULATION SHEET') {
                    j2--
                    if (j2 === 0) {
                        b2 = false
                    }
                }
            }
        }
        flagarray.push(flag)
        if (flag === 1) {
            ttlmarks[i - 1] = stdntttl
        }
        else {
            ttlmarks[i - 1] = 0
        }
        flagarray2.push(flag2)
        if (flag2 === 1) {
            ttlmarks2[i - 1] = stdntttl2
        }
        else {
            ttlmarks2[i - 1] = 0
        }
    }


    let retarray = [flagarray, ttlmarks, flagarray2, ttlmarks2];

    return retarray;

}

function prepareResult(flagarray, ttlmarks) {

    var percentage = [], sem = [], cmarks = 0, divider = 0;

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

    let retRes = [cmarks, percentage, sem];

    return retRes;

}

async function compareResults(msg, res, sendMessage, sendPhoto) {

    let res1 = msg.text.substr(0, 11);
    let res2 = msg.text.substr(12, 11);

    if (res1 === res2) {
        reply.post(sendMessage, {
            chat_id: msg.chat.id,
            text: 'Please enter two different enrollment numbers!'
        }).then(respons => {
            res.end('ok');
        }).catch(err => {
            console.log(err);
            res.end(err);
        });
    }
    else {

        let cummRes = await processLineByLine(res1, res2);

        if (!cummRes[0].includes(1) || !cummRes[2].includes(1)) {
            postMsg.post(sendMessage, {
                chat_id: msg.chat.id,
                text: 'Sorry graph can not be generated!' +
                    '\nPlease enter correct enrollment numbers or check if stream or batch is included in results or not.'
            }).then(respons => {
                res.end('ok');
            }).catch(err => {
                console.log(err);
                res.end(err);
            });
        }
        else {

            let fin1 = prepareResult(cummRes[0], cummRes[1]);
            let fin2 = prepareResult(cummRes[2], cummRes[3]);

            let sems = [], per1 = [], per2 = [], anchor1 = [], anchor2 = [], align1 = [], align2 = [];

            function adjustData(semNo) {
                let temp1 = 0, temp2 = 0;
                if (fin1[2].includes(semNo) || fin2[2].includes(semNo)) {
                    sems.push(semNo);
                    if (!fin1[2].includes(semNo)) {
                        per1.push(' ');
                    }
                    else {
                        per1.push(fin1[1][fin1[2].indexOf(semNo)])
                        temp1 = fin1[1][fin1[2].indexOf(semNo)]
                    }
                    if (!fin2[2].includes(semNo)) {
                        per2.push(' ');
                    }
                    else {
                        per2.push(fin2[1][fin2[2].indexOf(semNo)])
                        temp2 = fin2[1][fin2[2].indexOf(semNo)]
                    }
                    if (temp1 >= temp2) {
                        anchor1.push("'end'");
                        anchor2.push("'start'");
                        align1.push("'end'");
                        align2.push("'start'");
                    }
                    else {
                        anchor1.push("'start'");
                        anchor2.push("'end'");
                        align1.push("'start'");
                        align2.push("'end'");
                    }
                }
            }

            for (let i = 1; i < 5; i++) {
                adjustData(`'Sem ${i}'`);
            }

            reply.post(sendPhoto, {
                chat_id: msg.chat.id,
                photo: "https://quickchart.io/chart?c={type:'line',data:{labels:[" + sems + "],"
                    + "datasets:[{label:'" + res1 + "',data:[" + per1 + "],fill:false,borderColor:'rgb(255, 153, 51)',"
                    + "datalabels: {color: 'black',display: true,anchor:[" + anchor1 + "],align:[" + align1 + "],backgroundColor: 'rgb(255, 185, 115)', font:{size: 9}}},"
                    + "{label:'" + res2 + "',data:[" + per2 + "],fill:false,borderColor:'rgb(19, 136, 8)',"
                    + "datalabels: {color: 'black',display: true,anchor:[" + anchor2 + "],align:[" + align2 + "],backgroundColor: 'lightgreen', font:{size: 9}}}]},}",
                caption: 'Semester wise marks comparison\nCumulative Marks:\n' + fin1[0] + '&' + fin2[0]
            }).then(response => {
                res.end('ok');
            }).catch(err => {
                console.log(err);
                res.end(err);
            });
        }

    }
}
module.exports = { compareReply, compareResults }