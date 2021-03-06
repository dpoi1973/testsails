/**
 * QuanqiuInvoiceInfo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
//  70965INV  Excel
module.exports = {
  attributes:{
    Storer:{
      type:'string',
      size:100
    },
    vat:{
      type:'string',
      size:50
    },
    Notes2:{
      type:'string',
      size:50
    },
    OriginCountry:{
      type:'string',
      size:50
    },
    ExternLineNo:{
      type:'integer',
    },
    FOBPoint:{
      type:'string',
      size:50
    },
    Ship_Order_Num:{
      type:'integer'
    },
    Externorderkey:{
      type:'integer'
    },
    S_COMPANY:{
      type:'string',
      size:50
    },
    Csgn_cmp:{
      type:'string',
      size:50
    },
    Csgn_cmp1:{
      type:'string',
      size:50
    },
    Csgn_cmp2:{
      type:'string',
      size:50
    },
    SKU:{
      type:'string',
      size:50
    },
    QTY:{
      type:'integer'
    },
    Vendor_PTNR:{
      type:'string',
      size:50
    },
    Descr:{
      type:'string',
      size:100
    },
    Tariff_Code:{
      type:'string',
      size:50
    },
    Unit_Price:{
      type:'float'
    },
    shipmentid:{
      type:'string',
      size:50
    },
    adddate:{
      type:'datetime'
    },
    owner:{
      model:'QuanqiuYWInfo'
    }
  }
};

