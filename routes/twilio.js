let secretToken = require('./secretToken');
let twilio = require('twilio');
let client = new twilio(secretToken.accountSid, secretToken.authToken);

function messageChef(order) {
  client.messages.create({
      body: order,
      to: '+15194369581',
      from: '+15146127315'
  });
}

messageChef("Hey there world!");
