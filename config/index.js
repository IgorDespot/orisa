require('dotenv').config();

module.exports = {
    witToken: process.env.WIT_TOKEN,
    slackToken: process.env.SLACK_TOKEN,
    slackLogLevel: 'info',
    serviceTimeout: 30
};