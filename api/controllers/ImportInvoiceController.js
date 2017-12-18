var XLSX = require('xlsx');
var workbook, target_sheet, worksheet, filename = '70963INV.xlsx', path = 'C:/Users/wanli/Documents/70963/';
var Obj = {
    1: 'K10', 	//    '仓库号码'        		:'StockNO',
    2: 'AL12',	//    '报关申请单号' 		    : 'BaoguanApplyNO',
    3: 'M16', 	//     '发票号'        			: 'InvoiceNO',
    4: 'AL18', 	//     '报关日期'      		  : 'BaoguanDate'
    5: 'AL14', 	//     '提货单位'      		  : 'Tihuoplace'
    6: 'M12', 	//     '仓储企业名称'      		  : 'storecompany'
    7: 'M14', 	//     '货主十位数代码'      		  : 'ownercode'
    8: 'AK16', 	//     '封志/唛头：'      		  : 'note'
    9: 'M18', 	//     '报关单号：'      		  : 'pre_entry_id'
    10: 'M20', 	//     '运输单位名称'      		  : 'transcompany'
    11: 'AL20' 	//     '预计出关日期'      		  : 'pretonguandate'
}
var index = [24, 24, 24, 24, 25, 25, 25, 25, 25],
    table = {
        0: 'F', 1: 'M', 2: 'U', 3: 'AX',
        4: 'C', 5: 'AB', 6: 'AE', 7: 'AL', 8: 'AR'
    };

module.exports = {
    import_bak: function (req, res) {

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
            else if (uploadedFiles.length == 1) {
                var filename_1 = uploadedFiles[0].filename;
                var path1 = uploadedFiles[0].fd;
                var custYWNO = req.body.Custywno;
                var qqywid, temp = { filename_1: filename_1, filename_2: '', filename_3: '', custYWNO: custYWNO };
                var obj1 = Service.read_excel2_info(path1, filename_1, qqywid);
                if (obj1 != 'err') {
                    var head = '';
                    var newarray = [];

                    obj1.forEach(curr => {
                        if (curr['正式调拨单号']) {
                            head = curr['正式调拨单号'];
                        }
                        // curr['正式调拨单号']=head;
                        var newobj = {};
                        newobj['正式调拨单号'] = head;
                        for (var key in curr) {
                            if (key != '正式调拨单号') {
                                newobj[key] = curr[key];
                            }
                        }
                        newarray.push(newobj);
                    })
                    temp.shenqinglist = newarray;
                    QuanqiuYWInfo.create(temp).then(function (ywi) {
                        res.json('ok');
                    }).catch(function (err) {
                        console.log(err);
                        res.json(err);
                    });
                }
                else {
                    res.json('文件格式有误');
                }
            }
            else if (uploadedFiles.length == 2) {
                var filename_1 = uploadedFiles[0].filename;
                filename_2 = uploadedFiles[1].filename;
                var path1 = uploadedFiles[0].fd;
                path2 = uploadedFiles[1].fd;
                custYWNO = req.body.Custywno;
                var qqywid, temp = { filename_1: filename_1, filename_2: filename_2, filename_3: '', custYWNO: custYWNO };
                var obj1 = Service.read_excel2_info(path1, filename_1, qqywid);
                if (obj1 != 'err') {
                    var head = '';
                    var newarray = [];

                    var packlist = [];
                    var skulist = [];
                    obj1.forEach(curr => {
                        var packinfo = {};
                        var newobj = {};
                        if (curr['CARTON_NO']) {
                            newobj['CARTON_NO'] = curr['CARTON_NO'];
                        }
                        if (curr['SKU']) {
                            newobj['SKU'] = curr['SKU'];
                        }
                        if (curr['QTY']) {
                            newobj['QTY'] = curr['QTY'];
                        }
                        if (curr['GROSSWT']) {
                            newobj['GROSSWT'] = curr['GROSSWT'];
                        }

                        var pack = _.find(packlist, pack => {
                            return pack.CARTON_NO == newobj['CARTON_NO'];
                        })
                        if (pack) {
                            var sk = _.find(pack.pro, proinfo => {
                                return proinfo.SKU == newobj['CARTON_NO'];
                            })
                            if (sk) {
                                //是否是引用类型 毛重是否能直接加
                                sk.QTY += newobj['GROSSWT'];
                            }
                            else {
                                var pro = {};
                                pro.SKU = newobj['SKU'];
                                pro.QTY = newobj['QTY'];
                                pack.pro.push(pro);
                            }

                        }
                        else {
                            var newpack = {};
                            newpack.CARTON_NO = newobj['CARTON_NO'];
                            newpack.GROSSWT = newobj['GROSSWT'];
                            newpack.pro = [];
                            var pro = {};
                            pro.SKU = newobj['SKU'];
                            pro.QTY = newobj['QTY'];
                            newpack.pro.push(pro);
                            packlist.push(newpack);
                        }

                        if (!packlist.indexOf(newobj['CARTON_NO'])) {
                            packlist.push(newobj['CARTON_NO'])
                        }
                        else {

                        }

                        if (!skulist.indexOf(newobj['QTY']))


                            // for (var key in curr) {
                            //     if (key != '正式调拨单号') {
                            //         newobj[key] = curr[key];
                            //     }
                            // }
                            newarray.push(newobj);
                    })
                    temp.shenqinglist = newarray;
                    QuanqiuYWInfo.create(temp).then(function (ywi) {
                        res.json('ok');
                    }).catch(function (err) {
                        console.log(err);
                        res.json(err);
                    });
                }
                else {
                    res.json('文件格式有误');
                }
            }
            else if (uploadedFiles.length == 3) {

                var filename_1 = uploadedFiles[0].filename;
                filename_2 = uploadedFiles[1].filename;
                filename_3 = uploadedFiles[2].filename;
                var path1 = uploadedFiles[0].fd;
                path2 = uploadedFiles[1].fd;
                path3 = uploadedFiles[2].fd;
                custYWNO = req.body.Custywno;
                if (filename_1 && filename_2 && filename_3 && custYWNO) {
                    var qqywid, temp = { filename_1: filename_1, filename_2: filename_2, filename_3: filename_3, custYWNO: custYWNO };
                    console.log(temp);

                    var obj1 = Service.read_excel0_info(path1, filename_1, Obj, qqywid);
                    var obj1list = Service.read_excel1_info(path1, filename_1, index, table, qqywid);
                    var obj2 = Service.read_excel2_info(path2, filename_2, qqywid);
                    var obj3 = Service.read_excel2_info(path3, filename_3, qqywid);
                    if (obj1 != 'err' && obj1list != 'err' && obj2 != 'err' && obj3 != 'err') {
                        temp.Invoice = obj1;
                        temp.shenqinglist = obj1list;
                        temp.PL = obj2;
                        temp.Apl = obj3;
                        QuanqiuYWInfo.create(temp).then(function (ywi) {
                            res.json('ok');
                        }).catch(function (err) {
                            console.log(err);
                            res.json(err);
                        });
                    }
                    else {
                        res.json('文件格式有误');
                    }
                }
            }
        });
    },

    import: function (req, res) {
        var SOLD_TO = req.body.SOLD_TO;
        var custYWNO = req.body.Custywno;
        var custid = req.body.custid;
        var feeweight = req.body.feeweight;
        req.file('newFile').upload({
            // don't allow the total upload size to exceed ~10MB
            maxBytes: 10000000
        }, function whenDone(err, uploadedFiles) {
            if (err) {
                return res.negotiate(err);
            }
            var user = req.session.user;
            if (!user) {
                res.json(utilsService.reponseMessage('OK', '请先登录'));
            }
            else {
                // If no files were uploaded, respond with an error.
                if (uploadedFiles.length === 0) {
                    return res.badRequest('No file was uploaded');
                }
                else {
                    if (custid == 751) {
                        var filename_1 = uploadedFiles[0].filename;
                        filename_2 = uploadedFiles[1].filename;
                        filename_3 = uploadedFiles[2].filename;
                        var path1 = uploadedFiles[0].fd;
                        path2 = uploadedFiles[1].fd;
                        path3 = uploadedFiles[2].fd;
                        if (filename_1 && filename_2 && filename_3 && custYWNO) {
                            var qqywid, temp = { filename_1: filename_1, filename_2: filename_2, filename_3: filename_3, custYWNO: custYWNO };
                            console.log(temp);

                            var obj1 = Service.read_excel0_info(path1, filename_1, Obj, qqywid);
                            var obj1list = Service.read_excel1_info(path1, filename_1, index, table, qqywid);
                            var obj2 = Service.read_excel2_info(path2, filename_2, qqywid);
                            var obj3 = Service.read_excel2_info(path3, filename_3, qqywid);
                            if (obj1 != 'err' && obj1list != 'err' && obj2 != 'err' && obj3 != 'err') {
                                temp.Invoice = obj1;
                                temp.shenqinglist = obj1list;
                                temp.PL = obj2;
                                temp.Apl = obj3;
                                QuanqiuYWInfo.create(temp).then(function (ywi) {
                                    res.json('ok');
                                }).catch(function (err) {
                                    console.log(err);
                                    res.json(err);
                                });
                            }
                            else {
                                res.json('文件格式有误');
                            }
                        }
                    }
                    else if (custid == 2549) {
                        var filename_1 = uploadedFiles[0].filename;
                        var path = uploadedFiles[0].fd;
                        var invlist = Service.read_excel2_info(path, filename_1, custYWNO);


                        paracom.find({ select: ['parakey', 'paravalue'], where: { paratype: '材质对照' } })
                            .then((paratotal) => {

                                utilsService.getinitYwNoremote().then(ywno => {
                                    YWinfo.create({ YWNO: ywno.replace(/\"/g, ""), CustYWNO: custYWNO, custid: custid, createperson: user.empinfo.Empname }).then((ywinfo) => {

                                        var para = {};
                                        paratotal.forEach(t => {
                                            para[t.parakey] = t.paravalue;
                                        })
                                        var InvoiceDetailinfos = [];
                                        var id = 1;
                                        var tiyundandata = {};

                                        // tiyundandata.contrNo = invinfo.productgroup;
                                        // tiyundandata.noteS = invinfo.BaoguanApplyNO;
                                        tiyundandata.baoguantemplate = '机场LV上海进口征税模板';



                                        tiyundandata.ywinfoid = ywinfo.id;
                                        invlist.forEach(sor => {
                                            for (var k = 1; k <= 4; k++) {
                                                if (sor['Made in ' + k + ' Qty'] != 0) {
                                                    console.log(sor['Made in ' + k + ' Qty']);
                                                    var inv = {};
                                                    inv.ywinfoid = ywinfo.id;
                                                    inv.sku = sor["Material"];

                                                    inv.Price = sor.Price;

                                                    var TotalPrice = sor["Net Value"].replace(/,/g, '');
                                                    var totalqty = sor["Billed Qty"].replace(/,/g, '');

                                                    inv.Price = Number(TotalPrice) / Number(totalqty);

                                                    if (isNaN(inv.Price)) {
                                                        inv.Price = 0;
                                                    }
                                                    inv.Qty = sor["Made in " + k + " Qty"];
                                                    inv.OCOO = sor["Made in " + k];
                                                    inv.TotalPriceCIF = inv.Qty * inv.Price;
                                                    // inv.sku = sor["part number"] + sor["key2"];
                                                    inv.productDetailJson = {};

                                                    var averyweight = sor["Net Weight"];

                                                    inv.NetWeight = averyweight * inv.Qty;

                                                    inv.Unit = 001;
                                                    inv.Curr = sor['Document Curr.'];

                                                    // inv.GrossWeight = sor["Net Weight"];
                                                    inv.SequenceNO = id;
                                                    id++;

                                                    inv.Qtyc = 0;
                                                    inv.Qty1 = 0;
                                                    inv.Qty2 = 0;
                                                    inv.PackQty = 0;
                                                    inv.CFlag = sor['Cflag'];

                                                    // if (inv.HSCode.length == 10 && _.endsWith(inv.HSCode, '00')) {
                                                    //     inv.HSCode = inv.HSCode.substr(0, 8);
                                                    // }
                                                    inv.productDetailJson = {};
                                                    // inv.productDetailJson.key2 = sor["key2"];
                                                    inv.productDetailJson.GoodsnameEN = sor["HK Product Group"];
                                                    inv.productDetailJson.OHSCode = sor['Custom code'];
                                                    inv.productDetailJson.SpecEN = sor["Item Dimension Group"];
                                                    inv.productDetailJson.Hier = sor["Product Hierarchy"];
                                                    inv.productDetailJson.HierDesc = sor["Product Hier. Desc."];
                                                    inv.productDetailJson.MaterialDesc = sor["Material Desc."];

                                                    inv.productDetailJson.key1 = sor["Material"];
                                                    inv.productDetailJson.key2 = sor["LV SKU Code"];
                                                    inv.productDetailJson.DESC_SECTION = getsection(inv.productDetailJson.key1, inv.productDetailJson.key2);

                                                    var mat = "";
                                                    for (var l = 1; l < 10; l++) {
                                                        if (sor['Type Compo ' + l]) {
                                                            mat += sor['Type Compo ' + l];
                                                        }
                                                        if (sor['% Compo ' + l]) {
                                                            mat += (sor['% Compo ' + l] + '%');
                                                        }
                                                        if (sor['Desc. Compo ' + l]) {
                                                            mat += sor['Desc. Compo ' + l];
                                                        }
                                                    }
                                                    inv.productDetailJson.MaterialEN = mat;
                                                    inv.productDetailJson.materialcn = getmaterialcn(mat, para);
                                                    inv.productDetailJson.maincomp = getmainmaterial(mat, para);
                                                    var judge = JSON.stringify(inv.productDetailJson);
                                                    if (judge.indexOf('JERSEY') != -1 || judge.indexOf('KNIT') != -1 || judge.indexOf('KNITWEAR') != -1) {
                                                        inv.productDetailJson.TARIFF_GROUP = 'KNIT';
                                                    }
                                                    // inv.productDetailJson.Goodsnamememo = "Materialkeyen:[" + sor["Product Hierarchy"] + "];Specen:[" + sor["Product Hier# Desc#"] + "];Memo:[" + sor["Material Desc#"] + "]";
                                                    InvoiceDetailinfos.push(inv);
                                                }
                                            }
                                        })

                                        tiyundandata.netWt = utilsService.sum(InvoiceDetailinfos, 'NetWeight');
                                        console.log('stsave');
                                        console.log(InvoiceDetailinfos.length);
                                        return [InvoiceDetailInfo.create(InvoiceDetailinfos), TiyundanInfo.create(tiyundandata), ywinfo];
                                        // InvoiceDetailInfo.create(InvoiceDetailinfos);
                                    }).spread((invoicelist, tinyudan, ywinfo) => {
                                        res.json(utilsService.reponseMessage('OK', `导入业务${ywinfo.YWNO} 发票数据${invoicelist.length}`));
                                    }).catch(err => {
                                        console.log(err);
                                        res.json(utilsService.reponseMessage('Error', err.message));
                                    })
                                })
                            })
                    }
                    else if (custid == 3276) {
                        var filename_1 = uploadedFiles[0].filename;
                        var path = uploadedFiles[0].fd;
                        var invlist = Service.read_excel2_info(path, filename_1, custYWNO);
                        paracom.find({ select: ['parakey', 'paravalue'], where: { paratype: ['DESC_SECTION', 'TARIFF_GROUP'] } })
                            .then((paratotal) => {
                                var para = {};
                                paratotal.forEach(t => {
                                    para[t.parakey] = t.paravalue;
                                })
                                utilsService.getinitYwNoremote().then(ywno => {
                                    YWinfo.create({ YWNO: ywno.replace(/\"/g, ""), CustYWNO: custYWNO, custid: custid, feeweight: feeweight, createperson: user.empinfo.Empname }).then((ywinfo) => {
                                        var InvoiceDetailinfos = [];
                                        var id = 1;
                                        var tiyundandata = {};
                                        tiyundandata.baoguantemplate = 'zara测试模板';
                                        tiyundandata.ywinfoid = ywinfo.id;
                                        invlist.forEach(sor => {

                                            var t = {};
                                            t.ywinfoid = ywinfo.id;

                                            t.sku = sor["CUSTOMS_SKU"].replace(/\s/g, '');
                                            console.log('start');
                                            if (sor["DESTINATION_HS"]) {
                                                console.log(sor["DESTINATION_HS"])
                                                t.HSCode = sor["DESTINATION_HS"].replace(/\./g, '');
                                                // if (t.HSCode.length == 10 && _.endsWith(t.HSCode, '00')) {
                                                //     t.HSCode = t.HSCode.substr(0, 8);
                                                // }
                                            }


                                            t.COO = sor["ORIGIN"];
                                            t.OCOO = sor["ORIGIN"];
                                            t.Curr = sor["CURRENCY"];

                                            t.Price = sor["UNIT_PRICE"];
                                            t.TotalPriceCIF = sor["AMOUNT"];
                                            t.Qty = sor["QUANTITY"];

                                            t.NetWeight = sor["TOT_NET_WEIGHT"];
                                            t.Cgoodsname = sor["DESTINATION_FAM"] ? sor["DESTINATION_FAM"] : '';
                                            if (!t.Cgoodsname) {
                                                t.Cgoodsname = sor["CN_FAMILY"] ? sor["CN_FAMILY"] : '';
                                            }
                                            t.Unit = 001;
                                            t.Qtyc = 0;
                                            t.Qty1 = 0;
                                            t.Qty2 = 0;
                                            t.PackQty = 0;


                                            t.productDetailJson = {};

                                            t.productDetailJson.BUNDLE = sor["BUNDLE"];
                                            t.productDetailJson.Brand = sor["Brand"] ? sor["Brand"] : '';
                                            t.productDetailJson.CProductName = t.Cgoodsname;
                                            t.productDetailJson.DESC_SECTION = sor["DESC_SECTION"] ? sor["DESC_SECTION"] : '';
                                            t.productDetailJson.Gender = para[t.productDetailJson.DESC_SECTION];
                                            t.productDetailJson.SHIP_TO = sor["SHIP_TO"] ? sor["SHIP_TO"] : '';
                                            t.productDetailJson.MODEL = sor["MODEL"] ? sor["MODEL"] : '';
                                            t.productDetailJson.QUALITY = sor["QUALITY"] ? sor["QUALITY"] : '';
                                            t.productDetailJson.ID_COLOUR = sor["ID_COLOUR"] ? sor["ID_COLOUR"] : '';

                                            var material = "";
                                            var mainmaterial = "";
                                            var LININGmaterial = "";
                                            var FILLINGmaterial = "";
                                            for (var z = 1; z < 6; z++) {

                                                mainmaterial += (sor["%COMP" + z] && sor["%COMP" + z] != '000' ? Number(sor["%COMP" + z]) + '%' : '') + (sor["CN_COMP" + z] ? ttrim(sor["CN_COMP" + z]) : '');
                                                LININGmaterial += (sor["%COMP" + z + "_LINING"] && sor["%COMP" + z + "_LINING"] != '000' ? Number(sor["%COMP" + z + "_LINING"]) + '%' : '') + (sor["CN_COMP" + z + "_DESC_LINING"] ? ttrim(sor["CN_COMP" + z + "_DESC_LINING"]) : '');
                                                FILLINGmaterial += (sor["%COMP" + z + "_FILLING"] && sor["%COMP" + z + "_FILLING"] != '000' ? Number(sor["%COMP" + z + "_FILLING"]) + '%' : '') + (sor["CN_COMP" + z + "_DESC_FILLING"] ? ttrim(sor["CN_COMP" + z + "_DESC_FILLING"]) : '');
                                                material += sor["%COMP" + z] + sor["ID_COMP" + z] + sor["COMP" + z] + ttrim(sor["CN_COMP" + z]);
                                                material += sor["%COMP" + z + "_LINING"] + sor["ID_COMP" + z + "_LINING"] + sor["COMP" + z + "_DESC_LINING"] + ttrim(sor["CN_COMP" + z + "_DESC_LINING"]);
                                                material += sor["%COMP" + z + "_FILLING"] + sor["ID_COMP" + z + "_FILLING"] + sor["COMP" + z + "_DESC_FILLING"] + ttrim(sor["CN_COMP" + z + "_DESC_FILLING"]);
                                            }
                                            t.productDetailJson.maincomp = ttrim(sor["CN_COMP1"]);
                                            t.productDetailJson.maincompper = Number(sor["%COMP1"]);
                                            t.productDetailJson['鞋底材料'] = ttrim(sor["CN_COMP1_DESC_FILLING"]);
                                            // t.productDetailJson.material = material;
                                            t.productDetailJson.mainmaterial = mainmaterial;
                                            t.productDetailJson.LININGmateria = LININGmaterial;
                                            t.productDetailJson.FILLINGmaterial = FILLINGmaterial;
                                            t.productDetailJson.HSCode = t.HSCode;
                                            // t.productDetailJson.Updatememo = sor["TARIFF_GROUP"] + "|" + sor["FAMILY"] + "|" + sor["CN_FAMILY"];
                                            t.productDetailJson.TARIFF_GROUP = para[sor["TARIFF_GROUP"]] ? para[sor["TARIFF_GROUP"]] : sor["TARIFF_GROUP"];
                                            t.productDetailJson.FAMILY = sor["FAMILY"];
                                            t.productDetailJson.CN_FAMILY = sor["CN_FAMILY"];
                                            t.productDetailJson.Cgoodsname = t.Cgoodsname;
                                            t.productDetailJson.sku = t.sku;
                                            var skuarray = t.sku.split('-');
                                            var sk1 = skuarray[skuarray.length - 2];
                                            var sk2 = skuarray[skuarray.length - 3];
                                            t.productDetailJson.sku = t.sku;
                                            t.SequenceNO = id;
                                            if (SOLD_TO) {
                                                t.productDetailJson.SOLD_TO = SOLD_TO;
                                            }
                                            //resultlist.Add(t);
                                            id++;
                                            InvoiceDetailinfos.push(t);
                                        })

                                        // tiyundandata.grossWt = sum(InvoiceDetailinfos, 'GrossWeight');

                                        // tiyundandata.packNo = sum(InvoiceDetailinfos, 'NoOfCarton');

                                        tiyundandata.netWt = utilsService.sum(InvoiceDetailinfos, 'NetWeight');
                                        console.log('stsave');
                                        console.log(InvoiceDetailinfos.length);
                                        return [InvoiceDetailInfo.create(InvoiceDetailinfos), TiyundanInfo.create(tiyundandata), ywinfo];
                                        // InvoiceDetailInfo.create(InvoiceDetailinfos);
                                    }).spread((invoicelist, tinyudan, ywinfo) => {
                                        res.json(utilsService.reponseMessage('OK', `导入业务${ywinfo.YWNO} 发票数据${invoicelist.length}`));
                                    }).catch(err => {
                                        console.log(err);
                                        res.json(utilsService.reponseMessage('Error', err.message));

                                    })
                                })
                            })
                    } else if (custid == 3282) {
                        var filename_1 = uploadedFiles[0].filename;
                        var path = uploadedFiles[0].fd;
                        var invlist = Service.read_excel2_info(path, filename_1, custYWNO);
                        paracom.find({ select: ['parakey', 'paravalue'], where: { paratype: 'DESC_SECTION' } })
                            .then((paratotal) => {
                                var para = {};
                                paratotal.forEach(t => {
                                    para[t.parakey] = t.paravalue;
                                })
                                var passcol = true;
                                if (invlist[0]) {
                                    var val = invlist[0];
                                    var cols = [];
                                    cols.push("P/N");
                                    cols.push("PO.");
                                    cols.push("总单号");
                                    cols.push("HS CODE");
                                    cols.push("单价\n(USD)");
                                    cols.push("总额\n(USD)");
                                    cols.push("小件数\n(PCS)");
                                    // cols.push("净重");
                                    cols.push("中文品名");
                                    cols.push("毛重");
                                    cols.push("件数");
                                    cols.push("REF.NO");
                                    cols.push("起运国");
                                    cols.push("包装种类");
                                    cols.push("成交方式");
                                    cols.push("净重百分比");
                                    var colerr = valcol(val, cols);
                                    if (colerr) {
                                        passcol = false;
                                        res.json(utilsService.reponseMessage('OK', colerr + "表头有误"));
                                    }
                                }
                                else {
                                    passcol = false;
                                    res.json(utilsService.reponseMessage('OK', '缺少数据'));
                                }
                                if (passcol) {
                                    utilsService.getinitYwNoremote().then(ywno => {
                                        YWinfo.create({ YWNO: ywno.replace(/\"/g, ""), CustYWNO: custYWNO, custid: custid, createperson: user.empinfo.Empname }).then((ywinfo) => {
                                            var InvoiceDetailinfos = [];
                                            var id = 1;
                                            var tiyundandata = {};
                                            tiyundandata.baoguantemplate = '保税口岸上海慧与进口征税模板';
                                            tiyundandata.ywinfoid = ywinfo.id;
                                            // tiyundandata.packNo = invlist[0]["件数"];
                                            // tiyundandata.grossWt = invlist[0]["毛重"];
                                            var REFNO = '';
                                            var QYG = '';
                                            var BZZL = '';
                                            var CJFS = '';
                                            var zongd = '';
                                            var fend = '';
                                            var contrNo = '';
                                            var grosswt = 0;

                                            invlist.forEach(sor => {
                                                if (sor["P/N"]) {
                                                    if (!contrNo) {
                                                        contrNo = sor["PO."];
                                                        tiyundandata.contrNo = contrNo;
                                                    }
                                                    else {
                                                        if (sor["PO."]) {
                                                            tiyundandata.contrNo = contrNo + '等';
                                                        }
                                                    }

                                                    var t = {};
                                                    t.ywinfoid = ywinfo.id;
                                                    if (!zongd) {
                                                        zongd = sor["总单号"];
                                                    }
                                                    if (!fend) {
                                                        fend = sor["分单号"];
                                                    }
                                                    t.sku = sor["P/N"].replace(/\s/g, '');
                                                    console.log('start');
                                                    if (sor["HS CODE"]) {
                                                        console.log(sor["HS CODE"])
                                                        t.HSCode = sor["HS CODE"].replace(/\./g, '');
                                                        if (t.HSCode.length == 10 && _.endsWith(t.HSCode, '00')) {
                                                            t.HSCode = t.HSCode.substr(0, 8);
                                                        }
                                                    }


                                                    t.COO = sor["原产国"];
                                                    t.OCOO = sor["原产国"];
                                                    t.Curr = "USD";
                                                    t.cCurr = "美元[502]";

                                                    t.Price = sor["单价\n(USD)"];
                                                    t.TotalPriceCIF = sor["总额\n(USD)"];
                                                    t.Qty = sor["小件数\n(PCS)"];

                                                    // t.NetWeight = sor["净重"] ? parseFloat(sor["净重"]) : 0.0;
                                                    t.Cgoodsname = sor["中文品名"] ? sor["中文品名"] : '';
                                                    t.Unit = 001;
                                                    t.Qtyc = 0;
                                                    t.Qty1 = 0;
                                                    t.Qty2 = 0;
                                                    t.PackQty = 0;

                                                    if (grosswt == 0) {
                                                        grosswt = sor["毛重"] ? parseFloat(sor["毛重"]) : 0.0;
                                                    }

                                                    t.NoOfCarton = sor["件数"] ? parseFloat(sor["件数"]) : 0.0;


                                                    t.productDetailJson = {};
                                                    if (!REFNO) {
                                                        REFNO = sor["REF.NO"];
                                                    }
                                                    if (!QYG) {
                                                        QYG = sor["起运国"];
                                                    }
                                                    if (!BZZL) {
                                                        BZZL = sor["包装种类"];
                                                    }
                                                    if (!CJFS) {
                                                        CJFS = sor["成交方式"];
                                                    }
                                                    t.productDetailJson.REFNO = REFNO;
                                                    t.productDetailJson.QYG = QYG;
                                                    t.productDetailJson.BZZL = BZZL;
                                                    t.productDetailJson.CJFS = CJFS;
                                                    t.productDetailJson.zongd = zongd;
                                                    t.productDetailJson.fend = fend;
                                                    t.productDetailJson.JZBFB = sor["净重百分比"];
                                                    t.productDetailJson.fakeNetWeight = sor["净重"] ? parseFloat(sor["净重"]) : 0.0;
                                                    t.SequenceNO = id;
                                                    id++;
                                                    InvoiceDetailinfos.push(t);
                                                }
                                            })
                                            if (REFNO.indexOf('SEA') != -1) {
                                                tiyundandata.billNo = zongd.toUpperCase();
                                            }
                                            else {
                                                tiyundandata.billNo = zongd.replace('-', '').toUpperCase() + "_" + fend.toUpperCase();
                                            }

                                            tiyundandata.grossWt = grosswt;

                                            tiyundandata.packNo = utilsService.sum(InvoiceDetailinfos, 'NoOfCarton');
                                            var wraptype = '';
                                            if (tiyundandata.grossWt / tiyundandata.packNo >= 20) {
                                                if (tiyundandata.packNo < 5) {
                                                    wraptype = '托盘[5]';
                                                }
                                                else {
                                                    wraptype = '其它[7]';
                                                }
                                                tiyundandata.netWt = tiyundandata.grossWt - 10 * tiyundandata.packNo;
                                            }
                                            else {
                                                wraptype = '纸箱[2]';
                                                if (tiyundandata.grossWt <= tiyundandata.packNo) {
                                                    tiyundandata.netWt = tiyundandata.grossWt - 0.1 * tiyundandata.packNo;
                                                }
                                                else {
                                                    tiyundandata.netWt = tiyundandata.grossWt - tiyundandata.packNo;
                                                }
                                            }
                                            // if (tiyundandata.netWt < 1) {
                                            //     tiyundandata.netWt = 1;
                                            // }
                                            tiyundandata.wraptype = wraptype;
                                            var outweight = 0;
                                            var outgross = 0;
                                            InvoiceDetailinfos.forEach(inv => {
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
                                                InvoiceDetailinfos.forEach(inv => {
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
                                                InvoiceDetailinfos.forEach(inv => {
                                                    if (!end) {
                                                        if (inv.GrossWeight > (outgross - tiyundandata.grossWt)) {
                                                            inv.GrossWeight = (inv.GrossWeight - (outgross - tiyundandata.grossWt)).toFixed(2);
                                                            end = true;
                                                        }
                                                    }
                                                })
                                            }
                                            // tiyundandata.netWt = utilsService.sum(InvoiceDetailinfos, 'NetWeight');
                                            // if (tiyundandata.netWt < 1) {
                                            //     tiyundandata.netWt = 1;
                                            // }
                                            console.log('stsave');
                                            console.log(InvoiceDetailinfos.length);
                                            return [InvoiceDetailInfo.create(InvoiceDetailinfos), TiyundanInfo.create(tiyundandata), ywinfo];
                                            // InvoiceDetailInfo.create(InvoiceDetailinfos);
                                        }).spread((invoicelist, tinyudan, ywinfo) => {
                                            res.json(utilsService.reponseMessage('OK', `导入业务${ywinfo.YWNO} 发票数据${invoicelist.length}`));
                                        }).catch(err => {
                                            console.log(err);
                                            res.json(utilsService.reponseMessage('OK', err.reason));

                                        })
                                    })
                                }
                            })
                    }
                }
            }
        });
    },


    commonimport: function (req, res) {
        var imdata = req.body;
        if (!imdata.invlist) {
            imdata.invlist = "[]";
        }
        var invlist = JSON.parse(imdata.invlist);
        if (invlist && invlist.length > 0) {
            parseconfig.findOne({ custname: imdata.custname }).then(reobj => {
                if (reobj) {
                    paracom.find({ select: ['parakey', 'paravalue'], where: { paratype: 'DESC_SECTION' } })
                        .then((paratotal) => {
                            var para = {};
                            paratotal.forEach(t => {
                                para[t.parakey] = t.paravalue;
                            })
                            var passcol = true;
                            if (invlist[0]) {
                                var val = invlist[0];

                                var colerr = valcolbyobj(val, reobj);
                                if (colerr) {
                                    passcol = false;
                                    res.json(utilsService.reponseMessage('OK', colerr + "表头有误"));
                                }
                            }
                            else {
                                passcol = false;
                                res.json(utilsService.reponseMessage('OK', '缺少数据'));
                            }
                            if (passcol) {
                                YWinfo.findOne({ CustYWNO: imdata.custYWNO, custid: reobj.custid })
                                    .then(ywrecord => {
                                        if (!ywrecord) {
                                            utilsService.getinitYwNoremote().then(ywno => {
                                                YWinfo.create({ YWNO: ywno.replace(/\"/g, ""), CustYWNO: imdata.custYWNO, custid: reobj.custid, createperson: '系统导入' }).then((ywinfo) => {
                                                    var InvoiceDetailinfos = [];
                                                    var id = 1;
                                                    var tiyundandata = {};
                                                    tiyundandata.baoguantemplate = imdata.templatename;
                                                    tiyundandata.uploadtime = imdata.importdate;
                                                    tiyundandata.ywinfoid = ywinfo.id;
                                                    var InvoiceDetailinfos = parseInv(invlist, reobj, ywinfo);


                                                    if (imdata.temobj) {
                                                        tiyundandata.temobj = imdata.temobj;
                                                    }

                                                    tiyundandata.contrNo = imdata.contrNo;
                                                    tiyundandata.billNo = imdata.billNo;
                                                    tiyundandata.grossWt = imdata.grosswt;
                                                    tiyundandata.tradeCountry = imdata.tradeCountry;
                                                    tiyundandata.distinatePort = imdata.distinatePort;

                                                    tiyundandata.packNo = imdata.packNo;
                                                    tiyundandata.netWt = imdata.netWt;
                                                    // tiyundandata.wraptype = imdata.wraptype;

                                                    console.log(InvoiceDetailinfos.length);
                                                    return [InvoiceDetailInfo.create(InvoiceDetailinfos), TiyundanInfo.create(tiyundandata), ywinfo];
                                                }).spread((invoicelist, tinyudan, ywinfo) => {
                                                    res.json(utilsService.reponseMessage('OK', `导入业务${ywinfo.YWNO},发票数据${invoicelist.length}`));
                                                }).catch(err => {
                                                    console.log(err);
                                                    res.json(utilsService.reponseMessage('OK', err.reason));

                                                })
                                            })
                                        }
                                        else {
                                            res.json(utilsService.reponseMessage('OK', '业务已存在'));
                                        }
                                    })
                            }
                            else {
                                res.json(utilsService.reponseMessage('OK', '缺少数据'));
                            }
                        })


                }
                else {
                    res.json(utilsService.reponseMessage('OK', '配置不存在'));
                }

            })
        }
        else {
            parseconfig.findOne({ custname: imdata.custname }).then(reobj => {
                if (reobj) {
                    utilsService.getinitYwNoremote().then(ywno => {
                        YWinfo.create({ YWNO: ywno.replace(/\"/g, ""), CustYWNO: imdata.custYWNO, custid: reobj.custid, createperson: '系统导入' }).then((ywinfo) => {
                            var tiyundandata = {};
                            tiyundandata.ywinfoid = ywinfo.id;
                            tiyundandata.noteS = imdata.noteS;
                            TiyundanInfo.create(tiyundandata).then((td) => {
                                res.json(utilsService.reponseMessage('OK', '导入数据有误'));
                            })
                        })
                    })
                } else {
                    res.json(utilsService.reponseMessage('OK', '配置不存在'));
                }
            });
        }



    },

    saveQuanqiuYWInfo: function (req, res) {
        let yw = req.body;
        QuanqiuYWInfo.findOne({ custYWNO: yw.custYWNO })
            .then(record => {
                if (!record) {
                    QuanqiuYWInfo.create(yw).then(function (ywi) {
                        res.json('ok');
                    }).catch(function (err) {
                        console.log(err);
                        res.json(err);
                    });
                }
                else {
                    res.json('已存在');
                }

            })
    },
    trancustprodetail: function (req, res) {
        paracom.find({ select: ['parakey', 'paravalue'], where: { paratype: '材质对照' } })
            .then((paratotal) => {
                var para = {};
                paratotal.forEach(t => {
                    para[t.parakey] = t.paravalue;
                })
                CustProductDetailInfo.find({}).then(detailinfos => {
                    async.each(detailinfos, function (detail, cb) {
                        detail.templateJson.MaterialCN = getmaterialcn(detail.templateJson.MaterialEN, para);
                        detail.save(err => {
                            if (err) {
                                cb(err);
                            }
                        });
                    }, function (err) {
                        if (err)
                            res.json(err);
                        else
                            res.json('ok');
                    })
                })
            });
    }
};



//str.replace(/\s/g, "")

function ttrim(str) {
    if (!str) {
        str = '';
    }
    return str.replace(/\s/g, "");
}


function deleteother(str) {
    if (!str) {
        str = '';
    }
    var fina = '';
    reg = /^(?:[\u3300-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFE30-\uFE4F]|[\uD840-\uD868\uD86A-\uD872][\uDC00-\uDFFF]|\uD869[\uDC00-\uDEDF\uDF00-\uDFFF]|\uD873[\uDC00-\uDEAF]|\uD87E[\uDC00-\uDE1F]|[\u0061-\u007a]|[\u0041-\u005a])+$/m
    for (var i = 0; i < str.length; i++) {
        if (reg.test(str[i])) {
            fina += (str[i]);
        }
    }
    return fina;
}




function panjijeq(i, j, m, n) {
    var k, s, find, c;
    if (b[i][j] != 0) {
        vf[j] = 1;
        for (k = i + 1; k < m; k++) {
            if (b[k][j] != 0) {
                c = b[k][j] / b[i][j];
                b[k][j] = 0;
                for (s = j + 1; s < n + 1; s++) {
                    b[k][s] -= b[i][s] * c;
                }
            }
            i++;
            j++;
            if (i < m && j < n + 1) {
                panjijeq(i, j, m, n);
            }
            else {
                find = 0;
                k = i + 1;
                while ((find == 0) && k < m) {
                    if (b[k++][j] != 0) {
                        find = 1;
                    }
                    if (find == 1) {
                        change(i, j, k, n);
                        panjijeq(i, j, m, n)
                    }
                    else {
                        j++;
                        if (j < n + 1) {
                            panjijeq(i, j, m, n)
                        }
                    }
                }
            }
        }
    }

}





function change(i, j, k, n) {
    var s = line[i];
    line[i] = line[k];
    line[k] = s;
    for (s = j; s < n + 1; s++) {
        var a = b[i][s];
        b[i][s] = b[k][s];
        b[k][s] = a;
    }
}

function det(n, a, column) {
    var d = 0, t = 1, j = [];
    d = deter(n, 0, j, d, t, a, column);
    return d;
}

function deter(n, i, j, t, a, column) {
    var k, sign, flag;
    if (i < n) {
        for (j[i] = 0; j[i] < n; j[i]++) {
            flag = 0; k = 0;
            while ((flag == 0) && (k < i)) {
                if (j[i] == f[k++]) {
                    flag = 1;
                }
                if (flag == 1) {
                    continue;
                }
                if (a[i * column + j[i]] == 0) {
                    continue;
                }
                sign = 1;
                for (k = 0; k < i; k++) {
                    if (j[i] < j[k]) {
                        sign = -sign;
                        d = deter(n, i + 1, d, t * sign * a[i * column + j[i], a, column]);
                    }
                    else {
                        d += t;
                    }
                }
            }
        }
    }
    return d;
}


function gred(u, v) {
    var r, t = v;
    if (u < 0) {
        u = -u;
    }
    if (v < 0) {
        v = -v;
    }
    while (v != 0) {
        r = u % v;
        u = v;
        v = r;
    }
    return (t > 0 ? u : -u);
}



function getmaterialcn(str, para) {
    // var str = '要素2=是否改良种用);要素3=(品种);要素4=(其他[非必报要素，请根据实际情况填报]);';
    // var str = 'LINING50%VISCOSELINING50%CUPROMAIN45%POLYESTERMAIN33%POLYAMIDEMAIN22%WOOLOTHER0%LAMB';
    var re = /(MAIN|LINING|SOLE|UPPER|OTHER|COMP|) {0,}(\d{1,3}%) {0,}(.+?)(?=\n|(MAIN|SOLE|LINING|UPPER|OTHER|COMP|$|\d{1,3}))/g;
    var array = []; var r;
    while ((r = re.exec(str)) != null) {
        var temp = {};

        temp.a = r[1]; temp.b = r[2]; temp.c = para[r[3].trim()];
        if (temp.a.trim() != 'LINING') {
            array.push(temp.b + temp.c);
        }
    }
    return array.join(';');
}


function getmainmaterial(str, para) {
    var re = /(MAIN|LINING|SOLE|UPPER|OTHER|COMP|) {0,}(\d{1,3}%) {0,}(.+?)(?=\n|(MAIN|SOLE|LINING|UPPER|OTHER|COMP|$|\d{1,3}))/g;
    var array = []; var r;
    while ((r = re.exec(str)) != null) {
        var temp = {};

        temp.a = r[1]; temp.b = r[2]; temp.c = para[r[3].trim()];
        if (temp.a.trim() == 'MAIN') {
            array.push(temp.c);
            break;
        }
        if (temp.a.trim() != 'LINING') {
            array.push(temp.b + temp.c);
        }
    }
    return array.join(';');
}


function getsection(key1, key2) {
    if (!isNaN(key1.substr(0, 1))) {
        var jug = key2.substr(0, 1);
        if (jug == 'A') {
            return '女式';
        }
        else if (jug == 'B') {
            return '男式';
        }
        else if (jug == 'C') {
            return '女式';
        }
        else if (jug == 'F') {
            return '女衣';
        }
        else if (jug == 'H') {
            return '男式';
        }
    }
    return '';
}


function valcol(so, colnamelist) {
    var err = '';
    colnamelist.forEach(col => {
        if (so[col] == null) {
            err += col + ',';
        }
    })
    return err;
}

function valcolbyobj(val, reobj) {
    var err = '';
    for (var key in reobj.invoiceconfig) {
        if (val[key] == null) {
            err += key + ',';
        }
    }
    return err;
}


function parseInv(invlist, reobj, ywinfo) {
    var InvoiceDetails = [];
    var invconfig = reobj.invoiceconfig;
    invlist.forEach(inv => {
        var detail = {};
        for (var key in invconfig) {
            detail[invconfig[key]] = inv[key];
        }
        if (inv.productDetailJson) {
            detail.productDetailJson = inv.productDetailJson;
        }
        if (detail['sku']) {
            InvoiceDetails.push(detail);
        }
        detail.ywinfoid = ywinfo.id;
    })
    return InvoiceDetails;
}
