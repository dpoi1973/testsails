/**
 * YWinfo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    autosubscribe: ['destroy', 'update','create'],
    autoCreatedBy: false,
    attributes: {
        CustYWNO: {
            type: 'string',
            size: 20

        },
        YWNO: {
            type: 'string',
            size: 20
        },
        feeweight:{
            type: 'float'
        },
        invoiceDetailList: {
            collection: 'InvoiceDetailInfo',
            via: 'ywinfoid'

        },
        tiyundaninfo: {
            collection: 'TiyundanInfo',
            via: 'ywinfoid'
        },
        formhead: {
            collection: 'FormHead',
            via: 'ywid'
        },
        custid:{
            type:'integer',
        },
        createperson:{
            type: 'string'
        }
    }
};