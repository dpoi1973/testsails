module.exports = {
    searchby: function (req, res) {
        let condition = req.body;
        let whereObj = utilsService.getWhereCondition(condition.condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        paracom.count({ where: whereObj }).then(function (resultcount) {
            responseresult.totalCount = resultcount;

            return paracom.find({
                where: whereObj,
                skip: (condition.pageIndex - 1) * condition.pageSize,
                limit: condition.pageSize,
                sort: condition.sortby? condition.sortby:'id ASC'
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
    init: function (req, res) {
        QuanqiuYWInfo.find({}).then(function (quanqiuywinfolist) {
            async.mapSeries(quanqiuywinfolist, function (ywinfo, cb) {
                // quanqiuywinfolist.forEach(function (ywinfo) {
                var sqlist = ywinfo.shenqinglist;
                async.mapSeries(sqlist, function (sq, cb1) {
                    if (sq.Vendor) {
                        paracom.findOne({paratype:'Brand', parakey: sq.Vendor })
                            .then(function (pc) {
                                if (!pc) {
                                    var pm = {};
                                    pm.paratype = 'Brand';
                                    pm.parakey = sq.Vendor;
                                    pm.paravalue = sq.Vendor;
                                    pm.description=sq.company;
                                    paracom.create(pm).then(function (pm) {
                                        cb1();
                                    }).catch(function (err) {
                                        cb1();
                                    });
                                }
                                else{
                                    cb1();
                                }
                            }).error(function (er) {
                                cb1(err);
                            })
                    }
                    else{
                        cb()
                    }
                }, function (err) {
                    cb()
                })
            }, function (err) {
                res.json('over');
            });
        })
    }
}