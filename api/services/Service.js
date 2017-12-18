/**
 * Created by wanli on 2016/7/13 0013.
 */
/**
 * Created by wanli on 2016/7/13 0013.
 */
var XLSX = require('xlsx');



var workbook, target_sheet, worksheet, desired_cell;
module.exports = {
  read_excel0_info: function (path, filename, Obj, id) {
    Service.readExcelFile(path, filename);
    if (worksheet != null) {
      var temp = { owner: id };
      for (var key in Obj) {
        desired_cell = worksheet[Obj[key]];
        if (desired_cell) {
          switch (parseInt(key)) {
            case 1: temp.StockNO = desired_cell.v; break;
            case 2: temp.BaoguanApplyNO = desired_cell.v; break;
            case 3: temp.InvoiceNO = desired_cell.v; break;
            case 4: temp.BaoguanDate = desired_cell.v; break;
            case 5: temp.Tihuoplace = desired_cell.v; break;
            case 6: temp.storecompany = desired_cell.v; break;
            case 7: temp.ownercode = desired_cell.v; break;
            case 8: temp.note = desired_cell.v; break;
            case 9: temp.pre_entry_id = desired_cell.v; break;
            case 10: temp.transcompany = desired_cell.v; break;
            case 11: temp.pretonguandate = desired_cell.v; break;
            default: break;
          }
        }
      }
      if (temp.StockNO && temp.BaoguanApplyNO && temp.InvoiceNO && temp.BaoguanDate) {
        return temp;
      }
      else {
        return "err";
      }

    }
    else {
      return "err";
    }

  },
  read_excel1_info: function (path, filename, index, table, id) {
    Service.readExcelFile(path);
    if (worksheet != null) {
      var list = new Array(), i = 0;
      do {
        var temp = { owner: id }, j;
        for (var key in table) {
          j = index[key] + i;
          desired_cell = worksheet[(table[key] + j)];
          if (desired_cell) {
            switch (parseInt(key)) {
              case 0: temp.HSCode = desired_cell.v; break;
              case 1: temp.GName = desired_cell.v; break;
              case 2: temp.Qty = desired_cell.v; break;
              case 3: temp.Curr = desired_cell.v; break;
              case 4: temp.SequenceNO = desired_cell.v; break;
              case 5: temp.Unit = desired_cell.v; break;
              case 6: temp.GrossWeight = desired_cell.v; break;
              case 7: temp.NetWeight = desired_cell.v; break;
              case 8: temp.Amount = desired_cell.v; break;
              default: break;
            }
          }
        }
        list.push(temp);
        i = i + 4;
        desired_cell = worksheet['C' + (25 + i)];
      } while (desired_cell != null);
      return list;
    }
    else{
      return 'err';
    }
  },
  read_excel2_info: function (path, filename, id) {
    Service.readExcelFile(path, filename);
    if (worksheet != null) {
      var temp = { owner: id };
      temp = (XLSX.utils.sheet_to_json(worksheet));
      return temp;
    }
    else {
      return 'err';
    }


  },
  read_excel3_info: function (path, filename, id, callback) {
    // return result= Service.readsimpleExcelFile(path, filename).then(function(json){
    //   return json;
    // });
    Service.readExcelFile(path, filename);
    var temp = { owner: id };
    temp = (XLSX.utils.sheet_to_json(worksheet));
    return temp;
  },
  read_excel4_info: function (path, filename, callback) {
    Service.readExcelFile(path, filename);
    var temp = {};
    temp = (XLSX.utils.sheet_to_json(worksheet));
    return temp;
  },
  readExcelFile: function (path, filename) {
    try {
      workbook = XLSX.readFile(path);
      target_sheet = workbook.SheetNames[0];
      try {
        worksheet = workbook.Sheets[target_sheet];
        if (!worksheet) throw "Sheet " + target_sheet + " cannot be found";
      } catch (e) {
        console.error(" error parsing " + filename + " " + target_sheet + ": " + e);
      }
    } catch (e) {
      console.error(" error parsing  : " + e);
      worksheet = null;
    }

  },
  readsimpleExcelFile: function (path, filename) {
    return readfromcsv(path).then(function (err, result) {
      if (err) {
        try {
          workbook = XLSX.readFile(path);
          target_sheet = workbook.SheetNames[0];
          worksheet = workbook.Sheets[target_sheet];
          if (!worksheet) {
            throw "Sheet " + target_sheet + " cannot be found";
          }
          else {
            var temp = {};
            temp = (XLSX.utils.sheet_to_json(worksheet));
            return temp;
          }
        } catch (e) {
          console.error(" error parsing  : " + e);
          return 'err';
        }
      }
      else {
        return result;
      }
    })

  },


  readcsvfile(path, callback) {
    // fs.createReadStream( csvfile ).pipe( newConverter );
    // newConverter.on("end_parsed", function (jsonArray) {
    // })
    converter.fromFile(path, function (err, result) {
      var temp = result;
      callback(temp);
    });
  }

};

