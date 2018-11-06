'use strict';

const config = require('../config');

const slackClient = require('../server/slackClient');
const service = require('../server/service')(config);
const http = require('http');

const server = http.createServer(service);

const wit_token = config.witToken;
const slack_token = config.slackToken;
const slackLogLevel = 'info';

const WitClient = require('../server/witClient');
const witClient = new WitClient(wit_token);

const serviceRegistry = service.get('serviceRegistry');

const rtm = slackClient.init(slack_token, slackLogLevel, witClient, serviceRegistry);

rtm.start();

slackClient.addAuthenicatedHanler(rtm, function() {
	server.listen(3000);
});

server.on('listening', () => {
	console.log(`Server is listening on ${server.address().port} in ${service.get('env')} mode.`);
});
