'use strict';

const _ = require('lodash');
const _super = require('sails-permissions/api/models/User');

_.merge(exports, _super);
_.merge(exports, {
  attributes: {
    empid: {
      model: 'EmpInfo',
      unique:true
    }
  }
});