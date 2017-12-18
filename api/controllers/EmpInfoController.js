/**
 * EmpInfoController
 *
 * @description :: Server-side logic for managing Empinfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict'
module.exports = {

    update: (req, res) => {
        if (req.method === 'PUT') {
            const empjson = req.body;
            if (_.isObject(empjson.userinfo)) {
                empjson.userinfo = empjson.userinfo.id;
            }
            User.findOne({ empid: empjson.id })
                .then(userinfo => {


                    return [EmpInfo.update({id:empjson.id},empjson), userinfo];
                })
                .spread((empdata, userinfo) => {
                    if (userinfo && (empdata.length == 1) && (userinfo.id != empdata[0].userinfo)) {

                        userinfo.empid = null;
                        return [userinfo.save(), empdata];


                    } else {
                        return [userinfo, empdata];
                    }
                })
                .spread((userdata, data) => {
                    console.log(data);
                    res.ok(data);

                })
                .catch(e => {
                    res.ok(e);

                });

        } else {
            res.ok({ ok: 'ok' });
        }


    },
    searchby: (req, res) => {


        let condition = req.body;
        var responseresult = { status: '', totalCount: 0, pageIndex: condition.pageIndex, pageSize: condition.pageSize, datas: [] };
        //console.log(condition.pageIndex);

        let whereObj = baseUtilService.getWhereCondition(condition.condition);

        EmpInfo.count(condition.condition)
            .then(empcount => {
                responseresult.totalCount = empcount;
                return EmpInfo.find({
                        where: condition.condition,
                        skip: (condition.pageIndex - 1) * condition.pageSize,
                        limit: condition.pageSize,
                        sort: condition.sortby? condition.sortby:'createdAt DESC'
                    })
                    .populate('userinfo')
            }).then(function (results) {

                responseresult.status = 'OK';
                responseresult.datas = results;
                res.json(responseresult);
            })
            .error(function (er) {
                res.json({
                    status: 'error',
                    err: er.message
                });
            });
    },
    getValidUser: (req, res) => {
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        const empid = req.param('empid');
        //search username not 
        EmpInfo.find({
                where: {
                    userinfo: { '>': 0 },
                    id: { '!': empid }
                },
                select: ['userinfo']
            })
            .then(emps => {
                const ids = _.map(emps, 'userinfo');
                if (ids.length == 0)
                    ids[0] = -1;
                return User.find({
                    where: { 'id': { '!': ids } },
                    select: ['username', 'id']
                })
            })
            .then(data => {
                responseresult.status = 'OK';
                responseresult.datas = data;
                res.json(responseresult);

            })

        .catch(e => {
            res.badRequest(e);
        })

    }
};
