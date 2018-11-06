'use strict';

const config = require('../config');

const slackClient = require('../server/slackClient');
const service = require('../server/service');
const http = require('http');

const server = http.createServer(service);

const wit_token = config.witToken;
const slack_token = config.slackToken;
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
