'use strict';

const RtmClient = require('@slack/client').RTMClient;
let rtm = null;
let nlp = null;
let registry = null;

function handleOnAuthenticated(rtmStartData) {
    console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
};

function addAuthenticatedHandler(rtm, handler) {
    rtm.on('authenticated', handler);
};

function handleOnMessage(message) {
    if (message.text.toLowerCase().includes('orisa')) {
        nlp.ask(message.text, function(err, res) {
            if (err) {
                console.log(err);
                return;
            }

            try {
                if (!res.intent || !res.intent[0] || !res.intent[0].value) {
                    throw new Error('Could not extract intent.');
                }

                const intent = require('./intents/' + res.intent[0].value + 'Intent');

                intent.process(res, registry, function(error, response) {
                    if(error) {
                        console.log(error.message);
                        return;
                    }

                    return rtm.sendMessage(response, message.channel);
                });
            } catch (error) {
                console.log(error);
                console.log(res);
                if (!res.intent) {
                    return rtm.sendMessage("Sorry, I don't know what you are talking about.", message.channel);
                } else if (!res.intent[0].value == 'time' && !res.location) {
                    return rtm.sendMessage(`I don't yet know the time in ${res.location[0].value}`, message.channel);
                } else {
                    console.log(res);
                    return rtm.sendMessage("Sorry, I don't know what you are talking about.", message.channel);
                }
            }
        });
    }
};
 
module.exports.init = function slackClient(token, slacklogLevel, nlpClient, serviceRegistry) {
    rtm = new RtmClient(token, { logLevel: slacklogLevel });
    nlp = nlpClient;
    registry = serviceRegistry;
    addAuthenticatedHandler(rtm, handleOnAuthenticated);
    rtm.on('message', handleOnMessage);

    return rtm;
};

module.exports.addAuthenicatedHanler = addAuthenticatedHandler;