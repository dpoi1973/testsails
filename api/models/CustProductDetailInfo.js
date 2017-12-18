/**
 * CustProductDetailInfo.js
 *
 * @description :: 客户产品明细库
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {

        SKU: {
            type: 'string',
            size: 50
        },
        GoodsclassEN: {
            type: 'string',
            size: 50
        },
        GoodsnameEN: {
            type: 'string',
            size: 50
        },
        MaterialEN: {
            type: 'string',
            size: 50
        },
        MaterialkeyEN: {
            type: 'string',
            size: 50
        },
        SpecEN: {
            type: 'string',
            size: 50
        },
        GoodsnameCN: {
            type: 'string',
            size: 50
        },
        SpecCN: {
            type: 'string',
            size: 50
        },
        HScode: {
            type: 'string',
            size: 50
        },
        Memo: {
            type: 'string',
            size: 50
        },
        CreateDate: {
            type: 'string',
            size: 50
        },
        LastUpdateDate: {
            type: 'string',
            size: 50
        },
        CreatePerson: {
            type: 'string',
            size: 50
        },
        LastUpdatePerson: {
            type: 'string',
            size: 50
        },
        ClassifyNO: {
            type: 'string',
            size: 50
        },
        ClassifyMD5Source: {
            type: 'string',
            size: 50
        },
        status: {
            type: 'string',
            size: 10
        },
        templateJson: {
            type: 'json'
        },
        ClassifiedProductid: {
            model: 'CustClassifyProductInfo'

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
        custid: {
            model: 'custinfo'
        },
        former: {
            type: 'boolean'
        },
        "pracGoodsname": {
            "type": "string"
        },
        fakeCspec: {
            "type": "string",
            "required": false,
            "length": 255
        },
        opetempjson: {
            type: 'json'
        },
        opegoodsname:{
            type: 'string',
            size: 255
        },
        manualNO:{
            type: 'string'
        },
        contrItem:{
           type: 'integer'
        },

        // cspecnow: function () {


        //     _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
        //     if (this.ClassifiedProductid) {
        //         var template = _.template(this.ClassifiedProductid.Cspec);
        //         return template(this.templateJson);
        //     } else
        //         return ('');

        // },
        // toJSON: function () {
        //     var obj = this.toObject();
        //     obj.cspp = this.cspecnow();
        //     return obj;
        // }

    }
};