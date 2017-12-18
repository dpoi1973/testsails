/**
 * ClassifyInfoController
 *
 * @description :: Server-side logic for managing classifyinfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var XLSX = require('xlsx');
var request = require('request');
'use strict'
module.exports = {
    searchby: function (req, res) {
        let condition = req.body;
        let whereObj = utilsService.getWhereCondition(condition.condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        manualcustproductdetail.count({ where: whereObj }).then(function (resultcount) {
            responseresult.totalCount = resultcount;

            return manualcustproductdetail.find({
                where: whereObj,
                skip: (condition.pageIndex - 1) * condition.pageSize,
                limit: condition.pageSize,
                sort: condition.sortby ? condition.sortby : 'id desc'
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

    import: function (req, res) {
        req.file('newFile').upload({
            // don't allow the total upload size to exceed ~10MB
            maxBytes: 10000000
        }, function whenDone(err, uploadedFiles) {
            if (err) {
                return res.negotiate(err);
            }

            // If no files were uploaded, respond with an error.
            if (uploadedFiles.length === 0) {
                return res.badRequest('No file was uploaded');
            }
            else {
                if (req.body.Custid) {
                    // if(req.body.Custid == '3282' || req.body.Custid == '3283'){
                    var custid = req.body.Custid;//Custname
                    var custname = req.body.Custname;
                    var filename_1 = uploadedFiles[0].filename;
                    var path = uploadedFiles[0].fd;
                    var workbook = XLSX.readFile(path);
                    var data = [];
                    for (var i = 0; i < workbook.SheetNames.length; i++) {
                        XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[i]]).forEach(dd => {
                            data.push(dd);
                        })
                    }
                    async.mapSeries(data, function (list, cb) {
                        // If there is a user with the specified name, return it,
                        var lis = {};
                        lis.custid = custid;
                        for (var key in list) {
                            if (key == '项号') {
                                lis.SKU = list[key]
                            } else if (key == '商品编码') {
                                lis.HScode = list[key];
                            } else if (key == '规格型号') {
                                lis.Cspec = list[key]
                            }
                        }
                        if (lis.SKU == '' || !lis.SKU) {
                            cb('项号不能为空');
                        } else if (lis.HScode == '' || !lis.HScode) {
                            cb(null, `${lis.SKU}商品编码为空`);
                        } else if (lis.Cspec == '' || !lis.Cspec) {
                            cb(null, `${lis.SKU}规格型号为空`);
                        } else {
                            if (lis.HScode.length == 8) {
                                lis.HScode = lis.HScode + '00'
                            } else if (lis.HScode.length == 9) {
                                lis.HScode = lis.HScode + '0'
                            }
                            var linkRegx = /;(.*?)(?=\d:|$)/g;
                            var cspec = '';
                            while ((result = linkRegx.exec(lis.Cspec)) != null) {
                                cspec += result[1].replace(/\s/g, '').replace('\r\n', '') + '|'
                            }
                            lis.Cspec = cspec.substring(0, cspec.length - 1);
                            var sp = lis.Cspec.split('|');
                            lis.Cgoodsname = sp[0];
                            var spp = '';
                            for (var i = 1; i < sp.length; i++) {
                                spp += sp[i] + '|';
                            }
                            lis.Cspec = spp.substring(0, spp.length - 1);
                            if (lis.Cspec == '') {
                                cb(lis.SKU + '规格型号不存在！');
                            } else {
                                ClassifyInfo.find({ HScode: lis.HScode }).then(class1 => {
                                    if (class1.length > 0) {
                                        ciq2edi.find({ paratype: 'Unit' })
                                            .then(paras => {
                                                lis.Cunit = '';
                                                lis.Cunit1 = '';
                                                lis.Cunit2 = '';
                                                async.map(paras, function (qo) {
                                                    if (qo.Q_code == class1[0].Unit1) {
                                                        lis.Cunit = qo.Q_name + "[" + qo.Q_code + "]";
                                                        lis.Cunit1 = qo.Q_name + "[" + qo.Q_code + "]";
                                                    }
                                                    if (qo.Q_code == class1[0].Unit2) {
                                                        lis.Cunit2 = qo.Q_name + "[" + qo.Q_code + "]";
                                                    }
                                                })

                                                lis.ControlMark = class1[0].ControlMark ? class1[0].ControlMark : '';// lis
                                                manualcustproductdetail.findOne({ SKU: lis.SKU })
                                                    .then(result => {
                                                        if (result) {
                                                            for (var key in lis) {
                                                                result[key] = lis[key];
                                                            }
                                                            result.save(err => {
                                                                if (err) {
                                                                    cb(err)
                                                                } else {
                                                                    var msslis = {};
                                                                    for (var key in lis) {
                                                                        if (key == 'SKU') {
                                                                            msslis.Key1 = lis[key]
                                                                        } else if (key == 'HScode') {
                                                                            msslis.HScode = lis[key]
                                                                        } else if (key == 'Cgoodsname') {
                                                                            msslis.Cgoodsname = lis[key]
                                                                        } else if (key == 'Cspec') {
                                                                            msslis.Cspec = lis[key]
                                                                        } else if (key == 'Cunit') {
                                                                            msslis.Cunit = lis[key]
                                                                        } else if (key == 'Cunit1') {
                                                                            msslis.Cunit1 = lis[key]
                                                                        } else if (key == 'Cunit2') {
                                                                            msslis.Cunit2 = lis[key]
                                                                        } else if (key == 'ControlMark') {
                                                                            msslis.ControlMark = lis[key]
                                                                        }
                                                                    }
                                                                    msslis.CreatePerson = custname;
                                                                    console.log(msslis);
                                                                    const url = sails.config.remoteapi + `/api/CustProduct/addhuiyuclassify`;
                                                                    const options = {
                                                                        method: 'POST',
                                                                        uri: url,
                                                                        json: true, // Automatically parses the JSON string in the response,
                                                                        timeout: 3000,
                                                                        body: msslis,
                                                                    };
                                                                    request(options, (error, response, bodyu) => {
                                                                        if (!error && response.statusCode === 200) {
                                                                            cb(null, null);
                                                                        } else if (error) {
                                                                            cb('error', 'no such body', error);
                                                                        } else {
                                                                            cb(bodyu);
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        } else {
                                                            manualcustproductdetail.create(lis).exec(function (err, records) {
                                                                if(err){
                                                                    cb(err);
                                                                }else{
                                                                    cb(null,null);
                                                                }
                                                            });
                                                        }
                                                    })
                                                    .catch(err => {
                                                        cb(err);
                                                    });
                                                // .exec(cb);
                                            })
                                            .catch(err => {
                                                cb(err);
                                            })
                                    } else {
                                        cb(lis.HScode + '不存在,');
                                    }
                                })
                                    .catch(err => {
                                        cb(err);
                                    })
                            }
                        }
                    },
                        function done(err, results) {
                            if (err) {
                                res.json(utilsService.reponseMessage('Error', err));
                            } else {
                                if (results) {
                                    var pp = [];
                                    for (var i = 0; i < results.length; i++) {
                                        if (results[i] && results[i] != '') {
                                            pp.push(results[i]);
                                        }
                                    }
                                    if (pp.length > 0) {
                                        res.json(utilsService.reponseMessage('err', results));
                                    } else {
                                        res.json(utilsService.reponseMessage('OK', `导入业务`));
                                    }
                                } else {
                                    res.json(utilsService.reponseMessage('OK', `导入业务`));
                                }
                            }
                        });
                    // }else{
                    //     res.json(utilsService.reponseMessage('Error', `不是惠普惠与`));
                    // }
                } else {
                    res.json(utilsService.reponseMessage('Error', `没有厂家`));
                }
            }
        });
    },


};