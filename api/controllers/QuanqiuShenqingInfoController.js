/**
 * QuanqiuShenqingInfoController
 *
 * @description :: Server-side logic for managing Quanqiushenqinginfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
//  70965 Excel
var XLSX = require('xlsx');
var workbook,target_sheet,workbook,worksheet,filename = '70965.xls',path = 'C:/Users/wanli/Documents/70965/',
  Obj = {
  1: 'K10', //    '仓库号码'        :'StockNO',
  2: 'AL12',//    '报关申请单号'    : 'BaoguanApplyNO',
  3: 'M16', //     '发票号'        : 'InvoiceNO',
  4: 'AL18' //     '报关日期'      : 'BaoguanDate'
};

module.exports = {
  import:function(req,res){
    try{
      workbook = XLSX.readFile(path + filename);		//读文件
    }catch(e){
      console.log(" error parsing  : " + e);
      return res.json({message:'该文件不是Excel文件!'});
    }
    target_sheet = workbook.SheetNames[0];
    console.log(target_sheet);
    try {
      worksheet = workbook.Sheets[target_sheet];
      if (!worksheet) throw "Sheet " + target_sheet + " cannot be found";
    } catch (e) {
      console.log(" error parsing " + filename + " " + target_sheet + ": " + e);
      return res.json({message:'没有找到表文件！！'});
    }
    var temp = {};    //    {StockNO:'',BaoguanApplyNO:'',InvoiceNO:'',BaoguanDate:''};
    for (var key in Obj)
    {
      desired_cell 	= worksheet[Obj[key]];
      //  console.log(key + '		-->		' + desired_cell.v);
      if(desired_cell){
        switch( parseInt(key) ){
          case 1:
            temp.StockNO = desired_cell.v;
            break;
          case 2:
            temp.BaoguanApplyNO = desired_cell.v;
            break;
          case 3:
            temp.InvoiceNO = desired_cell.v;
            break;
          case 4:
            temp.BaoguanDate = desired_cell.v;
            break;
          default:
            break;
        }
      }else{
        console.log(desired_cell);
        console.log(key);
      }
    }
    console.log(temp);
    if(temp){
      QuanqiuShenqingInfo.create(temp).exec(function (err, rec) {          //   执行创建操作
        if (err) {
          console.log('添加出错！！');		                                  //	输出错误
          return res.json({message:'添加出错！！'});
        } else {
          console.log('正常添加！！');                                      //	正确返回
          return res.json({message:'正常添加！！'});
        }
      });
    }
  }
};

