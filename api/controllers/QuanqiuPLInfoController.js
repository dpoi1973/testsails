/**
 * QuanqiuPLInfoController
 *
 * @description :: Server-side logic for managing Quanqiuplinfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
//  70965 PL Excel
var XLSX = require('xlsx');
var	workbook,	target_sheet,	worksheet,  filename = '70963PL.xls', path = 'C:/Users/wanli/Documents/70963/';
module.exports = {
  import:function(req,res){
    try{
      workbook = XLSX.readFile(path + filename);
    }catch(e){
      console.log(" error parsing  : " + e);
      return res.json({message:'该文件不是Excel文件!'});
    }
//		获取表名
    target_sheet = workbook.SheetNames[0];
//		加载到内存
    try {
      worksheet = workbook.Sheets[target_sheet];
      if (!worksheet) throw "Sheet " + target_sheet + " cannot be found";
    } catch (e) {
      console.log("error parsing " + filename + " " + target_sheet + ": " + e);//
      return res.json({message:'没有找到表文件！！'});
    }
    //		映射成对象
    oo = (XLSX.utils.sheet_to_json(worksheet));
    //		遍历对象数组
    if(oo){
      QuanqiuPLInfo.create(oo).exec(function (err, rec) {           //	执行创建操作
        if (err) {
          console.log('添加出错！！');		                          //	输出错误
          return res.json('添加出错！！');
        } else {
          console.log('正常添加！！');                              //	正确返回
          return res.json('正常添加！！');
        }
      });
    }
  }
};

