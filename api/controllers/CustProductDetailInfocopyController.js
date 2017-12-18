/**
 * CheckInOutInfoController
 *
 * @description :: Server-side logic for managing Checkinoutinfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var crypto = require('crypto');
'use strict'
module.exports = {
    searchby: function (req, res) {
        let condition = req.body;
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        //console.log(condition.pageIndex);

        let whereObj = utilsService.getWhereCondition(condition.condition);


        CustProductDetailInfocopy.count({ where: whereObj }).then(function (resultcount) {
            responseresult.totalCount = resultcount;

            return CustProductDetailInfocopy.find({
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



    //
    detailfilljson: function (req, res) {

        //where: { SKU: '858252-001' }
        CustProductDetailInfocopy.find({}).populate('ClassifiedProductid').then(detailinfos => {
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
        paracom.find({ paratype: ['款式', '内底长度'] })
            .then(paras => {
                var paracom = {};
                paras.forEach(sec => {
                    paracom[sec.paratype + '_' + sec.parakey] = sec.paravalue;
                })
                CustProductDetailInfocopy.findOne({ id: proid })
                    .then(product => {
                        CustClassifyProductInfo.findOne({ HScode: product.HScode, Cgoodsname: product.Cgoodsname, custid: product.custid }).then(cust => {
                            if (cust) {
                                if (cust.Cspec) {
                                    product.fakeCspec = '|' + cust.Cspec;
                                    product.ClassifiedProductid = cust.id;
                                    var attachjson = Object.assign(product.templateJson, product.opetempjson);

                                    product.pracGoodsname = cust.pracGoodsname;
                                    product.opegoodsname = cust.pracGoodsname.replace(/\[.*?\]/g, word => {
                                        var wj = word.replace(/\[|\]/g, '');
                                        var word_sec = attachjson[wj];
                                        return word_sec;
                                    });
                                    product.Cspec = cust.Cspec.replace(/\[.*?\]/g, word => {
                                        var wj = word.replace(/\[|\]/g, '');
                                        var word_sec = attachjson[wj];
                                        return word_sec;
                                    });
                                    product.Cspec = product.Cspec.replace(/{.*?}/g, word => {
                                        var wj = word.replace(/{|}/g, '');
                                        var word_sec = paracom[wj];
                                        return word_sec;
                                    });
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
                                    ClassifyInfo.findOne({ HSCode: product.HScode }).then(classify => {
                                        if (classify) {
                                            var classifyinfo = {};
                                            classifyinfo.HScode = product.HScode;
                                            classifyinfo.Cgoodsname = product.Cgoodsname;
                                            classifyinfo.custid = product.custid;
                                            classifyinfo.r2 = classify.TempJson;
                                            classifyinfo.R2Distinct = classify.R2Distinct;
                                            classifyinfo.Status = '未审核';
                                            var dist = classifyinfo.R2Distinct.split('|')
                                            var midDic = {};
                                            dist.forEach(function (dt) {
                                                midDic[dt] = dt;
                                            }, this);
                                            classifyinfo.midDic = midDic;
                                            CustClassifyProductInfo.create(classifyinfo).then(rez => {
                                                res.json('关联失败');
                                            });
                                        }

                                    })

                                }
                                else {
                                    res.json('关联失败');
                                }

                            }
                        })
                    })
            })
    },


    // 更新opegoodsname,Cspec  生成申报要素
    filllastcspec: function (req, res) {
        var proid = req.param('id');
        paracom.find({ paratype: ['款式', '内底长度'] })
            .then(paras => {
                var paracom = {};
                paras.forEach(sec => {
                    paracom[sec.paratype + '_' + sec.parakey] = sec.paravalue;
                })
                CustProductDetailInfocopy.find({ custid: proid, 'status': '自动归类' }).populate('custid').then(detailinfos => {
                    async.each(detailinfos, function (product, cb) {
                        var totaljson = Object.assign(product.templateJson, product.opetempjson);
                        product.opegoodsname = product.pracGoodsname.replace(/\[.*?\]/g, word => {
                            var wj = word.replace(/\[|\]/g, '');
                            var word_sec = totaljson[wj];
                            return word_sec;
                        });
                        product.Cspec = product.fakeCspec.replace(/\[.*?\]/g, word => {
                            var wj = word.replace(/\[|\]/g, '');
                            var word_sec = totaljson[wj];
                            return word_sec;
                        });
                        product.Cspec = product.Cspec.replace(/{.*?}/g, word => {
                            var wj = word.replace(/{|}/g, '');
                            var word_sec = paracom[wj];
                            return word_sec;
                        });
                        if (product.Cspec.substr(0, 1) == '|') {
                            product.Cspec = product.Cspec.substr(1, product.Cspec.length)
                        }
                        product.status = '归类完成';
                        product.save(err => {
                            cb(err);
                        })

                    }, function (err) {
                        if (err)
                            res.json(err);
                        else
                            res.json('ok');
                    })
                })
            })
    },

    saveopetempjson: function (req, res) {
        var proid = req.param('id');
        var opetempjson = req.body;
        paracom.find({ paratype: ['款式', '内底长度'] })
            .then(paras => {
                var paracom = {};
                paras.forEach(sec => {
                    paracom[sec.paratype + '_' + sec.parakey] = sec.paravalue;
                })
                CustProductDetailInfocopy.findOne({ id: proid })
                    .then(product => {
                        product.opetempjson = opetempjson;
                        var attachjson = Object.assign(product.templateJson, product.opetempjson);

                        product.opegoodsname = product.pracGoodsname.replace(/\[.*?\]/g, word => {
                            var wj = word.replace(/\[|\]/g, '');
                            var word_sec = attachjson[wj];
                            return word_sec;
                        });
                        product.Cspec = product.fakeCspec.replace(/\[.*?\]/g, word => {
                            var wj = word.replace(/\[|\]/g, '');
                            var word_sec = attachjson[wj];
                            return word_sec;
                        });
                        product.Cspec = product.Cspec.replace(/{.*?}/g, word => {
                            var wj = word.replace(/{|}/g, '');
                            var word_sec = paracom[wj];
                            return word_sec;
                        });
                        product.save(err => {
                            if (err) {
                                res.json('fail');
                            }
                            else {
                                res.json('ok');
                            }
                        });
                    })
            })

    },



    // 确认测试产品 插入autojudgeinfo  根据custinfo表确定md5 确认通过
    confirmtopro: function (req, res) {
        var proid = req.param('id');
        CustProductDetailInfocopy.findOne({ id: proid })
            .then(productcopy => {
                if (utilsService.judgeconfirm(productcopy)) {
                    autojudgeinfo.findOne({ classifyKey: productcopy.ClassifyMD5Source })
                        .then(judge => {
                            if (!judge) {
                                var judgeinfo = {};
                                judgeinfo.materialKey = '';
                                judgeinfo.classifyKey = productcopy.ClassifyMD5Source;
                                judgeinfo.originJson = productcopy.templateJson;
                                judgeinfo.materialDesc = productcopy.templateJson.MaterialEN;
                                judgeinfo.classifyDesc = '';
                                judgeinfo.custid = productcopy.custid;
                                judgeinfo.classifyproductid = productcopy.ClassifiedProductid;
                                judgeinfo.pracGoodsname = productcopy.pracGoodsname;
                                judgeinfo.fakeCspec = productcopy.fakeCspec;
                                judgeinfo.opetempjson = productcopy.opetempjson;
                                judgeinfo.classifyStatus = 2;
                                autojudgeinfo.create(judgeinfo).then(rez => {
                                    productcopy.status = '已归类';
                                    productcopy.save(err => {
                                        if (err) {
                                            res.json('fail');
                                        }
                                        else {
                                            res.json('ok');
                                        }
                                    });
                                });
                            }
                            else {
                                judge.classifyproductid = productcopy.ClassifiedProductid;
                                judge.pracGoodsname = productcopy.pracGoodsname;
                                judge.fakeCspec = productcopy.fakeCspec;
                                judge.opetempjson = productcopy.opetempjson;
                                judge.classifyStatus = 2;
                                judge.save(err => {
                                    productcopy.status = '已归类';
                                    productcopy.save(err => {
                                        if (err) {
                                            res.json('fail');
                                        }
                                        else {
                                            res.json('ok');
                                        }
                                    });
                                });
                            }
                        });
                }
                else {
                    res.json('归类不正确，无法确认');
                }
            })

    },


    // 批量确认  已作废
    confirmtoprototal: function (req, res) {
        autojudgeinfo.find({ classifyStatus: 2 })
            .then(judgeinfos => {
                async.each(judgeinfos, function (judge, cb) {
                    CustProductDetailInfo.find({ ClassifyMD5Source: judge.classifykey })
                        .then(pros => {
                            async.each(pros, function (pro, cb1) {
                                var attachjson = Object.assign(judge.originJson, judge.opetempjson);
                                pro.pracGoodsname = judge.pracGoodsname;
                                pro.fakeCspec = judge.fakeCspec;
                                pro.templateJson = judge.originJson;
                                pro.opetempjson = judge.opetempjson;
                                pro.opegoodsname = judge.pracGoodsname.replace(/\[.*?\]/g, word => {
                                    var wj = word.replace('[', '').replace(']', '');
                                    if (attachjson[wj]) {
                                        word = attachjson[wj];
                                    }
                                    return word;
                                });
                                pro.Cspec = judge.fakeCspec.replace(/\[.*?\]/g, word => {
                                    var wj = word.replace('[', '').replace(']', '');
                                    if (attachjson[wj]) {
                                        word = attachjson[wj];
                                    }
                                    return word;
                                });
                                pro.save(err => {
                                    cb1(err);
                                });
                            }, function (err) {
                                if (err) {
                                    res.json(err);
                                }
                                else {
                                    CustProductDetailInfocopy.find({ ClassifyMD5Source: judge.classifykey })
                                        .then(copys => {
                                            async.each(copys, function (copy, cb2) {
                                                CustProductDetailInfo.findOne({ SKU: copy.SKU, custid: copy.custid })
                                                    .then(product => {
                                                        if (!product) {
                                                            productcopy.id = null;
                                                            productcopy.pracGoodsname = judge.pracGoodsname;
                                                            productcopy.fakeCspec = judge.fakeCspec;
                                                            productcopy.templateJson = judge.originJson;
                                                            productcopy.opetempjson = judge.opetempjson;
                                                            var attachjson = Object.assign(judge.originJson, judge.opetempjson);
                                                            productcopy.opegoodsname = judge.pracGoodsname.replace(/\[.*?\]/g, word => {
                                                                var wj = word.replace('[', '').replace(']', '');
                                                                if (attachjson[wj]) {
                                                                    word = attachjson[wj];
                                                                }
                                                                return word;
                                                            });
                                                            productcopy.Cspec = judge.fakeCspec.replace(/\[.*?\]/g, word => {
                                                                var wj = word.replace('[', '').replace(']', '');
                                                                if (attachjson[wj]) {
                                                                    word = attachjson[wj];
                                                                }
                                                                return word;
                                                            });
                                                            CustProductDetailInfo.create(productcopy).then(rez1 => {
                                                                CustProductDetailInfocopy.destroy({ id: productcopy.id })
                                                                    .then(updaterecord => {
                                                                        cb2();
                                                                    })
                                                                    .error(er => {
                                                                        cb2(er);
                                                                    });
                                                            });
                                                        }
                                                        else {
                                                            CustProductDetailInfocopy.destroy({ id: productcopy.id })
                                                                .then(updaterecord => {
                                                                    cb2();
                                                                })
                                                                .error(er => {
                                                                    cb2(er);
                                                                });
                                                        }
                                                    })


                                            }, function (err) {
                                                if (err) {
                                                    res.json(err);
                                                }
                                                else {
                                                    judge.classifyStatus = 1;
                                                    judge.save(err => {
                                                        cb(err);
                                                    });
                                                }

                                            })
                                        });
                                }
                            })
                        })
                }, function (err) {
                    if (err)
                        res.json(err);
                    else
                        res.json('ok');
                });


            })
        // CustProductDetailInfocopy.find({ 'status': '自动归类' })
        //     .then(productcopys => {
        //         async.each(productcopys, function (productcopy, cb) {
        //             CustProductDetailInfo.findOne({ SKU: productcopy.SKU, custid: productcopy.custid })
        //                 .then(product => {
        //                     if (product) {
        //                         for (var key in product) {
        //                             if (key != 'id' && key != 'save') {
        //                                 product[key] = productcopy[key];
        //                             }
        //                         }
        //                         var attachjson = Object.assign(product.templateJson, product.opetempjson);
        //                         product.opegoodsname = product.pracGoodsname.replace(/\[.*?\]/g, word => {
        //                             var wj = word.replace('[', '').replace(']', '');
        //                             if (attachjson[wj]) {
        //                                 word = attachjson[wj];
        //                             }
        //                             return word;
        //                         });
        //                         product.Cspec = product.fakeCspec.replace(/\[.*?\]/g, word => {
        //                             var wj = word.replace('[', '').replace(']', '');
        //                             if (attachjson[wj]) {
        //                                 word = attachjson[wj];
        //                             }
        //                             return word;
        //                         });
        //                         product.save(err => {
        //                             CustProductDetailInfocopy.destroy({ id: productcopy.id })
        //                                 .then(updaterecord => {
        //                                     cb();
        //                                 })
        //                                 .error(er => {
        //                                     cb(er);
        //                                 });
        //                         });
        //                     }
        //                     else {
        //                         productcopy.id = null;
        //                         var attachjson = Object.assign(productcopy.templateJson, productcopy.opetempjson);
        //                         productcopy.opegoodsname = productcopy.pracGoodsname.replace(/\[.*?\]/g, word => {
        //                             var wj = word.replace('[', '').replace(']', '');
        //                             if (attachjson[wj]) {
        //                                 word = attachjson[wj];
        //                             }
        //                             return word;
        //                         });
        //                         productcopy.Cspec = productcopy.fakeCspec.replace(/\[.*?\]/g, word => {
        //                             var wj = word.replace('[', '').replace(']', '');
        //                             if (attachjson[wj]) {
        //                                 word = attachjson[wj];
        //                             }
        //                             return word;
        //                         });
        //                         CustProductDetailInfo.create(productcopy).then(rez1 => {
        //                             CustProductDetailInfocopy.destroy({ id: productcopy.id })
        //                                 .then(updaterecord => {
        //                                     cb();
        //                                 })
        //                                 .error(er => {
        //                                     cb(er);
        //                                 });
        //                         });
        //                     }
        //                 })

        //         }, function (err) {
        //             if (err)
        //                 res.json(err);
        //             else
        //                 res.json('ok');
        //         })
        //     })

    },


    // 更新或填充MD5key 根据custinfo 更新md5key
    refreshmd5andlink: function (req, res) {
        var proid = req.param('id');
        CustProductDetailInfocopy.find({ custid: proid }).populate('custid').then(detailinfos => {
            async.each(detailinfos, function (detail, cb) {
                var str = detail.custid.md5key.replace(/\[.*?\]/g, word => {
                    var wj = word.replace('[', '').replace(']', '');
                    if (detail.templateJson[wj]) {
                        word = detail.templateJson[wj];
                    }
                    return word;
                });
                var shasum = crypto.createHash('md5');
                shasum.update(str);
                var md5 = shasum.digest('hex');
                detail.ClassifyMD5Source = md5;
                detail.save(err => {
                    cb(err);
                });

            }, function (err) {
                if (err)
                    res.json(err);
                else
                    res.json('ok');
            })
        })
    },

    //  把autojudgeinfo中数据更新回CustProductDetailInfocopy表  填充商品临时库  预归类
    backautojudgeinfo: function (req, res) {
        // 更新copy表的md5，pracGoodsname，fakeCspec，Cgoodsname 关联custclassifyproductinfo表
        var sqlstr = 'update custproductdetailinfocopy c,autojudgeinfo j,custclassifyproductinfo f set c.ClassifiedProductid=j.classifyproductid,c.pracGoodsname=j.pracGoodsname,c.fakeCspec=j.fakeCspec,c.Cgoodsname=f.Cgoodsname,c.status="自动归类" where c.ClassifyMD5Source=j.classifykey and c.custid=j.custid    and j.classifyproductid=f.id and c.ClassifyMD5Source!=""  and j.classifyStatus=2';
        CustProductDetailInfocopy.query(sqlstr, function (err, result) {
            if (err) {
                res.json('fail');
            } else {
                res.json('ok');

            }
        });
    },


    //  完成归类移到CustProductDetailInfo
    productmovetofin: function (req, res) {
        // 获取所有归类完成数据 移到CustProductDetail 删除归类数据   status: "归类完成"  必须下载后才能移到
        CustProductDetailInfocopy.find({ status: "归类完成" }).then(detailinfos => {
            async.each(detailinfos, function (detail, cb) {
                var copyid = detail.id;
                detail.id = 0;
                CustProductDetailInfo.findOne({ custid: detail.custid, SKU: detail.SKU }).then(pro => {
                    if (pro) {
                        CustProductDetailInfo.destroy({ id: pro.id })
                            .then(updaterecord => {
                                CustProductDetailInfo.create(detail).then(rez => {
                                    CustProductDetailInfocopy.destroy({ id: copyid })
                                        .then(updaterecord => {
                                            cb();
                                        })
                                });
                            })
                            .error(er => {
                                cb(er)
                            });
                    }
                    else {
                        CustProductDetailInfo.create(detail).then(rez => {
                            CustProductDetailInfocopy.destroy({ id: copyid })
                                .then(updaterecord => {
                                    cb();
                                })
                        });
                    }
                })
            }, function (err) {
                InvoiceDetailInfo.query('CALL freshkweskuinfo() ', function (nerr, nresult) {
                    if (nerr)
                        res.json(nerr);
                    else
                        res.json('ok');
                })
            })
        })
    },

    syntemj: function (req, res) {
        var proid = req.param('id');
        paracom.find({ select: ['parakey', 'paravalue'], where: { paratype: '材质英中' } })
            .then((paratotal) => {
                var para = {};
                paratotal.forEach(t => {
                    para[t.parakey] = t.paravalue;
                })
                CustProductDetailInfocopy.find({ custid: proid }).populate('ClassifiedProductid').then(detailinfos => {
                    async.each(detailinfos, function (detail, cb) {
                        InvoiceDetailInfo.findOne({ sku: detail.SKU }).then(inv => {
                            if (inv) {
                                detail.templateJson = inv.productDetailJson;
                                if (!detail.templateJson.maincomp) {
                                    detail.templateJson.maincomp = utilsService.getmainmaterial(inv.productDetailJson.MaterialEN, para);
                                }
                                if (!detail.templateJson.CProductName) {
                                    detail.templateJson.CProductName = detail.Cgoodsname;
                                }
                                detail.opetempjson = {};
                                detail.opetempjson.maincomp = detail.templateJson.maincomp;
                                detail.opetempjson.CProductName = detail.templateJson.CProductName;
                                detail.save(err => {
                                    if (err) {
                                        cb(err);
                                    }
                                });
                            }
                            else {
                                cb();
                            }

                        })
                    }, function (err) {
                        if (err)
                            res.json(err);
                        else
                            res.json('ok');
                    })
                })
            })
    },

    // 同表更新templatejson  已作废
    syntemjlocal: function (req, res) {
        var proid = req.param('id');
        paracom.find({ select: ['parakey', 'paravalue'], where: { paratype: '材质英中' } })
            .then((paratotal) => {
                var para = {};
                paratotal.forEach(t => {
                    para[t.parakey] = t.paravalue;
                })
                console.log(proid);
                CustProductDetailInfocopy.find({ custid: proid }).populate('ClassifiedProductid').then(detailinfos => {
                    var i = 1;
                    async.each(detailinfos, function (detail, cb) {
                        console.log(i + '/' + detailinfos.length);
                        i++;
                        detail.templateJson.HScode = detail.HScode;
                        if (!detail.templateJson.maincomp) {
                            if (detail.templateJson.MaterialEN) {
                                detail.templateJson.maincomp = utilsService.getmainmaterial(detail.templateJson.MaterialEN, para);
                            }
                        }
                        if (!detail.templateJson.CProductName) {
                            detail.templateJson.CProductName = detail.Cgoodsname;
                        }
                        detail.opetempjson = {};
                        detail.opetempjson.maincomp = detail.templateJson.maincomp;
                        detail.opetempjson.CProductName = detail.templateJson.CProductName;
                        detail.save(err => {
                            if (err) {
                                cb(err);
                            }
                        });
                    }, function (err) {
                        console.log(err);
                        if (err)
                            res.json(err);
                        else
                            res.json('ok');
                    })
                }).catch(err => {
                    console.log(err);
                })
            })
    },
    syntemjlocalsingle: function (req, res) {
        var proid = req.param('id');
        paracom.find({ select: ['parakey', 'paravalue'], where: { paratype: '材质英中' } })
            .then((paratotal) => {
                var para = {};
                paratotal.forEach(t => {
                    para[t.parakey] = t.paravalue;
                })
                console.log(proid);
                CustProductDetailInfocopy.find({ id: proid }).populate('ClassifiedProductid').then(detailinfos => {
                    var i = 1;
                    async.each(detailinfos, function (detail, cb) {
                        console.log(i + '/' + detailinfos.length);
                        i++;
                        if (!detail.templateJson.maincomp) {
                            if (detail.templateJson.MaterialEN) {
                                detail.templateJson.maincomp = utilsService.getmainmaterial(detail.templateJson.MaterialEN, para);
                            }
                        }
                        if (!detail.templateJson.CProductName) {
                            detail.templateJson.CProductName = detail.Cgoodsname;
                        }
                        detail.opetempjson = {};
                        detail.opetempjson.maincomp = detail.templateJson.maincomp;
                        detail.opetempjson.CProductName = detail.templateJson.CProductName;
                        detail.save(err => {
                            if (err) {
                                cb(err);
                            }
                        });
                    }, function (err) {
                        console.log(err);
                        if (err)
                            res.json(err);
                        else
                            res.json('ok');
                    })
                }).catch(err => {
                    console.log(err);
                })
            })
    },

    //从md中取mainmaterial，maincomp保存至CustProductDetailInfocopy templatejson 同表更新templatejson
    jsonfrommd: function (req, res) {
        var proid = req.param('id');
        var keylist = [];
        keylist.push('面料');
        keylist.push('帮面材料');
        paracom.find({ select: ['parakey', 'paravalue'], where: { paratype: 'Matrial' } })
            .then((paratotal) => {
                var para = {};
                paratotal.forEach(t => {
                    para[t.parakey] = t.paravalue;
                })
                md.find({}).then((mds) => {
                    async.mapSeries(mds, function (detail, cb) {
                        CustProductDetailInfocopy.findOne({ SKU: detail['SKU CUSTOMS'], custid: proid }).then(pro => {
                            if (pro) {
                                var linkRegx = /(.*?):(.*?)(?=\n|$)/g;
                                var count = 0;
                                var comobj = {};
                                while ((result = linkRegx.exec(detail['composition'])) != null) {
                                    if (result.length >= 2) {
                                        var tmpkey = result[1].replace(/\s/g, "");
                                        var tmpvalue = result[2].replace(/\s/g, "");
                                        comobj[tmpkey] = tmpvalue;
                                        count++;
                                        // if (keylist.indexOf(tmpkey) == -1) {
                                        //     keylist.push(tmpkey);
                                        // }
                                    }
                                }
                                comobj.TARIFF_GROUP = detail['TARIFF_GROUP'];
                                pro.templateJson = Object.assign(pro.templateJson, comobj);
                                pro.templateJson.sku = pro.SKU;
                                console.log(pro.templateJson);
                                if (count == 1) {
                                    for (var key in comobj) {
                                        if (key != 'TARIFF_GROUP') {
                                            pro.templateJson.mainmaterial = pro.templateJson[key];
                                        }
                                    }
                                }
                                else {
                                    for (var key in comobj) {
                                        if (keylist.indexOf(key) != -1) {
                                            pro.templateJson.mainmaterial = pro.templateJson[key];
                                        }
                                    }
                                }

                                if (pro.templateJson.mainmaterial) {
                                    var maincomp = '';
                                    var matRegx = /\d{1,3}%(.+?)([0-9]|$)/g;
                                    while ((result = matRegx.exec(pro.templateJson.mainmaterial)) != null) {
                                        if (result.length >= 2) {
                                            maincomp = result[1].replace(/\s/g, "");
                                            console.log(maincomp);
                                            break;
                                        }
                                    }
                                    console.log(maincomp);
                                    pro.templateJson.maincomp = maincomp;
                                    if (!pro.opetempjson) {
                                        pro.opetempjson = {};
                                    }
                                    pro.opetempjson.mainmaterial = pro.templateJson.mainmaterial;
                                    var repmaincomp = pro.templateJson.maincomp;
                                    if (para[pro.templateJson.maincomp]) {
                                        repmaincomp = para[pro.templateJson.maincomp];
                                    }
                                    pro.opetempjson.maincomp = repmaincomp;
                                    pro.opetempjson.CProductName = pro.templateJson.CProductName;
                                }
                                pro.save(err => {
                                    cb(err);
                                });
                            }
                            else {
                                cb();
                            }
                        })

                    }, function (err) {
                        if (err)
                            res.json(err);
                        else
                            res.json('ok');
                    })
                })
            })
    },

    //批量关联确认
    manualattachcust: function (req, res) {
        var proid = req.param('id');
        paracom.find({ paratype: ['款式', '内底长度'] })
            .then(paras => {
                var paracom = {};
                paras.forEach(sec => {
                    paracom[sec.paratype + '_' + sec.parakey] = sec.paravalue;
                })
                CustProductDetailInfocopy.find({ custid: proid, status: { '!': '已归类' } })
                    .then(products => {
                        console.log('getlist');
                        async.mapSeries(products, function (product, cb) {
                            autojudgeinfo.findOne({ classifyKey: product.ClassifyMD5Source })
                                .then(hasjudge => {
                                    if (!hasjudge) {
                                        CustClassifyProductInfo.findOne({ HScode: product.HScode, Cgoodsname: product.Cgoodsname, custid: product.custid }).then(cust => {
                                            console.log(cust);
                                            if (cust) {
                                                if (cust.Cspec) {
                                                    product.fakeCspec = '|' + cust.Cspec;
                                                    product.ClassifiedProductid = cust.id;
                                                    var attachjson = Object.assign(product.templateJson, product.opetempjson);

                                                    product.pracGoodsname = cust.pracGoodsname;
                                                    product.opegoodsname = cust.pracGoodsname.replace(/\[.*?\]/g, word => {
                                                        var wj = word.replace(/\[|\]/g, '');
                                                        var word_sec = attachjson[wj];
                                                        return word_sec;
                                                    });
                                                    product.Cspec = cust.Cspec.replace(/\[.*?\]/g, word => {
                                                        var wj = word.replace(/\[|\]/g, '');
                                                        var word_sec = attachjson[wj];
                                                        return word_sec;
                                                    });
                                                    product.Cspec = product.Cspec.replace(/{.*?}/g, word => {
                                                        var wj = word.replace(/{|}/g, '');
                                                        var word_sec = paracom[wj];
                                                        return word_sec;
                                                    });
                                                    console.log(product.Cspec);
                                                    // if(product.Cgoodsname.indexOf('鞋')!=-1){

                                                    // }
                                                    if (product.Cspec.indexOf('未归类') != -1 || product.Cspec.indexOf('undefined') != -1) {
                                                        product.status = '归类有误';
                                                    }
                                                    else {
                                                        product.status = '已归类';
                                                    }
                                                    product.save(err => {
                                                        autojudgeinfo.findOne({ classifyKey: product.ClassifyMD5Source })
                                                            .then(judge => {
                                                                if (!judge) {
                                                                    var judgeinfo = {};
                                                                    judgeinfo.materialKey = '';
                                                                    judgeinfo.classifyKey = product.ClassifyMD5Source;
                                                                    judgeinfo.originJson = product.templateJson;
                                                                    judgeinfo.materialDesc = product.templateJson.MaterialEN;
                                                                    judgeinfo.classifyDesc = '';
                                                                    judgeinfo.custid = product.custid;
                                                                    judgeinfo.classifyproductid = product.ClassifiedProductid;
                                                                    judgeinfo.pracGoodsname = product.pracGoodsname;
                                                                    judgeinfo.fakeCspec = product.fakeCspec;
                                                                    judgeinfo.opetempjson = product.opetempjson;
                                                                    if (product.status == '已归类') {
                                                                        judgeinfo.classifyStatus = 2;
                                                                    }
                                                                    else {
                                                                        judgeinfo.classifyStatus = 0;
                                                                    }
                                                                    autojudgeinfo.create(judgeinfo).then(rez => {
                                                                        cb();
                                                                    });
                                                                }
                                                                else {
                                                                    judge.classifyproductid = product.ClassifiedProductid;
                                                                    judge.pracGoodsname = product.pracGoodsname;
                                                                    judge.fakeCspec = product.fakeCspec;
                                                                    judge.opetempjson = product.opetempjson;
                                                                    if (product.status == '已归类') {
                                                                        judgeinfo.classifyStatus = 2;
                                                                    }
                                                                    else {
                                                                        judgeinfo.classifyStatus = 0;
                                                                    }
                                                                    judge.save(err => {
                                                                        cb();
                                                                    });
                                                                }
                                                            });
                                                    });
                                                }
                                                else {
                                                    cb();
                                                }
                                            }
                                            else {
                                                cb();
                                            }
                                        })
                                    }
                                    else {
                                        cb();
                                    }

                                })
                        }, function (err) {
                            autojudgeinfo.destroy({ classifyStatus: 0 })
                                .then(err => {
                                    if (err)
                                        res.json(err);
                                    else
                                        res.json('ok');
                                })
                        })
                    })
            })
    }
};


function isArray(o) {
    return Object.prototype.toString.call(o) == '[object Array]';
}