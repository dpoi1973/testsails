/**
 * EmpInfo.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
  autoCreatedBy: false,

  attributes: {
    "empname": {
            "type": "string",
            size:10
        },
        "empNO":{
          "type":"string",
          size:10
        },
        "userinfo":{
          model:'User',
          unique:true
        }



  }
};

