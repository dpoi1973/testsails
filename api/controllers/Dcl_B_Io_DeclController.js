module.exports = {
  searchby: function (req, res) {
    let condition = req.body;
    let whereObj = utilsService.getWhereCondition(condition.condition);
    var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
    Dcl_B_Io_Decl.count({ where: whereObj }).then(function (resultcount) {
      responseresult.totalCount = resultcount;

      return Dcl_B_Io_Decl.find({
        where: whereObj,
        skip: (condition.pageIndex - 1) * condition.pageSize,
        limit: condition.pageSize,
        sort: condition.sortby ? condition.sortby : 'Oper_Time ASC'
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

  sendciq: function (req, res) {
    var ciqlist = req.body;
    console.log(ciqlist);
    utilsService.sendqueue('mysqlciq', ciqlist).then((ok) => {
      res.json(utilsService.reponseMessage('OK', '发送成功'));
    })
      .catch((er) => {
        res.json({ status: 'error', err: er.message });
      });
    // Dcl_B_Io_Decl.find({ id: ids }, ciqlist => {
    //   utilsService.sendqueue('mysqlciq', ciqlist).then((ok) => {
    //     res.json(utilsService.reponseMessage('OK', '发送成功'));
    //   })
    //     .catch((er) => {
    //       res.json({ status: 'error', err: er.message });
    //     });
    // })

  },

  genciqlist: function (req, res) {
    var templatename = req.query.templatename;
    var ids = req.body;
    var paratypes = [];
    paratypes.push('Controlway');
    paratypes.push('Country');
    paratypes.push('Port');
    paratypes.push('Domesticport');
    paratypes.push('Unit');
    paratypes.push('custom');
    TemplateFormHead.findOne({ TempleteName: templatename })
      .then(template => {
        if (template) {
          return [FormHead.find({ id: ids }).populate('formlist'), template, ciq2edi.find({ paratype: paratypes })]
        }
        else {
          res.json(utilsService.reponseMessage('Error', '模板不存在'));
        }
      }).spread((formheads, template, paradic) => {
        if (formheads.length > 0) {
          var genlist = [];
          var groupargs = [];
          groupargs.push('ywid');
          var tidangroup = utilsService.groupBy(formheads, groupargs);
          tidangroup.forEach(t => {
            var tongguanheadlist = _.sortBy(t, 'COP_NO');

            if (tongguanheadlist.length > 0) {
              Ciq_GenerateShangjianFromFormheads(tongguanheadlist, template, paradic, pp => {
                console.log(pp);
                Dcl_B_Io_Decl.create(pp).then(aa => {
                  res.json(utilsService.reponseMessage('OK', '保存结束'));
                });
              });
              // pp.foreach(adddetail => {
              //   genlist.Add(adddetail);
              // })

            }
          })
        }
        else {
          res.json(utilsService.reponseMessage('Error', '没有找到报关单'));
        }

      }).catch(err => {
        res.json(utilsService.reponseMessage('Error', err.message));
      })
  },

  getquanshenbao: function (req, res) {
    var billno = req.query.billno;
    var paratypes = [];
    paratypes.push('Controlway');
    paratypes.push('Country');
    paratypes.push('Port');
    paratypes.push('Domesticport');
    paratypes.push('Unit');
    paratypes.push('custom');
    ciq2edi.find({ paratype: paratypes }).then(para => {
      return [FormHead.find({ bill_no: billno }).populate('formlist'), para]
    }).spread((formheads, template, paradic) => {
    })
    FormHead.find({ bill_no: billno }).populate('formlist').then(forms=>{
      if(forms&&forms.length>0){
        return [ciq2edi.find({ paratype: paratypes }),forms]
      }
      else{
        res.json(utilsService.reponseMessage('error', `提运单不存在`));
      }
    }).spread((paradic,forms) => {
      res.json(utilsService.reponseMessage('error', `提运单不存在`));
    })
  }

}



function Ciq_GenerateShangjianFromFormheads(tongguanheadlist, templateinfo, paradic, callback) {
  var genlist = [];
  var goodtemp = {};
  if (tongguanheadlist.length > 0) {
    // 如果每票都有A则每个都要生成一个商检单证，但如果有A了，并且第一票中包含了有疫区的，是否就不用
    // 如果第二票中没有A的，则将对应的商品列表移到前一个生成的
    // 带A的最多只能有20条商品
    var formheadindex = 0;
    var finishflag = false;
    async.mapSeries(tongguanheadlist, function (formhead, cb) {
      var formlistend = [];
      if (formhead.formlist[0].ControlMark.indexOf("A") == -1) {
        // hscode转换  ciq_hscode_unitview
        formlistend = getformlistend(formhead);
        if (genlist.length > 0 && formlistend.length > 0) {
          getCiqGenAplGoodsList(goodtemp, paradic, formlistend, ciqlist => {
            for (var i = 0; i < ciqlist.length; i++) {
              ciqlist[i].Goods_No = i + genlist[genlist.length - 1].Dcl_B_Io_Decl_Goods.length + 1;
            }
            genlist[genlist.length - 1].Dcl_B_Io_Decl_Goods.concat(ciqlist);
            if (genlist[genlist.length - 1].Dcl_B_Io_Decl_Goods.length > 99) {
              var tempPre_entry_id = formhead.pre_entry_id;
              var temp = genlist[genlist.length - 1].Dcl_B_Io_Decl_Goods.length / 99;
              for (var z = 0; z < temp; z++) {
                var my_z = z + 1;
                var takearr = takelimit(genlist[genlist.length - 1].Dcl_B_Io_Decl_Goods, 99);
                genlist[genlist.length - 1].Dcl_B_Io_Decl_Goods = takearr[0];
                var newCiqInAplList = takearr[1];
                var newResult = genlist[genlist.length - 1].clone();
                newResult.Dcl_B_Io_Decl_Goods = newCiqInAplList;
                tempPre_entry_id = tempPre_entry_id + "_" + my_z;
                newResult.Inv_no = tempPre_entry_id;
                newResult.Single_no = newResult.Inv_no;
                var i = 0;
                newResult.Dcl_B_Io_Decl_Goods.forEach(item => {
                  item.Serial = i;
                  i = i + 1;
                })
                genlist.push(newResult);
              }
            }
            index = 0;
            if (formhead.ContainerList && formhead.ContainerList.length > 0) {
              formhead.ContainerList.forEach(detail => {
                var container = {};
                container.Single_no = result.Single_no;
                container.serial = index;
                container.Special = detail.ContainerModel == "1" ? "20GP" : "40GP";
                container.containerno = detail.ContainerNO;
                container.Quantity = "1";
                genlist[genlist.length - 1].Dcl_B_Io_Decl_Att.push(container);
              })
            }
            cb();
          })
        }
        else {
          cb();
        }
      }
      else {
        formlistend = getformlistend(formhead);
        var result = {};
        result = templateinfo.getDefaultCiq();
        goodtemp = result.goods;
        getCiqGenAplGoodsList(goodtemp, paradic, formlistend, ciqlist => {
          // 对字段

          fillciqleft(result, formhead, paradic);
          var index = 0;
          var YYFlag = false;
          var Dcl_B_Io_Decl_Goods_Pack = [];
          for (var i = 0; i < ciqlist.length; i++) {
            ciqlist[i].Goods_No = i + 1;
            var pack = {};
            pack.Ent_Decl_No = ciqlist[i].Ent_Decl_No;
            pack.Goods_No = ciqlist[i].Goods_No;
            pack.Pack_Type_Code = goodtemp.Pack_Type_Code;
            pack.Pack_Catg_Name = goodtemp.Pack_Catg_Name;
            if (i == 0) {
              pack.Pack_Qty = formhead.pack_no;
            }
            else {
              pack.Pack_Qty = 0;
            }
            pack.Is_Main_Pack = 1;
            Dcl_B_Io_Decl_Goods_Pack.push(pack);
          }
          //ciqlist[0].
          result.Dcl_B_Io_Decl_Goods = ciqlist;
          result.Dcl_B_Io_Decl_Goods_Pack = Dcl_B_Io_Decl_Goods_Pack;
          result.Dcl_B_Io_Decl_Att = [];
          if (formhead.ContainerList && formhead.ContainerList.length > 0) {
            formhead.ContainerList.forEach(detail => {
              var container = {};
              container.Single_no = result.Single_no;
              container.serial = index;
              container.Special = detail.ContainerModel == "1" ? "20GP" : "40GP";
              container.containerno = detail.ContainerNO;
              container.Quantity = "1";
              result.Dcl_B_Io_Decl_Att.push(container);
            })
          }
          genlist.push(result);
          cb();
        })
      }
    }, function (err) {
      callback(genlist);
    })
  }
}


function fillciqleft(result, formhead, paradic) {
  result.Contract_no = formhead.contr_no;
  result.AplKind = "I";
  result.Decl_Id = formhead.pre_entry_id;
  result.Ent_Decl_No = formhead.pre_entry_id;
  result.Decl_No = '';
  result.Decl_Get_No = '';
  result.Trade_Mode_Code = '11';//贸易方式
  result.Contract_No = formhead.contr_no;;
  result.Mark_No = '';
  result.Trade_Country_Code = transedi2ciq(paradic, getcode(formhead.TRADE_AREA_CODE), 'Country');
  result.Trade_Country_Name = transedi2ciqname(paradic, getcode(formhead.TRADE_AREA_CODE), 'Country');
  result.Desp_Ctry_Code = transedi2ciq(paradic, getcode(formhead.trade_country), 'Country');
  result.Desp_Ctry_Name = transedi2ciqname(paradic, getcode(formhead.trade_country), 'Country');
  // result.Trans_Mode_Code = transedi2ciq(paradic, getcode(formhead.traf_mode));
  if (formhead.bill_no) {
    var strsplit = formhead.bill_no.split('_');
    if (strsplit.length == 2) {
      result.Bill_Lad_No = strsplit[0];//得到总运单号
      result.Split_Bill_Lad_No = strsplit[1];//得到分运单号
    }
    else {
      result.Bill_Lad_No = formhead.bill_no;
      result.Convynce_Name = formhead.traf_name;
      result.Trans_Mean_No = formhead.voyage_no;
    }
  }
  result.Desp_Port_Code = transedi2ciq(paradic, getcode(formhead.distinate_port), 'Port');
  result.Desp_Port_Name = transedi2ciqname(paradic, getcode(formhead.distinate_port), 'Port');
  result.Port_Stop_Code = transedi2ciq(paradic, getcode(formhead.district_code), 'Domesticport');
  result.Port_Stop_Name = transedi2ciqname(paradic, getcode(formhead.district_code), 'Domesticport');
  result.Enty_Port_Code = transedi2ciq(paradic, getcode(formhead.i_e_port), 'Domesticport');
  result.Enty_Port_Name = transedi2ciqname(paradic, getcode(formhead.i_e_port), 'Domesticport');
  result.Gds_Arvl_Date = formhead.i_e_date;
  result.Cmpl_Dschrg_Dt = formhead.i_e_date;
  //result.Goods_Place = '';//存货地点
  result.Dest_Code = transedi2ciq(paradic, getcode(formhead.district_code), 'Domesticport');
  result.Dest_Name = transedi2ciqname(paradic, getcode(formhead.district_code), 'Domesticport');
  // result.Counter_Claim = '';//索赔截止
  // result.Delivery_Order = '';//提货单
  // result.Insp_Org_Code = '';
  // result.Exc_Insp_Dept_Code = '';
  result.Decl_Custm = transedi2ciq(paradic, getcode(formhead.DECL_PORT), 'custom');
  result.Decl_Custm_Name = transedi2ciqname(paradic, getcode(formhead.DECL_PORT), 'custom');
  // result.Spec_Decl_Flag = '';
  // result.Purp_Org_Code = '';
  //result.Correlation_Decl_No = '';//关联报检号
  //result.Correlation_Reason_Flag = '';//关联理由
  //result.Specl_Insp_Qura_Re = '';//特殊检验检疫要求
  //result.App_Cert_Code = '';
  // result.App_Cert_Name = '';
  // result.Appl_Ori = '';
  // result.Appl_Copy_Quan = '';
  // result.Custm_Reg_No = '';//海关注册号
  //result.Decl_Persn_Cert_No = '';//报检员代码
  // result.Decl_Person_Name = '';
  // result.Decl_Reg_No = '';//报检单位代码
  // result.Decl_Reg_Name = '';
  //result.Contactperson = '';
  //result.Cont_Tel = '';
  //result.Consignee_Code = '';
  // result.Consignee_Cname = '';
  // result.Consignee_Ename = '';
  // result.Consignee_Addr = '';
  // result.Consignor_Code = '';
  // result.Consignor_Cname = '';
  // result.Consignor_Ename = '';
  // result.Consignor_Addr = '';
  // result.Decl_Code = '';
  // result.Decl_Date = '';
  // result.Spec_Pass_Flag = '';
  // result.Desp_Date = '';
  // result.Arriv_Port_Code = '';
  // result.Atta_Collect_Code = '';
  // result.Atta_Collect_Name = '';
  // result.Is_List_Good = '';
  // result.Is_Cont = '';
  // result.Ffj_Flag = '';
  // result.Ffj_Status = '';
  // result.Resend_Num = '';
  // result.Is_Draw = '';
  // result.Total_Val_Us = '';
  // result.Total_Val_Cn = '';
  // result.Cont_Cancel_Flag = '';
  // result.Fee_Handle_State = '';
  // result.Rels_State = '';
  // result.Flg_Port_Inland = '';
  // result.Enable_Trans_Flag = '';
  // result.Process_Status = '';
  // result.Process_Link = '';
  // result.Situation_Code = '';
  // result.Situation_Level = '';
  // result.Org_Code = '';
  // result.Cert_Cancel_Flag = '';
  // result.Oper_Code = '';
  // result.Oper_Time = '';
  // result.Falg_Archive = '';
  // result.Bill_Status = '';
  // result.Upload_Status = '';
  // result.Module_Id = '';
  // result.User_Id = '';
  // result.Verify_Code = '';
  // result.Data_Source = '';
  // result.Trade_Mode_Name = '';
  // result.Trade_Country_Name = '';
  // result.Desp_Ctry_Name = '';
  // result.Desp_Port_Name = '';
  // result.Port_Stop_Name = '';
  // result.Enty_Port_Name = '';
  // result.Insp_Org_Name = '';
  // result.Decl_Custm_Name = '';
  // result.Spec_Flag_Content = '';
  // result.Purp_Org_Name = '';
  // result.Correlation_Reason_Content = '';
  // result.Decl_Type_Name = '';
  // result.Spec_Pass_Content = '';
  // result.Arriv_Port_Name = '';
  // result.Trans_Mode_Name = '';
  // result.Apl_Kind = '';
  // result.Sum_Decl_Id = '';
  // result.Org_Name = '';
  // result.Vsa_Org_Code = '';
  // result.Vsa_Org_Name = '';
  // result.Orig_Box_Flag = '';
  // result.Print_Views = '';
  // result.Goods_Customs_Id = '';
  // result.Insp_Bill_No = '';
  result.sjUsername = 'NEW207';

  // var realno = formhead.COP_NO;
  // result.Single_no = realno;
  // result.Inv_no = realno;
  // result.Apl_date = new Date();

  // result.Convey_code = formhead.traf_mode;
  return result;
}


function getformlistend(formhead) {
  var cergoodslist = _.filter(formhead.formlist, function (t) {
    return t.ControlMark.indexOf("A") != -1 || t.CFlag || t.YFlag || t.C3Flag
  });
  cergoodslist = _.sortBy(cergoodslist, 'g_no');
  return cergoodslist;
}



function takelimit(array, limit) {
  var flresult = [];
  var flele = [];
  for (var k = 0; k < array.length; k++) {
    if (k != 0 && k % limit == 0) {
      flresult.push(flele);
      flele = [];
    }
    flele.push(flgroup[k]);
    if (k == array.length - 1) {
      flresult.push(flele);
    }
  }
  return flresult;
}


function getCiqGenAplGoodsList(goodtemp, paradic, formlist, callback) {
  var declgoods = [];
  async.each(formlist, function (fl, cb) {
    transhscode(fl.code_t + (fl.code_s ? fl.code_s : '00'), (ciqhs) => {
      var good = {};
      for (var key in goodtemp) {
        good[key] = goodtemp[key];
      }
      //good.Goods_Id='';
      //good.Decl_Id='';
      good.Ent_Decl_No = fl.pre_entry_id;
      good.Goods_No = fl.g_no;
      good.Prod_Hs_Code = fl.code_t + (fl.code_s ? fl.code_s : '00');
      sails.models.ciqunit.findOne({ hs_code: good.Prod_Hs_Code })
        .then(ciqunit => {

          good.Hs_Code_Desc = ciqhs.C_name;
          good.Decl_Goods_Cname = fl.g_name;
          good.Decl_Goods_Ename = '';

          AutoFillCiqUnitbyFormhead(fl, ciqunit, good, paradic);
          // good.Goods_Spec = '';
          // good.Goods_Model = '';
          // good.Orig_Place_Code = '';
          // good.Ori_Ctry_Code = '';
          // good.Goods_Brand = '';
          // good.Insp_Type = '';
          // // good.Weight = fl.qty_1;
          // // good.Wt_Meas_Unit = fl.g_unit;
          // // good.Std_Weight = fl.qty_1;
          // // good.Std_Weight_Unit_Code = fl.g_unit;
          // // good.Qty = fl.qty_conv;
          // // good.Qty_Meas_Unit = fl.unit_1;
          // // good.Std_Qty = fl.qty_conv;
          // // good.Std_Qty_Unit_Code = fl.unit_1;
          good.Currency = transedi2ciq(paradic, getcode(fl.trade_curr), 'Curr');
          good.Currency_Name = transedi2ciqname(paradic, getcode(fl.trade_curr), 'Curr');
          // good.Price_Per_Unit = '';
          good.Goods_Total_Val = fl.trade_total;
          // good.Total_Val_Us = '';
          // good.Total_Val_Cn = '';
          good.Ciq_Code = ciqhs.C_code + ciqhs.C_country_code;
          good.Ciq_Name = ciqhs.C_name;
          good.Ciq_Classify_Code = ciqhs.Q_code;
          good.Ciq_Classify_Name = ciqhs.Q_name;
          // good.Situation_Code = '';
          // good.Situation_Level = '';
          //good.Purpose = 'muban';
          // good.Mnufctr_Reg_No = '';
          // good.Produce_Date = '';
          // good.Prod_Batch_No = '';
          good.Prod_Valid_Dt = '1900-01-01 00:00:00.000';
          // good.Prod_Qgp = '';
          // good.Goods_Attr = 'muban';
          // good.Goods_Attr_Name = 'muban';
          // good.Stuff = '';
          // good.Un_Code = '';
          // good.Dang_Name = '';
          // good.Pack_Type = '';
          // good.Pack_Spec = '';
          // good.Custm_Spv_Cond = '';
          // good.Prod_Tag_Pic = '';
          // good.Is_List_Goods = '';
          // good.Cabin_No = '';
          // good.Wagon_No = '';
          // good.By1 = '';
          // good.By2 = '';
          // good.Eng_Man_Ent_Cnm = '';
          // good.Rate = '';
          //good.Mnufctr_Reg_Name = 'muban';
          good.Orig_Place_Name = fl.origin_country;
          // good.Ori_Ctry_Name = '';
          // good.Wt_Unit_Name = '';
          // good.Std_Weight_Unit_Name = '';
          // good.Qty_Unit_Name = '';
          // good.Std_Qty_Unit_Name = '';
          // good.Purpose_Name = '';
          // good.No_Dang_Flag = '';
          declgoods.push(good);
          cb();
        })

    })
  }, function (err) {
    callback(declgoods);
  })
}

function getcode(fullname) {
  if (!fullname) {
    fullname = '';
  }
  var regex = "\\[(.+?)\\]";
  var arr = fullname.match(regex);
  if (arr && arr[1]) {
    return arr[1];
  }
  else {
    return fullname;
  }
}

function transedi2ciq(paradic, edino, type) {
  var ciqno = '';
  if (type == "Domesticport" || type == "custom") {
    ciqno = (t = _.find(paradic, (m) => {
      return m.C_code == edino && m.paratype == type
    }), (t ? t.C_code : ''));
    if (!ciqno) {
      ciqno = edino;
    }
  }
  else {
    ciqno = (t = _.find(paradic, (m) => {
      return m.C_code == edino && m.paratype == type
    }), (t ? t.Q_code : ''));
    if (!ciqno) {
      ciqno = edino;
    }
  }
  return ciqno;
}

function transedi2ciqname(paradic, edino, type) {
  var ciqno = '';
  if (type == "Domesticport" || type == "custom") {
    ciqno = (t = _.find(paradic, (m) => {
      return m.C_code == edino && m.paratype == type
    }), (t ? t.C_name : ''));
    if (!ciqno) {
      ciqno = edino;
    }
  }
  else {
    ciqno = (t = _.find(paradic, (m) => {
      return m.C_code == edino && m.paratype == type
    }), (t ? t.Q_name : ''));
    if (!ciqno) {
      ciqno = edino;
    }
  }
  return ciqno;
}

function transhscode(hscode, cb) {
  sails.models.ciq2edi.findOne({ paratype: 'ciq_hscode', C_code: hscode })
    .then(ciqhs => {
      cb(ciqhs);
    })
}



function AutoFillCiqUnitbyFormhead(detail, ciqunit, aplgoods, paradic) {
  if (ciqunit) {


    //法定单位
    // aplgoods.QuantityUnitCode_Sta = ciqunit.std_measure_code;
    var stdQtystr = getQtybyUnitCode(ciqunit.std_measure_code, detail);
    setStdCiqQty(ciqunit.std_measure_code, ciqunit.measure_type_code, stdQtystr, aplgoods, paradic);

    var Qtystr = getQtybyUnitCode(ciqunit.std_measure_code, detail);
    setCiqQty(ciqunit.ciq_std_measure, ciqunit.ciq_measure_type, Qtystr, aplgoods, paradic);
  }
}

function getQtybyUnitCode(unitCode, detail) {
  if (detail.g_unit == unitCode) {
    return detail.qty_1;
  }
  else if (detail.unit_1 == unitCode) {
    return detail.qty_conv;
  }
  else {
    if (detail.unit_2 == unitCode)
      return detail.qty_2;
    else
      return "";
  }
}

function setCiqQty(unitcode, unittype, Qtystr, aplgoods, paradic) {
  var unitname = (t = _.find(paradic, (m) => {
    return m.C_code == unitcode && m.paratype == "Unit"
  }), (t ? t.C_name : ''));
  if (!unitcode)
    return;
  switch (unittype) {
    case "1"://数量
      aplgoods.Qty = Qtystr;
      aplgoods.Qty_Meas_Unit = unitcode;
      aplgoods.Qty_Unit_Name = unitname;
      break;
    case "2"://重量
      aplgoods.Weight = Qtystr;
      aplgoods.Wt_Meas_Unit = unitcode;
      aplgoods.Wt_Unit_Name = unitname;
      break;
    case "3":
      aplgoods.Qty = Qtystr;
      aplgoods.Qty_Meas_Unit = unitcode;
      aplgoods.Qty_Unit_Name = unitname;
      break;
    default:
      break;
  }
}


function setStdCiqQty(unitcode, unittype, Qtystr, aplgoods, paradic) {
  var unitname = (t = _.find(paradic, (m) => {
    return m.C_code == unitcode && m.paratype == "Unit"
  }), (t ? t.C_name : ''));
  if (!unitcode)
    return;
  switch (unittype) {
    case "1"://数量
      aplgoods.Std_Qty = Qtystr;
      aplgoods.Std_Qty_Unit_Code = unitcode;
      aplgoods.Std_Qty_Unit_Name = unitname;
      break;
    case "2"://重量
      aplgoods.Std_Weight = Qtystr;
      aplgoods.Std_Weight_Unit_Code = unitcode;
      aplgoods.Std_Weight_Unit_Name = unitname;
      break;
    case "3":
      aplgoods.Std_Qty = Qtystr;
      aplgoods.Std_Qty_Unit_Code = unitcode;
      aplgoods.Std_Qty_Unit_Name = unitname;
      break;
    default:
      break;
  }
}