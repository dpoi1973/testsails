/**
 * CheckInOutInfoController
 *
 * @description :: Server-side logic for managing Checkinoutinfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

'use strict'
module.exports = {
    searchby: function (req, res) {
        let condition = req.body;
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        //console.log(condition.pageIndex);

        let whereObj = utilsService.getWhereCondition(condition.condition);


        CustProductDetailInfo.count({ where: whereObj }).then(function (resultcount) {
            responseresult.totalCount = resultcount;

            return CustProductDetailInfo.find({
                where: whereObj,
                skip: (condition.pageIndex - 1) * condition.pageSize,
                limit: condition.pageSize,
                sort: condition.sortby ? condition.sortby : 'createdate DESC'
            })
                .populate('ClassifiedProductid');
        })
            .then(function (results) {

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
    detailfilljson: function (req, res) {

        //where: { SKU: '858252-001' }
        CustProductDetailInfo.find({}).populate('ClassifiedProductid').then(detailinfos => {
            async.each(detailinfos, function (detail, cb) {

                if (detail.ClassifiedProductid && !detail.templateJson) {
                    var custCspec = detail.ClassifiedProductid.Cspec;
                    var custtempJson = detail.ClassifiedProductid.tempJson;
                    var detailCspec = detail.Cspec.replace(/\(/g, '（').replace(/\)/g, '）');
                    var regstr = '';
                    custCspec = custCspec.substr(1, custCspec.length - 1);
                    custCspec = custCspec.replace(/\|/g, "\\|");
                    for (var key in custtempJson) {
                        if (isArray(custtempJson[key])) {
                            custCspec = custCspec.replace("{{" + key + "}}", "(" + custtempJson[key].join("|").replace(/\(/g, '（').replace(/\)/g, '）') + ")")
                        }
                        else {
                            custCspec = custCspec.replace("{{" + key + "}}", "(.*?)")
                        }
                    }
                    var valre = new RegExp(custCspec, 'igm');
                    var array = [];
                    array = valre.exec(detailCspec);
                    if (array) {
                        var keyre = new RegExp('{{(.*?)}}', 'igm');
                        var keyarray = [];
                        var r;
                        while ((r = keyre.exec(detail.ClassifiedProductid.Cspec.replace(/\(/g, '（').replace(/\)/g, '）'))) != null) {
                            keyarray.push(r[1])
                        }
                        console.log(keyarray);

                        if (keyarray.length == array.length - 1) {
                            var result = {};
                            for (var i = 0; i < keyarray.length; i++) {
                                result[keyarray[i]] = array[i + 1];
                            }
                        }
                        detail.templateJson = result;
                        detail.save(err => {
                            if (err) {
                                cb(err);
                            }
                        });
                    }
                }
            }, function (err) {
                if (err)
                    res.json(err);
                else
                    res.json('ok');
            });
        })
    },

    attachcust: function (req, res) {
        var proid = req.param('id');
        CustProductDetailInfo.findOne({ id: proid })
            .then(product => {
                CustClassifyProductInfo.findOne({ HScode: product.HScode, Cgoodsname: product.Cgoodsname, custid: product.custid }).then(cust => {
                    if (cust) {
                        if (product.Cspec || cust.Cspec) {
                            if (!product.Cspec) {
                                product.Cspec = cust.Cspec;
                            }
                            product.ClassifiedProductid = cust.id;
                            if (cust.pracGoodsname) {
                                product.pracGoodsname = cust.pracGoodsname;
                            }
                            else {
                                product.pracGoodsname = product.Cgoodsname;
                            }

                            product.save(err => {
                                if (err) {
                                    res.json('关联失败');
                                }
                                else {
                                    res.json('关联成功');
                                }
                            });
                        }
                        else {
                            res.json('关联失败');
                        }

                    }
                    else {
                        if (product.HScode && product.Cgoodsname && product.custid) {
                            var hscond = product.HScode;
                            if (hscond.length == 8) {
                                hscond = hscond + '00';
                            }
                            ClassifyInfo.findOne({ HSCode: hscond }).then(classify => {
                                if (classify) {
                                    var classifyinfo = {};
                                    classifyinfo.HScode = product.HScode;
                                    classifyinfo.Cgoodsname = product.Cgoodsname;
                                    classifyinfo.custid = product.custid;
                                    classifyinfo.r2 = classify.TempJson;
                                    classifyinfo.R2Distinct = classify.R2Distinct;
                                    var dist = classifyinfo.R2Distinct.split('|')
                                    var midDic = {};
                                    dist.forEach(function (dt) {
                                        midDic[dt] = dt;
                                    }, this);
                                    classifyinfo.midDic = midDic;
                                    classifyinfo.cunit1 = classify.Unit1;
                                    classifyinfo.cunit2 = classify.Unit2;
                                    CustClassifyProductInfo.create(classifyinfo).then(rez => {
                                        product.ClassifiedProductid = rez.id;
                                        product.save(err => {
                                            if (err) {
                                                res.json('关联失败');
                                            }
                                            else {
                                                res.json('关联成功');
                                            }
                                        });
                                    });
                                }
                                else {
                                    res.json('税号不足10位');
                                }

                            })

                        }
                        else {
                            res.json('关联失败');
                        }

                    }
                })
            })
    },


    reconfirm: function (req, res) {
        var proid = req.param('id');
        CustProductDetailInfo.findOne({ id: proid })
            .then(product => {
                CustProductDetailInfocopy.findOne({ SKU: product.SKU, custid: product.custid })
                    .then(productcopy => {
                        if (!productcopy) {
                            productcopy.id = null;
                            CustProductDetailInfocopy.create(productcopy).then(rez1 => {
                                res.json('ok');
                            });
                        }
                        else {
                            res.json('已存在');
                        }
                    })
            })
    },

    judgeguilei: function (req, res) {
        var aaaerr = [];
        var newerr = [];
        CustProductDetailInfo.find()
            .then(products => {
                ClassifyInfo.find()
                    .then(cftotal => {
                        products.forEach(pro => {
                            var cf = {};
                            for (var i = 0; i < cftotal.length; i++) {
                                if (cftotal[i].HSCode == pro.HScode) {
                                    cf = cftotal[i];
                                    break;
                                }
                            }
                            var rlen = cf.R2Distinct.split('|');
                            var prolen = pro.Cspec.split('|');
                            if (prolen.length != rlen.length - 1) {
                                if (aaaerr.indexOf(pro.ClassifiedProductid) == -1) {
                                    aaaerr.push(pro.ClassifiedProductid);
                                }
                                newerr.push(pro.SKU + '|' + pro.HScode);
                            }
                        })
                        CustClassifyProductInfo.find({ id: aaaerr }).then(custinfos => {
                            if (custinfos) {
                                async.each(custinfos, function (cust, cb) {
                                    cust.Status = '未审核';
                                    cust.save(err => {
                                        autojudgeinfo.destroy({ classifyproductid: cust.id })
                                            .then(updaterecord => {
                                                CustProductDetailInfo.find({ ClassifiedProductid: cust.id })
                                                    .then(products => {
                                                        async.each(products, function (productcopy, cb1) {
                                                            CustProductDetailInfocopy.create(productcopy).then(rez1 => {
                                                                CustProductDetailInfo.destroy({ id: productcopy.id })
                                                                    .then(updaterecord => {
                                                                        cb1();
                                                                    })
                                                                    .error(zer => {
                                                                        cb1(zer);
                                                                    });
                                                            });
                                                        }, function (zerr) {
                                                            cb(zerr)
                                                        })
                                                    })
                                            })
                                    });
                                }, function (zerr) {
                                    res.json(zerr);
                                })
                            }
                            else {
                                res.json('err');
                            }
                        })

                    })
            })
    },

    judgeguileioption: function (req, res) {
        var err = [];
        CustProductDetailInfo.find()
            .then(products => {
                ClassifyInfo.find()
                    .then(cftotal => {
                        products.forEach(pro => {
                            var cf = {};
                            for (var i = 0; i < cftotal.length; i++) {
                                if (cftotal[i].HSCode == pro.HScode) {
                                    cf = cftotal[i];
                                    break;
                                }
                            }
                            if (cf.TempJson) {
                                var prolen = pro.Cspec.split('|');
                                for (var j = 0; j < cf.TempJson.length; j++) {
                                    if (cf.TempJson[j].option) {
                                        var option = cf.TempJson[j].option;
                                        //"(*)#(克、千克、毫升、升、磅、盎司、加仑、其他)#×#(*)#(箱、包、袋、盒、桶、罐、瓶、支、管、片、个、卷、其他)#/#(箱、包、袋、盒、桶、罐、瓶、支、管、片、个、卷、其他)"
                                        var option = option.replace(/#/g, '');
                                        var option = option.replace(/\(.*?\)/g, work => {
                                            if (work.indexOf('其他') != -1 || work == "(*)") {
                                                return ".*";
                                            }
                                            else {
                                                work = work.replace(/、/g, "|");
                                                return work;
                                            }
                                        });
                                        var judg = prolen[j - 1];
                                        var arr = judg.match(option);
                                        if (!arr) {
                                            console.log(option);
                                            console.log(judg);
                                            if (err.indexOf(pro.HScode) == -1) {
                                                err.push(pro.HScode);
                                            }
                                        }
                                    }
                                }
                            }
                        })
                        res.json(err);
                    })
            })
    },

    judgeguileioption: function (req, res) {
        var err = [];
        CustProductDetailInfo.find()
            .then(products => {
                ClassifyInfo.find()
                    .then(cftotal => {
                        products.forEach(pro => {
                            var cf = {};
                            for (var i = 0; i < cftotal.length; i++) {
                                if (cftotal[i].HSCode == pro.HScode) {
                                    cf = cftotal[i];
                                    break;
                                }
                            }
                            if (cf.TempJson) {
                                var prolen = pro.Cspec.split('|');
                                for (var j = 0; j < cf.TempJson.length; j++) {
                                    if (cf.TempJson[j].option) {
                                        var option = cf.TempJson[j].option;
                                        //"(*)#(克、千克、毫升、升、磅、盎司、加仑、其他)#×#(*)#(箱、包、袋、盒、桶、罐、瓶、支、管、片、个、卷、其他)#/#(箱、包、袋、盒、桶、罐、瓶、支、管、片、个、卷、其他)"
                                        var option = option.replace(/#/g, '');
                                        var option = option.replace(/\(.*?\)/g, work => {
                                            if (work.indexOf('其他') != -1 || work == "(*)") {
                                                return ".*";
                                            }
                                            else {
                                                work = work.replace(/、/g, "|");
                                                return work;
                                            }
                                        });
                                        var judg = prolen[j - 1];
                                        var arr = judg.match(option);
                                        if (!arr) {
                                            console.log(option);
                                            console.log(judg);
                                            if (err.indexOf(pro.HScode) == -1) {
                                                err.push(pro.HScode);
                                            }
                                        }
                                    }
                                }
                            }
                        })
                        res.json(err);
                    })
            })
    }

    ,

    judgeguileisub: function (req, res) {
        var err = [];
        CustProductDetailInfo.find()
            .then(products => {
                ClassifyInfo.find()
                    .then(cftotal => {
                        products.forEach(pro => {
                            var cf = {};
                            for (var i = 0; i < cftotal.length; i++) {
                                if (cftotal[i].HSCode == pro.HScode) {
                                    cf = cftotal[i];
                                    break;
                                }
                            }
                            if (cf.TempJson) {
                                var prolen = pro.Cspec.split('|');
                                for (var j = 0; j < cf.TempJson.length; j++) {
                                    if (cf.TempJson[j].option) {
                                        var option = cf.TempJson[j].option;
                                        //"(*)#(克、千克、毫升、升、磅、盎司、加仑、其他)#×#(*)#(箱、包、袋、盒、桶、罐、瓶、支、管、片、个、卷、其他)#/#(箱、包、袋、盒、桶、罐、瓶、支、管、片、个、卷、其他)"
                                        var option = option.replace(/#/g, '');
                                        var option = option.replace(/\(.*?\)/g, work => {
                                            if (work.indexOf('其他') != -1 || work == "(*)") {
                                                return ".*";
                                            }
                                            else {
                                                work = work.replace(/、/g, "|");
                                                return work;
                                            }
                                        });
                                        var judg = prolen[j - 1];
                                        var arr = judg.match(option);
                                        if (!arr) {
                                            console.log(option);
                                            console.log(judg);
                                            if (err.indexOf(pro.HScode) == -1) {
                                                err.push(pro.HScode);
                                            }
                                        }
                                    }
                                }
                            }
                        })
                        res.json(err);
                    })
            })
    }
};


function isArray(o) {
    return Object.prototype.toString.call(o) == '[object Array]';
}