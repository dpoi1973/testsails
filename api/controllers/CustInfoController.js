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
        CustInfo.count({ where: whereObj }).then(function (resultcount) {
            responseresult.totalCount = resultcount;

            return CustInfo.find({
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
    },

    getidbyname: function (req, res) {
        var custname = req.param('custname');
        if (!custname) {
            custname = "";
        }
        CustInfo.findOne({ custname: custname, custtype: '最终客户' }).then(cust => {
            res.json(cust.id);
        })
    }


};