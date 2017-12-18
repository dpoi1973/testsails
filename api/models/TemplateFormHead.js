'use strict'
module.exports = {
    autoCreatedBy: false,
    attributes: {
        "CreateDate": {
            "type": "String"
        },
        "CreatePersonName": {
            "type": "String"
        },
        "LastUpdateDate": {
            "type": "String"
        },
        "LastUpdatePersonName": {
            "type": "String"
        },
        "goodsCustid": {
            type: 'text'
        },
        "CustID": {
            type: 'text'
        },
        "TempleteName": {
            "type": "String"
        },
        "parentTempleteName": {
            "type": "String"
        },
        "GuiLeiOptions": {
            "type": "json"
        },
        "OrderOptions": {
            "type": "json"
        },

        CombinOptions: {

            "type": "json"
        },

        shangjianElements: {

            "type": "json"
        },
        templateObj: {

            "type": "json"
        },
        ciqObj: {

            "type": "json"
        },

        formheadElements: {
            collection: 'templeteelement',
            via: 'owner'

        },


        'getDefaultFormhead': function (head) {
            // defaultobj[el.fieldName.replace(/(_\w)/, function (v) {
            //     return v[1].toUpperCase();
            // })] = el.defaultValue;
            _.templateSettings = {
                interpolate: /\{\{(.+?)\}\}/g
            };
            var _this = this;
            var formlist = [];
            //template(head.tiyundaninfo);


            var defaultobj = {};
            defaultobj.PROMISE_ITMES = '0000';
            if (this.templateObj) {
                var tmobj = this.templateObj;
                if (head.tiyundaninfo.temobj) {
                    tmobj = Object.assign(tmobj, head.tiyundaninfo.temobj);
                }
                for (var key in tmobj) {
                    if (tmobj[key].value) {
                        if (!_.endsWith(key, 'Input')) {
                            var template = _.template(tmobj[key].value);
                            defaultobj[key] = template(head.tiyundaninfo);
                            if (key == 'gross_wt' || key == 'net_wt') {
                                if (defaultobj[key] < 1) {
                                    defaultobj[key] = 1;
                                }
                            }
                            if (key.indexOf('promiseflag') != -1) {
                                var proindex = key.replace('promiseflag', '');
                                var proitem = defaultobj.PROMISE_ITMES.split('');
                                if (tmobj[key].value) {
                                    proitem[proindex - 1] = '1';
                                }
                                defaultobj.PROMISE_ITMES = proitem.join('');
                            }
                        }
                    }
                }
                defaultobj.pre_entry_id = head.COP_NO;
                defaultobj.ywid = head.ywinfo.id;
                defaultobj.ywno = head.ywinfo.YWNO;
                defaultobj.COP_NO = defaultobj.pre_entry_id;
                defaultobj.templatename = this.TempleteName;
                if (head.ywinfo.custid == 3282) {
                    huiyulogic(defaultobj, head);
                }
                var maingoodname = '';
                head.invoicedetails.forEach(v => {
                    var fl = v.getFormlist();
                    fl.pre_entry_id = defaultobj.pre_entry_id;
                    maingoodname = fl.gName;

                    for (var key in tmobj) {
                        if (tmobj[key].value) {
                            if (_.endsWith(key, 'Input')) {
                                var template = _.template(tmobj[key].value);
                                var pkey = key.substr(0, key.length - 5);
                                fl[pkey] = template(head.tiyundaninfo);
                            }
                        }
                    }
                    formlist.push(fl);
                })
                var g_no = 0;
                formlist.forEach(v => {
                    v.g_no = g_no++;
                })
                defaultobj.maingoodsname = maingoodname;
                defaultobj.formlist = formlist;
            }
            else {
                _.filter(this.formheadElements, v => {
                    return (v.defaultValue !== '' && v.defaultValue != null)
                })
                    .forEach(el => {
                        //defaultobj[el.fieldName] = el.defaultValue;
                        //加正则 有[]只取里面内容

                        //var template = _.template("Hello {{ name }}!");
                        if (!_.endsWith(el.fieldName, 'Input')) {
                            // if (el.fieldName == "note_s") {
                            //     var a = 1;
                            // }
                            var template = _.template(el.defaultValue);
                            defaultobj[el.fieldName] = template(head.tiyundaninfo);
                            if (el.fieldName == 'gross_wt' || el.fieldName == 'net_wt') {
                                if (defaultobj[el.fieldName] < 1) {
                                    defaultobj[el.fieldName] = 1;
                                }
                            }
                            if (el.fieldName.indexOf('promiseflag') != -1) {
                                var proindex = el.fieldName.replace('promiseflag', '');
                                var proitem = defaultobj.PROMISE_ITMES.split('');
                                if (el.defaultValue) {
                                    proitem[proindex - 1] = '1';
                                }
                                defaultobj.PROMISE_ITMES = proitem.join('');
                            }

                        }

                        // defaultobj.net_wt = tiyundaninfo.netWt;
                        // defaultobj.gross_wt = tiyundaninfo.grossWt;
                        // defaultobj.contr_no = tiyundaninfo.contrNo;
                        // defaultobj.note_s = tiyundaninfo.noteS;
                        // defaultobj.pack_no = tiyundaninfo.packNo;


                        // var re = new RegExp("\\[(\\d*)\\]");
                        // var modelval = el.defaultValue.match(re);
                        // if (modelval) {
                        //     defaultobj[el.fieldName] = modelval[1];
                        // }
                    });

                defaultobj.pre_entry_id = head.COP_NO;
                defaultobj.ywid = head.ywinfo.id;
                defaultobj.ywno = head.ywinfo.YWNO;
                defaultobj.COP_NO = defaultobj.pre_entry_id;
                defaultobj.templatename = this.TempleteName;
                // defaultobj.wrap_type = '5';
                // defaultobj.username = 'WLD7';
                var maingoodname = '';
                if (head.ywinfo.custid == 3282) {
                    huiyulogic(defaultobj, head);
                }
                //var netwt = 0;
                head.invoicedetails.forEach(v => {
                    var fl = v.getFormlist();
                    //fl.parentid = formhead.id;
                    fl.pre_entry_id = defaultobj.pre_entry_id;
                    //netwt += fl.qty_conv;
                    maingoodname = fl.gName;
                    _.filter(_this.formheadElements, v => {
                        return (v.defaultValue !== '' && v.defaultValue != null)
                    })
                        .forEach(el => {
                            if (_.endsWith(el.fieldName, 'Input')) {
                                //fl[el.fieldName] = _.template(el.defaultValue);
                                var template = _.template(el.defaultValue);

                                var key = el.fieldName.substr(0, el.fieldName.length - 5);
                                fl[key] = template(head.tiyundaninfo);


                                // var re = new RegExp("\\[(\\d*)\\]");
                                // var modelval = el.defaultValue.match(re);
                                // if (modelval) {
                                //     fl[key] = modelval[1];
                                // }
                            }
                        })

                    formlist.push(fl);
                })
                var g_no = 0;
                formlist.forEach(v => {
                    v.g_no = g_no++;

                })
                defaultobj.maingoodsname = maingoodname;
                defaultobj.formlist = formlist;
            }

            console.log('生成完成');
            return defaultobj;



            /*   var defaultobj = {};
               _.filter(this.tempeleteElements, v => {
                       return (v.defaultValue !== '' && v.defaultValue != null)
                   })
                   .forEach(el => {

                       defaultobj[el.fieldName.replace(/(_\w)/, function(v) {
                           return v[1].toUpperCase();
                       })] = el.defaultValue;

                   });
               return defaultobj;*/

        },

        'getDefaultCiq': function (head) {
            _.templateSettings = {
                interpolate: /\{\{(.+?)\}\}/g
            };
            var _this = this;
            var formlist = [];
            var defaultobj = {};
            if (this.ciqObj) {
                var tmobj = this.ciqObj;
                defaultobj.goods = {};
                for (var key in tmobj) {
                    if (tmobj[key]) {
                        if (!_.endsWith(key, 'Input')) {
                            defaultobj[key] = tmobj[key];
                        }
                        else {
                            var subkey = key.substr(0, key.length - 5);
                            defaultobj.goods[key] = tmobj[key];

                        }
                    }
                }
            }
            else {
                _.filter(this.shangjianElements, v => {
                    return (v.defaultValue !== '' && v.defaultValue != null)
                })
                    .forEach(el => {
                        if (!_.endsWith(el.fieldName, 'Input')) {
                            defaultobj[el.fieldName] = el.defaultValue;
                        }
                    });
            }

            console.log('生成完成');
            return defaultobj;
        }
    }

}



function huiyulogic(defaultobj, head) {
    var invoice = head.invoicedetails;
    var sel = invoice[0];
    if (sel && sel.productDetailJson) {
        if (sel.productDetailJson.zongd && sel.productDetailJson.zongd.indexOf('-') != -1) {
            defaultobj.i_e_port = '浦东机场[2233]';
        }
        else {
            defaultobj.i_e_port = '上海快件[2244]';
        }
        if (sel.productDetailJson.REFNO && sel.productDetailJson.REFNO.indexOf('SEA') != -1) {
            defaultobj.traf_mode = '水路运输[2]';
        }
        else {
            defaultobj.traf_mode = '航空运输[5]';
        }
        if (sel.productDetailJson.trade_country) {
            defaultobj.trade_country = sel.productDetailJson.trade_country;
            defaultobj.TRADE_AREA_CODE = sel.productDetailJson.trade_country;
            defaultobj.distinate_port = sel.productDetailJson.trade_country;
        }
        if (sel.productDetailJson.CJFS == 'EXW' || sel.productDetailJson.CJFS == 'FCA') {
            defaultobj.trans_mode = 'FOB[3]';
            defaultobj.insur_mark = '1';
            defaultobj.insur_rate = '0.3';
            defaultobj.insur_curr = '502';
        }
        else if (sel.productDetailJson.CJFS == 'CPT') {
            defaultobj.trans_mode = 'C&F[2]';
            defaultobj.insur_mark = '1';
            defaultobj.insur_rate = '0.3';
            defaultobj.insur_curr = '502';
        }
        else {
            defaultobj.trans_mode = 'CIF[1]';
        }
        if (sel.productDetailJson.REFNO && sel.productDetailJson.REFNO.indexOf('DMX') != -1) {
            defaultobj.PROMISE_ITMES = '0000';
        }
        else {
            defaultobj.PROMISE_ITMES = '1000';
        }
    }
}