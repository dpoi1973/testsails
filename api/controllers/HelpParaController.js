'use strict'
var Redis = require('ioredis');
const redisconnstr = sails.config.redisurl;
var redis = new Redis(redisconnstr);

module.exports = {
  getParaValue: function (req, res) {
    const params = req.params;


    redis.hget(params, [v.ID, v.disValue]);
    params
  }
}
