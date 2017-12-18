'use strict'



var qr = require('qr-image')

var crypto = require('crypto');


var api = "https://open.weixin.qq.com/connect/oauth2/authorize";
var appid = "wxc235846a7eeb4780";
var uri = "http://wfj.miemietech.com/qr";

var mongoose = require('mongoose');
var mongodb = "mongodb://192.168.0.14/WechatDB_qy";
var options = {
  /*
  server:
  { socketOptions: { keepAlive: 1, connectTimeoutMS: 1500 }
      ,poolSize:100},
  replset:
  { socketOptions:
      { keepAlive: 1, connectTimeoutMS : 1500 }
  }
   */
};
mongoose.connect(mongodb, options, function (err) {
  if (err) {
    console.error('connect to %s error: ', mongodb, err.message);
    //  process.exit(1);
  }
});



var Schema = mongoose.Schema;
var SessionScanInfo = new Schema({
  sessionID: {
    type: String
  },
  wechatid: {
    type: String
  },
  username:{
    type:String
  },
  empinfo:{
    type:Object
  },
  createdate: {
    type: Date,
    default: Date.now
  }
})
SessionScanInfo.index({ sessionID: 1 }, { unique: true })
mongoose.model("SessionScanInfo", SessionScanInfo)



module.exports = {
  "logout":function(req,res){
    req.logout();
    delete req.user;
    delete req.session.passport;
    delete req.session.user;
    req.session.authenticated = false;
    res.ok();
  },
  "me": function (req, res) {
    if (_.isObject(req.session.user)||_.isObject(req.user))
      res.ok(req.session.user);
    else
      res.forbidden();

  },
  "weichatLogin": function (req, res) {
  
    //微信登录成功
  // req.session.qrID='f31bc2d4f0e489bd0f7a766b';
    if (!_.isString(req.session.qrID))
      return res.json({ status: "Error", message: 'no sessionid' });
    var qrID = '881f10a64b0f569214afea39';



    //const openid = '9304457279d28aa6b3c6920e';;

    var sessionModel = mongoose.model('SessionScanInfo')
    sessionModel.findOne({ sessionID: req.session.qrID })
      .then(data => {
        if(data.empinfo){
          console.log(data);
        const query = {
          identifier:data.wechatid,
          provider:'wechatid',
          protocol: 'openid'

        }
        data.empinfo.username = data.wechatid;
        data.empinfo.provider='wechatid';
        const profile  = data.empinfo;
      // sails.services.actionpermissionservice.connect
        sails.services.actionpermissionservice.connect(req,query,profile,function(err,user,passport){
          if(err){
            console.log(err);
            res.json(err);
          }
          else
          {
            user.empinfo = data.empinfo;          
            req.user = user;
            req.session.authenticated = true;
            req.session.user = user;
            req.session.passport = passport;
            console.log("OK",req.user);
            res.json(req.user);
          
        }

        })
      }
      else{
        console.log('err  no empinfo');
        res.error({err:'no empinfo'});
      }

      })
      .catch(err=>{
        console.log(err);
        res.json(err);
      });

      //   if (data) {
      //     if (data.empinfo) {

      //       return sails.models.passport.findOne({ identifier: wechatid });
      //     } else {

      //       res.forbidden({ err: 'weichatid not find' });
      //     }
      //   }
      // })
      // .then(passport => {
      //   if (passport) {
      //     sails.models.user.findOne({ id: passport.user }, function (err, user) {
      //       if (err) {
      //         throw err;
      //       }
      //       if (!user) {

      //         res.forbidden({ err: 'ser not find by empid' });
      //       } else {
      //         sails.models.passport.findOne({
      //           protocol: 'local',
      //           user: user.id
      //         }, function (err, passport) {
      //           if (passport) {

      //             req.user = user;
      //             req.session.authenticated = true;
      //             req.session.passport = passport;
      //             res.json(req.user);

      //           } else {
      //             req.flash('error', 'Error.Passport.Password.NotSet');
      //             return next(null, false);
      //           }
      //         });
      //       }
      //     });
      //   } else // create passport
      //   {
      //     saisl.models.user.create({ username: username }, function (err, userinfo) {
      //       if (err) {

      //       } else {
      //         return sails.models.passport.create({ protocol: 'local', provider: '', identifier: wechatid })

      //       }
      //     })
      //   }
      // })
      // .then(passport => {
      //   req.user = user;
      //   req.session.authenticated = true;
      //   req.session.passport = passport;
      //   res.json(req.user);
      // })
      // .catch(err => {
      //   res.send(403, err);
      // })
  },
  "getSessionid": function (req, res) {
    if (!_.isString(req.session.qrID))
      req.session.qrID = crypto.randomBytes(12).toString('hex');
    res.json({ qrid: req.session.qrID });


  },
  "weiChartQR": function (req, res) {

    if (!_.isString(req.session.qrID))
      req.session.qrID = crypto.randomBytes(12).toString('hex');

    var sessionModel = mongoose.model('SessionScanInfo')
    sessionModel.findOne({ sessionID: req.session.qrID })
      .then(data => {
        if (data) {
          console.log(data)
        } else {
          sessionModel.create({ sessionID: req.session.qrID }, function (error) {
            if (error) {
              console.log(error);
            } else {
              console.log('save ok');
              var dd = new Date();
              // console.log("now "+dd);
              dd.setDate(dd.getDate() - 3);
              // console.log("ss "+dd);
              sessionModel.find().where('createdate').lt(dd).then(data => {
                console.log(data);
                for (var i = 0; i < data.length; i++) {
                  sessionModel.remove(data[i], (err) => {
                    console.log('---clean db ---------------------------------------');
                    if (err) {
                      console.log(err);
                    }
                  })
                }
              });
            }
          })
        }
      })
      .catch(err => {
        console.log(err);
      })
    var text = `${api}?appid=${appid}&redirect_uri=${uri}&response_type=code&scope=snsapi_base&state=${req.session.qrID}#wechat_redirect`;
    console.log(text);
    try {
      var img = qr.image(text, { size: 10 });
      res.writeHead(200, { 'Content-Type': 'image/png' });
      img.pipe(res);
    } catch (e) {
      res.writeHead(414, { 'Content-Type': 'text/html' });
      res.end('<h1>414 Request-URI Too Large</h1>');
    }
  }
}
