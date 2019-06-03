'use strict';

/**
 * @fileOverview translate.js
 *
 * @author Motone Adachi (@waritocomatta)
 * @version 1.0.0
 */

const path = require('path');
const fs = require('fs-extra');

/**
 * @type {string}
 */
const SETTING_JSON = path.resolve(__dirname, '..', '..', 'reaction2lang.json');

/**
 * @type {string<string>}
 */
let reaction2lang = JSON.parse(fs.readFileSync(SETTING_JSON).toString());

/**
 * @type {boolean}
 */
let editing = false;

/**
 * @type {string<string>}
 */
let memo = {};

/**
 * update for reaction to lang.
 * @param {string} reaction
 * @param {string} lang
 */
const update = (reaction, lang) => {
  if (!editing) {
    editing = true;
    memo = {};
  }
  memo[reaction] = lang;
};

const save = () => {
  reaction2lang = memo;
  fs.writeFileSync(SETTING_JSON, JSON.stringify(memo));
  editing = false;
};

const load = () => {
  return reaction2lang;
};

module.exports = {
  update: update,
  save: save,
  load: load
};
