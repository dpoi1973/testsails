/**
 * QuanqiuShenqingListInfo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
//  70965 Excel list
module.exports = {
  attributes: {
    //  "项号"
    SequenceNO:{
      type:'string',
      size:50
    },
    //  "HS编码"
    HSCode:{
      type:'string',
      size:50
    },
    //  "货物名称"
    GName:{
      type:'string',
      size:50
    },
    //  "数量"
    Qty:{
      type:'integer'
    },
    //  "币制"
    Curr:{
      type:'string',
      size:50
    },
    //  "单位"
    Unit:{
      type:'string',
      size:50
    },
    //  "毛重（KG）"	:
    GrossWeight:{
      type:'float'
    },
    //  "净重(KG)"
    NetWeight:{
      type:'float'
    },
    //  "金额"
    Amount:{
      type:'float'
    },
    //  "全球申请详细信息 属于 一个全球申请信息"
    owner: {
      model: 'QuanqiuShenqingInfo'
    }
  }
};
