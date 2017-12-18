/**
 * QuanqiuShenqingInfo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
//  70965 Excel
module.exports = {

  attributes: {
    //  "仓库号码"		:
    StockNO:{
      type:'string',
      size:50
    },
    //  "报关申请单号"
    BaoguanApplyNO:{
      type:'string',
      size:100
    },
    //  "发票号"
    InvoiceNO:{
      type:'string',
      size:50
    },
    //  "报关日期"
    BaoguanDate:{
      type:'datetime'
    },
    owner:{
      model:'QuanqiuYWInfo'
    },
    //  "全球申请信息 拥有  多个全球申请列表信息"
    QuanqiuShenqingListInfoS: {
      collection: 'QuanqiuShenqingListInfo',
      via: 'owner'
    }
  }
};

