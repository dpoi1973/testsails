'use strict'
module.exports = {

    searchby: function (req, res) {
        let condition = req.body;
        let whereObj = utilsService.getWhereCondition(condition.condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        custftpattach.count({ where: whereObj }).then(function (resultcount) {
            responseresult.totalCount = resultcount;

            return custftpattach.find({
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

    saveinfo: function (req, res) {
        var info = req.body;
        custftpattach.findOne({ relateno: info.relateno, ftppath: info.ftppath })
            .then(finfo => {
                if (!finfo) {
                    custftpattach.create(info).exec(function (err, records) {
                        res.json(records);
                    });
                }
                else {
                    res.json({ err: 'exsist' });
                }
            })
    },
    download: function (req, res) {
        try {
            console.log(req.query.ftppath)
            utilsService.ygldownload(req.query.ftppath, req.query.filename).then(ftp => {
                // ftp.pipe(res);
                res.set({
                    "Content-type": "application/octet-stream",
                    "Content-Disposition": "attachment;filename=" + encodeURI(req.query.filename)
                });

                ftp.on("data", (chunk) => res.write(chunk, "binary"));

                ftp.on('end', function () {
                    res.end();
                });
            })
                .catch(err => {
                    res.json(utilsService.reponseMessage('Error', err));
                })
        } catch (err) {
            res.json(utilsService.reponseMessage('Error', err));
        }
    }
}