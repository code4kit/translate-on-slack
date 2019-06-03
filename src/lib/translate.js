'use strict';

/**
 * @fileOverview translate.js
 *
 * @author Motone Adachi (@waritocomatta)
 * @version 1.0.0
 */

const request = require('requestretry');

/**
 * @type {string[]}
 */
const LANGS = ['en', 'ja', 'km', 'de', 'fr', 'es', 'ru', 'sw', 'zh-CN', 'zh-TW', 'ko'];

/**
 * translate
 * @param lang {'en'|'ja'|'km'}
 * @param msg {string}
 * @param callback {function}
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
