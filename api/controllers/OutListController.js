var XLSX = require('xlsx');
module.exports = {
  
    import: function (req, res) {
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
                    var filename_1 = uploadedFiles[0].filename;
                    var path = uploadedFiles[0].fd;
                    var invlist = Service.read_excel4_info(path, filename_1);
                    var goodsn = '';
                    var lastlist = [];
                    for(var i = 0; i < invlist.length; i ++ ){
                        var ll = {};
                        if(invlist[i].品名 && goodsn != invlist[i].品名){
                            goodsn = invlist[i].品名;
                        }else if (!invlist[i].品名) {
                            invlist[i].品名 = goodsn
                        }
                        ll.id = invlist[i].序号
                        ll.goods_name = invlist[i].品名
                        ll.type = invlist[i].型号.replace(' ','')
                        ll.remark_type = invlist[i].型号.split('(').length > 1 ? invlist[i].型号.split('(')[0].replace(' ','') : invlist[i].型号.split('（')[0].replace(' ','') 
                        ll.hs_code = invlist[i].HS编码 ? invlist[i].HS编码 : ''
                        ll.unit = invlist[i].单位
                        ll.remarks = invlist[i].备注 ? invlist[i].备注 : ''
                        ll.ele_spec = invlist[i].电气规格
                        ll.create_date = invlist[i].办理日期 ? invlist[i].办理日期 : ''
                        ll.declaration = invlist[i].实物申报一致 ? invlist[i].实物申报一致 : ''
                        lastlist.push(ll);
                    }
                OutList.query('delete from outlist',[],function (err,kk) {
                    async.mapSeries(lastlist, function(lis, cb) {
                        // If there is a user with the specified name, return it,
                        // otherwise create one
                            OutList.findOrCreate({type:lis.type,hs_code:lis.hs_code,remarks:lis.remarks},lis).exec(cb);
                        
                    }, 
                    function done(err, users) {
                        if (err) { res.json(utilsService.reponseMessage('Error', err.message));return err;}
                        res.json(utilsService.reponseMessage('OK', `导入业务`));     
                    });
                })
            }
                })
    },

};