/**
 * CustInfoController
 *
 * @description :: Server-side logic for managing CustInfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var async = require('async');
'use strict'
module.exports = {
    searchby: function(req, res) {
        let condition = req.body;
        let whereObj = utilsService.getWhereCondition(condition.condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        Product_ccc.count({ where: whereObj }).then(function(resultcount) {
                responseresult.totalCount = resultcount;

                return Product_ccc.find({
                    where: whereObj,
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


    import: function(req,res) {
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
                var sku = req.body.sku;
                var country = req.body.country;
                var uploadperson = req.body.uploadperson;
                var filename = uploadedFiles[0].filename;
                var path = uploadedFiles[0].fd;
                
                utilsService.huiyuftpupload(path, filename).then(ftppath => {
                    console.log(ftppath);
                    Product_ccc.find({
                        sku: sku,
                        country: country,
                    })
                    .then(file =>{
                        if(file.length > 0){
                            Product_ccc.query('delete from product_ccc where id = ?',[file[0].id],function(err,result){
                                if(err){
                                    res.json(utilsService.reponseMessage('Error', err));
                                }else{
                                    Product_ccc.create({
                                        sku: sku,
                                        country: country,
                                        ftppath: ftppath,
                                        filename: filename,
                                        uploadperson: uploadperson
                                    })
                                    .then(result => {
                                        res.json(utilsService.reponseMessage('OK', `导入成功`));
                                    })
                                    .catch(er => {
                                        res.json(utilsService.reponseMessage('Error', err));
                                    })
                                }
                            })
                        }else{
                            Product_ccc.create({
                                sku: sku,
                                country: country,
                                ftppath: ftppath,
                                filename: filename,
                                uploadperson: uploadperson
                            })
                            .then(result => {
                                res.json(utilsService.reponseMessage('OK', `导入成功`));
                            })
                            .catch(er => {
                                res.json(utilsService.reponseMessage('Error', er)); 
                            })
                        }
                    })
                }).catch(err => {
                    res.json(err)
                });
            }
        });
    },


    download: function(req,res){
        try{
            utilsService.huiyudownload(req.query.ftppath).then(ftp => {
                ftp.pipe(res);
            })
            .catch(er => {
                res.json(utilsService.reponseMessage('Error', er)); 
            })
        }catch(err){

        }
    }


};