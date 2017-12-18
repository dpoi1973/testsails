/**
 * CheckInOutInfoController
 *
 * @description :: Server-side logic for managing Checkinoutinfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict'
module.exports = {
  searchby: function (req, res) {
    //     // var tt = [{ typename: '适用机型', values: 'DL360' }]
    //     CustClassifyProductInfo.find()
    //         .then(function(values) {

    let condition = req.body;
    var responseresult = { status: '', totalCount: 0, pageIndex: condition.pageIndex, pageSize: condition.pageSize, datas: [] };
    //console.log(condition.pageIndex);

    let whereObj = utilsService.getWhereCondition(condition.condition);

    console.log(whereObj);
    // if (condition.condition.custid) {
    //   whereObj.custid = condition.condition.custid;
    // }
    CustClassifyProductInfo.count({ where: whereObj }).then(function (resultcount) {
      responseresult.totalCount = resultcount;
      //         })
      //         .catch(err => res.json({ status: 'error', err: err.message }));
      // }
      return CustClassifyProductInfo.find({
        where: whereObj,
        skip: (condition.pageIndex - 1) * condition.pageSize,
        limit: condition.pageSize,
        sort: condition.sortby ? condition.sortby : 'R2Distinct DESC'
      }).populate('custid', {
        select: ['id', 'custname'],
        where: {},
      });
      //       .populate('ClassifiedProductid');
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
  updatemodel: function (req, res) {
    //var id = req.param[id];


    var updatejson = req.body;
    if (!updatejson.id) {
      CustClassifyProductInfo.create(updatejson)
        .then(updaterecord => {

          res.json({ status: 'OK', resultdata: updaterecord })
        })
        .error(er => {
          res.json({ status: 'error', err: er.message });
        });
    } else {
      CustClassifyProductInfo.update({ id: updatejson.id }, updatejson)
        .then(updaterecord => {

          res.json({ status: 'OK', resultdata: updaterecord })
        })
        .error(er => {
          res.json({ status: 'error', err: er.message });
        });
    }
  },
  deletemodel: function (req, res) {
    var deleteids = req.body;
    CustClassifyProductInfo.destroy({
      id: deleteids
    }).exec(function (err, datadelete) {
      if (err) {
        res.json({ status: 'Error', err: err.message });

      } else {

        res.json({
          status: 'OK',

          resultdata: datadelete
        });
      }
    })
  },
  detailaddvendor: function (req, res) {

    //where: { SKU: '858252-001' }
    CustClassifyProductInfo.find({ where: { HScode: '84733090', custid: 751 } }).then(custlist => {
      async.each(custlist, function (detail, cb) {
        if (detail.tempJson) {
          if (detail.tempJson["品牌"].indexOf('[Vendor]') == -1) {
            if (isArray(detail.tempJson["品牌"])) {
              detail.tempJson["品牌"].push('[Vendor]');
            }
            else {
              detail.tempJson["品牌"] = '[Vendor]';
            }
            detail.save(err => {
              if (err) {
                cb(err);
              }
            });
          }

        }

      }, function (err) {
        if (err)
          res.json(err);
        else
          res.json('ok');
      });
    })
  },
  fillprodetail: function (req, res) {
    var hsid = req.query.id;
    //where: { SKU: '858252-001' }  , ClassifiedProductid: 0
    CustClassifyProductInfo.findOne({ id: hsid, Status: '完成' }).then(hsinfo => {
      if (hsinfo) {
        CustProductDetailInfo.find({ where: { Cgoodsname: hsinfo.Cgoodsname, HScode: hsinfo.HScode, custid: hsinfo.custid } }).then(prolist => {
          async.each(prolist, function (detail, cb) {
            detail.ClassifiedProductid = hsid;
            detail.Cspec = hsinfo.Cspec;
            detail.pracGoodsname = hsinfo.pracGoodsname;
            detail.save(err => {
              cb(err);
            });
          }, function (err) {
            if (err)
              res.json(err);
            else
              res.json('ok');
          });
        })
      }
      else {
        res.json('状态未完成');
      }

    })
  },
  fillallprodetail: function (req, res) {
    CustClassifyProductInfo.find({}).then(hslist => {
      console.log(hslist);
      async.each(hslist, function (hsinfo, cbt) {
        // , ClassifiedProductid: 0 
        CustProductDetailInfo.find({ where: { Cgoodsname: hsinfo.Cgoodsname, HScode: hsinfo.HScode, custid: hsinfo.custid } }).then(prolist => {
          async.each(prolist, function (detail, cb) {
            detail.ClassifiedProductid = hsinfo.id;
            detail.Cspec = hsinfo.Cspec;
            detail.pracGoodsname = hsinfo.pracGoodsname;
            detail.save(err => {
              cb(err);
            });
          }, function (err) {
            cbt(err);
          });
        })
      }, function (err) {
        if (err)
          res.json(err);
        else
          res.json('ok');
      })

    })
  },
  copyHsconfig: function (req, res) {
    var hsid = req.query.id;
    //where: { SKU: '858252-001' }
    CustClassifyProductInfo.findOne({ id: hsid }).then(hsinfo => {
      CustClassifyProductInfo.find({ where: { R2Distinct: hsinfo.R2Distinct, custid: hsinfo.custid } }).then(hslist => {
        async.each(hslist, function (detail, cb) {
          detail.fakeCspec = hsinfo.fakeCspec;
          detail.Cspec = hsinfo.Cspec;
          detail.midDic = hsinfo.midDic;
          detail.pracGoodsname = hsinfo.pracGoodsname;
          detail.Status = '完成';
          detail.save(err => {
            cb(err);
          });
        }, function (err) {
          if (err)
            res.json(err);
          else
            res.json('ok');
        });
      })
    })
  }

  ,
  copyHsbysel: function (req, res) {
    var ids = req.body.ids;
    //where: { SKU: '858252-001' }
    CustClassifyProductInfo.find({ id: ids }).then(hsinfos => {

      var standard = {};
      hsinfos.forEach(function (hsinfo) {
        if (hsinfo.Cspec) {
          standard = hsinfo;
        }
      }, this);

      async.each(hsinfos, function (detail, cb) {
        detail.fakeCspec = standard.fakeCspec;
        detail.Cspec = standard.Cspec;
        detail.midDic = standard.midDic;
        detail.pracGoodsname = standard.pracGoodsname;
        detail.Status = '完成';
        detail.save(err => {
          cb(err);
        });
      }, function (err) {
        if (err)
          res.json(err);
        else
          res.json('ok');
      });
    })
  }

  ,
  fillHsinfos: function (req, res) {
    var ids = req.body.ids;
    //where: { SKU: '858252-001' }
    CustClassifyProductInfo.find({ id: ids }).then(hsinfos => {

      async.each(hsinfos, function (detail, cb) {
        ClassifyInfo.findOne({ HSCode: detail.HScode }).then(classify => {
          if (classify) {
            detail.R2Distinct = classify.R2Distinct;
            detail.cunit = classify.Unit1;
            detail.cunit1 = classify.Unit1;
            detail.cunit2 = classify.Unit2;
            valUnit(detail);
            detail.ControlMark = classify.ControlMark;
            var dist = classify.R2Distinct.split('|')
            var midDic = {};
            dist.forEach(function (dt) {
              midDic[dt] = dt;
            }, this);
            detail.midDic = midDic;
            detail.save(err => {
              cb(err);
            });
          }
        })
      }, function (err) {
        if (err)
          res.json(err);
        else
          res.json('ok');
      });
    })
  },
  // 补全全部单位
  fillallHsinfos: function (req, res) {
    CustClassifyProductInfo.find({}).then(hsinfos => {
      async.each(hsinfos, function (detail, cb) {
        ClassifyInfo.findOne({ HSCode: detail.HScode }).then(classify => {
          if (classify) {
            detail.R2Distinct = classify.R2Distinct;
            detail.cunit = classify.Unit1;
            detail.cunit1 = classify.Unit1;
            detail.cunit2 = classify.Unit2;
            valUnit(detail);
            detail.ControlMark = classify.ControlMark;
            var dist = classify.R2Distinct.split('|')
            var midDic = {};
            dist.forEach(function (dt) {
              midDic[dt] = dt;
            }, this);
            detail.midDic = midDic;
            detail.save(err => {
              cb(err);
            });
          }
          else{
            cb();
          }
        })
      }, function (err) {
        if (err)
          res.json(err);
        else
          res.json('ok');
      });
    })
  },
  fillpracname: function (req, res) {
    var custidz = req.query.id;
    CustInfo.findOne({ id: custidz }).then(custinfo => {
      if (custinfo) {
        CustClassifyProductInfo.find({ custid: custinfo.id }).then(hslist => {
          async.each(hslist, function (hsinfo, cbt) {
            ClassifyInfo.findOne({ HSCode: hsinfo.HScode }).then(classify => {
              if (classify && classify.namestruct && !fakegoodsname) {
                hsinfo.fakegoodsname = classify.namestruct;
                hsinfo.save(err => {
                  cbt(err);
                });
              }
              else {
                cbt(null)
              }

            })
          }, function (err) {
            if (err)
              res.json(err);
            else
              res.json('ok');
          })
        })
      }
      else {
        res.json('请选择客户');
      }
    })
  },
  fillfakegoodsname: function (req, res) {
    var custidz = req.query.id;
    CustInfo.findOne({ id: custidz }).then(custinfo => {
      if (custinfo) {
        CustClassifyProductInfo.find({ custid: custinfo.id }).then(hslist => {
          async.each(hslist, function (hsinfo, cbt) {
            if (hsinfo.fakegoodsname) {
              hsinfo.pracGoodsname = hsinfo.fakegoodsname.replace(/\[.*?\]/g, word => {
                var wj = word.replace('[', '').replace(']', '');
                if (custinfo.proinfoconfig[wj]) {
                  word = custinfo.proinfoconfig[wj];
                }
                return word;
              });
              hsinfo.save(err => {
                cbt(err);
              });
            }
            else {
              cbt(null)
            }
          }, function (err) {
            if (err)
              res.json(err);
            else
              res.json('ok');
          })
        })
      }
      else {
        res.json('请选择客户');
      }
    })
  },


  // 取classifyinfo namestruct Cspec 到CustClassifyProductInfo中 更新cspec和pracgoodsname 已存在就直接根据custinfo中config替换  补全cspec和prac
  fillallcspec: function (req, res) {
    var custidz = req.query.id;
    CustInfo.findOne({ id: custidz }).then(custinfo => {
      CustClassifyProductInfo.find({ custid: custinfo.id }).then(hslist => {
        async.each(hslist, function (hsinfo, cbt) {
          ClassifyInfo.findOne({ HSCode: hsinfo.HScode }).then(classify => {
            if (classify && classify.Cspec) {
              // if (hsinfo.fakeCspec && hsinfo.fakegoodsname && hsinfo.fakeCspec.indexOf('未归类') == -1 && hsinfo.Status == '未审核') {
              //   hsinfo.Cspec = hsinfo.fakeCspec.substr(1, hsinfo.fakeCspec.length).replace(/\[.*?\]/g, word => {
              //     var wj = word.replace('[', '').replace(']', '');
              //     // if (custinfo.proinfoconfig[wj]) {
              //     //   word = custinfo.proinfoconfig[wj];
              //     // }
              //     return custinfo.proinfoconfig[wj];
              //   });
              //   hsinfo.pracGoodsname = hsinfo.fakegoodsname.replace(/\[.*?\]/g, word => {
              //     var wj = word.replace('[', '').replace(']', '');
              //     // if (custinfo.proinfoconfig[wj]) {
              //     //   word = custinfo.proinfoconfig[wj];
              //     // }
              //     return custinfo.proinfoconfig[wj];
              //   });
              // }

              if (hsinfo.Status != '审核完成') {
                hsinfo.fakeCspec = '|' + classify.Cspec;
                hsinfo.fakegoodsname = classify.namestruct;
                hsinfo.Cspec = classify.Cspec.replace(/\[.*?\]/g, word => {
                  var wj = word.replace('[', '').replace(']', '');
                  // if (custinfo.proinfoconfig[wj]) {
                  //   word = custinfo.proinfoconfig[wj];
                  // }
                  return custinfo.proinfoconfig[wj];
                });
                hsinfo.pracGoodsname = hsinfo.fakegoodsname.replace(/\[.*?\]/g, word => {
                  var wj = word.replace('[', '').replace(']', '');
                  // if (custinfo.proinfoconfig[wj]) {
                  //   word = custinfo.proinfoconfig[wj];
                  // }
                  return custinfo.proinfoconfig[wj];
                });
              }

              hsinfo.save(err => {
                cbt(err);
              });
            }
            else {
              if (hsinfo.fakeCspec && hsinfo.fakegoodsname) {
                hsinfo.Cspec = hsinfo.fakeCspec.substr(1, hsinfo.fakeCspec.length).replace(/\[.*?\]/g, word => {
                  var wj = word.replace('[', '').replace(']', '');
                  // if (custinfo.proinfoconfig[wj]) {
                  //   word = custinfo.proinfoconfig[wj];
                  // }
                  return custinfo.proinfoconfig[wj];
                });
                hsinfo.pracGoodsname = hsinfo.fakegoodsname.replace(/\[.*?\]/g, word => {
                  var wj = word.replace('[', '').replace(']', '');
                  // if (custinfo.proinfoconfig[wj]) {
                  //   word = custinfo.proinfoconfig[wj];
                  // }
                  return custinfo.proinfoconfig[wj];
                });
              }
              hsinfo.save(err => {
                cbt(err);
              });
            }

          })
        }, function (err) {
          if (err)
            res.json(err);
          else
            res.json('ok');
        })
      })
    })
  },


  fillcspec: function (req, res) {
    var hsid = req.query.id;
    //where: { SKU: '858252-001' }
    CustClassifyProductInfo.findOne({ id: hsid }).populate('custid').then(hsinfo => {
      ClassifyInfo.findOne({ HSCode: hsinfo.HScode }).then(classify => {
        if (classify && classify.Cspec) {
          if (hsinfo.fakeCspec && hsinfo.fakegoodsname) {
            hsinfo.Cspec = hsinfo.fakeCspec.substr(1, hsinfo.fakeCspec.length).replace(/\[.*?\]/g, word => {
              var wj = word.replace('[', '').replace(']', '');
              if (hsinfo.custid.proinfoconfig[wj]) {
                word = hsinfo.custid.proinfoconfig[wj];
              }
              return word;
            });
            hsinfo.pracGoodsname = hsinfo.fakegoodsname.replace(/\[.*?\]/g, word => {
              var wj = word.replace('[', '').replace(']', '');
              if (hsinfo.custid.proinfoconfig[wj]) {
                word = hsinfo.custid.proinfoconfig[wj];
              }
              return word;
            });
          }
          else {
            hsinfo.fakeCspec = '|' + classify.Cspec;
            hsinfo.fakegoodsname = classify.namestruct;
            hsinfo.Cspec = classify.Cspec.replace(/\[.*?\]/g, word => {
              var wj = word.replace('[', '').replace(']', '');
              if (hsinfo.custid.proinfoconfig[wj]) {
                word = hsinfo.custid.proinfoconfig[wj];
              }
              return word;
            });
            hsinfo.pracGoodsname = hsinfo.fakegoodsname.replace(/\[.*?\]/g, word => {
              var wj = word.replace('[', '').replace(']', '');
              if (hsinfo.custid.proinfoconfig[wj]) {
                word = hsinfo.custid.proinfoconfig[wj];
              }
              return word;
            });
          }
          hsinfo.save(err => {
            if (err) {
              res.json(err);
            }
            else {
              res.json('ok');
            }
          });
        }
        else {
          if (hsinfo.fakeCspec && hsinfo.fakegoodsname) {
            hsinfo.Cspec = hsinfo.fakeCspec.substr(1, hsinfo.fakeCspec.length).replace(/\[.*?\]/g, word => {
              var wj = word.replace('[', '').replace(']', '');
              if (custinfo.proinfoconfig[wj]) {
                word = custinfo.proinfoconfig[wj];
              }
              return word;
            });
            hsinfo.pracGoodsname = hsinfo.fakegoodsname.replace(/\[.*?\]/g, word => {
              var wj = word.replace('[', '').replace(']', '');
              if (custinfo.proinfoconfig[wj]) {
                word = custinfo.proinfoconfig[wj];
              }
              return word;
            });
          }
          hsinfo.save(err => {
            if (err) {
              res.json(err);
            }
            else {
              res.json('ok');
            }
          });
        }
      })
      // var dic = hsinfo.midDic;
      // var odic = hsinfo.custid.proinfoconfig;
      // //  hsinfo.Cspec=R2Distinct.replace()
      // var R2Distinct = hsinfo.R2Distinct;
      // for (var key in dic) {
      //   R2Distinct = R2Distinct.replace(key, dic[key])
      // }
      // hsinfo.fakeCspec = R2Distinct.substr(R2Distinct.indexOf('|'))

      // var cspec = hsinfo.fakeCspec;
      // for (var key in odic) {
      //   cspec = cspec.replace(key, odic[key])
      // }
      // hsinfo.Cspec = cspec;
      // hsinfo.save(err => {
      //   if (err) {
      //     res.json(err);
      //   }
      //   else {
      //     res.json('ok');
      //   }
      // })
    })
  },

  import: function (req, res) {
    req.file('newFile').upload({
      // don't allow the total upload size to exceed ~10MB
      maxBytes: 10000000
    }, function whenDone(err, uploadedFiles) {
      if (err) {
        return res.negotiate(err);
      }
      var ftype = req.body.ftype;
      var filename = uploadedFiles[0].filename;
      var path = uploadedFiles[0].fd;
      console.log(ftype, filename, path);
      utilsService.ftpupload(path, filename).then(ftppath => {
        console.log(ftppath);
        if (ftype == 'product') {
          utilsService.sendqueue('zaracustpro', ftppath).then(zz => {
            console.log(zz);
            res.json('ok');
          }).catch(err => res.json(err));
        }
        else {
          utilsService.sendqueue('kwedic', ftppath).then(zz => {
            console.log(zz);
            res.json('ok');
          }).catch(err => res.json(err));
        }
      }).catch(err => res.json(err));
    })
  },
  //重新审核
  dragbackpro: function (req, res) {
    var infos = req.body;
    var ids = [];
    if (infos) {
      infos.forEach(info => {
        ids.push(info.id);
      })
    }
    CustClassifyProductInfo.find({ id: ids }).then(custinfos => {
      if (custinfos) {
        async.each(custinfos, function (cust, cb) {
          cust.Status = '未审核';
          cust.save(err => {
            autojudgeinfo.destroy({ classifyproductid: cust.id })
              .then(updaterecord => {
                CustProductDetailInfo.find({ ClassifiedProductid: cust.id })
                  .then(products => {
                    async.each(products, function (productcopy, cb1) {
                      CustProductDetailInfocopy.create(productcopy).then(rez1 => {
                        CustProductDetailInfo.destroy({ id: productcopy.id })
                          .then(updaterecord => {
                            cb1();
                          })
                          .error(er => {
                            cb1(er);
                          });
                      });
                    }, function (err) {
                      cb(err)
                    })
                  })
              })
          });
        }, function (err) {
          if (err)
            res.json(err);
          else
            res.json('ok');
        })
      }
      else {
        res.json('err');
      }
    })
  }
};


function isArray(o) {
  return Object.prototype.toString.call(o) == '[object Array]';
}



function valUnit(detail) {

  if (detail.cunit2 == '035') {
    detail.cunit = detail.cunit1;
  }
  else if (detail.cunit2 == '000') {
    if (detail.cunit1 == '035') {
      detail.cunit = '007';
    }
    else {
      detail.cunit = '035';
    }
  }
  else if (detail.cunit2 != '035' && detail.cunit1 == '035') {
    detail.cunit = detail.cunit2;
  }

}