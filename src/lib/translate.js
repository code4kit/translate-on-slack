'use strict';

/**
 * @fileOverview translate.js
 *
 * @author Motone Adachi (@waritocomatta)
 * @version 1.0.0
 */

const request = require('requestretry');

/**
 * by https://cloud.google.com/translate/docs/languages
 * @type {string[]}
 */
const LANGS = ['af', 'sq', 'am', 'ar', 'hy', 'az', 'eu', 'be', 'bn', 'bs', 'bg', 'ca', 'ceb', 'zh-CN', 'zh-TW', 'co', 'hr', 'cs', 'da', 'nl', 'en', 'eo', 'et', 'fi', 'fr', 'fy', 'gl', 'ka', 'de', 'el', 'gu', 'ht', 'ha', 'haw', 'he**', 'hi', 'hmn', 'hu', 'is', 'ig', 'id', 'ga', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'ko', 'ku', 'ky', 'lo', 'la', 'lv', 'lt', 'lb', 'mk', 'mg', 'ms', 'ml', 'mt', 'mi', 'mr', 'mn', 'my', 'ne', 'no', 'ny', 'ps', 'fa', 'pl', 'pt', 'pa', 'ro', 'ru', 'sm', 'gd', 'sr', 'st', 'sn', 'sd', 'si', 'sk', 'sl', 'so', 'es', 'su', 'sw', 'sv', 'tl', 'tg', 'ta', 'te', 'th', 'tr', 'uk', 'ur', 'uz', 'vi', 'cy', 'xh', 'yi', 'yo', 'zu', 'zh', 'iw'];

/**
 * translate
 * @param {string} lang
 * @param {string} msg
 * @param {string} callback
 */
module.exports = (msg, lang, callback) => {
  if (LANGS.indexOf(lang) === -1 || msg === '') {
    console.error('Illegal args by translate.js');
    return;
  }
  request({
    url: `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&hl=en-US&dt=t&dt=bd&dj=1&source=icon&q=${encodeURIComponent(msg)}`,
    headers: {
      'Referer': 'https://example.com/',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.172 Safari/537.36'
    }
  }).then(res => {
    if (res.statusCode !== 200) {
      return;
    }
    callback(JSON.parse(res.body));
  }).catch(err => {
    console.error('API requesting error.', err);
  });
};
