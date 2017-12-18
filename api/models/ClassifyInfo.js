/**
 * ClassifyInfo.js
 *
 * @description :: 海关hscode归类内容，请设置版本号，以便更新.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
autoCreatedBy: false,
    attributes: {

        HSCode: {
            type: 'string',
            size: 10,
            primaryKey: true
        },
        GName: {
            type: 'string',
            size: 255
        },
        LowRate: {
            type: 'float'
        },
        HighRate: {
            type: 'float'
        },
        OutRate: {
            type: 'float'
        },
        RegRate: {
            type: 'float'
        },
        TaxType: {
            type: 'string',
            size: 10
        },
        TaxRate: {
            type: 'float',
            size: 10
        },
        CommRate: {
            type: 'float',
            size: 10
        },
        TaiwanRate: {
            type: 'float',
            size: 10
        },
        OtherType: {
            type: 'string',
            size: 10
        },
        OtherRate: {
            type: 'float',
            size: 10
        },
        Unit1: {
            type: 'string',
            size: 10
        },
        Unit2: {
            type: 'string',
            size: 10
        },
        ControlMark: {
            type: 'string',
            size: 20
        },
        TarifFlag: {
            type: 'string',
            size: 10
        },
        NoteS: {
            type: 'string',
            size: 200
        },
        ChouchaFlag: {
            type: 'boolean'
        },
        ChouchaValidDate: {
            type: 'date'
        },
        TmpTax: {
            type: 'float'
        },
        ClassifyName: {
            type: 'string',
            size: 255
        },
        R1: {
            type: 'string',
            size: 255
        },
        R2: {
            type: 'string',
            size: 255
        },
        RList: {
            type: 'string',
            size: 255
        },
        hscodeVersion: {
            type: 'string'
            
        },
        TempJson:{
            type: 'json'
        },
        R2Distinct: {
            type: 'string' 
        },
        namestruct: {
            type: 'string' 
        },
        Cspec: {
            type: 'string' 
        }
        
    }
};