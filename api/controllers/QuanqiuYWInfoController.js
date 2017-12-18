/**
 * QuanqiuYWInfoController
 *
 * @description :: Server-side logic for managing Quanqiuywinfoes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var filename_1, filename_2, filename_3, custYWNO,
  path = 'C:/Users/wanli/Documents/71518/',
  Obj = {
    1: 'K10', 	//    '仓库号码'        		:'StockNO',
    2: 'AL12',	//    '报关申请单号' 		    : 'BaoguanApplyNO',
    3: 'M16', 	//     '发票号'        			: 'InvoiceNO',
    4: 'AL18' 	//     '报关日期'      		  : 'BaoguanDate'
  },
  index = [24, 24, 24, 24, 25, 25, 25, 25, 25],
  table = {
    0: 'F', 1: 'M', 2: 'U', 3: 'AX',
    4: 'C', 5: 'AB', 6: 'AE', 7: 'AL', 8: 'AR'
  };
module.exports = {
  import: function (req, res) {
    filename_1 = req.param('file_1');
    filename_2 = req.param('file_2');
    filename_3 = req.param('file_3');
    custYWNO = req.param('custYWNO');
    if (filename_1 && filename_2 && filename_3 && custYWNO) {
      var qqywid, temp = { filename_1: filename_1, filename_2: filename_2, filename_3: filename_3, custYWNO: custYWNO };
      console.log(temp);
      QuanqiuYWInfo.create(temp).then(function (ywi) {
        var obj;
        qqywid = ywi.custYWNO;
        obj = Service.read_excel0_info(path, filename_1, Obj, qqywid);
        //return QuanqiuShenqingInfo.create(obj);
      }).then(function (sqi) {
        var obj;
        //obj = Service.read_excel1_info(path,filename_1,index,table,sqi.id);
        //return QuanqiuShenqingListInfo.create(obj);
      }).then(function (sqli) {
        var obj;
        obj = Service.read_excel2_info(path, filename_2, qqywid);
        // return QuanqiuInvoiceInfo.create(obj);
      }).then(function (cc) {
        var obj;
        obj = Service.read_excel3_info(path, filename_3, qqywid);
        // return QuanqiuPLInfo.create(obj);
      }).catch(function (err) {
        console.log(err);
      });
    }
    return res.json({ message: 'Hello World!!' });
  },
  searchby: function (req, res) {
    var condition = req.body;
    console.log(condition.pageIndex);
    var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
    QuanqiuYWInfo.count({
      where: {
        custYWNO: {
          'contains': condition.custYWNO
        }
      }
    }).then(function (resultcount) {
      responseresult.totalCount = resultcount;

      return QuanqiuYWInfo.find({
        where: {
          custYWNO: {
            'contains': condition.custYWNO
          }
        }, skip: (condition.pageIndex - 1) * condition.pageSize, limit: condition.pageSize, sort: condition.sortby?condition.sortby:'custYWNO DESC'
      });
    })
      .then(function (results) {
        responseresult.status = 'OK';
        responseresult.datas = results;
        res.json(responseresult);
      })
      .error(function (er) {
        res.json({ status: 'error', err: er.message });
      });
  },
  destroy: function (req, res) {
    QuanqiuYWInfo.findOne({ id: req.param('id') })
      .then(record => {
        if (record.ywid) {
          res.json({ status: 'error', err: '外部数据下业务未删除' });
        }
        else {
          QuanqiuYWInfo.destroy({ id: req.param('id') })
            .then((updaterecord) => {
              res.json({ status: 'ok', err: '外部数据已删除' });
            })
        }
      })
      .error(er => {
        res.json({ status: 'error', err: er.message });
      });


  }

};

