// https://www.npmjs.com/package/request
// npm install request --save
var request = require('request');

// importing all sensitive stuff from config.js
var config = require('./config.js');

var slackOptions = {

    url: 'https://slack.com/api/conversations.history?token=' + config.slackApi_token + '&channel=' + config.slackJsChannel + '&pretty=1',

    headers: {
        'User-Agent': 'request'
    }
};

function scrapeSlackLinks(error, response, body) {
    console.log(slackOptions.url);
  if (!error && response.statusCode == 200) {
    var info = JSON.parse(body);
    var filter = [];
    for (var i = 0; i < info.messages.length; i++){
        if(info.messages[i].attachments){
            if(!info.messages[i].hasOwnProperty('subtype') && info.messages[i].attachments[0].hasOwnProperty('title')){
                var origLink = '<li style=\'border:1px solid; margin: 10px 0 10px 0; padding: 10px;\'><p>' + info.messages[i].attachments[0].text + '<\/p><a href=\'' + info.messages[i].attachments[0].original_url + '\' target=\'_blank\'>' + info.messages[i].attachments[0].title + '<\/a><\/li>'
                var cleanLink = origLink.replace(/\//g, "\\/");
                filter.push(cleanLink);
            }
        }   
    }
    sendToMailChimp(filter);
  }
}

function sendToMailChimp(filter) {
    var filterToString = filter.toString();
    var cleanFilter = filterToString.replace(/,/g, "");
    var links = "{\n\t\"html\": \"<h1>Links from the last week in the JavaScript Slack channel<\/h1><ul style=\'list-style: none;\'>" + cleanFilter + "</ul>\"\n}"
    
    // Only classic templates in MailChimp work with the API
    var mailChimpOptions = {
        url: 'https://' + config.mailChimpApiKey + '.api.mailchimp.com/3.0/templates/' + config.mailChimpTemplateKey,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': config.mailChimpAuth,
            'Cache-Control': 'no-cache'
        },
        body: links
    };
    
    //console.log(cleanFilter);
    request.patch(mailChimpOptions, results)
}

function results(error, response, body) {
    console.log(error);
    console.log(response);
    console.log(body);    
}

request(slackOptions, scrapeSlackLinks);