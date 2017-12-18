/**
 * CustInfoController
 *
 * @description :: Server-side logic for managing CustInfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict'
module.exports = {
    searchby: function (req, res) {
        let condition = req.body;
        let whereObj = utilsService.getWhereCondition(condition.condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        if (!condition.doctitle || condition.doctitle == '') {
            Company.count({ where: whereObj }).then(function (resultcount) {
                responseresult.totalCount = resultcount;

                return Company.find({
                    where: whereObj,
                    skip: (condition.pageIndex - 1) * condition.pageSize,
                    limit: condition.pageSize,
                    sort: condition.sortby ? condition.sortby : null
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
        } else {
            Docinfo.find({ doctitle: condition.doctitle, doctype: '企业归档' }).then(doc => {
                whereObj.id = [];
                for (var i = 0; i < doc.length; i++) {
                    whereObj.id.push(doc[i].parentid);
                }
                return Company.count({ where: whereObj });
            })
                .then(resultcount => {
                    responseresult.totalCount = resultcount;
                    return Company.find({
                        where: whereObj,
                        skip: (condition.pageIndex - 1) * condition.pageSize,
                        limit: condition.pageSize,
                        sort: condition.sortby ? condition.sortby : null
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
        }
    },
    findOne: function (req, res) {
        // var id=req.id;
        console.log(req.param('id'))
        Company.findOne({ id: req.param('id') })
            .populate(['charge'])
            .then(data => {
                if (data) {
                    return res.json(data);
                }
                else {
                    return res.json({});
                }

            })
            .catch(err => {
                return res.err(err);
            })

    },
    saveinfo: function (req, res) {
        var info = req.body;
        console.log(info)
        Company.findOne({ id: info.id })
            .populate(['charge'])
            .then(data => {
                if (data) {
                    Charge.destroy({ companyid: info.id })
                        .then(err => {
                            if(info.contract_name != data.contract_name){
                            Company.findOne({ contract_name: info.contract_name })
                                .then(com => {
                                    if (com) {
                                        return Docinfo.find({
                                            where: {
                                                parentid: com.id
                                            }
                                        });
                                    } else {
                                        return com;
                                    }
                                })
                                .then(docs => {
                                    if (docs) {
                                        Docinfo.query('delete from docinfo where parentid = ?', [info.id], function (err, kk) {
                                            if (err) {
                                                res.json(err);
                                            } else {
                                                async.mapSeries(docs, function (doc, callback) {
                                                    console.log(doc);
                                                    Docinfo.create({
                                                        doctitle: doc.doctitle,
                                                        doctype: doc.doctype,
                                                        docname: doc.docname,
                                                        docpath: doc.docpath,
                                                        parentid: info.id,
                                                        uploadperson: doc.uploadperson,
                                                        contractstartdate: doc.contractstartdate,
                                                        contractenddate: doc.contractenddate
                                                    })
                                                        .then(docinfo => {
                                                            callback(null, docinfo);
                                                        })
                                                        .catch(err => {
                                                            callback(err);
                                                        })
                                                }, function (err, result) {
                                                    if (err) {
                                                        res.json(err);
                                                    } else {
                                                        for (var key in info) {
                                                            if (key == 'charge') {
                                                                data[key] = [];
                                                                if (info['charge'].length > 0) {
                                                                    info['charge'].forEach(charge => {
                                                                        data[key].add(charge);
                                                                    });
                                                                }
                                                            }
                                                            else {
                                                                data[key] = info[key];
                                                            }
                                                        }
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
                                            }
                                        })
                                    } else {
                                        Docinfo.query('delete from docinfo where parentid = ?', [info.id], function (err, kk) {
                                            if (err) {
                                                res.json(err);
                                            } else {
                                                for (var key in info) {
                                                    if (key == 'charge') {
                                                        data[key] = [];
                                                        if (info['charge'].length > 0) {
                                                            info['charge'].forEach(charge => {
                                                                data[key].add(charge);
                                                            });
                                                        }
                                                    }
                                                    else {
                                                        data[key] = info[key];
                                                    }
                                                }
                                                data.save(err => {
                                                    if (err) {
                                                        res.json(err);
                                                    }
                                                    else {
                                                        res.json(data);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                })
                            }else{
                                for (var key in info) {
                                    if (key == 'charge') {
                                        data[key]=[];
                                        if (info['charge'].length > 0) {
                                            info['charge'].forEach(charge => {
                                                data[key].add(charge);
                                            });
                                        }
                                    }
                                    else {
                                        data[key] = info[key];
                                    }
                                }
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
                        .catch(err => {
                            res.json(err);
                        })
                }
                else {
                    Company.create(info).exec(function (err, records) {
                        if (err) {
                            res.json(err);
                        } else {
                            Company.findOne({ contract_name: info.contract_name })
                                .then(comp => {
                                    if (comp) {
                                        return Docinfo.find({
                                            where: {
                                                parentid: comp.id
                                            }
                                        });
                                    } else {
                                        return comp;
                                    }
                                })
                                .then(docs => {
                                    if (docs && docs.length != 0) {
                                        async.mapSeries(docs, function (doc, callback) {
                                            Docinfo.create({
                                                doctitle: doc.doctitle,
                                                doctype: doc.doctype,
                                                docname: doc.docname,
                                                docpath: doc.docpath,
                                                parentid: records.id,
                                                uploadperson: doc.uploadperson,
                                                contractstartdate: doc.contractstartdate,
                                                contractenddate: doc.contractenddate
                                            })
                                                .then(docinfo => {
                                                    callback(null, docinfo);
                                                })
                                                .catch(err => {
                                                    callback(err);
                                                })
                                        }, function (err, result) {
                                            if (err) {
                                                res.json(err);
                                            } else {
                                                res.json(records);
                                            }
                                        })
                                    } else {
                                        res.json(records);
                                        // Company.create(info).exec(function (err, records) {
                                        //     if (err) {
                                        //         res.json(err);
                                        //     } else {
                                        //         res.json(records);
                                        //     }
                                        // });
                                    }
                                })
                                .catch(err => {
                                    res.json(err);
                                })
                        }
                    });
                }
            })
            .catch(err => {
                return res.json(err);
            })

    }

};