/**
 * InvoiceDetailInfo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    autoCreatedBy: false,
    attributes: {

        ywinfoid: {
            model: 'YWinfo'
        },

        sku: {
            type: 'string',
            size: 50
        },
        productDetailJson: {
            type: 'json'
        },

        NetWeight: {
            type: 'float',
            defaultsTo: 0
        },
        Unit: {
            type: 'string',
        },
        Price: {
            type: 'float',
            defaultsTo: 0
        },
        Curr: {
            type: 'string',
            size: 20
        },
        cCurr: {
            type: 'string',
            size: 20

        },
        TotalpriceFOB: {
            type: 'float',
            defaultsTo: 0
        },
        TotalPriceCIF: {
            type: 'string',
        },
        Qty: {
            type: 'float',
            defaultsTo: 0
        },
        OCOO: {
            type: 'string',
        },
        COO: {
            type: 'string',
        },
        PONo: {
            type: 'string',
        },
        Createdate: {
            type: 'datetime',
        },
        CreatePerson: {
            type: 'string',
        },
        LastUpdatedate: {
            type: 'string',
        },
        LastUpdatePerson: {
            type: 'string',
        },
        OHscode: {
            type: 'string',
        },
        GrossWeight: {
            type: 'float',
            defaultsTo: 0
        },
        SequenceNO: {
            type: 'integer',
        },
        HSCode: {
            type: 'string',
            size: 10
        },

        CustomsCOO: {
            type: 'string',
        },
        "cunit": {
            "type": "string",
            "required": false,
            "length": 10,

        },
        "cunit1": {
            "type": "string",
            "required": false,
            "length": 10

        },
        "cunit2": {
            "type": "string",
            "required": false,
            "length": 10

        },
        Qtyc: {
            type: 'float',
            defaultsTo: 0
        },
        Qty1: {
            type: 'float',
            defaultsTo: 0
        },
        Qty2: {
            type: 'float',
            defaultsTo: 0
        },
        ManualItemID: {
            type: 'integer',
        },
        ControlMark: {
            type: 'string',
        },
        PackQty: {
            type: 'float',
            defaultsTo: 0
        },
        Cgoodsname: {
            type: 'string',
            size: '200'
        },
        Cspec: {
            "type": "string",
            "required": false,
            "length": 255
        },
        VATRate: {
            type: 'string',
        },
        DutyRate: {
            type: 'string',
        },
        EXRate: {
            type: 'string',
        },
        WeigthUnit: {
            type: 'string',
        },

        PackUnit: {
            type: 'string',
        },
        GSTRate: {
            type: 'string',
        },
        OtherLicenseMark: {
            type: 'string',
        },
        CFlag: {
            type: 'string',
        },
        YFlag: {
            type: 'string',
        },
        ShebaoID: {
            type: 'string',
        },
        ClassifyNO: {
            type: 'string',
        },
        OrderFlagValue: {
            type: 'string',
        },
        ShangjianMark: {
            type: 'string',
        },
        CONTR_ITEM: {
            type: 'string',
        },
        combineid: {
            "type": "String"
        },
        wpre: {
            "type": "String"
        },
        wgno: {
            "type": "String"
        },


        'getFormlist': function () {
            var defaultobj = {};
            defaultobj.ivid = this.id;
            defaultobj.NetWeight = this.NetWeight;
            defaultobj.code_t = this.HSCode.substr(0, 8);
            defaultobj.code_s = this.HSCode.replace(defaultobj.code_t, "") == "00" ? "" : this.HSCode.replace(defaultobj.code_t, '');
            defaultobj.g_name = this.Cgoodsname;
            defaultobj.g_model = this.Cspec;

            defaultobj.trade_total = isNaN(this.TotalpriceFOB) ? 0 : this.TotalpriceFOB.toFixed(2);
            if (defaultobj.trade_total == 0) {
                defaultobj.trade_total = isNaN(this.TotalPriceCIF) ? 0 : Number(this.TotalPriceCIF).toFixed(2);
            }
            defaultobj.ControlMark = this.ControlMark;
            defaultobj.ShangjianMark = this.ShangjianMark;
            defaultobj.OtherLicenseMark = this.OtherLicenseMark;
            defaultobj.CFlag = this.CFlag;
            defaultobj.trade_curr = this.cCurr;
            defaultobj.g_unit = this.cunit == "000" ? "" : this.cunit;
            defaultobj.unit_1 = this.cunit1 == "000" ? "" : this.cunit1;
            defaultobj.unit_2 = this.cunit2 == "000" ? "" : this.cunit2;
            defaultobj.qty_conv = isNaN(this.Qtyc) ? 0 : this.Qtyc.toFixed(4);
            defaultobj.qty_1 = isNaN(this.Qty1) ? 0 : this.Qty1.toFixed(4);
            if (defaultobj.unit_2) {
                defaultobj.qty_2 = this.Qty2;
            }
            else {
                defaultobj.qty_2 = '';
            }
            if (defaultobj.qty_1) {
                var declprice = defaultobj.trade_total / defaultobj.qty_1;
                defaultobj.decl_price = declprice.toFixed(2);
            }
            //defaultobj.decl_price =  isNaN(this.Price) ? 0 : this.Price.toFixed(4);

            defaultobj.ver_no = '';
            defaultobj.prdt_no = '';
            //defaultobj.use_to = '';
            defaultobj.origin_country = this.COO;
            defaultobj.contr_item = this.ManualItemID;
            //defaultobj.duty_mode = '3';
            defaultobj.work_usd = '';
            //defaultobj.entry_group = 'ABCD';
            defaultobj.SUP_TYPE = '';
            if(this.productDetailJson){
                defaultobj.SHIP_TO = this.productDetailJson.SHIP_TO ? this.productDetailJson.SHIP_TO : "";
            }
            defaultobj.tcombineid = this.combineid ? this.combineid.toString() : '';
            defaultobj.wpre = this.wpre;
            defaultobj.wgno = this.wgno;
            //defaultobj.DESTINATION_COUNTRY = '142';
            // _.filter(this.formheadElements, v => {
            //     return (v.defaultValue !== '' && v.defaultValue != null)
            // })
            //     .forEach(el => {

            //         defaultobj[el.fieldName.replace(/(_\w)/, function (v) {
            //             return v[1].toUpperCase();
            //         })] = el.defaultValue;

            //     });
            return defaultobj;
        }
    }
};