/**
 * CustInfoController
 *
 * @description :: Server-side logic for managing CustInfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const async = require('async');
const md5 = require('md5')
'use strict'
module.exports = {
    searchby: function (req, res) {
        let condition = req.body;
        let whereObj = utilsService.getWhereCondition(condition.condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        if (!condition.doctitle || condition.doctitle == '') {
            Dmanage.count({ where: whereObj }).then(function (resultcount) {
                responseresult.totalCount = resultcount;

                return Dmanage.find({
                    where: whereObj,
                    skip: (condition.pageIndex - 1) * condition.pageSize,
                    limit: condition.pageSize,
                    sort: condition.sortby ? condition.sortby : "innerno asc"
                });
            })
                .then(function (results) {
                    responseresult.status = 'OK';
                    async.mapSeries(results, function (result, callback) {
                        Proxy_archive.findOne({ goods_description_archive: result.goods_description_archive })
                            .then(data => {
                                if (data) {
                                    result.proxyid = data.id;
                                }
                                callback(null, result);
                            })
                            .catch(err => {
                                callback(err);
                            })
                    }, function (err, results) {
                        if (err) {
                            res.json({ status: 'error', err: er });
                        } else {
                            responseresult.datas = results;
                            res.json(responseresult);
                        }
                    })
                })
                .error(function (er) {
                    res.json({ status: 'error', err: er.message });
                });
        } else {
            Docinfo.find({ doctitle: condition.doctitle, doctype: '数据归档' }).then(doc => {
                whereObj.id = [];
                for (var i = 0; i < doc.length; i++) {
                    whereObj.id.push(doc[i].parentid);
                }
                return Dmanage.count({ where: whereObj });
            })
                .then(resultcount => {
                    responseresult.totalCount = resultcount;
                    return Dmanage.find({
                        where: whereObj,
                        skip: (condition.pageIndex - 1) * condition.pageSize,
                        limit: condition.pageSize,
                        sort: condition.sortby ? condition.sortby : null
                    });
                })
                .then(function (results) {
                    responseresult.status = 'OK';
                    async.mapSeries(results, function (result, callback) {
                        Proxy_archive.findOne({ goods_description_archive: result.goods_description_archive })
                            .then(data => {
                                if (data) {
                                    result.proxyid = data.id;
                                }
                                callback(null, result);
                            })
                            .catch(err => {
                                callback(err);
                            })
                    }, function (err, results) {
                        if (err) {
                            res.json({ status: 'error', err: er });
                        } else {
                            responseresult.datas = results;
                            res.json(responseresult);
                        }
                    })
                })
                .error(function (er) {
                    res.json({ status: 'error', err: er.message });
                });
        }
    },

    findOne: function (req, res) {
        // var id=req.id;
        let callone = {};
        console.log(req.param('id'))
        Dmanage.findOne({ id: req.param('id') })
            .populate(['flowinfo'])
            .then(data => {
                if (data) {
                    callone = data;
                    return Proxy_archive.findOne({ goods_description_archive: data.goods_description_archive });
                }
                else {
                    return callone;
                }
            })
            .then(pro => {
                if(pro){
                    callone.proxyid = pro.id;
                    return res.json(callone);
                }else{
                    return res.json(callone);
                }
            })
            .catch(err => {
                return res.err(err);
            })

    },

    createone: function (req, res) {
        var data = req.body;
        async.waterfall([
            function (callback) {
                Dmanage.find({
                    where: {
                        sku: data.sku,
                        companyid: data.companyid
                    }
                })
                    .then(manage => {
                        callback(null, manage);
                    })
                    .catch(err => {
                        callback(err);
                    })
            },
            function (manage, callback) {
                if (manage.length == 0) {
                    Dmanage.find({
                        where: {
                            goods_name: data.goods_name,
                            companyid: data.companyid
                        }
                    })
                        .then(chargemanage => {
                            callback(null, chargemanage);
                        })
                        .catch(err => {
                            callback(err);
                        })
                } else {
                    callback({ 'data': '已存在' });
                }
            },
            function (chargemanage, callback) {
                if (chargemanage.length == 0) {
                    Charge.find({
                        where: {
                            companyid: data.companyid
                        }
                    })
                        .then(charge => {
                            callback(null, charge, 1);
                        })
                        .catch(err => {
                            callback(err)
                        })
                } else {
                    Charge.find({
                        where: {
                            companyid: data.companyid
                        }
                    })
                        .then(charge => {
                            callback(null, charge, 2);
                        })
                        .catch(err => {
                            callback(err)
                        })
                }
            },
            function (charge, count, callback) {
                if (charge.length == 0) {
                    data.finallcharge = 0;
                } else {
                    if (count == 1) {
                        var finallcharge = 0;
                        charge.forEach(cd => {
                            if (cd['charge_type'] == '业务收费' && cd['chargenum']) {
                                finallcharge = cd['chargenum'];
                            }
                        });
                    }
                    else {
                        var finallcharge = 0;
                        charge.forEach(cd => {
                            if (cd['charge_type'] == '业务收费' && cd['chargenum']) {
                                finallcharge = cd['chargenum'];
                            }
                        });
                        charge.forEach(cd => {
                            if (cd['charge_type'] == '第二收费' && cd['chargenum']) {
                                finallcharge = cd['chargenum'];
                            }
                        });
                    }
                    data.finallcharge = finallcharge
                }
                Dmanage.create(data)
                    .then(datas => {
                        callback(null, datas)
                    })
                    .catch(err => {
                        callback(err)
                    })
            }
        ], function (err, result) {
            if (err) {
                res.json({ status: 'error', err: err });
            } else {
                res.json(result);
            }
        })
    },
    saveinfo: function (req, res) {
        var info = req.body;
        if (!info.sku || info.sku == '') {
            var md = md5(new Date);
            md = md.substring(md.length - 7, md.length - 1);
            info.sku = info.goods_name + '_' + md;
        }
        Charge.find({ companyid: info.companyid })
            .then(charges => {
                var chargeinfo = {};
                charges.forEach(cd => {
                    chargeinfo[cd['charge_type']] = cd['chargenum'];
                });
                if (!chargeinfo.ywfee) {
                    chargeinfo.ywfee = 0;
                }
                Dmanage.find({ goods_name: info.goods_name, companyid: info.companyid })
                    .then(goodsjudge => {
                        if (info.id) {
                            if (!chargeinfo.secfee) {
                                info.finallcharge = chargeinfo.ywfee;
                            }
                            else {
                                if (goodsjudge.length == 0) {
                                    info.finallcharge = chargeinfo.ywfee;
                                }
                                else if (goodsjudge.length == 1) {
                                    if (goodsjudge.id != info.id) {
                                        info.finallcharge = chargeinfo.secfee;
                                    }
                                    else {
                                        info.finallcharge = chargeinfo.ywfee;
                                    }
                                }
                                else {
                                    info.finallcharge = chargeinfo.secfee;
                                }
                            }
                            Dmanage.findOne({ id: info.id })
                                .then(data => {
                                    if (data.sku != info.sku || data.companyid != info.companyid) {
                                        Dmanage.findOne({ sku: info.sku, companyid: info.companyid })
                                            .then(exsist => {
                                                if (exsist) {
                                                    res.json({ err: "sku已存在" });
                                                }
                                                else {
                                                    for (var key in info) {
                                                        data[key] = info[key];
                                                    }
                                                    if(info.goods_description_archive && info.goods_description_archive != ''){
                                                    Proxy_archive.findOrCreate({goods_description_archive: info.goods_description_archive},{goods_description_archive: info.goods_description_archive, updateperson: info.updateperson})
                                                    .exec((err,proxy) =>{
                                                        if(err){
                                                            res.json(err);
                                                        }else{
                                                            data.save(err => {
                                                                if (err) {
                                                                    res.json(err);
                                                                }
                                                                else {
                                                                    res.json(data);
                                                                }
                                                            });
                                                        }
                                                    })
                                                    }else{
                                                        data.save(err => {
                                                            if (err) {
                                                                res.json(err);
                                                            }
                                                            else {
                                                                res.json(data);
                                                            }
                                                        });
                                                    }
                                                    
                                                }
                                            })
                                    }
                                    else {
                                        for (var key in info) {
                                            data[key] = info[key];
                                        }
                                        if(info.goods_description_archive && info.goods_description_archive != ''){
                                        Proxy_archive.findOrCreate({goods_description_archive: info.goods_description_archive},{goods_description_archive: info.goods_description_archive, updateperson: info.updateperson})
                                        .exec((err,proxy) =>{
                                            if(err){
                                                res.json(err);
                                            }else{
                                                data.save(err => {
                                                    if (err) {
                                                        res.json(err);
                                                    }
                                                    else {
                                                        res.json(data);
                                                    }
                                                });
                                            }
                                        })
                                        }else{
                                            data.save(err => {
                                                if (err) {
                                                    res.json(err);
                                                }
                                                else {
                                                    res.json(data);
                                                }
                                            });
                                        }
                                    }
                                })
                        }
                        else {
                            if (!chargeinfo.secfee) {
                                info.finallcharge = chargeinfo.ywfee;
                            }
                            else {
                                if (goodsjudge.length == 0) {
                                    info.finallcharge = chargeinfo.ywfee;
                                }
                                else {
                                    info.finallcharge = chargeinfo.secfee;
                                }
                            }
                            Dmanage.findOne({ sku: info.sku, companyid: info.companyid })
                                .then(exsist => {
                                    if (exsist) {
                                        res.json({ err: "sku已存在" });
                                    }
                                    else {
                                        if(info.goods_description_archive && info.goods_description_archive != ''){
                                        Proxy_archive.findOrCreate({goods_description_archive: info.goods_description_archive},{goods_description_archive: info.goods_description_archive, updateperson: info.updateperson})
                                        .exec((err,proxy) =>{
                                            if(err){
                                                res.json(err);
                                            }else{
                                                Dmanage.create(info).exec(function (err, records) {
                                                    res.json(records);
                                                });
                                            }
                                        })
                                        }else{
                                            Dmanage.create(info).exec(function (err, records) {
                                                res.json(records);
                                            });
                                        }
                                    }
                                })
                        }
                    })

            })
    },


    importold: function (req, res) {
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
                var person = req.body.uploadperson;
                var filename_1 = uploadedFiles[0].filename;
                var path = uploadedFiles[0].fd;
                var invlist = Service.read_excel4_info(path, filename_1);
                var count = 0;
                var date1 = new Date();
                var lastlist = [];
                for(var i = 0; i < invlist.length; i ++ ){
                    var ll = {};
                    ll.sku = invlist[i].货号 ? invlist[i].货号 : '';
                    ll.hs_code = invlist[i].建议税号 ? invlist[i].建议税号 : '';
                    ll.cspec = invlist[i].申报要素 ? invlist[i].申报要素  : '';
                    ll.goods_name = invlist[i].中文名称 ? invlist[i].中文名称 : '';
                    ll.goods_nameEN = invlist[i].英文名称 ? invlist[i].英文名称 : '';
                    ll.other_name = invlist[i].其他名称 ? invlist[i].其他名称 : '';
                    ll.goods_description = invlist[i].商品描述 ? invlist[i].商品描述 : '';
                    ll.classify_basis = invlist[i].归类依据或理由 ? invlist[i].归类依据或理由 : '';
                    ll.goods_description_archive = invlist[i].随附委托协议编号 ? invlist[i].随附委托协议编号 : '';
                    ll.submissions_archive = invlist[i].意见书编号 ? invlist[i].意见书编号 : '';
                    ll.declaredate = invlist[i].申报日期 ? invlist[i].申报日期 : '';
                    ll.valididate = invlist[i].到期日期 ? invlist[i].到期日期 : '';
                    ll.trade_name = invlist[i].委托方公司名称 ? invlist[i].委托方公司名称 : '';
                    ll.specifications_model = invlist[i].规格型号 ? invlist[i].规格型号 : '';
                    ll.back3 = invlist[i].预归类单位名称 ? invlist[i].预归类单位名称 : '';
                    ll.updateperson = person ? person : '';
                    lastlist.push(ll);
                }
                async.mapSeries(lastlist, function (list, cb) {
                     if (list.cspec && list.cspec != '') {
                        list.innerno = 5;
                        list.innerstatus = '已完成';
                    }
                    async.waterfall([
                        function (callback) {
                            Company.findOne({ trade_name: list.trade_name })
                                .then(company => {
                                    if (company) {
                                        list.companyid = company.id;
                                        callback(null, list);
                                    } else {
                                        callback(null, `${list.sku}没有经营单位！`);
                                    }
                                })
                                .catch(err => {
                                    callback(err);
                                })
                        },
                        function (list, callback) {
                            if (list.sku) {
                                Dmanage.findOne({ sku: list.sku, companyid: list.companyid })
                                    .then(dmanag => {
                                        if (dmanag) {
                                            for (var key in list) {
                                                dmanag[key] = list[key];
                                            }
                                            dmanag.save(err => {
                                                if (err) {
                                                    callback(err)
                                                } else {
                                                    callback(null, dmanag);
                                                }
                                            });
                                        } else {
                                            Dmanage.create(list).exec(function (err, dmana) {
                                                if (err) {
                                                    callback(err);
                                                } else {
                                                    callback(null, dmana);
                                                }
                                            });
                                        }
                                    })
                                    .catch(err => {
                                        callback(err);
                                    })
                            } else {
                                callback(null, list);
                            }
                        },
                        function (list, callback) {
                            if (list.sku) {
                                Flowinfo.query('delete from flowinfo where parentid = ? and parentable = ?', [list.id, 'Dmanage'], function (err, flowinfo) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        callback(null, list);
                                    }
                                })
                            } else {
                                callback(null, list);
                            }
                        },
                        function (list, callback) {
                            if (list.cspec && list.cspec != '') {
                                let Flowinfolist = [
                                    {
                                        parentable: 'Dmanage',
                                        parentid: list.id,
                                        flowid: 1,
                                        flowname: '待上传',
                                        memo: '系统导入',
                                        operateperson: person
                                    },
                                    {
                                        parentable: 'Dmanage',
                                        parentid: list.id,
                                        flowid: 2,
                                        flowname: '待初审',
                                        memo: '系统导入',
                                        operateperson: person
                                    },
                                    {
                                        parentable: 'Dmanage',
                                        parentid: list.id,
                                        flowid: 3,
                                        flowname: '待复审',
                                        memo: '系统导入',
                                        operateperson: person
                                    },
                                    {
                                        parentable: 'Dmanage',
                                        parentid: list.id,
                                        flowid: 4,
                                        flowname: '待终审',
                                        memo: '系统导入',
                                        operateperson: person
                                    },
                                    {
                                        parentable: 'Dmanage',
                                        parentid: list.id,
                                        flowid: 5,
                                        flowname: '已完成',
                                        memo: '系统导入',
                                        operateperson: person
                                    }
                                ];
                                Flowinfo.create(Flowinfolist).exec(function (err, flow) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        callback(null, list);
                                    }
                                });
                            } else {
                                callback(null, list);
                            }
                        },
                        function(list,callback){
                            if (list.cspec && list.cspec != '' && list.goods_description_archive && list.goods_description_archive != '') {
                                Proxy_archive.findOrCreate({goods_description_archive: list.goods_description_archive},{goods_description_archive: list.goods_description_archive, updateperson: list.updateperson})
                                .exec((err,proxy) =>{
                                    if(err){
                                        callback(err);
                                    }else{
                                        callback(null, null);
                                    }
                                })
                            } else {
                                callback(null, null);
                            }
                        }
                    ], function (err, result) {
                        if (err) {
                            console.log(err);
                            cb(err);
                        } else if (result) {
                            cb(null, result);
                        } else {
                            console.log('导入了', count++)
                            cb(null);
                        }
                    })
                }, function (err, results) {
                    if (err) {
                        console.log(err);
                        res.json({ status: 'error', err: err });
                    } else if (results) {
                        var date2 = new Date();
                        console.log(date2 - date1);
                        res.json({ status: 'OK', message: results });
                    } else {
                        res.json({ status: 'OK', message: '导入成功' });
                    }
                })
            }
        })
    }

};