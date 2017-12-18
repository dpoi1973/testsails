/**
 * QuanqiuShenqingListInfoController
 *
 * @description :: Server-side logic for managing Quanqiushenqinglistinfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
//  70965 Excel list
var XLSX = require('xlsx');
var target_sheet,filename = '70965.xls',workbook,worksheet,desired_cell,path = 'C:/Users/wanli/Documents/70965/',index = [24,24,24,24,25,25,25,25,25],
table = {
 0: 'F' , 1: 'M' , 2: 'U' , 3: 'AX',
 4: 'C' , 5: 'AB', 6: 'AE', 7: 'AL', 8: 'AR'
};
/**
 * var table = {
 *  "HS编码"		  : 'F' , "货物名称"		: 'M' , "数量"			  : 'U' , "币制"			  : 'AX',
 * "项号"			  : 'C' , "单位"			  : 'AB', "毛重（KG）"	: 'AE', "净重(KG)"		: 'AL', "金额"			  : 'AR'
 *  };
 * @type {{import: module.exports.import}}
 */
module.exports = {
  import:function(req,res){
    try{
      workbook = XLSX.readFile(path + filename);		//读文件
    }catch(e){
      console.log(" error parsing  : " + e);
      return res.json({message:'读取文件时出错！！'});
    }
    target_sheet = workbook.SheetNames[0];
    console.log(target_sheet);
    try {
      worksheet = workbook.Sheets[target_sheet];
      if (!worksheet) throw "Sheet " + target_sheet + " cannot be found";
    } catch (e) {
      console.log(": error parsing " + filename + " " + target_sheet + ": " + e);
      return res.json({message:'没有找到表文件！！'});
    }
    var temp = {};
    for (var key in table)
    {
      desired_cell 	= worksheet[(table[key]+index[key])];
      //  console.log( key +"-->"+(table[key]+index[key])+"-->"+desired_cell);
      if(desired_cell){
        switch( parseInt(key) ){
          case 0:
            temp.HSCode = desired_cell.v;
            break;
          case 1:
            temp.GName = desired_cell.v;
            break;
          case 2:
            temp.Qty = desired_cell.v;
            break;
          case 3:
            temp.Curr = desired_cell.v;
            break;
          case 4:
            temp.SequenceNO = desired_cell.v;
            break;
          case 5:
            temp.Unit = desired_cell.v;
            break;
          case 6:
            temp.GrossWeight = desired_cell.v;
            break;
          case 7:
            temp.NetWeight = desired_cell.v;
            break;
          case 8:
            temp.Amount = desired_cell.v;
            break;
          default:
            break;
        }
      }
    }
    console.log(temp);
    if(temp){
      QuanqiuShenqingListInfo.create(temp).exec(function (err, rec) {           //   执行创建操作
        if (err) {
          return res.json({message:'添加出错！！'});                             //	输出错误
        }else{
          return res.json({message:'正常添加！！'});                            //	正确返回
        }
      });
    }
  },
  findToApplyNo:function (req,res) {
    var applyId = req.param('ApplyId');
    console.log(applyId);
    if(applyId){
      QuanqiuShenqingListInfo.find({BaoguanApplyNO:applyId}).exec( function (err,qqsqli) {
        if(err){
          return res.json({status: 'error', errmesage: err.message});
        }
        return res.json({qqsqli:qqsqli});
      });
    }
  }
};

