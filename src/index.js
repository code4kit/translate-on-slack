'use strict';

/**
 * @fileOverview index.js
 *
 * @author Motone Adachi (@waritocomatta)
 * @version 1.0.0
 */

require('dotenv').config();
const { RTMClient, WebClient } = require('@slack/client');
const translate = require('./lib/translate');
const http = require('http');

const rtmClient = new RTMClient(process.env.TOKEN);
const webClient = new WebClient(process.env.TOKEN);

/**
 * Reaction to Lang for func of 'translate'.
 * @type {string<string>}
 */
const reactionToLang = {
  'gb': 'en',
  'flag-gb': 'en',
  'jp': 'ja',
  'flag-jp': 'ja',
  'flag-kh': 'km'
};

rtmClient.on('message', event => {
  if (!('text' in event)) {
    return;
  }
  if (!event.text.match(/^:.+:.+/)) {
    return;
  }
  const reaction = event.text.split(':')[1];
  if (!(reaction in reactionToLang)) {
    return;
  }
  translate(event.text.replace(`:${reaction}:`, '').trim(), reactionToLang[reaction], translated => {
    transToThread(event.channel, translated, event.ts);
  });
});

rtmClient.on('reaction_added', event => {
  (async () => {
    const msgWithReaction = await webClient.channels.history({
      channel: event.item.channel,
      latest: event.item.ts,
      oldest: event.item.ts,
      inclusive: true,
      count: 1
    });
    if (!('text' in msgWithReaction.messages[0])) {
      return;
    }
    if (!(event.reaction in reactionToLang)) {
      return;
    }
    if ('subtype' in msgWithReaction.messages[0]) {
      if (msgWithReaction.messages[0].subtype === 'bot_message' && 'attachments' in msgWithReaction.messages[0]) {
        if ('text' in msgWithReaction.messages[0].attachments[0]) {
          msgWithReaction.messages[0].text += msgWithReaction.messages[0].attachments[0].text;
        }
      }
    }
    translate(msgWithReaction.messages[0].text, reactionToLang[event.reaction], translated => {
      transToThread(event.item.channel, translated, event.item.ts);
    });
  })();
});
rtmClient.start();

/**
 * trans to thread.
 * @param {string} ch
 * @param {object} trans
 * @param {string} ts
 * @see replyToThread
 */
const transToThread = (ch, trans, ts) => {
  replyToThread(
    ch,
    trans.sentences[0].trans,
    ts
  );
  replyToThread(
    ch,
    `\`\`\`AUTO JUDGMENT: ${trans.src}\n\n${trans.sentences[0].trans}\`\`\``,
    ts
  );
};

/**
 * reply to thread.
 * @param {string} ch
 * @param {string} msg
 * @param {string} ts
 */
const replyToThread = (ch, msg, ts) => {
  webClient.chat.postMessage({
    channel: ch,
    text: msg,
    thread_ts: ts,
    username: 'translate by google',
    icon_emoji: ':globe_with_meridians:'
  });
};

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('Translate on Slack');
  res.end();
}).listen(process.env.PORT, '0.0.0.0', () => console.log(`Server running at ${process.env.PORT}`));
