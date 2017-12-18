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
        Docinfo.count({ where: whereObj }).then(function (resultcount) {
            responseresult.totalCount = resultcount;

            return Docinfo.find({
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


    import: function (req, res) {
        req.file('newFile').upload({
            // don't allow the total upload size to exceed ~10MB
            maxBytes: 50000000
        }, function whenDone(err, uploadedFiles) {
            if (err) {
                return res.negotiate(err);
            }

            // If no files were uploaded, respond with an error.
            if (uploadedFiles.length === 0) {
                return res.badRequest('No file was uploaded');
            }
            else {
                var sku = '';
                var contractstartdate = '';
                var contractenddate = '';
                if (req.body.sku) {
                    sku = req.body.sku;
                }
                if (req.body.contractstartdate) {
                    contractstartdate = req.body.contractstartdate;
                }
                if (req.body.contractenddate) {
                    contractenddate = req.body.contractenddate;
                }
                var filetype = req.body.filetype;
                var parentid = req.body.parentid;
                var doctitle = req.body.doctitle;
                var uploadperson = req.body.uploadperson;
                var filename = uploadedFiles[0].filename;
                var path = uploadedFiles[0].fd;

                utilsService.yglftpupload(path, filename, parentid, filetype, sku).then(ftppath => {
                    console.log(ftppath);
                    if (filetype == '数据归档') {
                        Docinfo.create({
                            doctitle: doctitle,
                            doctype: filetype,
                            docname: filename,
                            docpath: ftppath,
                            parentid: parentid,
                            uploadperson: uploadperson,
                            contractstartdate: contractstartdate,
                            contractenddate: contractenddate
                        })
                            .then(result => {
                                res.json(utilsService.reponseMessage('OK', `导入成功`));
                            })
                            .catch(er => {
                                res.json(utilsService.reponseMessage('Error', err));
                            })
                    } else if (filetype == '企业归档') {
                        Company.findOne({
                            id: parentid
                        }).then(company => {
                            return Company.find({
                                where: {
                                    contract_name: company.contract_name
                                }
                            })
                        })
                            .then(companys => {
                                async.mapSeries(companys, function (comp, callback) {
                                    Docinfo.create({
                                        doctitle: doctitle,
                                        doctype: filetype,
                                        docname: filename,
                                        docpath: ftppath,
                                        parentid: comp.id,
                                        uploadperson: uploadperson,
                                        contractstartdate: contractstartdate,
                                        contractenddate: contractenddate
                                    })
                                        .then(result => {
                                            callback(null, result);
                                        })
                                        .catch(er => {
                                            callback(er);
                                        })
                                }, function (err, result) {
                                    if (err) {
                                        res.json(utilsService.reponseMessage('Error', err));
                                    } else {
                                        res.json(utilsService.reponseMessage('OK', `导入成功`));
                                    }
                                })
                            })
                            .catch(err => {
                                res.json(utilsService.reponseMessage('Error', err));
                            })
                    }
                }).catch(err => {
                    res.json(err)
                });
            }
        });
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
    },


    deleteone: function (req, res) {
        try {
            console.log(req.query, req.query.docpath);
            Docinfo.findOne({ docpath: req.query.docpath })
                .then(data => {
                    return utilsService.ftpdelete(data.docpath);
                })
                .then(data => {
                    Docinfo.query('delete from docinfo where docpath = ?', [req.query.docpath], function (err, kk) {
                        if (err) {
                            res.json(utilsService.reponseMessage('Error', err));
                        } else {
                            console.log(kk);
                            res.json(utilsService.reponseMessage('OK', `删除成功`));
                        }
                    })
                })
                .catch(err => {
                    res.json(utilsService.reponseMessage('Error', err));
                })
        } catch (err) {
            res.json(utilsService.reponseMessage('Error', err));
        }
    }

};