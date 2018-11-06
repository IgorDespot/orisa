'use strict';

const slackClient = require('../server/slackClient');
const service = require('../server/service');
const http = require('http');

const server = http.createServer(service);

const wit_token = 'GLO2LOJK2GHGDLLTY4B3LWXIOWZIWYV6'
const slack_token = 'xoxb-467393544166-465993206002-fGNCMPoSsnoTj8XLHP1lEZ3Q';
const slackLogLevel = 'info';

const witClient = require('../server/witClient')(wit_token);

const serviceRegistry = service.get('serviceRegistry');

const rtm = slackClient.init(slack_token, slackLogLevel, witClient, serviceRegistry);

rtm.start();

slackClient.addAuthenicatedHanler(rtm, function() {
    server.listen(3000);
});

server.on('listening', () => {
    console.log(`Server is listening on ${server.address().port} in ${service.get('env')} mode.`);
});
