/**
 * QuanqiuYWInfo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  autoCreatedBy:false,
  attributes: {
    filename_1:{
      type:'string',
      size:50
    },
    filename_2:{
      type:'string',
      size:50
    },
    filename_3:{
      type:'string',
      size:50
    },
    custYWNO:{
      type:'string',
      size:20
    },
    batch:{
      type:'string'
    },
    //  一条业务编号 拥有 多个全球申请发票信息
    Invoice:{
     type:'json'
    },
    shenqinglist:{
     type:'json'
    },
    PL:{
     type:'json'
    },
    Apl:{
     type:'json'
    },
    ywid:{
      type:'integer',
    }
  }
};
