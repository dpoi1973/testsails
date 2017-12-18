/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your controllers.
 * You can apply one or more policies to a given controller, or protect
 * its actions individually.
 *
 * Any policy file (e.g. `api/policies/authenticated.js`) can be accessed
 * below by its filename, minus the extension, (e.g. "authenticated")
 *
 * For more information on how policies work, see:
 * http://sailsjs.org/#!/documentation/concepts/Policies
 *
 * For more information on configuring policies, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.policies.html
 */


module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions (`true` allows public     *
  * access)                                                                  *
  *                                                                          *
  ***************************************************************************/

  //  '*': true,


  //'*':['controllerAuth']

  '*': //true,
  [
    'basicAuth',
    'passport',
    'sessionAuth'
    // 'ModelPolicy',
    // 'AuditPolicy',
    // 'OwnerPolicy',
    // 'PermissionPolicy',
    // 'RolePolicy',
    // 'CriteriaPolicy'
  ],

  QuanqiuYWInfo: {
    '*': true
  },
  YWinfo: {
    '*': true
  },
  FormHead: {
    '*': true
  },
  baoguantempletecopy: {
    '*': true
  },
  BaoguanTemplete: {
    '*': true
  },
  ClassifyInfo: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth']
  },
  CustClassifyProductInfo: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth']
  },
  CustInfo: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth'],
    'getidbyname': true
  },
  HelpPara: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth']
  },
  TemplateFormHead: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth']
  },
  ProductCustInfo: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth']
  },

  EmpInfo: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth']
  },
  CustProductDetailInfo: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth']
  },
  CustProductDetailInfocopy: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth']
  },
  paracom: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth']
  },
  ImportInvoice: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth'],
    'commonimport': true
  },
  Dcl_B_Io_Decl: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth']
  },
  manualcustproductdetail: {
    '*': true
  },
  OutList: {
    '*': true
  },

  Company: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth']
  },
  Charge: {
    '*': true
  },
  Contract: {
    '*': true
  },
  Business_pro: {
    '*': true
  },
  Dmanage: {
    '*': ['basicAuth',
      'passport',
      'sessionAuth'],
    'importold': true
  },
  Flowinfo: {
    '*': true
  },
  Flowconfig: {
    '*': true
  },
  Docinfo: {
    '*': true
  },
  Product_ccc: {
    '*': true
  },
  Proxy_archive: {
    '*': true
  },

  AuthController: {
    '*': ['passport']
  },
  WeChatController: {
    '*': ['passport']
  },
  parseconfig: {
    '*': true
  },
  custftpattach: {
    '*': true
  }


  /***************************************************************************
  *                                                                          *
  * Here's an example of mapping some policies to run before a controller    *
  * and its actions                                                          *
  *                                                                          *
  ***************************************************************************/
  // RabbitController: {

  // Apply the `false` policy as the default for all of RabbitController's actions
  // (`false` prevents all access, which ensures that nothing bad happens to our rabbits)
  // '*': false,

  // For the action `nurture`, apply the 'isRabbitMother' policy
  // (this overrides `false` above)
  // nurture	: 'isRabbitMother',

  // Apply the `isNiceToAnimals` AND `hasRabbitFood` policies
  // before letting any users feed our rabbits
  // feed : ['isNiceToAnimals', 'hasRabbitFood']
  // }
};
