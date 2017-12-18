/**
 * YWinfoController
 *
 * @description :: Server-side logic for managing Ywinfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
// var edi = require('edino-lib')
// var edino = new edi('mysql://wanli:123456789@192.168.0.74:3306/qqautodb');
var request = require('request');
var uuid = require('node-uuid');
var fs = require('fs');
'use strict'



var sor = { "ie_flag": "9", "pre_entry_id": "EDI169000012908501", "customs_id": "EDI169000012908501", "manual_no": "", "contr_no": "BFSE001677", "i_e_date": "2016-11-17", "d_date": "2016-11-18", "trade_co": "3122240460", "trade_name": "上海慧与有限公司", "owner_code": "3122240460", "owner_name": "上海慧与有限公司", "agent_code": "3120980025", "agent_name": "上海万历报关有限公司", "traf_mode": "7", "traf_name": "", "voyage_no": "", "bill_no": "", "trade_mode": "0110", "cut_mode": "101", "pay_way": "", "lisence_no": "", "trade_country": "142", "distinate_port": "142", "district_code": "31222", "appr_no": "", "trans_mode": "1", "fee_mark": "", "fee_rate": "", "fee_curr": "", "insur_mark": "", "insur_rate": "", "insur_curr": "", "other_mark": "", "other_rate": "", "other_curr": "", "pack_no": "12", "wrap_type": "2", "gross_wt": "66.72", "net_wt": "51.4406", "ex_source": "0(0)", "type_er": "0", "entry_group": "Entr", "username": "WLD7", "i_e_port": "2218", "note_s": "/0505/0505Y201611170482376/分拨货物", "print_date": "", "SUP_FLAG": "", "CollectTax": "0", "Two_Audit": "", "chk_surety": "0", "BILL_TYPE": "", "PaperLessTax": "", "Tax_Amount": "", "is_status_old": "3", "Tax_No": "", "CBE": "", "TRADE_CO_SCC": "", "AGENT_CODE_SCC": "", "OWNER_CODE_SCC": "", "PROMISE_ITMES": "0000", "TRADE_AREA_CODE": "142", "EDI_NO": "EDI169000012908501", "COP_NO": "BG201611KWGQ006234", "DECL_PORT": "2218", "create_date": "", "formlist1": [], "certlist": [], "container": [] }

var listsor = { "pre_entry_id": "221820161186842504", "g_no": "0", "code_t": "84717010", "code_s": "", "g_name": "硬盘", "g_model": "J9F48A", "qty_1": "32.00000", "g_unit": "035", "decl_price": "120.4688", "trade_total": "3855.00", "trade_curr": "502", "qty_conv": "60.00000", "unit_1": "001", "ver_no": "", "prdt_no": "", "use_to": "", "origin_country": "132", "contr_item": "", "qty_2": "", "unit_2": "", "duty_mode": "3", "work_usd": "", "create_date": "2016年11月18", "entry_group": "ABCD", "FORM_LIST_GUID": "384c43c9782e4c4299d1c677abb24e72", "SUP_TYPE": "", "DESTINATION_COUNTRY": "142" }

module.exports = {
    // hello: function (req, res) {
    //     // Make sure this is a socket request (not traditional HTTP)
    //     if (!req.isSocket) {
    //         return res.badRequest();
    //     }
    //     // Have the socket which made the request join the "funSockets" room
    //     sails.sockets.join(req, 'funSockets');
    //     // Broadcast a "hello" message to all the fun sockets.
    //     // This message will be sent to all sockets in the "funSockets" room,
    //     // but will be ignored by any client sockets that are not listening-- i.e. that didn't call `io.socket.on('hello', ...)`
    //     sails.sockets.broadcast('funSockets', 'hello', { id: 1 }, req);
    //     // Respond to the request with an a-ok message
    //     return res.ok({ message: 'helloOK' });
    // },
    // 'test': function (req, res) {
    //     sails.sockets.join(req, 'funSockets');
    //     sails.sockets.broadcast('funSockets', 'hello', { id: 'jsfjejiejf' }, req);
    //     return res.ok({ message: 'testOK' });

    // },
    //
    'doGuiLeiAction': function (req, res) {
        var ywid = req.query.id;
        var combine = req.body.combine;
        if (!combine) {
            combine = [];
        }
        InvoiceDetailInfo.find({ ywinfoid: ywid })
            .populate('ywinfoid')
            .then(invoicelist => {
                console.log('zara业务');
                var ywinfo = invoicelist[0].ywinfoid;
                console.log(ywinfo);
                var testids = [];
                var currs = [];
                var countries = [];
                invoicelist.forEach(v => {
                    if (testids.indexOf(v.sku.toUpperCase()) == -1)
                        testids.push(v.sku.toUpperCase());
                    if (currs.indexOf(v.Curr) == -1)
                        currs.push(v.Curr);
                    if (countries.indexOf(v.OCOO) == -1)
                        countries.push(v.OCOO);
                })
                console.log('逐条归类');
                console.log(testids)
                //逐条归类？ SKU: { contains: testids }
                var custcondition = {};
                if (testids.length < 50) {
                    custcondition.SKU = { contains: testids };
                }
                else {
                    custcondition.custid = ywinfo.custid;
                }
                return [CustProductDetailInfo.find(custcondition).populate('ClassifiedProductid'), invoicelist,
                HelpPara.find({
                    select: ['paraHelpEn', 'paraDisplayName'],
                    where: { paratypeName: '国别', paraHelpEn: countries }
                }), HelpPara.find({ select: ['paraRawName', 'paraDisplayName'], where: { paratypeName: '币制', paraRawName: currs } })
                    , utilsService.getUnit(), testids, paracom.find({ paratype: 'Brand' }), paracom.find({ paratype: ['DESC_SECTION', 'TARIFF_GROUP', 'Matrial'] }), ywinfo
                ]
            }).spread((custproducts, invoicelist, paraCountries, paraCurrs, UNITlist, testids, vendors, section, ywinfo) => {
                var skulist = [];
                custproducts.forEach(cp => {
                    if (skulist.indexOf(cp.SKU) == -1) {
                        skulist.push(cp.SKU);
                    }
                    else {
                        throw new Error(cp.SKU + '商品信息重复')
                    }
                })
                console.log('商品信息未重复');
                custproducts.forEach(cp => {
                    if (!cp.Cspec || !cp.ClassifiedProductid || cp.Cspec.indexOf('未归类zz') != -1) {
                        throw new Error(cp.SKU + '商品未归类')
                        //res.json(utilsService.reponseMessage('Error', ));
                    }
                    _.remove(testids, function (n) {
                        return n == cp.SKU;
                    });
                });
                if (custproducts.length == 0 || testids.length > 0) {
                    var detailinfos = [];
                    testids.forEach(sku => {
                        if (!_.some(detailinfos, { 'SKU': sku.toUpperCase() }) && sku) {
                            var invoice = _.find(invoicelist, inv => {
                                return inv.sku == sku.toUpperCase();
                            })
                            var detail = {};
                            detail.SKU = sku.toUpperCase();
                            detail.HScode = invoice.HSCode;
                            detail.templateJson = invoice.productDetailJson;
                            if (invoice.Cgoodsname.indexOf('/') != -1) {
                                detail.Cgoodsname = invoice.Cgoodsname.substr(0, invoice.Cgoodsname.indexOf('/'));
                            }
                            else {
                                detail.Cgoodsname = invoice.Cgoodsname;
                            }
                            detail.custid = ywinfo.custid;
                            detailinfos.push(detail);
                        }

                    });
                    return CustProductDetailInfocopy.create(detailinfos);
                    //throw new Error('商品未添加')



                    //res.json(utilsService.reponseMessage('Error', ));
                }
                else {
                    console.log('通过验证')
                    invoicelist.forEach(inv => {
                        var guileidata = _.find(custproducts, v => {
                            return v.SKU == inv.sku.toUpperCase();
                        })
                        if (_.isUndefined(guileidata) == false) {
                            // inv.HSCode =
                            var gldata = guileidata.toObject();
                            delete gldata['id'];
                            delete gldata.ClassifiedProductid.id;

                            Object.assign(inv, gldata.ClassifiedProductid, gldata);

                            var vend = _.find(vendors, vd => {
                                return vd.parakey == inv.Vendor;
                            })
                            if (vend) {
                                inv.productDetailJson.Vendor = vend.paravalue;
                            }

                            var secsel = {};
                            section.forEach(sec => {
                                secsel[sec.parakey] = sec.paravalue;
                            })
                            console.log(secsel);
                            inv.Cspec = guileidata.Cspec.replace(/\[.*?\]/g, word => {
                                word = word.replace('[', '').replace(']', '');
                                var wj = inv.productDetailJson[word];
                                if (secsel[wj]) {
                                    wj = secsel[wj];
                                }
                                if (combine.indexOf(word) != -1) {
                                    wj = '~' + wj;
                                }
                                return wj;
                            });

                            if (inv.Cspec.startsWith('|')) {
                                inv.Cspec = inv.Cspec.substr(1);
                            }
                            inv.HSCode = guileidata.HScode;

                            if (guileidata.former) {
                                inv.Cgoodsname = inv.productDetailJson['Cgoodsname'];
                            }
                            else {
                                inv.Cgoodsname = guileidata.pracGoodsname.replace(/\[.*?\]/g, word => {
                                    word = word.replace('[', '').replace(']', '');
                                    word = inv.productDetailJson[word];
                                    if (secsel[word]) {
                                        word = secsel[word];
                                    }
                                    return word;
                                });
                            }
                            // console.log(inv);
                            // inv.UNIT = _.findWhere(UNITlist, { UNIT_NAME: inv.Unit }).UNIT_CODE;
                            valUnit(inv);
                            inv.cunit = inv.cunit1;
                            if (!inv.cunit || !inv.cunit1) {
                                throw new Error(inv.HScode + '商品缺少单位')
                                // res.json(utilsService.reponseMessage('Error', inv.HScode + '商品缺少单位'));
                            }
                            var t;
                            if (!inv.cunit2) {
                                inv.cunit2 = '';
                            }
                            inv.Qtyc = utilsService.getQtybyUnit(inv.Qty, inv.cunit1, inv.NetWeight);
                            inv.Qty1 = utilsService.getQtybyUnit(inv.Qty, inv.cunit, inv.NetWeight);
                            inv.Qty2 = utilsService.getQtybyUnit(inv.Qty, inv.cunit2, inv.NetWeight);
                            inv.COO = (t = _.find(paraCountries, (m) => {
                                return m.paraHelpEn == inv.OCOO
                            }), (t ? t.paraDisplayName : ''));

                            inv.cCurr = (t = _.find(paraCurrs, (m) => {
                                return m.paraRawName == inv.Curr
                            }), (t ? t.paraDisplayName : ''));
                        }
                    })
                    return invoicelist;
                }

            })
            .then((invoicelist) => {
                if (invoicelist[0].Qtyc) {
                    async.each(invoicelist, function (inv, cb) {
                        inv.save(err => {
                            cb(err)
                        });
                    }, function (err) {
                        console.log('end')
                        if (err)
                            res.json(utilsService.reponseMessage('Error', err.message));
                        else
                            res.json(utilsService.reponseMessage('OK', '保存结束'));
                    });
                }
                else {
                    res.json(utilsService.reponseMessage('Error', '商品未添加'));
                }
            })
            .catch(err => {
                res.json(utilsService.reponseMessage('Error', err.message));

            })
    },

    'doGuiLei_procedure': function (req, res) {
        var ywid = req.query.id;

        InvoiceDetailInfo.query('CALL yuguilei(' + ywid + ') ', function (err, result) {
            if (err) {
                res.json(utilsService.reponseMessage('Error', err.message));
            } else {
                if (result[0].length > 0) {
                    res.json(utilsService.reponseMessage('Error', (_.pluck(result[0], 'sku')).join(',') + '未归类'));
                }
                else {
                    res.json(utilsService.reponseMessage('OK', '归类完成'));
                }
            }
        });
    },


    // 特殊预归类
    'manual_yuguilei': function (req, res) {
        var ywid = req.query.id;
        var ieflag = req.query.ieflag;
        var manualno = req.query.manualno;
        InvoiceDetailInfo.query('CALL manual_yuguilei(' + ywid + ') ', function (nerr, nresult) {
            if (nerr) {
                res.json(utilsService.reponseMessage('Error', nerr.message));
            } else {
                if (nresult[0].length > 0) {
                    res.json(utilsService.reponseMessage('Error', (_.pluck(nresult[0], 'sku')).join(',') + '未归类'));
                }
                // else if (nresult[1] && nresult[1].length > 0) {
                //     res.json(utilsService.reponseMessage('Error', (_.pluck(nresult[0], 'sku')).join(',') + '缺少备案号'));
                // }
                else {
                    res.json(utilsService.reponseMessage('OK', '归类完成'));
                }
            }
        });
    },

    // 通用预归类
    'auto_yuguilei': function (req, res) {
        var ywid = req.query.id;
        var ieflag = req.query.ieflag;
        var manualno = req.query.manualno;
        InvoiceDetailInfo.query('CALL auto_yuguilei(' + ywid + ',"' + ieflag + '","' + manualno + '") ', function (nerr, nresult) {
            if (nerr) {
                res.json(utilsService.reponseMessage('Error', nerr.message));
            } else {
                if (nresult[0].length > 0) {
                    res.json(utilsService.reponseMessage('Error', (_.pluck(nresult[0], 'sku')).join(',') + '未归类或缺少备案号'));
                }
                // else if (nresult[1] && nresult[1].length > 0) {
                //     res.json(utilsService.reponseMessage('Error', (_.pluck(nresult[0], 'sku')).join(',') + '缺少备案号'));
                // }
                else {
                    res.json(utilsService.reponseMessage('OK', '归类完成'));
                }
            }
        });
    },


    'genFormHead': function (req, res) {
        var tthis = this;
        var ywid = req.query.id;
        var user = req.session.user;
        if (user && user.empinfo) {
            FormHead.findOne({ ywid: req.param('id') })
                .then(record => {
                    if (!record) {
                        YWinfo.findOne({ id: ywid })
                            .then(ywinfo => {
                                //得到提运单，
                                return [TiyundanInfo.findOne({ ywinfoid: ywid }), ywinfo];

                            }).spread((tiyundaninfo, ywinfo) => {
                                //得到模板，
                                return [TemplateFormHead.findOne({ TempleteName: tiyundaninfo.baoguantemplate }).populate('formheadElements'), InvoiceDetailInfo.find({ ywinfoid: ywid }), tiyundaninfo, ywinfo, tthis.allocateCop_no()];
                            })
                            .spread((templateinfo, invoicedetails, tiyundaninfo, ywinfo, COP_NO) => {
                                var head = {};
                                head.invoicedetails = invoicedetails;
                                head.tiyundaninfo = tiyundaninfo;
                                head.ywinfo = ywinfo;
                                head.COP_NO = COP_NO.replace(/\"/g, "");
                                var formheadinfo = {};
                                if (templateinfo) {
                                    formheadinfo = templateinfo.getDefaultFormhead(head);
                                }
                                var pass = true;
                                if (!formheadinfo.formlist || formheadinfo.formlist.length == 0) {
                                    pass = false;
                                }
                                formheadinfo.formlist.forEach(fl => {
                                    if (!fl.origin_country || !fl.g_unit) {
                                        pass = false;
                                    }
                                })
                                if (pass) {
                                    return [formheadinfo]
                                }
                                else {
                                    throw new Error('生成失败 预归类未完成');
                                }

                            }).spread((formheadinfo) => {
                                // var edino = edidata.replace(/\\/g, "").replace(/\"/g, "");
                                // if (_.startsWith(edino, 'EDI')) {
                                //     formheadinfo.EDI_NO = edino;
                                //     formheadinfo.customs_id = edino;
                                //     formheadinfo.i_e_date = curDate();
                                //     formheadinfo.create_date = curDateTime();

                                //     return [FormHead.create(formheadinfo), formheadinfo.formlist]
                                // }
                                // else {
                                //     throw new Error(edino);
                                // }

                                formheadinfo.customs_id = formheadinfo.pre_entry_id;
                                formheadinfo.i_e_date = curDate();
                                formheadinfo.create_date = curDateTime();

                                return [FormHead.create(formheadinfo), formheadinfo.formlist]

                            }).spread((formhead, formlist) => {
                                formhead.CreatePersonName = user.empinfo.Empname;
                                formhead.LastupdatePerson = user.empinfo.Empname;
                                formhead.PrintType = formhead.ywno;
                                formhead.FormList = formlist;
                                return [tthis.sycroFormhead(formhead), formhead];
                            }).spread((err, formhead) => {
                                if (err) {
                                    res.json(utilsService.reponseMessage('OK', `生成报关单${formhead.pre_entry_id}`));
                                }
                                else {
                                    res.json(utilsService.reponseMessage('error', err));
                                }
                            })
                            .catch(err => {
                                res.json(utilsService.reponseMessage('Error', err.message));
                            })
                    }
                    else {
                        res.json(utilsService.reponseMessage('Error', '报关单已生成'));
                    }
                })
        }
        else {
            res.json(utilsService.reponseMessage('Error', '请先登录'));
        }

    },
    // 紧急事态下用于批量生产 cb多次 等待找原因
    'genFormHead_tmpbak': function (req, res) {
        var tthis = this;
        //var ywid = req.query.id;
        var user = req.session.user;
        if (user && user.empinfo) {
            var ywlist = [];
            for (var s = 2868; s < 2923; s++) {
                ywlist.push(s);
            }

            async.mapSeries(ywlist, function (ywid, cb) {
                FormHead.findOne({ ywid: ywid })
                    .then(record => {
                        if (!record) {
                            YWinfo.findOne({ id: ywid })
                                .then(ywinfo => {
                                    if (ywinfo) {
                                        //得到提运单，
                                        return [TiyundanInfo.findOne({ ywinfoid: ywid }), ywinfo];
                                    }
                                    else {
                                        cb();
                                    }
                                }).spread((tiyundaninfo, ywinfo) => {
                                    //得到模板，
                                    return [TemplateFormHead.findOne({ TempleteName: tiyundaninfo.baoguantemplate }).populate('formheadElements'), InvoiceDetailInfo.find({ ywinfoid: ywid }), tiyundaninfo, ywinfo, tthis.allocateCop_no()];
                                })
                                .spread((templateinfo, invoicedetails, tiyundaninfo, ywinfo, COP_NO) => {
                                    var head = {};
                                    head.invoicedetails = invoicedetails;
                                    head.tiyundaninfo = tiyundaninfo;
                                    head.ywinfo = ywinfo;
                                    head.COP_NO = COP_NO.replace(/\"/g, "");
                                    var formheadinfo = {};
                                    if (templateinfo) {
                                        formheadinfo = templateinfo.getDefaultFormhead(head);
                                    }
                                    var pass = true;
                                    if (!formheadinfo.formlist || formheadinfo.formlist.length == 0) {
                                        pass = false;
                                    }
                                    formheadinfo.formlist.forEach(fl => {
                                        if (!fl.origin_country || !fl.g_unit) {
                                            pass = false;
                                        }
                                    })
                                    if (pass) {
                                        return [formheadinfo]
                                    }
                                    else {
                                        cb();
                                    }

                                }).spread((formheadinfo) => {
                                    formheadinfo.customs_id = formheadinfo.pre_entry_id;
                                    formheadinfo.i_e_date = curDate();
                                    formheadinfo.create_date = curDateTime();

                                    return [FormHead.create(formheadinfo), formheadinfo.formlist]

                                }).spread((formhead, formlist) => {
                                    formhead.CreatePersonName = user.empinfo.Empname;
                                    formhead.LastupdatePerson = user.empinfo.Empname;
                                    formhead.PrintType = formhead.ywno;
                                    formhead.FormList = formlist;
                                    return [tthis.sycroFormhead(formhead), formhead];
                                }).spread((err, formhead) => {
                                    if (err) {
                                        cb();
                                    }
                                    else {
                                        cb();
                                    }
                                })
                                .catch(err => {
                                    cb();
                                })
                        }
                        else {
                            cb();
                        }
                    })
            }, function (err) {
                res.json(utilsService.reponseMessage('OK', '完成'));
            })
        }
        else {
            res.json(utilsService.reponseMessage('Error', '请先登录'));
        }

    },


    'genFormHead_op': function (req, res) {
        var tthis = this;
        var ywid = req.query.id;
        var template = req.query.template;
        var ie_flag = req.query.ieflag;
        var oplimit = 45;
        var user = req.session.user;
        FormHead.findOne({ ywid: req.param('id'), ie_flag: ie_flag })
            .then(record => {
                if (!record) {
                    YWinfo.findOne({ id: ywid })
                        .then(ywinfo => {
                            //得到提运单，
                            return [TiyundanInfo.findOne({ ywinfoid: ywid }), ywinfo];

                        }).spread((tiyundaninfo, ywinfo) => {
                            tiyundaninfo.baoguantemplate = template;
                            //得到模板，
                            return [TemplateFormHead.findOne({ TempleteName: tiyundaninfo.baoguantemplate }).populate('formheadElements'), InvoiceDetailInfo.find({ ywinfoid: ywid }), tiyundaninfo, ywinfo, paracom.find({ paratype: '商检抽查' })];
                        })
                        .spread((templateinfo, invoicedetails, tiyundaninfo, ywinfo, para) => {
                            var head = {};
                            head.invoicedetails = invoicedetails;
                            head.tiyundaninfo = tiyundaninfo;
                            head.ywinfo = ywinfo;
                            // head.COP_NO = COP_NO.replace(/\"/g, "");
                            var formheadinfo = {};
                            if (templateinfo) {
                                formheadinfo = templateinfo.getDefaultFormhead(head);
                            }
                            console.log('生成');
                            var pass = true;
                            if (!formheadinfo.formlist || formheadinfo.formlist.length == 0) {
                                pass = false;
                            }
                            formheadinfo.formlist.forEach(fl => {
                                if (!fl.origin_country || !fl.g_unit) {
                                    pass = false;
                                }
                            })
                            if (pass) {

                                var fllist = formheadinfo.formlist;
                                // delete formheadinfo.formlist;
                                // var headinfo = formheadinfo;
                                console.log(fllist.length);
                                var groupargs = [];
                                groupargs.push('code_t');
                                groupargs.push('code_s');
                                groupargs.push('g_name');
                                // groupargs.push('g_model');
                                groupargs.push('trade_curr');
                                groupargs.push('origin_country');
                                if (ie_flag == 'A' || ie_flag == '9') {
                                    groupargs.push('SHIP_TO');
                                }


                                groupresult = groupBy(fllist, groupargs);
                                var flgroup = [];
                                gr = groupresult.length;
                                console.log(gr);
                                while (gr--) {
                                    //var flz = groupresult[gr][0];
                                    var flz = {};
                                    for (var key in groupresult[gr][0]) {
                                        if (key.indexOf(',') == -1) {
                                            flz[key] = groupresult[gr][0][key];
                                        }
                                    }
                                    // var cflag = _.find(para, vd => {
                                    //     return vd.parakey == (flz.code_t+flz.code_s)
                                    // })
                                    // if (cflag) {
                                    //     flz.CFlag = true;
                                    // }
                                    flz.g_model = flz.g_model.replace(/~/g, '');
                                    flz.qty_1 = sum(groupresult[gr], 'qty_1');
                                    flz.decl_price = sum(groupresult[gr], 'decl_price');
                                    flz.trade_total = sum(groupresult[gr], 'trade_total');
                                    flz.qty_conv = sum(groupresult[gr], 'qty_conv');
                                    flz.qty_2 = sum(groupresult[gr], 'qty_2');
                                    if (flz.qty_2 == 0) {
                                        flz.qty_2 = '';
                                    }
                                    flz.qty_1 = sum(groupresult[gr], 'qty_1');
                                    flz.NetWeight = sum(groupresult[gr], 'NetWeight');
                                    flz.combinejson = [];
                                    groupresult[gr].forEach(gfl => {
                                        flz.combinejson.push(gfl.ivid);
                                    })
                                    flgroup.push(flz);
                                }
                                var forminfols = [];
                                flgroup = marksort(flgroup);
                                if (flgroup.length > 0) {//>oplimit  不管是否拼单都可以在这里切割
                                    //var flresult = _.toArray(_.groupBy(flgroup, function (num, index) { return Math.floor(index / 20); }));
                                    var flresult = [];
                                    var regflresult = [];
                                    var flele = [];
                                    var regflele = [];
                                    for (var k = 0; k < flgroup.length; k++) {
                                        if (flele.length != 0 && flele.length % oplimit == 0) {
                                            flresult.push(flele);
                                            flele = [];
                                        }
                                        if (regflele.length != 0 && regflele.length % oplimit == 0) {
                                            regflresult.push(regflele);
                                            regflele = [];
                                        }
                                        if (flgroup[k].SHIP_TO == 'LIFESTYLE' && (ie_flag == 'A' || ie_flag == '9')) {
                                            regflele.push(flgroup[k]);
                                        }
                                        else {
                                            flele.push(flgroup[k]);
                                        }

                                        if (k == flgroup.length - 1) {
                                            if (flele.length > 0) {
                                                flresult.push(flele);
                                            }
                                            if (regflele.length > 0) {
                                                regflresult.push(regflele);
                                            }
                                        }
                                    }
                                    console.log('切割');
                                    // console.log(flresult[0]);
                                    var len = 0;
                                    while (len < flresult.length) {
                                        var headinfo = {};
                                        for (var key in formheadinfo) {
                                            if (key != 'formlist') {
                                                headinfo[key] = formheadinfo[key];
                                            }
                                        }
                                        headinfo.entry_group = 'ecom';
                                        headinfo.formlist = flresult[len];
                                        // headinfo.CreatePersonName = user.empinfo.Empname;
                                        // headinfo.LastupdatePerson = user.empinfo.Empname;
                                        // headinfo.PrintType = formheadinfo.ywno;
                                        // headinfo.FormList = flresult[len];
                                        forminfols.push(headinfo);
                                        len++;
                                    }
                                    len = 0;
                                    while (len < regflresult.length) {
                                        var headinfo = {};
                                        for (var key in formheadinfo) {
                                            if (key != 'formlist') {
                                                headinfo[key] = formheadinfo[key];
                                            }
                                        }
                                        headinfo.formlist = regflresult[len];
                                        headinfo.entry_group = 'reg';
                                        // headinfo.CreatePersonName = user.empinfo.Empname;
                                        // headinfo.LastupdatePerson = user.empinfo.Empname;
                                        // headinfo.PrintType = formheadinfo.ywno;
                                        // headinfo.FormList = flresult[len];
                                        forminfols.push(headinfo);
                                        len++;
                                    }
                                }
                                else {
                                    throw new Error('生成失败 没有产品');
                                }
                                // else {

                                //     var headinfo = {};
                                //     for (var key in formheadinfo) {
                                //         if (key != 'formlist') {
                                //             headinfo[key] = formheadinfo[key];
                                //         }
                                //     }
                                //     headinfo.formlist = flgroup;
                                //     forminfols.push(headinfo);
                                // }

                                return [tthis.allocateCop_no_mul(forminfols), tiyundaninfo]
                            }
                            else {
                                throw new Error('生成失败 预归类未完成 缺少原产国或单位');
                            }

                        }).spread((formheadinfos, tiyundaninfo) => {
                            var pk = tiyundaninfo.packNo;
                            var nt = tiyundaninfo.netWt;
                            var gt = tiyundaninfo.grossWt;
                            var totalpk = pk;
                            var totalnt = nt;
                            var totalgt = gt;
                            var formcount = formheadinfos.length;
                            var count = 0;
                            try {
                                async.each(formheadinfos, function (form, cb) {
                                    form.net_wt = 0;
                                    var i = 0;
                                    async.each(form.formlist, function (fl, cb1) {
                                        fl.pre_entry_id = form.pre_entry_id;
                                        fl.g_no = i.toString();
                                        form.net_wt += Number(fl.NetWeight);
                                        var combineid = uuid.v1().toString();
                                        fl.combineid = combineid;
                                        i++;
                                        var upcondition = [];
                                        fl.combinejson.forEach(inid => {
                                            upcondition.push(inid);
                                        })
                                        InvoiceDetailInfo.update({ id: upcondition }, { combineid: combineid })
                                            .then(result => {
                                                cb1();
                                            }).catch(err => {
                                                cb1(err);
                                            })
                                    }, function (err) {
                                        form.gross_wt = (gt / nt * form.net_wt);
                                        var tmp = pk / nt * form.net_wt;
                                        if (tmp < 1) {
                                            form.pack_no = 1;
                                        }
                                        else {
                                            form.pack_no = Math.floor(tmp);
                                        }
                                        count++;
                                        if (count == formcount) {
                                            form.pack_no = totalpk;
                                            form.gross_wt = totalgt;
                                            form.net_wt = totalnt;
                                        }
                                        else {
                                            totalpk = totalpk - form.pack_no;
                                            totalnt = totalnt - form.net_wt;
                                            totalgt = totalgt - form.gross_wt;
                                        }
                                        form.net_wt = Number(form.net_wt).toFixed(3);
                                        form.gross_wt = Number(form.gross_wt).toFixed(2);
                                        FormHead.create(form).exec(function (err, records) {
                                            cb(err);
                                        });
                                    })

                                }, function (err) {
                                    console.log(err);
                                    var flstr = (_.pluck(formheadinfos, 'pre_entry_id')).join(',');
                                    res.json(utilsService.reponseMessage('OK', `生成报关单${flstr}`));
                                })
                            }
                            catch (e) {
                                res.json(utilsService.reponseMessage('Error', e.message));
                            }

                        })
                        .catch(err => {
                            res.json(utilsService.reponseMessage('Error', err.message));
                        })
                }
                else {
                    res.json(utilsService.reponseMessage('Error', '报关单已生成'));
                }
            })
    },


    'genFormHead_zara': function (req, res) {
        var tthis = this;
        var ywid = req.query.id;
        var template = req.query.template;
        var ie_flag = req.query.ieflag;
        var oplimit = req.query.Objnum;
        if (!oplimit) {
            oplimit = 20;
        }
        var user = req.session.user;
        FormHead.findOne({ ywid: req.param('id'), ie_flag: ie_flag })
            .then(record => {
                if (!record) {
                    YWinfo.findOne({ id: ywid })
                        .then(ywinfo => {
                            //得到提运单，
                            return [TiyundanInfo.findOne({ ywinfoid: ywid }), ywinfo];

                        }).spread((tiyundaninfo, ywinfo) => {
                            tiyundaninfo.baoguantemplate = template;
                            //得到模板，
                            return [TemplateFormHead.findOne({ TempleteName: tiyundaninfo.baoguantemplate }).populate('formheadElements'), InvoiceDetailInfo.find({ ywinfoid: ywid }), tiyundaninfo, ywinfo, paracom.find({ paratype: '商检抽查' })];
                        })
                        .spread((templateinfo, invoicedetails, tiyundaninfo, ywinfo, para) => {
                            var head = {};
                            head.invoicedetails = invoicedetails;
                            head.tiyundaninfo = tiyundaninfo;
                            head.ywinfo = ywinfo;
                            // head.COP_NO = COP_NO.replace(/\"/g, "");
                            var formheadinfo = {};
                            if (templateinfo) {
                                formheadinfo = templateinfo.getDefaultFormhead(head);
                            }
                            if (ie_flag == 'B') {
                                formheadinfo.bill_no = tiyundaninfo.billNo;
                            }
                            if (ie_flag == '9') {
                                formheadinfo.contr_no = tiyundaninfo.contrNo;
                            }
                            formheadinfo.i_e_date = curDate();

                            console.log('生成');
                            var pass = true;
                            if (!formheadinfo.formlist || formheadinfo.formlist.length == 0) {
                                pass = false;
                            }
                            formheadinfo.formlist.forEach(fl => {
                                if (!fl.origin_country || !fl.g_unit) {
                                    pass = false;
                                }
                            })
                            if (pass) {

                                var fllist = formheadinfo.formlist;
                                // delete formheadinfo.formlist;
                                // var headinfo = formheadinfo;
                                console.log(fllist.length);
                                var groupargs = [];
                                groupargs.push('code_t');
                                groupargs.push('code_s');
                                if (ie_flag == 'A') {
                                    groupargs.push('contr_item');
                                }
                                else {
                                    groupargs.push('g_name');
                                }

                                // groupargs.push('g_model');
                                groupargs.push('trade_curr');
                                groupargs.push('origin_country');
                                if (ie_flag == 'A' || ie_flag == '9') {
                                    groupargs.push('SHIP_TO');
                                }
                                if (ie_flag == 'A') {
                                    groupargs.push('tcombineid');
                                }

                                groupresult = groupBy(fllist, groupargs);
                                var flgroup = [];
                                gr = groupresult.length;
                                console.log(gr);
                                while (gr--) {
                                    //var flz = groupresult[gr][0];
                                    var flz = {};
                                    for (var key in groupresult[gr][0]) {
                                        if (key.indexOf(',') == -1) {
                                            flz[key] = groupresult[gr][0][key];
                                        }
                                    }
                                    flz.g_model = flz.g_model.replace(/~/g, '');
                                    flz.qty_1 = sum(groupresult[gr], 'qty_1');
                                    // flz.decl_price = sum(groupresult[gr], 'decl_price');
                                    flz.trade_total = Number(sum(groupresult[gr], 'trade_total')).toFixed(2);
                                    flz.decl_price = Number(flz.trade_total / flz.qty_1).toFixed(4);
                                    flz.qty_conv = sum(groupresult[gr], 'qty_conv');
                                    flz.qty_2 = sum(groupresult[gr], 'qty_2');
                                    if (flz.qty_2 == 0) {
                                        flz.qty_2 = '';
                                    }
                                    flz.qty_1 = sum(groupresult[gr], 'qty_1');
                                    flz.NetWeight = sum(groupresult[gr], 'NetWeight');
                                    flz.combinejson = [];
                                    groupresult[gr].forEach(gfl => {
                                        flz.combinejson.push(gfl.ivid);
                                    })
                                    flgroup.push(flz);
                                }
                                var forminfols = [];
                                if (ie_flag == 'A') {
                                    flgroup = marksort_jin(flgroup);
                                }
                                else {
                                    flgroup = marksort(flgroup);
                                }

                                if (flgroup.length > 0) {//>oplimit  不管是否拼单都可以在这里切割
                                    if (ie_flag == 'A') {
                                        if (!flgroup[0].tcombineid) {
                                            throw new Error('生成出境单时必须先生成进口报关单');
                                        }
                                        var combineresult = {};
                                        var combinely = [];
                                        var flresult = [];
                                        for (var k = 0; k < flgroup.length; k++) {
                                            if (combinely.indexOf(flgroup[k].tcombineid) == -1) {
                                                combinely.push(flgroup[k].tcombineid);
                                                combineresult[flgroup[k].tcombineid] = [];
                                                combineresult[flgroup[k].tcombineid].push(flgroup[k]);
                                            }
                                            else {
                                                combineresult[flgroup[k].tcombineid].push(flgroup[k]);
                                            }
                                        }
                                        for (var key in combineresult) {
                                            flresult.push(combineresult[key]);
                                        }
                                        var len = 0;
                                        while (len < flresult.length) {
                                            var headinfo = {};
                                            for (var key in formheadinfo) {
                                                if (key != 'formlist') {
                                                    headinfo[key] = formheadinfo[key];
                                                }
                                            }
                                            headinfo.entry_group = 'ecom';
                                            headinfo.formlist = marksort_jin(flresult[len]);
                                            forminfols.push(headinfo);
                                            len++;
                                        }
                                    }
                                    else {
                                        var flresult = [];
                                        var regflresult = [];
                                        var flele = [];
                                        var regflele = [];
                                        for (var k = 0; k < flgroup.length; k++) {
                                            if (flele.length != 0 && flele.length % oplimit == 0) {
                                                flresult.push(flele);
                                                flele = [];
                                            }
                                            if (regflele.length != 0 && regflele.length % oplimit == 0) {
                                                regflresult.push(regflele);
                                                regflele = [];
                                            }
                                            if (flgroup[k].SHIP_TO == 'LIFESTYLE' && (ie_flag == 'A' || ie_flag == '9')) {
                                                regflele.push(flgroup[k]);
                                            }
                                            else {
                                                flele.push(flgroup[k]);
                                            }

                                            if (k == flgroup.length - 1) {
                                                if (flele.length > 0) {
                                                    flresult.push(flele);
                                                }
                                                if (regflele.length > 0) {
                                                    regflresult.push(regflele);
                                                }
                                            }
                                        }
                                        console.log('切割');
                                        // console.log(flresult[0]);
                                        var len = 0;
                                        while (len < flresult.length) {
                                            var headinfo = {};
                                            for (var key in formheadinfo) {
                                                if (key != 'formlist') {
                                                    headinfo[key] = formheadinfo[key];
                                                }
                                            }
                                            headinfo.entry_group = 'ecom';
                                            headinfo.formlist = flresult[len];
                                            headinfo.CollectTax = '0';
                                            headinfo.chk_surety = '0';
                                            // headinfo.CreatePersonName = user.empinfo.Empname;
                                            // headinfo.LastupdatePerson = user.empinfo.Empname;
                                            // headinfo.PrintType = formheadinfo.ywno;
                                            // headinfo.FormList = flresult[len];
                                            forminfols.push(headinfo);
                                            len++;
                                        }
                                        len = 0;
                                        while (len < regflresult.length) {
                                            var headinfo = {};
                                            for (var key in formheadinfo) {
                                                if (key != 'formlist') {
                                                    headinfo[key] = formheadinfo[key];
                                                }
                                            }
                                            headinfo.formlist = regflresult[len];
                                            headinfo.entry_group = 'reg';
                                            headinfo.CollectTax = '0';
                                            headinfo.chk_surety = '0';
                                            // headinfo.CreatePersonName = user.empinfo.Empname;
                                            // headinfo.LastupdatePerson = user.empinfo.Empname;
                                            // headinfo.PrintType = formheadinfo.ywno;
                                            // headinfo.FormList = flresult[len];
                                            forminfols.push(headinfo);
                                            len++;
                                        }
                                    }
                                }
                                else {
                                    throw new Error('生成失败 没有产品');
                                }
                                // else {

                                //     var headinfo = {};
                                //     for (var key in formheadinfo) {
                                //         if (key != 'formlist') {
                                //             headinfo[key] = formheadinfo[key];
                                //         }
                                //     }
                                //     headinfo.formlist = flgroup;
                                //     forminfols.push(headinfo);
                                // }

                                return [tthis.allocateCop_no_mul(forminfols), tiyundaninfo]
                            }
                            else {
                                throw new Error('生成失败 预归类未完成 缺少原产国或单位');
                            }

                        }).spread((formheadinfos, tiyundaninfo) => {
                            var pk = tiyundaninfo.packNo;
                            var nt = tiyundaninfo.netWt;
                            var gt = tiyundaninfo.grossWt;
                            var totalpk = pk;
                            var totalnt = nt;
                            var totalgt = gt;
                            var formcount = formheadinfos.length;
                            var count = 0;
                            try {
                                async.each(formheadinfos, function (form, cb) {
                                    form.net_wt = 0;
                                    var i = 0;
                                    async.each(form.formlist, function (fl, cb1) {
                                        fl.pre_entry_id = form.pre_entry_id;
                                        fl.g_no = i.toString();
                                        form.net_wt += Number(fl.NetWeight);
                                        // var combineid = uuid.v1().toString();
                                        // fl.combineid = combineid;
                                        i++;
                                        var upcondition = [];
                                        fl.combinejson.forEach(inid => {
                                            upcondition.push(inid);
                                        })
                                        if (ie_flag == '9') {
                                            InvoiceDetailInfo.update({ id: upcondition }, { combineid: form.COP_NO })
                                                .then(result => {
                                                    cb1();
                                                }).catch(err => {
                                                    cb1(err);
                                                })
                                        }
                                        else {
                                            cb1();
                                        }
                                    }, function (err) {
                                        form.gross_wt = (gt / nt * form.net_wt);
                                        var tmp = pk / nt * form.net_wt;
                                        if (tmp < 1) {
                                            form.pack_no = 1;
                                        }
                                        else {
                                            form.pack_no = Math.floor(tmp);
                                        }
                                        count++;
                                        if (count == formcount) {
                                            form.pack_no = totalpk;
                                            form.gross_wt = totalgt;
                                            form.net_wt = totalnt;

                                            form.net_wt = Number(form.net_wt).toFixed(3);
                                            form.gross_wt = Number(form.gross_wt).toFixed(2);
                                        }
                                        else {
                                            form.net_wt = Number(form.net_wt).toFixed(3);
                                            form.gross_wt = Number(form.gross_wt).toFixed(2);

                                            totalpk = totalpk - form.pack_no;
                                            totalnt = totalnt - form.net_wt;
                                            totalgt = totalgt - form.gross_wt;
                                        }
                                        // form.net_wt = Number(form.net_wt).toFixed(3);
                                        // form.gross_wt = Number(form.gross_wt).toFixed(2);
                                        FormHead.create(form).exec(function (err, records) {
                                            cb(err);
                                        });
                                    })

                                }, function (err) {
                                    console.log(err);
                                    var flstr = (_.pluck(formheadinfos, 'pre_entry_id')).join(',');
                                    res.json(utilsService.reponseMessage('OK', `生成报关单${flstr}`));
                                })
                            }
                            catch (e) {
                                res.json(utilsService.reponseMessage('Error', e.message));
                            }

                        })
                        .catch(err => {
                            res.json(utilsService.reponseMessage('Error', err.message));
                        })
                }
                else {
                    res.json(utilsService.reponseMessage('Error', '报关单已生成'));
                }
            })
    },


    'genFormHead_fenchai': function (req, res) {
        if (process.env.NODE_ENV == "development11") {
            var tthis = this;
            var ywid = req.query.id;
            var template = req.query.template;
            var ie_flag = req.query.ieflag;
            var oplimit = req.query.Objnum;
            if (!oplimit) {
                oplimit = 20;
            }
            oplimit = 120;
            var user = req.session.user;
            FormHead.findOne({ ywid: req.param('id'), ie_flag: ie_flag })
                .then(record => {
                    if (!record) {
                        YWinfo.findOne({ id: ywid })
                            .then(ywinfo => {
                                //得到提运单，
                                return [TiyundanInfo.findOne({ ywinfoid: ywid }), ywinfo];

                            }).spread((tiyundaninfo, ywinfo) => {
                                tiyundaninfo.baoguantemplate = template;
                                //得到模板，
                                return [TemplateFormHead.findOne({ TempleteName: tiyundaninfo.baoguantemplate }).populate('formheadElements'), InvoiceDetailInfo.find({ ywinfoid: ywid }), tiyundaninfo, ywinfo, paracom.find({ paratype: '商检抽查' })];
                            })
                            .spread((templateinfo, invoicedetails, tiyundaninfo, ywinfo, para) => {
                                var head = {};
                                head.invoicedetails = invoicedetails;
                                head.tiyundaninfo = tiyundaninfo;
                                head.ywinfo = ywinfo;
                                // head.COP_NO = COP_NO.replace(/\"/g, "");
                                var formheadinfo = {};
                                if (templateinfo) {
                                    formheadinfo = templateinfo.getDefaultFormhead(head);
                                }
                                if (ie_flag == 'A') {
                                    formheadinfo.bill_no = tiyundaninfo.billNo;
                                }

                                console.log('生成');
                                var pass = true;
                                if (!formheadinfo.formlist || formheadinfo.formlist.length == 0) {
                                    pass = false;
                                }
                                formheadinfo.formlist.forEach(fl => {
                                    if (!fl.origin_country || !fl.g_unit) {
                                        pass = false;
                                    }
                                })
                                if (pass) {

                                    var fllist = formheadinfo.formlist;
                                    // delete formheadinfo.formlist;
                                    // var headinfo = formheadinfo;
                                    console.log(fllist.length);
                                    var groupargs = [];
                                    groupargs.push('code_t');
                                    groupargs.push('code_s');
                                    if (ie_flag == 'A') {
                                        groupargs.push('contr_item');
                                    }
                                    else {
                                        groupargs.push('g_name');
                                    }

                                    // groupargs.push('g_model');
                                    groupargs.push('trade_curr');
                                    groupargs.push('origin_country');
                                    if (ie_flag == 'A' || ie_flag == '9') {
                                        groupargs.push('SHIP_TO');
                                    }
                                    if (ie_flag == 'A' || ie_flag == '9') {
                                        groupargs.push('wpre');
                                    }

                                    groupresult = groupBy(fllist, groupargs);
                                    var flgroup = [];
                                    gr = groupresult.length;
                                    console.log(gr);
                                    while (gr--) {
                                        //var flz = groupresult[gr][0];
                                        var flz = {};
                                        for (var key in groupresult[gr][0]) {
                                            if (key.indexOf(',') == -1) {
                                                flz[key] = groupresult[gr][0][key];
                                            }
                                        }
                                        flz.g_model = flz.g_model.replace(/~/g, '');
                                        flz.qty_1 = sum(groupresult[gr], 'qty_1');
                                        // flz.decl_price = sum(groupresult[gr], 'decl_price');
                                        flz.trade_total = Number(sum(groupresult[gr], 'trade_total')).toFixed(2);
                                        flz.decl_price = Number(flz.trade_total / flz.qty_1).toFixed(4);
                                        flz.qty_conv = sum(groupresult[gr], 'qty_conv');
                                        flz.qty_2 = sum(groupresult[gr], 'qty_2');
                                        if (flz.qty_2 == 0) {
                                            flz.qty_2 = '';
                                        }
                                        flz.qty_1 = sum(groupresult[gr], 'qty_1');
                                        flz.NetWeight = sum(groupresult[gr], 'NetWeight');
                                        flz.combinejson = [];
                                        groupresult[gr].forEach(gfl => {
                                            flz.combinejson.push(gfl.ivid);
                                        })
                                        flgroup.push(flz);
                                    }
                                    var forminfols = [];
                                    flgroup = marksort_fenchai(flgroup);
                                    if (flgroup.length > 0) {//>oplimit  不管是否拼单都可以在这里切割
                                        if (ie_flag == 'A' || ie_flag == '9') {
                                            var combineresult = {};
                                            var combinely = [];
                                            var flresult = [];
                                            for (var k = 0; k < flgroup.length; k++) {
                                                if (combinely.indexOf(flgroup[k].wpre) == -1) {
                                                    combinely.push(flgroup[k].wpre);
                                                    combineresult[flgroup[k].wpre] = [];
                                                    combineresult[flgroup[k].wpre].push(flgroup[k]);
                                                }
                                                else {
                                                    combineresult[flgroup[k].wpre].push(flgroup[k]);
                                                }
                                            }
                                            for (var key in combineresult) {
                                                flresult.push(combineresult[key]);
                                            }
                                            var len = 0;
                                            while (len < flresult.length) {
                                                var headinfo = {};
                                                for (var key in formheadinfo) {
                                                    if (key != 'formlist') {
                                                        headinfo[key] = formheadinfo[key];
                                                    }
                                                }
                                                headinfo.entry_group = 'ecom';
                                                headinfo.formlist = flresult[len];
                                                forminfols.push(headinfo);
                                                len++;
                                            }
                                        }
                                        else {
                                            var flresult = [];
                                            var regflresult = [];
                                            var flele = [];
                                            var regflele = [];
                                            for (var k = 0; k < flgroup.length; k++) {
                                                if (flele.length != 0 && flele.length % oplimit == 0) {
                                                    flresult.push(flele);
                                                    flele = [];
                                                }
                                                if (regflele.length != 0 && regflele.length % oplimit == 0) {
                                                    regflresult.push(regflele);
                                                    regflele = [];
                                                }
                                                if (flgroup[k].SHIP_TO == 'LIFESTYLE' && (ie_flag == 'A' || ie_flag == '9')) {
                                                    regflele.push(flgroup[k]);
                                                }
                                                else {
                                                    flele.push(flgroup[k]);
                                                }

                                                if (k == flgroup.length - 1) {
                                                    if (flele.length > 0) {
                                                        flresult.push(flele);
                                                    }
                                                    if (regflele.length > 0) {
                                                        regflresult.push(regflele);
                                                    }
                                                }
                                            }
                                            console.log('切割');
                                            // console.log(flresult[0]);
                                            var len = 0;
                                            while (len < flresult.length) {
                                                var headinfo = {};
                                                for (var key in formheadinfo) {
                                                    if (key != 'formlist') {
                                                        headinfo[key] = formheadinfo[key];
                                                    }
                                                }
                                                headinfo.entry_group = 'ecom';
                                                headinfo.formlist = flresult[len];
                                                headinfo.CollectTax = '0';
                                                headinfo.chk_surety = '0';
                                                // headinfo.CreatePersonName = user.empinfo.Empname;
                                                // headinfo.LastupdatePerson = user.empinfo.Empname;
                                                // headinfo.PrintType = formheadinfo.ywno;
                                                // headinfo.FormList = flresult[len];
                                                forminfols.push(headinfo);
                                                len++;
                                            }
                                            len = 0;
                                            while (len < regflresult.length) {
                                                var headinfo = {};
                                                for (var key in formheadinfo) {
                                                    if (key != 'formlist') {
                                                        headinfo[key] = formheadinfo[key];
                                                    }
                                                }
                                                headinfo.formlist = regflresult[len];
                                                headinfo.entry_group = 'reg';
                                                headinfo.CollectTax = '0';
                                                headinfo.chk_surety = '0';
                                                // headinfo.CreatePersonName = user.empinfo.Empname;
                                                // headinfo.LastupdatePerson = user.empinfo.Empname;
                                                // headinfo.PrintType = formheadinfo.ywno;
                                                // headinfo.FormList = flresult[len];
                                                forminfols.push(headinfo);
                                                len++;
                                            }
                                        }
                                    }
                                    else {
                                        throw new Error('生成失败 没有产品');
                                    }
                                    // else {

                                    //     var headinfo = {};
                                    //     for (var key in formheadinfo) {
                                    //         if (key != 'formlist') {
                                    //             headinfo[key] = formheadinfo[key];
                                    //         }
                                    //     }
                                    //     headinfo.formlist = flgroup;
                                    //     forminfols.push(headinfo);
                                    // }

                                    return [tthis.allocateCop_no_mul(forminfols), tiyundaninfo]
                                }
                                else {
                                    throw new Error('生成失败 预归类未完成 缺少原产国或单位');
                                }

                            }).spread((formheadinfos, tiyundaninfo) => {
                                var pk = tiyundaninfo.packNo;
                                var nt = tiyundaninfo.netWt;
                                var gt = tiyundaninfo.grossWt;
                                var totalpk = pk;
                                var totalnt = nt;
                                var totalgt = gt;
                                var formcount = formheadinfos.length;
                                var count = 0;
                                try {
                                    async.each(formheadinfos, function (form, cb) {
                                        form.net_wt = 0;
                                        var i = 0;
                                        async.each(form.formlist, function (fl, cb1) {
                                            fl.pre_entry_id = form.pre_entry_id;
                                            fl.g_no = i.toString();
                                            form.net_wt += Number(fl.NetWeight);
                                            // var combineid = uuid.v1().toString();
                                            // fl.combineid = combineid;
                                            i++;
                                            var upcondition = [];
                                            fl.combinejson.forEach(inid => {
                                                upcondition.push(inid);
                                            })
                                            if (ie_flag == '9') {
                                                InvoiceDetailInfo.update({ id: upcondition }, { combineid: form.COP_NO })
                                                    .then(result => {
                                                        cb1();
                                                    }).catch(err => {
                                                        cb1(err);
                                                    })
                                            }
                                            else {
                                                cb1();
                                            }
                                        }, function (err) {
                                            form.gross_wt = (gt / nt * form.net_wt);
                                            var tmp = pk / nt * form.net_wt;
                                            if (tmp < 1) {
                                                form.pack_no = 1;
                                            }
                                            else {
                                                form.pack_no = Math.floor(tmp);
                                            }
                                            count++;
                                            if (count == formcount) {
                                                form.pack_no = totalpk;
                                                form.gross_wt = totalgt;
                                                form.net_wt = totalnt;
                                            }
                                            else {
                                                totalpk = totalpk - form.pack_no;
                                                totalnt = totalnt - form.net_wt;
                                                totalgt = totalgt - form.gross_wt;
                                            }
                                            form.net_wt = Number(form.net_wt).toFixed(3);
                                            form.gross_wt = Number(form.gross_wt).toFixed(3);
                                            FormHead.create(form).exec(function (err, records) {
                                                cb(err);
                                            });
                                        })

                                    }, function (err) {
                                        console.log(err);
                                        var flstr = (_.pluck(formheadinfos, 'pre_entry_id')).join(',');
                                        res.json(utilsService.reponseMessage('OK', `生成报关单${flstr}`));
                                    })
                                }
                                catch (e) {
                                    res.json(utilsService.reponseMessage('Error', e.message));
                                }

                            })
                            .catch(err => {
                                res.json(utilsService.reponseMessage('Error', err.message));
                            })
                    }
                    else {
                        res.json(utilsService.reponseMessage('Error', '报关单已生成'));
                    }
                })
        }
        else {
            res.json(utilsService.reponseMessage('Error', '仅用于测试'));
        }
    },

    'genFormHead_manual': function (req, res) {
        var tthis = this;
        var ywid = req.query.id;
        var template = req.query.template;
        var ie_flag = req.query.ieflag;
        var oplimit = req.query.Objnum;
        if (!oplimit) {
            oplimit = 20;
        }
        var user = req.session.user;
        FormHead.findOne({ ywid: req.param('id') })
            .then(record => {
                if (!record) {
                    YWinfo.findOne({ id: ywid })
                        .then(ywinfo => {
                            //得到提运单，
                            return [TiyundanInfo.findOne({ ywinfoid: ywid }), ywinfo];

                        }).spread((tiyundaninfo, ywinfo) => {
                            tiyundaninfo.baoguantemplate = template;
                            //得到模板，
                            return [TemplateFormHead.findOne({ TempleteName: tiyundaninfo.baoguantemplate }).populate('formheadElements'), InvoiceDetailInfo.find({ ywinfoid: ywid }), tiyundaninfo, ywinfo, paracom.find({ paratype: '商检抽查' })];
                        })
                        .spread((templateinfo, invoicedetails, tiyundaninfo, ywinfo, para) => {
                            var head = {};
                            head.invoicedetails = invoicedetails;
                            head.tiyundaninfo = tiyundaninfo;
                            head.ywinfo = ywinfo;
                            // head.COP_NO = COP_NO.replace(/\"/g, "");
                            var formheadinfo = {};
                            if (templateinfo) {
                                formheadinfo = templateinfo.getDefaultFormhead(head);
                            }
                            formheadinfo.bill_no = tiyundaninfo.billNo;
                            formheadinfo.contr_no = tiyundaninfo.contrNo;
                            formheadinfo.wrap_type = tiyundaninfo.wraptype ? tiyundaninfo.wraptype : '';
                            formheadinfo.i_e_date = curDate();

                            console.log('生成');
                            var pass = true;
                            if (!formheadinfo.formlist || formheadinfo.formlist.length == 0) {
                                pass = false;
                            }
                            formheadinfo.formlist.forEach(fl => {
                                if (!fl.origin_country || !fl.g_unit) {
                                    pass = false;
                                }
                            })
                            if (pass) {

                                var fllist = formheadinfo.formlist;
                                // delete formheadinfo.formlist;
                                // var headinfo = formheadinfo;
                                console.log(fllist.length);
                                var groupargs = [];
                                groupargs.push('code_t');
                                groupargs.push('code_s');
                                if (ie_flag == 'A') {
                                    groupargs.push('contr_item');
                                }
                                else {
                                    groupargs.push('g_name');
                                }
                                if (ywinfo.custid == '3282') {
                                    groupargs.push('g_no');
                                }

                                // groupargs.push('g_model');
                                groupargs.push('trade_curr');
                                groupargs.push('origin_country');

                                groupresult = groupBy(fllist, groupargs);
                                var flgroup = [];
                                gr = groupresult.length;
                                console.log(gr);
                                while (gr--) {
                                    //var flz = groupresult[gr][0];
                                    var flz = {};
                                    for (var key in groupresult[gr][0]) {
                                        if (key.indexOf(',') == -1) {
                                            flz[key] = groupresult[gr][0][key];
                                        }
                                    }
                                    flz.g_model = flz.g_model.replace(/~/g, '');
                                    flz.qty_1 = sum(groupresult[gr], 'qty_1');
                                    // flz.decl_price = sum(groupresult[gr], 'decl_price');
                                    flz.trade_total = Number(sum(groupresult[gr], 'trade_total')).toFixed(2);
                                    flz.decl_price = Number(flz.trade_total / flz.qty_1).toFixed(4);
                                    flz.qty_conv = sum(groupresult[gr], 'qty_conv');
                                    flz.qty_2 = sum(groupresult[gr], 'qty_2');
                                    if (flz.qty_2 == 0) {
                                        flz.qty_2 = '';
                                    }
                                    flz.qty_1 = sum(groupresult[gr], 'qty_1');
                                    flz.NetWeight = sum(groupresult[gr], 'NetWeight');
                                    flz.combinejson = [];
                                    groupresult[gr].forEach(gfl => {
                                        flz.combinejson.push(gfl.ivid);
                                    })
                                    flgroup.push(flz);
                                }
                                var forminfols = [];
                                flgroup = marksort(flgroup);
                                if (flgroup.length > 0) {//>oplimit  不管是否拼单都可以在这里切割
                                    var flresult = [];
                                    var regflresult = [];
                                    var flele = [];
                                    var regflele = [];
                                    for (var k = 0; k < flgroup.length; k++) {
                                        if (flele.length != 0 && flele.length % oplimit == 0) {
                                            flresult.push(flele);
                                            flele = [];
                                        }
                                        if (regflele.length != 0 && regflele.length % oplimit == 0) {
                                            regflresult.push(regflele);
                                            regflele = [];
                                        }
                                        if (flgroup[k].SHIP_TO == 'LIFESTYLE' && (ie_flag == 'A' || ie_flag == '9')) {
                                            regflele.push(flgroup[k]);
                                        }
                                        else {
                                            flele.push(flgroup[k]);
                                        }

                                        if (k == flgroup.length - 1) {
                                            if (flele.length > 0) {
                                                flresult.push(flele);
                                            }
                                            if (regflele.length > 0) {
                                                regflresult.push(regflele);
                                            }
                                        }
                                    }
                                    console.log('切割');
                                    var len = 0;
                                    while (len < flresult.length) {
                                        var headinfo = {};
                                        for (var key in formheadinfo) {
                                            if (key != 'formlist') {
                                                headinfo[key] = formheadinfo[key];
                                            }
                                        }
                                        headinfo.entry_group = 'ecom';
                                        headinfo.formlist = flresult[len];
                                        headinfo.CollectTax = '0';
                                        headinfo.chk_surety = '0';
                                        forminfols.push(headinfo);
                                        len++;
                                    }
                                    len = 0;
                                    while (len < regflresult.length) {
                                        var headinfo = {};
                                        for (var key in formheadinfo) {
                                            if (key != 'formlist') {
                                                headinfo[key] = formheadinfo[key];
                                            }
                                        }
                                        headinfo.formlist = regflresult[len];
                                        headinfo.entry_group = 'reg';
                                        headinfo.CollectTax = '0';
                                        headinfo.chk_surety = '0';
                                        forminfols.push(headinfo);
                                        len++;
                                    }
                                }
                                else {
                                    throw new Error('生成失败 没有产品');
                                }
                                return [tthis.allocateCop_no_mul(forminfols), tiyundaninfo]
                            }
                            else {
                                throw new Error('生成失败 预归类未完成 缺少原产国或单位');
                            }

                        }).spread((formheadinfos, tiyundaninfo) => {
                            var pk = tiyundaninfo.packNo;
                            var nt = tiyundaninfo.netWt;
                            var gt = tiyundaninfo.grossWt;
                            var totalpk = pk;
                            var totalnt = nt;
                            var totalgt = gt;
                            var formcount = formheadinfos.length;
                            var count = 0;
                            try {
                                async.each(formheadinfos, function (form, cb) {
                                    form.net_wt = 0;
                                    var i = 0;
                                    async.each(form.formlist, function (fl, cb1) {
                                        fl.pre_entry_id = form.pre_entry_id;
                                        fl.g_no = i.toString();
                                        form.net_wt += Number(fl.NetWeight);
                                        // var combineid = uuid.v1().toString();
                                        // fl.combineid = combineid;
                                        i++;
                                        var upcondition = [];
                                        fl.combinejson.forEach(inid => {
                                            upcondition.push(inid);
                                        })
                                        cb1();
                                    }, function (err) {
                                        form.gross_wt = (gt / nt * form.net_wt);
                                        var tmp = pk / nt * form.net_wt;
                                        if (tmp < 1) {
                                            form.pack_no = 1;
                                        }
                                        else {
                                            form.pack_no = Math.floor(tmp);
                                        }
                                        count++;
                                        if (count == formcount) {
                                            form.pack_no = totalpk;
                                            form.gross_wt = totalgt;
                                            form.net_wt = totalnt;
                                        }
                                        else {
                                            totalpk = totalpk - form.pack_no;
                                            totalnt = totalnt - form.net_wt;
                                            totalgt = totalgt - form.gross_wt;
                                        }
                                        form.net_wt = Number(form.net_wt).toFixed(3);
                                        form.gross_wt = Number(form.gross_wt).toFixed(2);
                                        FormHead.create(form).exec(function (err, records) {
                                            cb(err);
                                        });
                                    })

                                }, function (err) {
                                    console.log(err);
                                    var flstr = (_.pluck(formheadinfos, 'pre_entry_id')).join(',');
                                    res.json(utilsService.reponseMessage('OK', `生成报关单${flstr}`));
                                })
                            }
                            catch (e) {
                                res.json(utilsService.reponseMessage('Error', e.message));
                            }

                        })
                        .catch(err => {
                            res.json(utilsService.reponseMessage('Error', err.message));
                        })
                }
                else {
                    res.json(utilsService.reponseMessage('Error', '报关单已生成'));
                }
            })
    },

    //慧与预归类生成报关单
    huiyucombine_bak: function (req, res) {
        var tthis = this;
        var ywid = req.query.id;
        var template = req.query.template;
        var ie_flag = req.query.ieflag;
        var oplimit = req.query.Objnum;
        var user = req.session.user;
        if (!oplimit) {
            oplimit = 20;
        }
        InvoiceDetailInfo.query('CALL manual_yuguilei(' + ywid + ') ', function (nerr, nresult) {
            if (nerr) {
                res.json(utilsService.reponseMessage('Error', nerr.message));
            } else {
                if (nresult[0].length > 0) {
                    res.json(utilsService.reponseMessage('Error', (_.pluck(nresult[0], 'sku')).join(',') + '未归类'));
                }
                else {
                    FormHead.findOne({ ywid: req.param('id') })
                        .then(record => {
                            if (!record) {
                                YWinfo.findOne({ id: ywid })
                                    .then(ywinfo => {
                                        //得到提运单，
                                        return [TiyundanInfo.findOne({ ywinfoid: ywid }), ywinfo];

                                    }).spread((tiyundaninfo, ywinfo) => {
                                        tiyundaninfo.baoguantemplate = template;
                                        //得到模板，
                                        return [TemplateFormHead.findOne({ TempleteName: tiyundaninfo.baoguantemplate }).populate('formheadElements'), InvoiceDetailInfo.find({ ywinfoid: ywid }), tiyundaninfo, ywinfo, paracom.find({ paratype: '商检抽查' })];
                                    })
                                    .spread((templateinfo, invoicedetails, tiyundaninfo, ywinfo, para) => {
                                        var head = {};
                                        head.invoicedetails = invoicedetails;
                                        head.tiyundaninfo = tiyundaninfo;
                                        head.ywinfo = ywinfo;
                                        // head.COP_NO = COP_NO.replace(/\"/g, "");
                                        var formheadinfo = {};
                                        if (templateinfo) {
                                            formheadinfo = templateinfo.getDefaultFormhead(head);
                                        }
                                        formheadinfo.bill_no = tiyundaninfo.billNo;
                                        formheadinfo.contr_no = tiyundaninfo.contrNo;
                                        formheadinfo.wrap_type = tiyundaninfo.wraptype ? tiyundaninfo.wraptype : '';
                                        formheadinfo.i_e_date = curDate();

                                        console.log('生成');
                                        var pass = true;
                                        if (!formheadinfo.formlist || formheadinfo.formlist.length == 0) {
                                            pass = false;
                                        }
                                        formheadinfo.formlist.forEach(fl => {
                                            if (!fl.origin_country || !fl.g_unit) {
                                                pass = false;
                                            }
                                        })
                                        if (pass) {

                                            var fllist = formheadinfo.formlist;
                                            // delete formheadinfo.formlist;
                                            // var headinfo = formheadinfo;
                                            console.log(fllist.length);
                                            var groupargs = [];
                                            groupargs.push('code_t');
                                            groupargs.push('code_s');
                                            if (ie_flag == 'A') {
                                                groupargs.push('contr_item');
                                            }
                                            else {
                                                groupargs.push('g_name');
                                            }
                                            if (ywinfo.custid == '3282') {
                                                groupargs.push('g_no');
                                            }

                                            // groupargs.push('g_model');
                                            groupargs.push('trade_curr');
                                            groupargs.push('origin_country');

                                            groupresult = groupBy(fllist, groupargs);
                                            var flgroup = [];
                                            gr = groupresult.length;
                                            console.log(gr);
                                            while (gr--) {
                                                //var flz = groupresult[gr][0];
                                                var flz = {};
                                                for (var key in groupresult[gr][0]) {
                                                    if (key.indexOf(',') == -1) {
                                                        flz[key] = groupresult[gr][0][key];
                                                    }
                                                }
                                                flz.g_model = flz.g_model.replace(/~/g, '');
                                                flz.qty_1 = sum(groupresult[gr], 'qty_1');
                                                // flz.decl_price = sum(groupresult[gr], 'decl_price');
                                                flz.trade_total = Number(sum(groupresult[gr], 'trade_total')).toFixed(2);
                                                flz.decl_price = Number(flz.trade_total / flz.qty_1).toFixed(4);
                                                flz.qty_conv = sum(groupresult[gr], 'qty_conv');
                                                flz.qty_2 = sum(groupresult[gr], 'qty_2');
                                                if (flz.qty_2 == 0) {
                                                    flz.qty_2 = '';
                                                }
                                                flz.qty_1 = sum(groupresult[gr], 'qty_1');
                                                flz.NetWeight = sum(groupresult[gr], 'NetWeight');
                                                flz.combinejson = [];
                                                groupresult[gr].forEach(gfl => {
                                                    flz.combinejson.push(gfl.ivid);
                                                })
                                                flgroup.push(flz);
                                            }
                                            var forminfols = [];
                                            flgroup = marksort(flgroup);

                                            if (flgroup.length > 0) {//>oplimit  不管是否拼单都可以在这里切割
                                                var flresult = [];
                                                var regflresult = [];
                                                var flele = [];
                                                var regflele = [];
                                                for (var k = 0; k < flgroup.length; k++) {
                                                    if (flele.length != 0 && flele.length % oplimit == 0) {
                                                        flresult.push(flele);
                                                        flele = [];
                                                    }
                                                    if (regflele.length != 0 && regflele.length % oplimit == 0) {
                                                        regflresult.push(regflele);
                                                        regflele = [];
                                                    }
                                                    if (flgroup[k].SHIP_TO == 'LIFESTYLE' && (ie_flag == 'A' || ie_flag == '9')) {
                                                        regflele.push(flgroup[k]);
                                                    }
                                                    else {
                                                        flele.push(flgroup[k]);
                                                    }

                                                    if (k == flgroup.length - 1) {
                                                        if (flele.length > 0) {
                                                            flresult.push(flele);
                                                        }
                                                        if (regflele.length > 0) {
                                                            regflresult.push(regflele);
                                                        }
                                                    }
                                                }
                                                console.log('切割');
                                                var len = 0;
                                                while (len < flresult.length) {
                                                    var headinfo = {};
                                                    for (var key in formheadinfo) {
                                                        if (key != 'formlist') {
                                                            headinfo[key] = formheadinfo[key];
                                                        }
                                                    }
                                                    headinfo.entry_group = 'ecom';
                                                    headinfo.formlist = flresult[len];
                                                    headinfo.CollectTax = '0';
                                                    headinfo.chk_surety = '0';
                                                    forminfols.push(headinfo);
                                                    len++;
                                                }
                                                len = 0;
                                                while (len < regflresult.length) {
                                                    var headinfo = {};
                                                    for (var key in formheadinfo) {
                                                        if (key != 'formlist') {
                                                            headinfo[key] = formheadinfo[key];
                                                        }
                                                    }
                                                    headinfo.formlist = regflresult[len];
                                                    headinfo.entry_group = 'reg';
                                                    headinfo.CollectTax = '0';
                                                    headinfo.chk_surety = '0';
                                                    forminfols.push(headinfo);
                                                    len++;
                                                }
                                            }
                                            else {
                                                throw new Error('生成失败 没有产品');
                                            }
                                            return [tthis.allocateCop_no_mul(forminfols), tiyundaninfo]
                                        }
                                        else {
                                            throw new Error('生成失败 预归类未完成 缺少原产国或单位');
                                        }

                                    }).spread((formheadinfos, tiyundaninfo) => {
                                        var pk = tiyundaninfo.packNo;
                                        var nt = tiyundaninfo.netWt;
                                        var gt = tiyundaninfo.grossWt;
                                        var totalpk = pk;
                                        var totalnt = nt;
                                        var totalgt = gt;
                                        var formcount = formheadinfos.length;
                                        var count = 0;
                                        try {
                                            async.each(formheadinfos, function (form, cb) {
                                                form.net_wt = 0;

                                                var i = 0;
                                                async.each(form.formlist, function (fl, cb1) {
                                                    fl.pre_entry_id = form.pre_entry_id;
                                                    fl.g_no = i.toString();
                                                    form.net_wt += Number(fl.NetWeight);
                                                    // var combineid = uuid.v1().toString();
                                                    // fl.combineid = combineid;
                                                    i++;
                                                    var upcondition = [];
                                                    fl.combinejson.forEach(inid => {
                                                        upcondition.push(inid);
                                                    })
                                                    cb1();
                                                }, function (err) {
                                                    form.gross_wt = (gt / nt * form.net_wt);
                                                    var cert = getcert(form.formlist);
                                                    form.Cert_List = cert;
                                                    var tmp = pk / nt * form.net_wt;
                                                    if (tmp < 1) {
                                                        form.pack_no = 1;
                                                    }
                                                    else {
                                                        form.pack_no = Math.floor(tmp);
                                                    }
                                                    count++;
                                                    if (count == formcount) {
                                                        form.pack_no = totalpk;
                                                        form.gross_wt = totalgt;
                                                        form.net_wt = totalnt;
                                                    }
                                                    else {
                                                        totalpk = totalpk - form.pack_no;
                                                        totalnt = totalnt - form.net_wt;
                                                        totalgt = totalgt - form.gross_wt;
                                                    }
                                                    form.net_wt = Number(form.net_wt).toFixed(3);
                                                    form.gross_wt = Number(form.gross_wt).toFixed(2);
                                                    FormHead.create(form).exec(function (err, records) {
                                                        cb(err);
                                                    });
                                                })
                                            }, function (err) {
                                                console.log(err);
                                                var flstr = (_.pluck(formheadinfos, 'pre_entry_id')).join(',');
                                                res.json(utilsService.reponseMessage('OK', `生成报关单${flstr}`));
                                            })
                                        }
                                        catch (e) {
                                            res.json(utilsService.reponseMessage('Error', e.message));
                                        }

                                    })
                                    .catch(err => {
                                        res.json(utilsService.reponseMessage('Error', err.message));
                                    })
                            }
                            else {
                                res.json(utilsService.reponseMessage('Error', '报关单已生成'));
                            }
                        })
                }
            }
        });

    },

    //慧与同步报关单
    huiyusycro: function (req, res) {
        var user = req.session.user;
        if (process.env.NODE_ENV == "development11") {
            return resolve("success");
        }
        else {
            var ywid = req.param('ywid');
            if (user) {
                var empname = user.empinfo.Empname;
                var empid = user.empinfo.Empid;
                YWinfo.findOne({ id: ywid }).then(ywinfo => {
                    request.get({ url: encodeURI(sails.config.remoteapi + '/api/Ywinfo/allowcateYwNoremote?ywno=' + ywinfo.YWNO + '&CustYwno=' + ywinfo.CustYWNO + '&empname=' + empname + '&empid=' + empid + '&custid=' + ywinfo.custid) },
                        function (err, httpResponse, body) {
                            if (body.replace(/\"/g, '') == "success") {
                                FormHead.find({ ywid: ywid }).populate('formlist').populate('Cert_List')
                                    .then(forms => {
                                        forms.forEach(formhead => {
                                            formhead.CreatePersonName = user.empinfo.Empname;
                                            formhead.LastupdatePerson = user.empinfo.Empname;
                                            formhead.PrintType = formhead.ywno;
                                            // formhead.FormList = formhead.formlist;
                                            // delete formhead.formlist;
                                            if (formhead.PROMISE_ITMES) {
                                                var proitem = formhead.PROMISE_ITMES.split('');
                                                formhead.promiseflag1 = proitem[0];
                                                formhead.promiseflag2 = proitem[1];
                                                formhead.promiseflag3 = proitem[2];
                                            }
                                        })
                                        request.post({ url: sails.config.remoteapi + '/api/Ywinfo/sycroFormhead_mul', json: forms },
                                            function (err, httpResponse, body) {
                                                res.json(body);
                                            })
                                    })
                            }
                            else {
                                res.json(utilsService.reponseMessage('OK', body));
                            }
                        })
                })
            }
            else {
                res.json(utilsService.reponseMessage('OK', '请登录'));
            }





        }
    },

    //分配
    huiyubalance: function (req, res) {
        try {
            var ywid = req.param('id');
            TiyundanInfo.findOne({ ywinfoid: ywid })
                .then(tiyundan => {
                    return [InvoiceDetailInfo.find({ ywinfoid: ywid }), tiyundan];
                })
                .spread((invoicelist, tiyundandata) => {
                    var outweight = 0;
                    var outgross = 0;
                    invoicelist.forEach(inv => {
                        if (inv.productDetailJson.JZBFB.indexOf('%') != -1) {
                            throw ("净重百分比有误");
                        }
                        inv.NetWeight = tiyundandata.netWt * inv.productDetailJson.JZBFB;
                        inv.NetWeight = Number(inv.NetWeight).toFixed(2);
                        inv.GrossWeight = tiyundandata.grossWt * inv.productDetailJson.JZBFB;
                        if (inv.NetWeight < 0.1) {
                            inv.NetWeight = 0.1;
                        }
                        inv.GrossWeight = Number(inv.GrossWeight).toFixed(2);
                        if (inv.GrossWeight < 0.2) {
                            inv.GrossWeight = 0.2;
                        }
                        outweight += Number(inv.NetWeight);
                        outgross += Number(inv.GrossWeight);
                    })
                    var end = false;
                    if (outweight != Number(tiyundandata.netWt)) {
                        invoicelist.forEach(inv => {
                            if (!end) {
                                if (inv.NetWeight > (outweight - tiyundandata.netWt)) {
                                    inv.NetWeight = (inv.NetWeight - (outweight - tiyundandata.netWt)).toFixed(2);
                                    end = true;
                                }
                            }
                        })
                    }
                    end = false;
                    if (outgross != Number(tiyundandata.grossWt)) {
                        invoicelist.forEach(inv => {
                            if (!end) {
                                if (inv.GrossWeight > (outgross - tiyundandata.grossWt)) {
                                    inv.GrossWeight = (inv.GrossWeight - (outgross - tiyundandata.grossWt)).toFixed(2);
                                    end = true;
                                }
                            }
                        })
                    }
                    async.each(invoicelist, function (inv, cb) {
                        inv.save(err => {
                            cb(err)
                        });
                    }, function (err) {
                        if (err)
                            res.json(utilsService.reponseMessage('OK', err.message));
                        else
                            res.json(utilsService.reponseMessage('OK', '保存结束'));
                    });
                })
                .catch(err => {
                    res.json(utilsService.reponseMessage('OK', err.message));
                })
        }
        catch (e) {
            res.json(utilsService.reponseMessage('OK', e.message));
        }

    },


    huiyucombine: function (req, res) {
        var tthis = this;
        var ywid = req.query.id;
        var template = req.query.template;
        var ie_flag = req.query.ieflag;
        var oplimit = req.query.Objnum;
        var user = req.session.user;
        var hserr = [];
        if (!oplimit || isNaN(oplimit)) {
            oplimit = 50;
        }
        InvoiceDetailInfo.query('CALL manual_yuguilei(' + ywid + ') ', function (nerr, nresult) {
            if (nerr) {
                res.json(utilsService.reponseMessage('Error', nerr.message));
            } else {
                if (nresult[0].length > 0) {
                    res.json(utilsService.reponseMessage('Error', (_.pluck(nresult[0], 'sku')).join(',') + '未归类或未分配重量'));
                }
                else {
                    FormHead.findOne({ ywid: req.param('id') })
                        .then(record => {
                            if (!record) {
                                YWinfo.findOne({ id: ywid })
                                    .then(ywinfo => {
                                        //得到提运单，
                                        return [TiyundanInfo.findOne({ ywinfoid: ywid }), ywinfo];

                                    }).spread((tiyundaninfo, ywinfo) => {
                                        tiyundaninfo.baoguantemplate = template;
                                        //得到模板，
                                        return [TemplateFormHead.findOne({ TempleteName: tiyundaninfo.baoguantemplate }).populate('formheadElements'), InvoiceDetailInfo.find({ ywinfoid: ywid }).sort({ SequenceNO: 'asc' }), tiyundaninfo, ywinfo, paracom.find({ paratype: '商检抽查' })];
                                    })
                                    .spread((templateinfo, invoicedetails, tiyundaninfo, ywinfo, para) => {
                                        var head = {};
                                        head.invoicedetails = invoicedetails;
                                        head.tiyundaninfo = tiyundaninfo;
                                        head.ywinfo = ywinfo;
                                        // head.COP_NO = COP_NO.replace(/\"/g, "");
                                        var formheadinfo = {};

                                        if (ywinfo.custid == 806) {
                                            invoicedetails.forEach(inv => {
                                                if (inv.OHscode != inv.HSCode) {
                                                    hserr.push(inv.sku)
                                                }
                                            })
                                        }

                                        // Object.assign(templateinfo)

                                        if (templateinfo) {
                                            formheadinfo = templateinfo.getDefaultFormhead(head);
                                        }

                                        if (!formheadinfo.trade_country) {
                                            formheadinfo.trade_country = tiyundaninfo.tradeCountry;
                                        }
                                        if (!formheadinfo.distinate_port) {
                                            formheadinfo.distinate_port = tiyundaninfo.distinatePort;
                                        }

                                        formheadinfo.bill_no = tiyundaninfo.billNo;
                                        formheadinfo.contr_no = tiyundaninfo.contrNo;
                                        if (!formheadinfo.wrap_type) {
                                            formheadinfo.wrap_type = tiyundaninfo.wraptype ? tiyundaninfo.wraptype : '';
                                        }
                                        if (!formheadinfo.wrap_type) {
                                            formheadinfo.wrap_type = getwrap_type(tiyundaninfo);
                                        }
                                        formheadinfo.i_e_date = curDate();

                                        console.log('生成');
                                        var pass = true;
                                        if (!formheadinfo.formlist || formheadinfo.formlist.length == 0) {
                                            pass = false;
                                        }
                                        formheadinfo.formlist.forEach(fl => {
                                            if (!fl.origin_country || !fl.g_unit) {
                                                pass = false;
                                            }
                                        })
                                        if (pass) {

                                            var fllist = formheadinfo.formlist;
                                            // delete formheadinfo.formlist;
                                            // var headinfo = formheadinfo;
                                            console.log(fllist.length);
                                            var groupargs = [];
                                            groupargs.push('code_t');
                                            groupargs.push('code_s');
                                            if (ie_flag == 'A') {
                                                groupargs.push('contr_item');
                                            }
                                            else {
                                                groupargs.push('g_name');
                                            }
                                            if (ywinfo.custid == '3282' || ywinfo.custid == '806') {
                                                groupargs.push('g_no');
                                            }

                                            // groupargs.push('g_model');
                                            groupargs.push('trade_curr');
                                            groupargs.push('origin_country');

                                            groupresult = groupBy(fllist, groupargs);
                                            var flgroup = [];
                                            gr = groupresult.length;
                                            var grlen = groupresult.length;
                                            console.log(gr);
                                            while (gr--) {
                                                //var flz = groupresult[gr][0];
                                                var flz = {};
                                                for (var key in groupresult[grlen - gr - 1][0]) {
                                                    if (key.indexOf(',') == -1) {
                                                        flz[key] = groupresult[grlen - gr - 1][0][key];
                                                    }
                                                }
                                                flz.g_model = flz.g_model.replace(/~/g, '');
                                                flz.qty_1 = sum(groupresult[grlen - gr - 1], 'qty_1');
                                                // flz.decl_price = sum(groupresult[gr], 'decl_price');
                                                flz.trade_total = Number(sum(groupresult[grlen - gr - 1], 'trade_total')).toFixed(2);
                                                flz.decl_price = Number(flz.trade_total / flz.qty_1).toFixed(4);
                                                flz.qty_conv = sum(groupresult[grlen - gr - 1], 'qty_conv');
                                                flz.qty_2 = sum(groupresult[grlen - gr - 1], 'qty_2');
                                                if (flz.qty_2 == 0) {
                                                    flz.qty_2 = '';
                                                }
                                                flz.qty_1 = sum(groupresult[grlen - gr - 1], 'qty_1');
                                                flz.NetWeight = sum(groupresult[grlen - gr - 1], 'NetWeight');
                                                flz.combinejson = [];
                                                groupresult[grlen - gr - 1].forEach(gfl => {
                                                    flz.combinejson.push(gfl.ivid);
                                                })
                                                flgroup.push(flz);
                                            }
                                            var forminfols = [];
                                            flgroup = marksort(flgroup);

                                            if (flgroup.length > 0) {//>oplimit  不管是否拼单都可以在这里切割
                                                var flresult = [];
                                                var regflresult = [];
                                                var flele = [];
                                                var regflele = [];
                                                for (var k = 0; k < flgroup.length; k++) {
                                                    if (flele.length != 0 && flele.length % oplimit == 0) {
                                                        flresult.push(flele);
                                                        flele = [];
                                                    }
                                                    flele.push(flgroup[k]);
                                                    if (k == flgroup.length - 1) {
                                                        if (flele.length > 0) {
                                                            flresult.push(flele);
                                                        }
                                                    }
                                                }
                                                console.log('切割');
                                                var len = 0;
                                                while (len < flresult.length) {
                                                    var headinfo = {};
                                                    for (var key in formheadinfo) {
                                                        if (key != 'formlist') {
                                                            headinfo[key] = formheadinfo[key];
                                                        }
                                                    }
                                                    headinfo.entry_group = 'ecom';
                                                    headinfo.formlist = flresult[len];
                                                    headinfo.CollectTax = '0';
                                                    headinfo.chk_surety = '0';
                                                    forminfols.push(headinfo);
                                                    len++;
                                                }
                                            }
                                            else {
                                                throw new Error('生成失败 没有产品');
                                            }
                                            return [tthis.allocateCop_no_mul(forminfols), tiyundaninfo]
                                        }
                                        else {
                                            throw new Error('生成失败 预归类未完成 缺少原产国或单位');
                                        }

                                    }).spread((formheadinfos, tiyundaninfo) => {
                                        var pk = tiyundaninfo.packNo;
                                        var nt = tiyundaninfo.netWt;
                                        var gt = tiyundaninfo.grossWt;
                                        var totalpk = pk;
                                        var totalnt = nt;
                                        var totalgt = gt;
                                        var formcount = formheadinfos.length;
                                        var count = 0;
                                        try {
                                            async.mapSeries(formheadinfos, function (form, cb) {
                                                form.net_wt = 0;

                                                var i = 0;
                                                async.mapSeries(form.formlist, function (fl, cb1) {
                                                    fl.pre_entry_id = form.pre_entry_id;
                                                    fl.g_no = i.toString();
                                                    form.net_wt += Number(fl.NetWeight);
                                                    // var combineid = uuid.v1().toString();
                                                    // fl.combineid = combineid;
                                                    i++;
                                                    var upcondition = [];
                                                    fl.combinejson.forEach(inid => {
                                                        upcondition.push(inid);
                                                    })
                                                    cb1();
                                                }, function (err) {
                                                    form.gross_wt = (gt / nt * form.net_wt);
                                                    var cert = getcert(form.formlist);
                                                    form.Cert_List = cert;
                                                    var tmp = pk / nt * form.net_wt;
                                                    if (tmp < 1) {
                                                        form.pack_no = 1;
                                                    }
                                                    else {
                                                        form.pack_no = Math.floor(tmp);
                                                    }
                                                    count++;
                                                    if (count == formcount) {
                                                        form.pack_no = totalpk;
                                                        form.gross_wt = totalgt;
                                                        form.net_wt = totalnt;
                                                    }
                                                    else {
                                                        totalpk = totalpk - form.pack_no;
                                                        totalnt = totalnt - form.net_wt;
                                                        totalgt = totalgt - form.gross_wt;
                                                    }
                                                    form.net_wt = Number(form.net_wt).toFixed(4);
                                                    form.gross_wt = Number(form.gross_wt).toFixed(4);
                                                    if (form.net_wt < 1) {
                                                        form.net_wt = 1;
                                                    }
                                                    if (form.gross_wt < 1) {
                                                        form.gross_wt = 1;
                                                    }
                                                    FormHead.create(form).exec(function (err, records) {
                                                        cb(err);
                                                    });
                                                })
                                            }, function (err) {
                                                console.log(err);
                                                var flstr = (_.pluck(formheadinfos, 'pre_entry_id')).join(',');
                                                if (hserr.length > 0) {
                                                    res.json(utilsService.reponseMessage('OK', `生成报关单${flstr},sku${hserr.join(",")}发票税号与数据库不符`));
                                                }
                                                else {
                                                    res.json(utilsService.reponseMessage('OK', `生成报关单${flstr}`));
                                                }

                                            })
                                        }
                                        catch (e) {
                                            res.json(utilsService.reponseMessage('Error', e.message));
                                        }

                                    })
                                    .catch(err => {
                                        res.json(utilsService.reponseMessage('Error', err.message));
                                    })
                            }
                            else {
                                res.json(utilsService.reponseMessage('Error', '报关单已生成'));
                            }
                        })
                }
            }
        });
    },



    "allocateEdino": function (req, res) {
        var ie_flag = req.query.ie_flag;
        var username = req.query.username;
        var COP_NO = req.query.COP_NO;
        var DECL_PORT = req.query.DECL_PORT;
        request.get({ url: 'http://192.168.0.70:8001/api/getFormhead?username=' + username },
            function (err, httpResponse, body) {
                if (err) {
                    res.json(err);
                }
                else {
                    edino.allocateCopNOPromise(ie_flag, username, COP_NO, DECL_PORT).then(edidata => {
                        res.json({ EDI_NO: edidata.EDI_NO });
                    }).catch(err => {
                        res.json(err);
                    })
                }
            })
    },



    "allocateEdino_new": function (req, res) {
        var ie_flag = req.query.ie_flag;
        var username = req.query.username;
        var COP_NO = req.query.COP_NO;
        var DECL_PORT = req.query.DECL_PORT;
        request.get({ url: 'http://192.168.0.70:8001/api/getFormheads?username=' + username + '&COP_NO=' + COP_NO + '&DECL_PORT=' + DECL_PORT + '&ie_flag=' + ie_flag },
            function (err, httpResponse, body) {
                if (err) {
                    res.json(err);
                }
                else {
                    res.json(body);
                }
            })
    },




    "allocateEdino_server": function (ie_flag, username, COP_NO, DECL_PORT) {
        if (process.env.NODE_ENV == "development11") {
            return new Promise((resolve, reject) => {
                var a = Math.random();
                var edino = 'EDI278000022' + parseInt(a * 1000000);
                return resolve(edino);
            })
        }
        else {
            var regex = "\\[(.+?)\\]";
            var arr = DECL_PORT.match(regex);
            DECL_PORT = arr[1];
            return new Promise((resolve, reject) => {
                request.get({ url: 'http://192.168.0.70:8001/api/getFormheads?username=' + username + '&COP_NO=' + COP_NO + '&DECL_PORT=' + DECL_PORT + '&ie_flag=' + ie_flag },
                    function (err, httpResponse, body) {
                        if (err) {
                            return reject(err);
                        }
                        else {
                            return resolve(body);
                        }
                    })
            })
        }
    },


    "freeEdino_new": function (req, res) {
        var COP_NO = req.query.COP_NO;
        var EDI_NO = req.query.EDI_NO;
        var username = req.query.username;
        request.get({ url: 'http://192.168.0.70:8001/api/freeformdata?username=' + username + '&COP_NO=' + COP_NO + '&EDI_NO=' + EDI_NO },
            function (err, httpResponse, body) {
                if (err) {
                    res.json(err);
                }
                else {
                    res.json(body);
                }
            })
        // edino.freeCopNO(COP_NO, EDI_NO, function (err, data) {
        //     if(err){
        //         res.json(err);
        //     }
        //     else{
        //         res.json("ok");
        //     }
        // })
    },



    "freeEdino": function (req, res) {
        var COP_NO = req.query.COP_NO;
        var EDI_NO = req.query.EDI_NO;
        edino.freeCopNO(COP_NO, EDI_NO, function (err, data) {
            if (err) {
                res.json(err);
            }
            else {
                res.json("ok");
            }
        })
    },



    "allocateYwno": function (CustYwno, user) {
        var empname = user.empinfo.Empname;
        var empid = user.empinfo.Empid;
        return new Promise((resolve, reject) => {
            if (process.env.NODE_ENV == "development11") {
                var a = Math.random();
                var ywno = 'YW201804QGWGQ00' + parseInt(a * 10000);
                return resolve(ywno);
            }
            else {
                request.get({ url: encodeURI(sails.config.remoteapi + '/api/Ywinfo/getYwNoremote?CustYwno=' + CustYwno + '&empname=' + empname + '&empid=' + empid) },
                    function (err, httpResponse, body) {
                        if (err) {
                            return reject(err);
                        }
                        else {
                            return resolve(body);
                        }
                    })
            }

        })
    },

    "allocateCop_no": function () {
        return new Promise((resolve, reject) => {
            if (process.env.NODE_ENV == "development11") {
                var a = Math.random();
                var copno = 'BG201804KWGQ00' + parseInt(a * 10000);
                return resolve(copno);
            }
            else {
                request.get({ url: sails.config.remoteapi + '/api/Ywinfo/getCopNoremote' },
                    function (err, httpResponse, body) {
                        if (err) {
                            return reject(err);
                        }
                        else {
                            return resolve(body);
                        }
                    })
            }
        })
    },


    "allocateCop_no_mul": function (forminfols) {
        return new Promise((resolve, reject) => {
            var count = forminfols.length;
            if (process.env.NODE_ENV == "development11") {
                var coplist = [];
                var a = Math.random();
                var copno = 'BG201904KWGQ00' + parseInt(a * 10000);
                while (count--) {
                    while (coplist.indexOf(copno) != -1) {
                        a = Math.random();
                        copno = 'BG201904KWGQ00' + parseInt(a * 10000);
                    }
                    coplist.push(copno);
                    forminfols[count].COP_NO = copno;
                    forminfols[count].pre_entry_id = copno;

                }
                return resolve(forminfols);
            }
            else {
                request.get({ url: sails.config.remoteapi + '/api/Ywinfo/getCopNoremote_mul?count=' + count },
                    function (err, httpResponse, body) {
                        if (err) {
                            return reject(err);
                        }
                        else {
                            var cops = JSON.parse(body);
                            while (count--) {
                                forminfols[count].COP_NO = cops[count];
                                forminfols[count].pre_entry_id = cops[count];
                            }
                            return resolve(forminfols);
                        }
                    })
            }
        })
    },

    "sycroFormhead": function (formhead) {
        return new Promise((resolve, reject) => {
            if (process.env.NODE_ENV == "development11") {
                return resolve("success");
            }
            else {
                request.post({ url: sails.config.remoteapi + '/api/Ywinfo/sycroFormhead', json: formhead },
                    function (err, httpResponse, body) {
                        if (body == "success") {
                            return resolve(body);
                        }
                        else {
                            return reject(body);
                        }
                    })
            }

        })
    },

    // zara同步报关单
    "sycroFormhead_mul": function (req, res) {
        var user = req.session.user;
        if (process.env.NODE_ENV == "development11") {
            return resolve("success");
        }
        else {
            FormHead.find({ ywid: req.param('ywid') }).populate('formlist')
                .then(forms => {
                    forms.forEach(formhead => {
                        formhead.CreatePersonName = user.empinfo.Empname;
                        formhead.LastupdatePerson = user.empinfo.Empname;
                        formhead.PrintType = formhead.ywno;
                        // formhead.FormList = formhead.formlist;
                        // delete formhead.formlist;
                        var proitem = formhead.PROMISE_ITMES.split('');
                        formhead.promiseflag1 = proitem[0];
                        formhead.promiseflag2 = proitem[1];
                        formhead.promiseflag3 = proitem[2];
                    })
                    request.post({ url: sails.config.remoteapi + '/api/Ywinfo/sycroFormhead_mul', json: forms },
                        function (err, httpResponse, body) {
                            res.json(body);
                        })
                })
        }
    },

    // zara同步formlist
    sycroFormlist_mul: function (req, res) {
        var user = req.session.user;
        if (process.env.NODE_ENV == "development11") {
            return resolve("success");
        }
        else {
            FormHead.find({ ywid: req.param('ywid'), ie_flag: '9' }).populate('formlist')
                .then(forms => {
                    forms.forEach(formhead => {
                        // formhead.CreatePersonName = user.empinfo.Empname;
                        // formhead.LastupdatePerson = user.empinfo.Empname;
                        // formhead.PrintType = formhead.ywno;
                        // formhead.FormList = formhead.formlist;
                        // delete formhead.formlist;
                        var proitem = formhead.PROMISE_ITMES.split('');
                        formhead.promiseflag1 = proitem[0];
                        formhead.promiseflag2 = proitem[1];
                        formhead.promiseflag3 = proitem[2];
                    })
                    request.post({ url: sails.config.remoteapi + '/api/Ywinfo/sycroFormlist_mul', json: forms },
                        function (err, httpResponse, body) {
                            res.json(body);
                        })
                })
        }
    },

    // 导出商检箱号
    getciqbundle: function (req, res) {
        if (process.env.NODE_ENV == "development11") {
            return resolve("success");
        }
        else {
            InvoiceDetailInfo.query('CALL getciqbundle("' + req.param('ywno') + '") ', function (err, result) {
                if (err || !result[1]) {
                    res.json(utilsService.reponseMessage('Error', err.message));
                } else {
                    res.json(result[1]);
                }
            });
        }
    },


    // zara同步报关单
    "sycroFormhead_mul_leg": function (req, res) {
        var user = req.session.user;
        if (process.env.NODE_ENV == "development11") {
            return resolve("success");
        }
        else {
            FormHead.find({ ywid: req.param('ywid') }).populate('formlist')
                .then(forms => {

                    async.forEach(forms, function (formhead, callback) {
                        formhead.CreatePersonName = user.empinfo.Empname;
                        formhead.LastupdatePerson = user.empinfo.Empname;
                        formhead.PrintType = formhead.ywno;
                        // formhead.FormList = formhead.formlist;
                        // delete formhead.formlist;
                        var proitem = formhead.PROMISE_ITMES.split('');
                        formhead.promiseflag1 = proitem[0];
                        formhead.promiseflag2 = proitem[1];
                        formhead.promiseflag3 = proitem[2];

                        writeresponse('D:', JSON.stringify(forms))
                        request.post({ url: 'http://localhost:42075/api/Ywinfo/sycroFormhead_mul', json: forms },
                            function (err, httpResponse, body) {
                                res.json(body);
                            })
                    })
                })
        }
    },


    'importYWOne': function (req, res) {
        var user = req.session.user;
        var ywid = req.param('id');
        var tthis = this;
        if (user && user.empinfo) {
            var empname = user.empinfo.Empname;
            QuanqiuYWInfo.findOne({ custYWNO: ywid }).then(function (quanqiuywinfo) {
                if (quanqiuywinfo.ywid) {
                    throw (ywid + '已接单');
                }
                var InvoiceDetailinfos = [];
                var invoicedetail = {};
                //第一个join表
                var quanqiuplinfo = quanqiuywinfo.PL;
                var groupargs = ['HPPartNo', 'Description', 'company', 'OriginCountry', 'ChineseDescr', 'productgroup'];
                groupargs.forEach(gkey => {
                    quanqiuplinfo.forEach(quan => {
                        quan[gkey] = quan[gkey].toUpperCase();
                    })
                })

                var groupresult = groupBy(quanqiuplinfo, groupargs);
                var pl = [];
                var gr = groupresult.length;
                while (gr--) {
                    var p1detail = groupresult[gr][0];
                    p1detail.NoOfCarton = sum(groupresult[gr], 'NoOfCarton');
                    p1detail.Qty = sum(groupresult[gr], 'Qty');
                    p1detail.GrossWeight = sum(groupresult[gr], 'GrossWeight');
                    p1detail.NetWeight = sum(groupresult[gr], 'NetWeight');

                    pl.push(p1detail);
                }

                //第二个join表
                var quanqiuinvoiceinfo = quanqiuywinfo.Apl;
                var groupargs = ['Storer', 'Notes2', 'OriginCountry', 'SKU', 'Descr'];


                groupargs.forEach(gkey => {
                    quanqiuinvoiceinfo.forEach(quan => {
                        quan[gkey] = quan[gkey].toUpperCase();
                    })
                })


                groupresult = groupBy(quanqiuinvoiceinfo, groupargs);
                var inv = [];
                gr = groupresult.length;

                while (gr--) {
                    var invdetail = groupresult[gr][0];
                    var glen = groupresult[gr].length;
                    var total = 0;
                    while (glen--) {
                        var totalprice = Number(groupresult[gr][glen].QTY) * Number(groupresult[gr][glen].Unit_Price);
                        total += totalprice;
                    }
                    // invdetail.Price = sum(groupresult[gr], 'Unit_Price') / groupresult[gr].length;
                    invdetail.qty = sum(groupresult[gr], 'QTY');
                    invdetail.totalPrice = total;
                    invdetail.Price = (total / invdetail.qty).toFixed(5);
                    inv.push(invdetail);
                }

                //第三个join表
                var quanqiushenqinginfo = quanqiuywinfo.Invoice;
                var q1 = quanqiuywinfo.shenqinglist;
                gr = q1.length;
                while (gr--) {
                    q1[gr].StockNO = quanqiushenqinginfo.StockNO;
                    q1[gr].BaoguanApplyNO = quanqiushenqinginfo.BaoguanApplyNO;
                    q1[gr].InvoiceNO = quanqiushenqinginfo.InvoiceNO;
                    q1[gr].BaoguanDate = quanqiushenqinginfo.BaoguanDate;
                    q1[gr].qlQty = q1[gr].Qty;
                    q1[gr].qlGrossWeight = q1[gr].GrossWeight;
                    q1[gr].qlNetWeight = q1[gr].NetWeight;
                    q1[gr].baoguantemplate = quanqiushenqinginfo.Tihuoplace == "HPE" ? "保税207慧与贸易进口征税模板" : "保税207惠普贸易进口征税模板"

                }

                var pnv = [];
                var plen = pl.length;
                while (plen--) {
                    var invlen = inv.length;
                    while (invlen--) {
                        if (inv[invlen].SKU == pl[plen].HPPartNo && inv[invlen].OriginCountry == pl[plen].OriginCountry) {
                            for (var p in inv[invlen]) {
                                pl[plen][p] = inv[invlen][p];
                            }
                            pnv.push(pl[plen]);
                        }
                    }
                }

                var ap = q1.length;
                while (ap--) {
                    var pnvlen = pnv.length;
                    while (pnvlen--) {
                        if (Number(pnv[pnvlen].Qty) == Number(q1[ap].qlQty) && (pnv[pnvlen].totalPrice).toFixed(3) == Number(q1[ap].Amount)) {
                            for (var p in pnv[pnvlen]) {
                                q1[ap][p] = pnv[pnvlen][p]
                            }

                            if (q1[ap].SKU) {
                                q1[ap].sku = q1[ap].SKU.toUpperCase();
                            }
                            q1[ap].TotalpriceFOB = (pnv[pnvlen].totalPrice).toFixed(3);// (Number(q1[ap].Price) * Number(q1[ap].Qty)).toFixed(5);
                            q1[ap].OCOO = q1[ap].OriginCountry;
                            q1[ap].Qty = pnv[pnvlen].Qty;
                            q1[ap].Qty2 = pnv[pnvlen].qty;
                            q1[ap].GrossWeight = q1[ap].qlGrossWeight
                            q1[ap].NetWeight = q1[ap].qlNetWeight;
                            q1[ap].Cgoodsname = q1[ap].GName;
                            if (q1[ap].HSCode.length == 10 && _.endsWith(q1[ap].HSCode, '00')) {
                                q1[ap].HSCode = q1[ap].HSCode.substr(0, 8);
                            }

                        }

                    }
                    if (!q1[ap].sku) {
                        throw (ywid + '与申请单无法匹配,原数据有误');
                    }
                    q1[ap].productDetailJson = {};
                    q1[ap].productDetailJson.Description = q1[ap].Description;
                    q1[ap].productDetailJson.company = q1[ap].company;
                    q1[ap].productDetailJson.Descr = q1[ap].Descr;
                    q1[ap].productDetailJson.SKU = q1[ap].SKU;
                    if (q1[ap].GName.indexOf('/') != -1) {
                        q1[ap].productDetailJson.Cgoodsname = q1[ap].GName.substr(0, q1[ap].GName.indexOf('/'));
                    }
                    else {
                        q1[ap].productDetailJson.Cgoodsname = q1[ap].GName;
                    }
                    q1[ap].productDetailJson.Vendor = q1[ap].Vendor;

                    InvoiceDetailinfos.push(q1[ap]);
                }
                tthis.allocateYwno(ywid, user).then(ywno => {
                    YWinfo.create({ YWNO: ywno.replace(/\"/g, ""), CustYWNO: ywid, custid: 751, createperson: empname }).then((ywinfo) => {
                        paracom.find({ paratype: 'Brand' }).then(function (vendors) {
                            // YWinfo.publishCreate(ywinfo);
                            var goodslist = [];
                            var tiyundandata = {};
                            var vendtmp = [];
                            var vendorinsert = [];
                            InvoiceDetailinfos.forEach(invinfo => {
                                invinfo.ywinfoid = ywinfo.id;
                                invinfo.Cgoodsname = invinfo.productDetailJson.Cgoodsname;
                                var vend = _.find(vendors, vd => {
                                    return vd.parakey == invinfo.Vendor && vd.paratype == 'Brand';
                                })
                                if (vend) {
                                    invinfo.productDetailJson.Vendor = vend.paravalue;
                                }
                                else {
                                    if (vendtmp.indexOf(invinfo.Vendor) == -1) {
                                        vendtmp.push(invinfo.Vendor);
                                        var vendele = {};
                                        vendele.paratype = 'Brand';
                                        vendele.parakey = invinfo.Vendor;
                                        vendele.paravalue = invinfo.Vendor;
                                        vendele.description = invinfo.company;
                                        vendorinsert.push(vendele);
                                    }
                                }
                                tiyundandata.contrNo = invinfo.productgroup;
                                tiyundandata.noteS = invinfo.BaoguanApplyNO;
                                tiyundandata.baoguantemplate = invinfo.baoguantemplate;
                            });



                            tiyundandata.grossWt = sum(InvoiceDetailinfos, 'GrossWeight');

                            tiyundandata.packNo = sum(InvoiceDetailinfos, 'NoOfCarton');

                            tiyundandata.netWt = sum(InvoiceDetailinfos, 'NetWeight');



                            // tiyundandata.grossWt = _.reduce(InvoiceDetailinfos, (sum, v) => {
                            //     return sum + v.GrossWeight
                            // }, 0);

                            // tiyundandata.packNo = _.reduce(InvoiceDetailinfos, (sum, v) => {
                            //     return sum + v.NoOfCarton
                            // }, 0);

                            // tiyundandata.netWt = _.reduce(InvoiceDetailinfos, (sum, v) => {
                            //     return sum + v.NetWeight
                            // }, 0);

                            tiyundandata.ywinfoid = ywinfo.id;
                            quanqiuywinfo.ywid = ywinfo.id;

                            return [InvoiceDetailInfo.create(InvoiceDetailinfos), ywinfo, TiyundanInfo.create(tiyundandata), QuanqiuYWInfo.update({ custYWNO: quanqiuywinfo.custYWNO }, { ywid: ywinfo.id }), paracom.create(vendorinsert)];
                        })
                            .spread((invoicelist, ywinfo, quanqiu) => {

                                res.json(utilsService.reponseMessage('OK', `导入业务${ywinfo.YWNO} 发票数据${invoicelist.length}`));

                            })
                            .catch(err => {
                                res.json(utilsService.reponseMessage('Error', err.message));

                            })

                    })

                })
            }).catch(err => {
                res.json(utilsService.reponseMessage('Error', err));

            })
        }
        else {
            res.json(utilsService.reponseMessage('Error', '请先登录'));
        }
    },
    // 同步业务
    'importYWOne_zara': function (req, res) {
        var ywid = req.param('id');
        var user = req.session.user;
        if (user) {
            var empname = user.empinfo.Empname;
            var empid = user.empinfo.Empid;
            YWinfo.findOne({ id: ywid }).then(ywinfo => {
                // utilsService.sycroYwno(ywinfo.YWNO, ywinfo.CustYWNO, user).then(result => {
                //     res.json(utilsService.reponseMessage('OK', `成功同步[${ywinfo.YWNO}]`));
                // }).catch(err=>{
                //     res.json(utilsService.reponseMessage('OK', err));
                // })
                request.get({ url: encodeURI(sails.config.remoteapi + '/api/Ywinfo/allowcateYwNoremote?ywno=' + ywinfo.YWNO + '&CustYwno=' + ywinfo.CustYWNO + '&empname=' + empname + '&empid=' + empid + '&custid=' + ywinfo.custid) },
                    function (err, httpResponse, body) {
                        if (body == "success") {
                            res.json(utilsService.reponseMessage('OK', `成功同步[${ywinfo.YWNO}]`));
                        }
                        else {
                            res.json(utilsService.reponseMessage('OK', body));
                        }
                    })
            })
        }
        else {
            res.json(utilsService.reponseMessage('OK', '请登录'));
        }
    },

    'importYw': function (req, res) {
        //import custywinfo to ywinfo
        var ids = req.body;
        var resultdata = [];
        var i = 0;
        async.forEach(ids, function (value, callback) {
            QuanqiuYWInfo.findOne({ custYWNO: value })
                .populate(['QuanqiuInvoiceInfos',
                    'QuanqiuPLInfos', 'QuanqiuShenqingInfos'
                ])
                .then(function (quanqiuywinfo) {
                    if (quanqiuywinfo.QuanqiuShenqingInfos.length === 1)
                        return [QuanqiuShenqingListInfo.find({ owner: quanqiuywinfo.QuanqiuShenqingInfos[0].id }), quanqiuywinfo];
                    //发票箱单内容，和建议书内容，校对后，生成invoicedetaillist



                })
                .spread(function (shenqinglistinfo, quanqiuywinfo) {

                    //合并发票箱单数据，和申请书保持一致


                    var groupinvoice = _.groupby(quanqiuywinfo.QuanqiuInvoiceInfos, (value) => {
                        return `sku:${value.HPPartNo},coo: ${value.OriginCountry}`
                    });
                    var groupps = _.groupby(quanqiuywinfo.QuanqiuPLInfos, (value) => {
                        return `sku:${value.HPPartNo},coo: ${value.OriginCountry}`
                    });

                    //judge same 



                    shenqinglistinfo.forEach(v => {


                    })
                    //把两个对象按照同一个拼成同一个对象，




                    var ywinfodata = {};
                    ywinfodata.YWNO = value;
                    ywinfodata.CustYWNO = value;



                    return YWinfo.create({ YWNO: value, CustYWNO: value });

                })
                .then(function (inserteddaa) {
                    //insert invoicedetai信息


                    quanqiuywinfo.owner = inserteddaa.id;
                    quanqiuywinfo.save()
                    i++;
                    callback();
                })
                .catch(function (err) {
                    callback(err);
                })
        }, function (err) {
            if (err) {
                res.json(utilsService.reponseMessage('Error', err.message));

            } else {
                res.json(utilsService.reponseMessage('OK', `成功接单[${i}]`));

            }

        });


    },
    searchby: function (req, res) {
        var condition = req.body;
        console.log(condition.pageIndex);
        // var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        let whereObj = utilsService.getWhereCondition(condition.condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        YWinfo.count({ where: whereObj }).then(function (resultcount) {
            responseresult.totalCount = resultcount;

            return YWinfo.find({
                where: whereObj,
                skip: (condition.pageIndex - 1) * condition.pageSize,
                limit: condition.pageSize,
                sort: condition.sortby ? condition.sortby : 'id DESC'
            });
        })
            .then(function (results) {
                async.mapSeries(results, function (result, callback) {
                    CustInfo.find({ id: result.custid }).then(data => {
                        result.custname = data[0].custname;
                        FormHead.findOne({ ywid: result.id }).then(form => {
                            if (form) {
                                result.mainpre_entry_id = form.pre_entry_id;
                            }
                            callback(null, result);
                        })
                    })
                        .catch(err => {
                            callback(err)
                        })
                }, function (err, data) {
                    if (err) {
                        res.json({ status: 'error', err: err });
                    } else {
                        responseresult.status = 'OK';
                        responseresult.datas = data;
                        res.json(responseresult);
                    }
                })
            })
            .error(function (er) {
                res.json({ status: 'error', err: er.message });
            });
        // YWinfo.count({
        //     where: {
        //         CustYWNO: {
        //             'contains': condition.CustYWNO
        //         }
        //     }
        // }).then(function (resultcount) {
        //     responseresult.totalCount = resultcount;

        //     return YWinfo.find({
        //         where: {
        //             CustYWNO: {
        //                 'contains': condition.CustYWNO
        //             }
        //         },
        //         skip: (condition.pageIndex - 1) * condition.pageSize,
        //         limit: condition.pageSize,
        //         sort: condition.sortby ? condition.sortby : 'id DESC'
        //     });
        // })
        //     .then(function (results) {
        //         responseresult.status = 'OK';
        //         responseresult.datas = results;
        //         console.log(results);
        //         res.json(responseresult);
        //     })
        //     .error(function (er) {
        //         res.json({ status: 'error', err: er.message });
        //     });
    },
    getywdetail: function (req, res) {
        var condition = req.body;
        var result = {};
        var ywid = condition.ywid;
        YWinfo.findOne({ id: ywid }).then(ywinfo => {
            result.ywinfo = ywinfo;
            InvoiceDetailInfo.find({ ywinfoid: ywid })
                .then(invoicelist => {
                    result.invoicelist = invoicelist;
                    TiyundanInfo.find({ ywinfoid: ywid }).then(tiyundan => {
                        result.tiyundan = tiyundan;
                        FormHead.find({ ywid: ywid }).then(form => {
                            result.formhead = form;
                            res.json(result);
                        })
                    })
                })
        }).error(function (er) {
            res.json({ status: 'error', err: er.message });
        })
    },
    findOne: function (req, res) {
        // var id=req.id;
        YWinfo.findOne({ id: req.param('id') })
            .populate(['invoiceDetailList', 'tiyundaninfo', 'formhead'])
            .then(data => {
                return res.json(data);

            })
            .catch(err => {
                return res.err(err);
            })

    },
    destroy: function (req, res) {
        FormHead.findOne({ ywid: req.param('id') })
            .then(record => {
                if (!record) {
                    QuanqiuYWInfo.findOne({ ywid: req.param('id') }).then(function (quanqiuywinfo) {
                        YWinfo.destroy({ id: req.param('id') })
                            .then((ywids) => {
                                if (quanqiuywinfo) {
                                    quanqiuywinfo.ywid = null;
                                    quanqiuywinfo.save(err => {
                                        if (err) {
                                            res.json({ status: 'err', err: err });
                                        }
                                        else {
                                            var ids = ywids.map(function (yw) { return yw.id; });
                                            InvoiceDetailInfo.destroy({ ywinfoid: ids }).exec(function (err, fls) {
                                                TiyundanInfo.destroy({ ywinfoid: ids }).exec(function (err, fls) {
                                                    res.json({ status: 'ok', err: '删除成功' });
                                                })
                                            });
                                        }
                                    });
                                }
                                else {
                                    var ids = ywids.map(function (yw) { return yw.id; });
                                    InvoiceDetailInfo.destroy({ ywinfoid: ids }).exec(function (err, fls) {
                                        TiyundanInfo.destroy({ ywinfoid: ids }).exec(function (err, fls) {
                                            res.json({ status: 'ok', err: '删除成功' });
                                        })
                                    });
                                }

                            })
                    })
                }
                else {
                    res.json({ status: 'error', err: '业务下报关单未删除' });
                }
            })
    },
    geteEDINObyCOPNO: function (req, res) {
        var COP_NO = req.query.COP_NO;
        if (COP_NO) {
            EDINOInfos.findOne({ AllocateCOPNO: COP_NO })
                .then(result => {
                    if (result) {
                        res.json(result.EDI_NO);
                    }
                    else {
                        res.json('');
                    }
                })
        }
        else {
            res.json('');
        }
    },
    saveywinfo: function (req, res) {
        var postdata = req.body;
        console.log(1);
        console.log(postdata);
        delete postdata.formhead;
        var tiyundaninfo = postdata.tiyundaninfo[0];
        // delete postdata.tiyundaninfo;
        // delete tiyundaninfo.billNo;
        // delete tiyundaninfo.voyageNo;
        // delete tiyundaninfo.tradeCountry;
        // delete tiyundaninfo.distinatePort;
        // delete tiyundaninfo.iEPort;
        // delete tiyundaninfo.contrNo;
        // delete tiyundaninfo.noteS;
        // delete tiyundaninfo.packNo;
        // delete tiyundaninfo.ywinfoid;
        // delete tiyundaninfo.trafName;
        YWinfo.update({ id: postdata.id }, postdata).then(result => {
            console.log(tiyundaninfo);
            TiyundanInfo.update({ id: tiyundaninfo.id }, tiyundaninfo).then(zresult => {
                res.json({ status: 'ok', err: '更新成功' });
            })
        })
    }

};

function sendformhead(form, username, callback) {
    request({
        url: 'http://192.168.0.188:8001/api/updateFormhead',
        method: "POST",
        json: form
    }, function (err, httpResponse, body) {
        request.get({ url: 'http://192.168.0.188:8001/api/getFormhead?username=' + username },
            function (err, httpResponse, body) {
                callback("");
            })
    })
}


function valUnit(inv) {
    if (inv.cunit1 != '035' && inv.cunit2 != '035') {
        inv.cunit = '035';
    }
    else if (inv.cunit1 != '035') {
        if (inv.UNIT != '035') {
            inv.cunit = inv.UNIT;
        }
        else {
            inv.cunit = inv.cunit1;
        }
    }
    else {
        if (inv.UNIT != '035') {
            inv.cunit = inv.UNIT;
        }
        else {
            inv.cunit = '007';
        }
    }
}


function groupBy(sourcelist, groupargs) {
    var groupkey = groupargs.join(',');
    var gouplist = [];
    sourcelist.forEach(sor => {
        sor[groupkey] = '';
        groupargs.forEach(gr => {
            if (gr == 'g_model') {
                sor[groupkey] += sor[gr].replace(/~.*?\|/g, "");
            }
            else {
                if (sor[gr]) {
                    sor[groupkey] += sor[gr];
                }
                else {
                    sor[groupkey] += 'empty';
                }
            }

        })
        var keylist = [];
        for (var key in gouplist) {
            keylist.push(key);
        }
        if (keylist.indexOf(sor[groupkey]) == -1) {
            gouplist[sor[groupkey]] = [];
            gouplist[sor[groupkey]].push(sor);
        }
        else {
            gouplist[sor[groupkey]].push(sor);
        }
    })
    var result = [];
    for (var key in gouplist) {
        result.push(gouplist[key]);
    }
    return result;
}



function sum(sourcelist, arg) {
    var slen = sourcelist.length;
    var amount = 0;
    while (slen--) {
        amount += Number(sourcelist[slen][arg]);
    }
    return amount.toFixed(5);
}


function curDateTime() {
    var d = new Date();
    var year = d.getYear();
    var month = d.getMonth() + 1;
    var date = d.getDate();
    var day = d.getDay();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    var ms = d.getMilliseconds();
    var curDateTime = year + 1900;
    if (month > 9)
        curDateTime = curDateTime + "-" + month;
    else
        curDateTime = curDateTime + "-0" + month;

    if (date > 9)
        curDateTime = curDateTime + "-" + date;
    else
        curDateTime = curDateTime + "-0" + date;

    curDateTime = curDateTime + ' ';
    if (hours > 9)
        curDateTime = curDateTime + "" + hours;
    else
        curDateTime = curDateTime + "0" + hours;
    if (minutes > 9)
        curDateTime = curDateTime + ":" + minutes;
    else
        curDateTime = curDateTime + ":0" + minutes;
    if (seconds > 9)
        curDateTime = curDateTime + ":" + seconds;
    else
        curDateTime = curDateTime + ":0" + seconds;
    return curDateTime;
}


function curDate() {
    var d = new Date();
    var year = d.getYear();
    var month = d.getMonth() + 1;
    var date = d.getDate();
    var day = d.getDay();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();
    var ms = d.getMilliseconds();
    var curDateTime = year + 1900;
    if (month > 9)
        curDateTime = curDateTime + "-" + month;
    else
        curDateTime = curDateTime + "-0" + month;

    if (date > 9)
        curDateTime = curDateTime + "-" + date;
    else
        curDateTime = curDateTime + "-0" + date;

    return curDateTime;
}

//反着排 后len--会倒回来
function marksort(formlist) {
    formlist = formlist.sort(by('g_no'));
    var oaflag = [];//oa flag
    var aflag = [];
    var ctflag = [];
    var cflag = [];
    var left = [];

    var oldarray = [];//旧商品
    //_.endsWith(q1[ap].HSCode, '00')
    var larray = [];
    var nonlarray = [];
    formlist.forEach(fl => {
        if (_.endsWith(fl.g_name, '(旧)')) {
            oldarray.push(fl);
        }
        else if (fl.ShangjianMark && fl.ShangjianMark.indexOf('L') != -1) {
            larray.push(fl);
        }
        else {
            nonlarray.push(fl);
        }
    })
    var lresult = larray.concat(nonlarray);
    lresult.forEach(fl => {
        if (fl.ControlMark && fl.ControlMark.indexOf('A') != -1 && fl.ControlMark.indexOf('O') != -1) {
            oaflag.push(fl);
        }
        else if (fl.ControlMark && fl.ControlMark.indexOf('A') != -1) {
            aflag.push(fl);
        }
        else if (fl.CFlag) {
            if (fl.code_t.substr(0, 2) == '64' && fl.g_name.indexOf('童') != -1) {
                ctflag.push(fl);
            }
            else {
                cflag.push(fl);
            }
        }
        else {
            left.push(fl);
        }
    })
    var result = oldarray.concat(oaflag).concat(aflag).concat(ctflag).concat(cflag).concat(left);
    return result;
}



function getcert(formlist) {
    var cay = [];
    var certlist = [];
    var pre_entry_id = '';
    formlist.forEach(fl => {
        pre_entry_id = fl.pre_entry_id;
        if (fl.ControlMark && fl.ControlMark.indexOf('O') != -1) {
            if (cay.indexOf('O') == -1) {
                cay.push('O')
            }
        }
        if (fl.ControlMark && fl.ControlMark.indexOf('A') != -1) {
            if (cay.indexOf('A') == -1) {
                cay.push('A')
            }
        }
    })
    var i = 0;
    if (cay.length > 0) {
        cay.forEach(ca => {
            var cert = {};
            cert.pre_entry_id = pre_entry_id;
            cert.order_no = i.toString();
            i++;
            cert.docu_code = ca;
            cert.cert_code = '';
            certlist.push(cert);
        })
    }
    return certlist;
}

//反着排 后len--会倒回来
function marksort_jin(formlist) {
    formlist = formlist.sort(by('contr_item'));
    formlist = formlist.sort(by('tcombineid'));
    return formlist;
}


//反着排 加上wgno
function marksort_fenchai(formlist) {
    var aflag = [];
    var cflag = [];
    var left = [];
    formlist.forEach(fl => {
        if (fl.ControlMark.indexOf('A') != -1) {
            aflag.push(fl);
        }
        else if (fl.CFlag) {
            cflag.push(fl);
        }
        else {
            left.push(fl);
        }
    })
    aflag = aflag.sort(by('wgno'));
    cflag = cflag.sort(by('wgno'));
    left = left.sort(by('wgno'));
    var result = aflag.concat(cflag).concat(left);
    return result;
}

var by = function (name) {
    return function (o, p) {
        var a, b;
        if (typeof o === "object" && typeof p === "object" && o && p) {
            a = o[name];
            b = p[name];
            if (a === b) {
                return 0;
            }
            if (typeof a === typeof b) {
                if (isNaN(a)) {
                    return a < b ? -1 : 1;
                }
                else {
                    return Number(a) < Number(b) ? -1 : 1;
                }

            }
            return typeof a < typeof b ? -1 : 1;
        }
        else {
            throw ("error");
        }
    }
}


function writeresponse(path, data) {
    //console.log(Date.parse(new Date()))
    fs.open(path + '\\yxresult.txt', 'a', function (err, fd) {
        if (err) {
            throw err;
        }
        fs.writeSync(fd, data, 0, 'utf-8');

        fs.close(fd, function (err) {
            if (err) {
                throw err;
            }
            //console.log('file closed');
        })
    })
}


function getwrap_type(tiyundandata) {
    var wraptype = '';
    if (tiyundandata.grossWt > 0 && tiyundandata.packNo > 0) {
        if (tiyundandata.grossWt / tiyundandata.packNo >= 20) {
            if (tiyundandata.packNo < 5) {
                wraptype = '托盘[5]';
            }
            else {
                wraptype = '其它[7]';
            }
        }
        else {
            wraptype = '纸箱[2]';
        }
    }
    return wraptype;
}