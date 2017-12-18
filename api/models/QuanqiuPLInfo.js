/**
 * QuanqiuPLInfo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
//  70965 PL Excel
module.exports = {

  attributes: {
    Vendor:{
      type:'string',
      size:50
    },  //  'MICRON-XMN',
    ShipmentOrderNo:{
      type:'integer'
    } , //  1292611,
    HPPullRefNo:{
      type:'integer'
    },  // 1292610,
    HPPartNo:{
      type:'string',
      size:50
    },  //  '698651-154',
    VendorPartNo:{
      type:'string',
      size:50
    },  //  '',
    Description:{
      type:'string',
      size:100
    },   //   DIMM, 8GB, PC3-12800, CL11, dPC'
    NoOfCarton:{
      type:'integer'
    },  //  1,
    Qty:{
      type:'integer'
    },  //  100,
    GrossWeight:{
      type:'float'
    },  //   2.61,
    NetWeight:{
      type:'float'
    },  //   1.7,
    wavekey:{
      type:'integer'
    },  //  613882,
    vat:{
      type:'string',
      size:50
    },  //  'BONDED',
    company:{
      type:'string',
      size:100
    },  //   'MICRON SEMICONDUCTOR ASIA PTE',
    externlineno:{
      type:'integer'
    },  //   1,
    productgroup:{
      type:'string',
      size:50
    },  //   'BFS0001661',
    ASN:{
      type:'integer'
    },  //   171034,
    OriginCountry:{
      type:'string',
      size:50
    },  //  'CHN',
    PalletID:{
      type:'string',
      size:50
    },  //   'Q004307092',
    Facility:{
      type:'string',
      size:50
    },  //   'BTL',
    ChineseDescr:{
     type:'string',
      size:50
    },
    owner:{
      model:'QuanqiuYWInfo'
    }
  }
};

