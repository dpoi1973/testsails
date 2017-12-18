/**
 * TiyundanInfo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    autoCreatedBy: false,
    attributes: {

        ywinfoid: {
            model: 'YWinfo',
            unique: true
        },

        "billNo": {
            "type": "String",
            "size": 64
        },
        "trafName": {
            "type": "String",
            "size": 50
        },
        "voyageNo": {
            "type": "String",
            "size": 32
        },
        "tradeCountry": {
            "type": "String",
            "size": 3
        },
        "distinatePort": {
            "type": "String",
            "size": 4
        },
        "grossWt": {
            "type": "float",
            "size": 20
        },
        "netWt": {
            "type": "float",
            "size": 20
        },
        "iEPort": {
            "type": "String",
            "size": 4
        },
        "contrNo": {
            "type": "String",
            "size": 70
        },
        "noteS": {
            type: "string",
            size: 200
        },
        packNo:{
            type: "integer",
            size: 10
        },
        baoguantemplate: {
            type: "string",
            size: 200
        },
        "wraptype": {
            type: "string",
            size: 50
        },
        "temobj": {
            type: "json"
        },
        "uploadtime": {
            type: "string"
        }
    }
};