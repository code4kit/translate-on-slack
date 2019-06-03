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
const reaction2lang = require('./lib/reaction2lang');
const http = require('http');

const rtmClient = new RTMClient(process.env.TOKEN);
const webClient = new WebClient(process.env.TOKEN);

/**
 * by https://cloud.google.com/translate/docs/languages
 * @type {string[]}
 */
const LANGS = ['af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'zh-CN', 'zh-TW', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'he**', 'hi', 'hmn', 'hu', 'is', 'ig', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'ko', 'ku', 'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'ny', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tl', 'tg', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu', 'zh', 'iw'];

if (!process.env.ICON_EMOJI) {
  process.env.ICON_EMOJI = 'globe_with_meridians';
} else if (process.env.ICON_EMOJI === '') {
  process.env.ICON_EMOJI = 'globe_with_meridians';
}

/**
 * Reaction to Lang for func of 'translate'.
 * @type {string<string>}
 */
let reactionToLang = reaction2lang.load();

rtmClient.on('message', event => {
  // is there text?
  if (!('text' in event)) {
    return;
  }

  // setting
  if (event.text.indexOf(`:${process.env.ICON_EMOJI}:`) === 0 && event.text.indexOf('\n') !== -1) {
    const lines = event.text.split('\n');
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].match(/^:.+:.+/)) {
        continue;
      }
      const reactionForSetting = lines[i].split(':')[1];
      const langForSetting = lines[i].replace(`:${reactionForSetting}:`, '').replace(/ /g, '');
      if (LANGS.indexOf(langForSetting) === -1) {
        continue;
      }
      reaction2lang.update(reactionForSetting, langForSetting);
    }
    reaction2lang.save();
    reactionToLang = reaction2lang.load();
    webClient.chat.postMessage({
      channel: event.channel,
      text: `<!here> Updated setting by <@${event.user}>`,
      username: process.env.USERNAME,
      icon_emoji: process.env.ICON_EMOJI
    });
    return;
  }

  // is top reaction?
  if (!event.text.match(/^:.+:.+/)) {
    return;
  }

  const reaction = event.text.split(':')[1];

  // show setting
  if (reaction === process.env.ICON_EMOJI && event.text.match(/setting/i)) {
    let replyMsg = '[SETTING]';
    for (const reaction in reactionToLang) {
      replyMsg += `\n:${reaction}: ${reactionToLang[reaction]}`;
    }
    replyToThread(event.channel, replyMsg, event.ts);
    return;
  }

  // show help
  if (reaction === process.env.ICON_EMOJI && event.text.match(/help/i)) {
    replyToThread(event.channel, 'https://github.com/code4kit/translate-on-slack', event.ts);
    return;
  }

  // is there this reaction?
  if (!(reaction in reactionToLang)) {
    return;
  }

  // reply translate to channel.
  translate(event.text.replace(`:${reaction}:`, '').trim(), reactionToLang[reaction], translated => {
    transToThread(event.channel, translated, event.ts);
  });
});

rtmClient.on('reaction_added', event => {
  (async () => {
    const reactionResult = await webClient.channels.history({
      channel: event.item.channel,
      latest: event.item.ts,
      oldest: event.item.ts,
      inclusive: true,
      count: 1
    });
    const reactionMsg = reactionResult.messages[0];
    if (!('text' in reactionMsg)) {
      return;
    }
    if (!(event.reaction in reactionToLang)) {
      return;
    }
    if (reactionMsg.text === '' && 'attachments' in reactionMsg) {
      if ('text' in reactionMsg.attachments[0]) {
        reactionMsg.text += reactionMsg.attachments[0].text;
      }
    }
    translate(reactionMsg.text, reactionToLang[event.reaction], translated => {
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
    username: process.env.USERNAME,
    icon_emoji: `:${process.env.ICON_EMOJI}:`
  });
};

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('Translate on Slack');
  res.end();
}).listen(process.env.PORT, '0.0.0.0', () => console.log(`Server running at ${process.env.PORT}`));
