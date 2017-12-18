/**
 * Created by wanli on 2016/7/13 0013.
 */
var XLSX = require('xlsx');
var workbook,target_sheet,worksheet,desired_cell;




module.exports = {
	/**
	*		初始化变量
	*
	*/
	init:function(){
		workbook			=		null;
		target_sheet	=		null;
		worksheet		=		null;
		desired_cell		=		null;
	},
	/**
	*		导入到数据库
	*
	*/
  importMysql:function(path,filename){
	init();
	readExcelFile(path,filename);
	//		映射成对象
    oo = (XLSX.utils.sheet_to_json(worksheet));
    //		遍历对象数组
    if(oo){
      QuanqiuInvoiceInfo.create(oo).exec(function (err, rec) {    //	执行创建操作
        if (err) {
          console.log('添加出错！！');		                          //	输出错误
          return {message:'添加出错！！'};
        } else {
          console.log('正常添加！！');                              //	正确返回
          return {message:'正常添加！！'};
        }
      });
    }
  },
  /**
  *		导入到数据库
  *
  */
  importMysql:function(path,filename,obj){
	init();
	readExcelFile(path,filename);
	var temp = {};    //    {StockNO:'',BaoguanApplyNO:'',InvoiceNO:'',BaoguanDate:''};
    for (var key in Obj){
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
          return {message:'添加出错！！'};
        } else {
          console.log('正常添加！！');                                      //	正确返回
          return {message:'正常添加！！'};
        }
      });
    }
  },
  /**
  *		导入到数据库
  *
  */
  importMysql:function(path,filename,index,table){
	init();
	readExcelFile(path,filename);
	var temp = {};
    for (var key in table){
      desired_cell 	= worksheet[(table[key]+index[key])];
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
      QuanqiuShenqingListInfo.create(temp).exec(function (err, rec) {				//   执行创建操作
        if (err) {
          return {message:'添加出错！！'};														//	输出错误
        }else{
          return {message:'正常添加！！'};														//	正确返回
        }
      });
    }
  },
  /**
  *			读Excel文件
  *
  */
  readExcelFile:function(path,filename){
	try{
      workbook = XLSX.readFile(path + filename);
    }catch(e){
      console.error(" error parsing  : " + e);
      return res.json({message:'该文件不是Excel文件!'});
    }
	//		获取表名
    target_sheet = workbook.SheetNames[0];
	//		加载到内存
    try {
      worksheet = workbook.Sheets[target_sheet];
      if (!worksheet) throw "Sheet " + target_sheet + " cannot be found";
    } catch (e) {
      console.error(" error parsing " + filename + " " + target_sheet + ": " + e);//
      return res.json({message:'没有找到表文件！！'});
    }
  }
};

