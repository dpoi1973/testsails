/**
 * CustInfoController
 *
 * @description :: Server-side logic for managing CustInfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict'
module.exports = {
    searchby: function(req, res) {
        let condition = req.body;
        let whereObj = utilsService.getWhereCondition(condition.condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        Flowinfo.count({ where: whereObj }).then(function(resultcount) {
                responseresult.totalCount = resultcount;

                return Flowinfo.find({
                    where: whereObj,
                    skip: (condition.pageIndex - 1) * condition.pageSize,
                    limit: condition.pageSize,
                    sort: condition.sortby?condition.sortby:null
                });
            })
            .then(function(results) {
                responseresult.status = 'OK';
                responseresult.datas = results;
                res.json(responseresult);
            })
            .error(function(er) {
                res.json({ status: 'error', err: er.message });
            });
    },


    turndown: function(req, res) {
        let condition = req.body;
        console.log(condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        var localcount = 5;
        Flowinfo.find({
            where: {parentid : condition.parentid,parentable: condition.parentable},
            limit: 1,
            sort:  'flowid desc'
        })
        .then(result => {
            if(result.length == 0){
                Flowconfig.count({})
                .then(count => {
                    localcount = count;
                    return Flowconfig.find({
                                where : {flowno:1},
                                limit : 1
                            })
                })
                .then(config => {
                    return  Flowinfo.create({
                                parentable: condition.parentable,
                                parentid : condition.parentid,
                                flowid : config[0].flowno,
                                flowname: config[0].flowname,
                                operateperson: condition.operateperson,
                                memo: condition.memo
                            })
                })
                .then(results => {
                    responseresult.status = 'OK';
                    responseresult.datas = results;
                    return Dmanage.findOne({id:results.parentid})
                })
                .then(dmanage=>{
                    dmanage.innerstatus = responseresult.datas.flowname;
                    dmanage.innerno = responseresult.datas.flowid;
                    dmanage.save(err => {
                        if (err) {
                            res.json(err);
                        } else {
                            res.json(responseresult);
                        }
                    });
                })
                .catch(er => {
                    res.json({ status: 'error', err: er });
                })
            }else if(result[0].flowid < localcount){
                Flowconfig.find({
                    where : {flowno: ((result[0].flowid + 1) > localcount) ? result[0].flowid : (result[0].flowid + 1)},
                    limit : 1,
                    sort: 'flowno desc'
                })
                .then(config => {
                    return  Flowinfo.create({
                                parentable: condition.parentable,
                                parentid : condition.parentid,
                                flowid : config[0].flowno,
                                flowname: config[0].flowname,
                                operateperson: condition.operateperson,
                                memo: condition.memo
                            })
                })
                .then(results => {
                    responseresult.status = 'OK';
                    responseresult.datas = results;
                    return Dmanage.findOne({id:results.parentid})
                })
                .then(dmanage=>{
                    dmanage.innerstatus = responseresult.datas.flowname;
                    dmanage.innerno = responseresult.datas.flowid;
                    dmanage.save(err => {
                        if (err) {
                            res.json(err);
                        } else {
                            res.json(responseresult);
                        }
                    });
                })
                .catch(er => {
                    res.json({ status: 'error', err: er });
                })
            }else{
                res.json({ status: 'error', err: '已经是最后状态' });
            }
        })
        .catch(er => {
            res.json({ status: 'error', err: er });
        })
    },



    turnup: function(req, res) {
        let condition = req.body;
        console.log(condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        try{
        Flowinfo.find({
            where: {parentid : condition.parentid,parentable: condition.parentable},
            limit: 1,
            sort:  'flowid desc'
        })
        .then(result => {
            if(result.length == 0){
               res.json({ status: 'error', err: '没有这条记录' });
            }else if(result[0].flowid > 0){
                Flowinfo.query('delete from flowinfo where id = ?',[result[0].id],function (er,results) {
                    if(er){
                        res.json({ status: 'error', err: er });
                    }else{
                        Flowinfo.findOne({
                                parentid: result[0].parentid,
                                flowid: (result[0].flowid - 1)
                        })
                        .then(flows => {
                            responseresult.status = 'OK';
                            responseresult.datas = flows;
                            return Dmanage.findOne({id:result[0].parentid});
                        })
                        .then(dmanage => {
                            dmanage.innerstatus = responseresult.datas.flowname;
                            dmanage.innerno = responseresult.datas.flowid;
                            dmanage.save(err => {
                                if (err) {
                                    res.json(err);
                                } else {
                                    res.json(responseresult);
                                }
                            });
                        })
                        // responseresult.status = 'OK';
                        // responseresult.datas = results;
                        // Dmanage.findOne({id:result[0].parentid})
                        // .then(dmanage => {
                        //     dmanage.innerstatus = result[0].flowname;
                        //     dmanage.innerno = result[0].flowid;
                        //     dmanage.save(err => {
                        //         if (err) {
                        //             res.json(err);
                        //         } else {
                        //             res.json(responseresult);
                        //         }
                        //     });
                        // })
                        .catch(err => {
                            res.json(err);
                        })
                    }
                })
            }else{
                res.json({ status: 'error', err: '错误' });
            }
        })
        .catch(er => {
            res.json({ status: 'error', err: er });
        })
        }catch(e){
            res.json({ status: 'error', err: e });
        }
    }

};