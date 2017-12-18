'use strict'
var request = require('request');
const amqp = require('amqplib');
const JSFtp = require('jsftp');
const fs = require('fs');

module.exports = {
  getWhereCondition: function (condition) {
    let tmp = {};
    let allcond = [];
    if (!condition) {
      condition = {};
    }
    Object.keys(condition).forEach(v => {
      //if(condition[v]) 不为空和方加，否则不用处理
      if (v.startsWith('or')) {
        var orconditon = {};
        orconditon[v.replace('or', '')] = { 'contains': condition[v] };
        allcond.push(orconditon);
      }
      else {


        if (_.isNumber(condition[v]) && condition[v] !== -1) {
          Object.assign(tmp, {
              [v]: condition[v]
            });
        } else if (_.isString(condition[v]) && condition[v] !== '') {
          if (_.startsWith(v, 'equal')) {
            Object.assign(tmp, {
              [v.replace('equal', '')]: condition[v]
            });
          }
          else {
            Object.assign(tmp, {
              [v]: { 'contains': condition[v] }
            });
          }

        } else if (_.isObject(condition[v]) && _.startsWith(v, 'node_')) {
          //datetime
          if (!condition[v]['nodea'])
            condition[v]['nodea'] = 0;
          if (!condition[v]['nodeb'])
            condition[v]['nodeb'] = 7;



          // if (_.isDate(new Date(condition[v]['startdate'])) === false)
          //     condition[v]['startdate'] = '2016-01-01';
          // if (_.isDate(new Date(condition[v]['enddate'])) === false)
          //     condition[v]['enddate'] = _.now();

          Object.assign(tmp, {
            [v.replace('node_', '')]: { '>=': condition[v]['nodea'], '<=': condition[v]['nodeb'] }
          });

        }
        else if (_.isObject(condition[v]) && _.has(condition[v], 'startdate') && _.has(condition[v], 'enddate')) {
          //datetime
          if (_.isString(condition[v].startdate) && condition[v].startdate === '')
            condition[v]['startdate'] = '2016-01-01';
          if (_.isString(condition[v].enddate) && condition[v].enddate === '')
            condition[v]['enddate'] = _.now();



          // if (_.isDate(new Date(condition[v]['startdate'])) === false)
          //     condition[v]['startdate'] = '2016-01-01';
          // if (_.isDate(new Date(condition[v]['enddate'])) === false)
          //     condition[v]['enddate'] = _.now();

          Object.assign(tmp, {
            [v]: { '>': new Date(condition[v]['startdate']), '<': new Date(condition[v]['enddate']) }
          });

        }
      }


    });
    if (allcond.length > 0) {

      console.log(tmp);
      var all = { or: allcond };
      if (judgeEmpty(tmp)) {
        Object.assign(all, tmp);
      }
      return all;
    }
    else {
      console.log(tmp);
      return tmp;
    }



  },
  reponseMessage: function (statusType, msg) {

    if (this.resStatusType[statusType] == undefined)
      statusType = 'Error';

    return { status: this.resStatusType[statusType], message: msg }

  },
  resStatusType: { OK: 'OK', Error: 'Error', Warning: 'Warning' },
  errResponseJson: function (err, res) {
    res.json(utilsService.reponseMessage('Error', err.message));

  },
  getQtybyUnit: function (pcs, convertunit, netweight) {
    //重量
    //pcs
    //体积
    var result = 0;
    var re = new RegExp("\\[(\\d*)\\]");
    var modelval = convertunit.match(re);
    if (modelval) {
      convertunit = modelval[1];
    }
    if (convertunit == '000' || convertunit == "") {
      return 0;
    }


    if (convertunit != null) {
      switch (convertunit.trim()) {
        case "035":
          result = netweight;
          break;
        case "054":
          result = pcs / 1000;
          break;
        case "007":
          result = pcs;
          break;
        case "001":
          result = pcs;
          break;
        case "017":
          result = pcs;
          break;
        case "015":
          result = pcs;
          break;
        case "019":
          result = pcs;
          break;
        case "036":
          result = netweight * 1000;
          break;
        case "011":
          result = pcs;
          break;
        case "012":
          result = pcs;
          break;
        case "016":
          result = pcs;
          break;
        case "006":
          result = pcs;
          break;
        case "025":
          result = pcs;
          break;
        case "041":
          result = pcs / 100;
          break;
        case "095":
          if (hscode.startsWith("27101999"))
            result = netweight * 1.015;
          else
            result = pcs;
          //  result = netweight * 1.126m;

          break;
        default:
          if (convertunit === '')
            result = 0;
          else
            result = pcs;
          break;
      }
    }
    return result;

  },

  groupBy: function (sourcelist, groupargs) {
    var groupkey = groupargs.join(',');
    var gouplist = [];
    sourcelist.forEach(sor => {
      sor[groupkey] = '';
      groupargs.forEach(gr => {
        if (sor[gr]) {
          sor[groupkey] += sor[gr];
        }
        else {
          sor[groupkey] += 'empty';
        }
      })
      var keylist = [];
      for (var key in gouplist) {
        keylist.push(key);
      }
      if (keylist.indexOf(sor[groupkey]) == -1) {
        gouplist[sor[groupkey]] = [];
        gouplist[sor[groupkey]].push(sor);
      }
      else {
        gouplist[sor[groupkey]].push(sor);
      }
    })
    var result = [];
    for (var key in gouplist) {
      result.push(gouplist[key]);
    }
    return result;
  },
  getmainmaterial: function (str, para) {
    // var re = /(MAIN|LINING|SOLE|UPPER|OTHER|COMP|) {0,}(\d{1,3}%) {0,}(.+?)(?=\n|(MAIN|SOLE|LINING|UPPER|OTHER|COMP|$|\d{1,3}))/g;
    var re = /((COMP) {0,}(\d{0,3}%{0,1}) {0,}(\D+?)(?=\n|(COMP|$|\d{1,3}))|(COMP) {0,}(\d{0,3}%{0,1}) {0,}(\D+?)(?=\n|(COMP|$|\d{1,3})))|((MAIN|LINING|SOLE|UPPER|OTHER) {0,}(\d{1,3}%) {0,}(.+?)(?=\n|(MAIN|SOLE|LINING|UPPER|OTHER|COMP|$|\d{1,3})))/g;
    var array = []; var r;
    while ((r = re.exec(str)) != null) {
      var temp = {};

      temp.a = r[1]; temp.b = r[2]; temp.c = para[r[3].trim()];
      if (temp.a.trim() == 'COMP') {
        array.push(temp.c);
        break;
      }
      if (temp.a.trim() == 'MAIN') {
        array.push(temp.c);
        break;
      }
      if (temp.a.trim() != 'LINING') {
        array.push(temp.b + temp.c);
      }
    }
    var result = array.length > 0 ? array[0] : '';
    return result;
  },

  judgeconfirm: function (productcopy) {
    if (productcopy.Cspec.indexOf('未归类') != -1 || productcopy.Cspec.indexOf('undefined') != -1) {
      return false;
    }
    else {
      return true;
    }
  },


  getUnit: function () {
    return new Promise((resolve, reject) => {
      HelpPara.query('SELECT UNIT_CODE ,UNIT_NAME  FROM UNIT', [], function (err, results) {
        if (err)
          return reject(err);
        else
          return resolve(results);

      });
    });
  },

  "freeEdino_server": function (COP_NO, EDI_NO, username) {
    return new Promise((resolve, reject) => {
      if (process.env.NODE_ENV == "development") {
        return resolve('test');
      }
      else {
        request.get({ url: 'http://192.168.0.70:8001/api/freeformdata?username=' + username + '&COP_NO=' + COP_NO + '&EDI_NO=' + EDI_NO },
          function (err, httpResponse, body) {
            if (err) {
              return reject(err);
            }
            else {
              return resolve(body);
            }
          })
      }
    });
  },
  "getinitYwNoremote": function () {
    return new Promise((resolve, reject) => {
      if (process.env.NODE_ENV == "development11") {
        var a = Math.random();
        var ywno = 'YW201804QGWGQ00' + parseInt(a * 10000);
        return resolve(ywno);
      }
      else {
        request.get({ url: encodeURI(sails.config.remoteapi + '/api/Ywinfo/getinitYwNoremote') },
          function (err, httpResponse, body) {
            if (err) {
              return reject(err);
            }
            else {
              return resolve(body);
            }
          })
      }

    })
  },

  "sycroYwno": function (ywno, CustYwno, user) {
    var empname = user.empinfo.Empname;
    var empid = user.empinfo.Empid;
    return new Promise((resolve, reject) => {
      if (process.env.NODE_ENV == "development1") {
        return resolve("success");
      }
      else {
        request.get({ url: encodeURI(sails.config.remoteapi + '/api/Ywinfo/allowcateYwNoremote?ywno=' + ywno + '&CustYwno=' + CustYwno + '&empname=' + empname + '&empid=' + empid) },
          function (err, httpResponse, body) {
            if (body == "success") {
              return resolve(body);
            }
            else {
              return reject(body);
            }
          })
      }

    })
  },

  sum: function (sourcelist, arg) {
    var slen = sourcelist.length;
    var amount = 0;
    while (slen--) {
      amount += Number(sourcelist[slen][arg]);
    }
    return amount.toFixed(5);
  },

  sendqueue: function (qName, data) {
    return new Promise(function (resolve, reject) {
      const open = amqp.connect("amqp://192.168.0.251");
      open.then((conn) => {
        conn.createChannel().then(ch => {
          ch.assertQueue(qName, { durable: true })
            .then(ok => {
              return ch.sendToQueue(qName, new Buffer(JSON.stringify(data)));
            })
            .then(ok => {
              resolve(ok);
            }).catch((e) => {
              reject(e);
            });
        })
      })
    })
  },

  ftpupload: function (filepath, filename) {
    var ftpconfig = {
      host: '192.168.0.214',
      port: 21,
      user: 'yhf',
      pass: '123456'
    }
    var currtime = Date.parse(new Date());
    const ftp = new JSFtp(ftpconfig);
    var ftppath = "zara/" + currtime + '/' + filename;
    return new Promise((resolve, reject) => {
      ftp.raw("mkd", "/zara", function (er, data) {
        ftp.raw("mkd", "/zara/" + currtime, function (er, data) {
          ftp.put(filepath, '/' + ftppath, (err) => {
            if (err) {
              console.log(err);
              ftp.raw.quit(function (erro, data) {
                reject(err);
              });
            }
            else {
              ftp.raw('quit', function (erro, data) {
                resolve(ftppath);
              });
            }
          });
        })
      });
    });


  },

  ftpdelete: function (filepath) {
    var ftpconfig = {
      host: '192.168.0.214',
      port: 21,
      user: 'yhf',
      pass: '123456'
    }
    const ftp = new JSFtp(ftpconfig);
    return new Promise((resolve, reject) => {
      ftp.raw('dele', '/' + filepath, function (err, data) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log('删除成功')
          resolve(data);
        }
      });
    });


  },

  yglftpupload: function (filepath, filename, company, filetype, sku) {
    var ftpconfig = {
      host: '192.168.0.214',
      port: 21,
      user: 'yhf',
      pass: '123456'
    }
    var currtime = Date.parse(new Date());
    const ftp = new JSFtp(ftpconfig);
    var obj = {
      upload_company: '企业归档',
      contract_archive: '数据归档'
    }
    for (var key in obj) {
      if (obj[key] == filetype) {
        filetype = key;
      }
    }
    var ftppath = '';
    if (sku != '') {
      ftppath = "ygl/" + company + '/' + filetype + '/' + sku + '/' + currtime + filename;
    } else {
      ftppath = "ygl/" + company + '/' + filetype + '/' + currtime + filename;
    }
    return new Promise((resolve, reject) => {
      ftp.raw("mkd", "/ygl", function (er, data) {
        ftp.raw("mkd", "/ygl/" + company, function (er, data) {
          ftp.raw("mkd", "/ygl/" + company + '/' + filetype, function (er, data) {
            if (sku != '') {
              ftp.raw("mkd", "/ygl/" + company + '/' + filetype + '/' + sku, function (er, data) {
                ftp.put(filepath, '/' + ftppath, (err) => {
                  if (err) {
                    console.log(err);
                    ftp.raw.quit(function (erro, data) {
                      reject(err);
                    });
                  }
                  else {
                    ftp.raw('quit', function (erro, data) {
                      resolve(ftppath);
                    });
                  }
                });
              })
            } else {
              ftp.put(filepath, '/' + ftppath, (err) => {
                if (err) {
                  console.log(err);
                  ftp.raw.quit(function (erro, data) {
                    reject(err);
                  });
                }
                else {
                  ftp.raw('quit', function (erro, data) {
                    resolve(ftppath);
                  });
                }
              });
            }
          })
        });
      });
    });


  },

  huiyuftpupload: function (filepath, filename) {
    var ftpconfig = {
      host: '192.168.0.214',
      port: 21,
      user: 'yhf',
      pass: '123456'
    }
    var currtime = Date.parse(new Date());
    const ftp = new JSFtp(ftpconfig);
    var ftppath = "huiyu/" + currtime + '/' + filename;
    return new Promise((resolve, reject) => {
      ftp.raw("mkd", "/huiyu", function (er, data) {
        ftp.raw("mkd", "/huiyu/" + currtime, function (er, data) {
          ftp.put(filepath, '/' + ftppath, (err) => {
            if (err) {
              console.log(err);
              ftp.raw.quit(function (erro, data) {
                reject(err);
              });
            }
            else {
              ftp.raw('quit', function (erro, data) {
                resolve(ftppath);
              });
            }
          });
        })
      });
    });


  },


  huiyudownload: function (filepath) {
    var ftpconfig = {
      host: '192.168.0.214',
      port: 21,
      user: 'yhf',
      pass: '123456'
    }
    var currtime = Date.parse(new Date());
    const ftp = new JSFtp(ftpconfig);
    return new Promise((resolve, reject) => {
      // ftp.get(filepath, (err, socket) => {
      //   if (err) {
      //     console.log(err);
      //     ftp.raw.quit(function (erro, data) {
      //       reject(err);
      //     });
      //   }
      //   else {
      // var str = '';
      // socket.on("data", function(d) { str += d.toString(); })
      // socket.on("close", function(hadErr) {
      //   if (hadErr)
      // console.error('There was an error retrieving the file.');
      // ftp.raw('quit', function (erro, data) {
      //   resolve(str);
      // });
      // });
      // socket.resume();
      //   }
      // });
      ftp.get(filepath, 'huiyu.pdf', (err) => {
        if (err) {
          console.log(err);
          ftp.raw.quit(function (erro, data) {
            reject(err);
          });
        }
        else {
          ftp.raw('quit', function (erro, data) {
            const stream = fs.createReadStream('huiyu.pdf');
            resolve(stream);
          });
        }
      });
    });
  },



  ygldownload: function (filepath, filename) {
    var ftpconfig = {
      host: '192.168.0.214',
      port: 21,
      user: 'yhf',
      pass: '123456'
    }
    var currtime = Date.parse(new Date());
    const ftp = new JSFtp(ftpconfig);
    return new Promise((resolve, reject) => {
      ftp.get(filepath, filename, (err) => {
        if (err) {
          console.log(err);
          ftp.raw.quit(function (erro, data) {
            reject(err);
          });
        }
        else {
          ftp.raw('quit', function (erro, data) {
            const stream = fs.createReadStream(filename);
            resolve(stream);
            fs.unlinkSync(filename);
          });
        }
      });
    })
  }

}


function judgeEmpty(obj) {
  for (var i in obj) {
    return true;
  }
  return false;
}