/**
 * ClassifyInfoController
 *
 * @description :: Server-side logic for managing classifyinfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict'
module.exports = {
    searchby: function(req, res) {
        let condition = req.body;
        let whereObj = utilsService.getWhereCondition(condition.condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        ClassifyInfo.count({ where: whereObj }).then(function(resultcount) {
                responseresult.totalCount = resultcount;

                return ClassifyInfo.find({
                    where: whereObj,
                    skip: (condition.pageIndex - 1) * condition.pageSize,
                    limit: condition.pageSize,
                    sort: condition.sortby? condition.sortby:'HSCode ASC'
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
    }


};