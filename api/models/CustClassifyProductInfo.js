/**
 * CustClassifyProductInfo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
autoCreatedBy: false,
    attributes: {

        "HScode": {
            "type": "string",
            "required": false,
            "length": 10


        },
        "Cgoodsname": {
            "type": "string",
            "required": false,
            "length": 255


        },
        "Cspec": {
            "type": "string",
            "required": false,
            "length": 255,

        },
        "cunit": {
            "type": "string",
            "required": false,
            "size": 20,

        },
        "cunit1": {
            "type": "string",
            "required": false,
            "size": 20

        },
        "cunit2": {
            "type": "string",
            "required": false,
            "size": 20

        },
        "memo": {
            "type": "string",
            "required": false,
            "size": 255
        },
        "r1": {
            "type": "string",
            "required": false,
            "size": 255
        },
        "r2": {
            type: 'json'
        },
        "Status": {
            "type": "string",
            "required": false,
            "length": 50
        },
        "keyWords": {
            "type": "string"

        },
        templateJson: {
            type: 'string'
        },
        tempJson: {
            type: 'json'
        },
        hscodeVersionid: {
            type: 'string'
        },
        custid:{
            model: 'custinfo'
        },
        "pracGoodsname": {
            "type": "string"
        },
        Cflag: {
            type: 'boolean'
        },
        ControlMark: {
            type: 'string'
        },
        ShangjianMark: {
            type: 'string'
        },
        R2Distinct: {
            type: 'string' 
        },
        midDic: {
            type: 'json' 
        },
        fakeCspec: {
            type: 'string' 
        },
        fakegoodsname: {
            type: 'string' 
        }

    }
};