'use strict';

const RtmClient = require('@slack/client').RTMClient;

class SlackClient {
	constructor(token, logLevel, nlp, registry) {
		this._rtm = new RtmClient(token, {logLevel: logLevel});
		this._nlp = nlp;
		this._registry = registry;

		this._addAuthenticatedHandler(this._handleAuthenticated);
		this._rtm.on('message', this._handleOnMessage.bind(this));
	}

	_handleAuthenticated(rtmStartData){
		console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
	}

	_addAuthenticatedHandler(handler) {
		this._rtm.on('authenticated', handler.bind(this));
	}

	_handleOnMessage(message) {
		if (message.text.toLowerCase().includes('orisa')) {
			this._nlp.ask(message.text, function(err, res) {
				if (err) {
					console.log(err);
					return;
				}
	
				try {
					if (!res.intent || !res.intent[0] || !res.intent[0].value) {
						throw new Error('Could not extract intent.');
					}
	
					const intent = require('./intents/' + res.intent[0].value + 'Intent');
	
					intent.process(res, this._registry, (error, response) => {
						if(error) {
							console.log(error.message);
							return;
						}
	
						return this._rtm.sendMessage(response, message.channel);
					});
				} catch (error) {
					console.log(error);
					console.log(res);
					if (!res.intent) {
						return this._rtm.sendMessage('Sorry, I don\'t know what you are talking about.', message.channel);
					} else if (!res.intent[0].value == 'time' && !res.location) {
						return this._rtm.sendMessage(`I don't yet know the time in ${res.location[0].value}`, message.channel);
					} else {
						console.log(res);
						return this._rtm.sendMessage('Sorry, I don\'t know what you are talking about.', message.channel);
					}
				}
			});
		}
	}

	start(handler) {
		this._addAuthenticatedHandler(handler);
		this._rtm.start();
	}
}

module.exports = SlackClient;