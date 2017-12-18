/**
 * CustYWinfo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {
        custywno: {
            type: 'string',
            primaryKey: true
        },
        importDate: {
            type: 'datetime',
            required: true,
            defaultsTo: function() {
                return new Date(); }
        },
        otherMemo: {
            type: 'string',

        }

    }



};