/**
 * FormHeadController
 *
 * @description :: Server-side logic for managing FormHeades
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict'

var Redis = require('ioredis');
const redisconnstr = sails.config.redisurl;
// var edi = require('edino-lib')

const redis = new Redis(redisconnstr);
const rediskeyvalue = {
  'traf_mode': 'transf',
  'trade_mode': 'trade',
  'cut_mode': 'levymode',
  'pay_way': 'lc_type',
  'trade_country': 'country',
  "distinate_port": "port",
  "district_code": "district",
  "trans_mode": "transac",
  "fee_mark": "fee_mark",
  "fee_curr": "curr",
  "insur_mark": "insur_mark",
  "insur_curr": "curr",
  "other_mark": "other_mark",
  "other_curr": "curr",
  "wrap_type": "wrap_type",
  "is_status": "",
  "i_e_port": "customs",
  "TRADE_AREA_CODE": "country",
  "DECL_PORT": "customs",
  "g_unit": "unit",
  "trade_curr": "curr",

  "unit_1": "unit",
  "use_to": "use_to",
  "origin_country": "country",

  "unit_2": "unit",
  "duty_mode": "levymode",
  "DESTINATION_COUNTRY": "country"
}

module.exports = {
  searchby: function (req, res) {
    let condition = req.body;
    let whereObj = utilsService.getWhereCondition(condition.condition);
    var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
    FormHead.count({ where: whereObj }).then(function (resultcount) {
      responseresult.totalCount = resultcount;

      return FormHead.find({
        where: whereObj,
        skip: (condition.pageIndex - 1) * condition.pageSize,
        limit: condition.pageSize,
        sort: condition.sortby ? condition.sortby : 'pre_entry_id ASC'
      });
    })
      .then(function (results) {
        responseresult.status = 'OK';
        responseresult.datas = results;
        res.json(responseresult);
      })
      .error(function (er) {
        res.json({ status: 'error', err: er.message });
      });
  },
  validate: function (req, res) {
    var id = req.param('id');
    var value = req.param('value');
    redis.hget(id, value)
      .then(v => {
        res.json(v);
      })
      .catch(err => {
        res.json(true);

      })
  },

  findOne: function (req, res) {
    // var id=req.id;
    FormHead.findOne({ id: req.param('id') })
      .populate(['formlist'])
      .populate(['Cert_List'])
      
      .populate(['ywid'])
      .then(data => {
        return res.json(data);

      })
      .catch(err => {
        return res.err(err);
      })

  },
  searchby1: function (req, res) {

    var preEntryId = req.query.preEntryId;

    FormHead.findOne({ preEntryId: preEntryId })
      .then(updaterecord => {
        //console.log(updaterecord);
        res.json(updaterecord)
      })
      .error(er => {
        res.json({ status: 'error', err: er.message });
      });
  },
  destroy: function (req, res) {
    FormHead.findOne({ id: req.param('id') })
      .then(record => {
        if (record.EDI_NO) {
          utilsService.freeEdino_server(record.COP_NO, record.EDI_NO, record.username).then(data => {
            FormHead.destroy({ id: req.param('id') })
              .then((updaterecord) => {
                var ids = updaterecord.map(function (form) { return form.id; });
                FormList.destroy({ parentid: ids }).exec(function (err, fls) {
                  res.json(fls)
                });
              })
              .error(er => {
                res.json({ status: 'error', err: er.message });
              });
          }).catch((err) => {
            res.json({ status: 'error', 'err': err });
          });
        }
        else {
          FormHead.destroy({ id: req.param('id') })
            .then(updaterecord => {
              //console.log(updaterecord);
              res.json(updaterecord)
            })
            .error(er => {
              res.json({ status: 'error', err: er.message });
            });
        }
      })
      .error(er => {
        res.json({ status: 'error', err: er.message });
      });


  },
  send: function (req, res) {
    FormHead.findOne({ id: req.param('id') })
      .then(record => {
        sendformheadtoqueue(record.COP_NO, function (err) {
          res.json('ok');
        })
      })
  }

};

function sendformheadtoqueue(COP_NO) {
  return new Promise((resolve, reject) => {
    request.get({ url: sails.config.remoteapi + '/api/FormHead/sendformtoqueue?COP_NO=' + COP_NO },
      function (err, httpResponse, body) {
        if (err) {
          return reject(err);
        }
        else {
          return resolve(body);
        }
      })
  })
}



function sendformhead(form, username, callback) {
  request({
    url: 'http://192.168.0.70:8001/api/updateFormhead',
    method: "POST",
    json: form
  }, function (err, httpResponse, body) {
    // request.get({ url: 'http://192.168.0.70:8001/api/getFormhead?username=' + username },
    //   function (err, httpResponse, body) {
    //     callback("");
    //   })
  })
}