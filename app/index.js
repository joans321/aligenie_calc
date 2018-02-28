'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const calc = require('./calc')
const logger = require('./logger')

const app = express();


app.set('port', (process.env.AleGeniePort || 9420));
app.use(bodyParser.json({type: 'application/json'}));
app.use(morgan('short', {stream: logger.stream}));

app.get('/', function(req, res) {
    res.redirect('https://blog.lisp4fun.com');
});

app.post('/', function(req, res) {
    logger.verbose(JSON.stringify(req.body));

    let requestBody = req.body;
    let sessionId = requestBody.sessionId;
    let intentName = requestBody.intentName;
    let utterance = requestBody.utterance;
    let slotValues = requestBody.slotEntities;

    logger.info('user session : ' + sessionId);
    logger.info('user utterance : ' + utterance);
    
    let numbers = [];
    let ops = [];
    for (var slotValue of slotValues) {
        if (slotValue.intentParameterName == 'op') {
            ops.push(slotValue.slotValue);
        } else {
            numbers.push(slotValue.slotValue);
        }
    }

    let replyMessage = '我没听清楚，请再说一遍';
    let result = 0.0;
    let resultStr = '';
    let resultFlag = false;
    if (ops.length == 1 && numbers.length == 2) {
        logger.log('debug', 'start calc for %s %s %s', numbers[0], ops[0], numbers[1]);

        result = calc(ops[0], parseFloat(numbers[0]), parseFloat(numbers[1]));
        if (!Number.isInteger(result)) {
            result = result.toFixed(2);
        }
        replyMessage = '' + numbers[0] + ops[0] + numbers[1] + '等于' + result;
        logger.debug('calc result : ' + result);
    } else {
        logger.error('not support syntax');
    }
 
    let responseBody = {
        'returnCode': '0',
        'returnErrorSolution': '',
        'returnMessage': 'Sucess',
        'returnValue': {
            'reply': replyMessage,
            'resultType': 'RESULT'
        }
    };
        
    res.append('Content-Type', 'application/json');
    res.status(200).send(responseBody);

});


app.use((err, req, res, next) => {
    let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    logger.error("got error from %s, method %s, url %s", ip, req.method, req.url);
    logger.error(err.stack);
    next(err);
});

module.exports = app;

app.listen(app.get('port'), function() {
    logger.info('AliGenie Calculator listening on port ' + app.get('port'));
});
