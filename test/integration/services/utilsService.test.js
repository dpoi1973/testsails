var assert = require('assert');



describe('#groupby(condition)', function () {
    it('should exist', function () {

        assert.ok(sails.services.utilsservice);
        assert.ok(global.utilsService);

    });


    it('should return result after group', function (done) {


        QuanqiuYWInfo.findOne({ custYWNO: 'sadas' }).then(function (quanqiuywinfo) {
            
            var quanqiuplinfo = quanqiuywinfo.PL;
            for (var i = 0; i < 500; i++) {
                quanqiuplinfo.push(quanqiuplinfo[0]);
            }
           // console.log(new Date());
            var groupargs = ['HPPartNo', 'Description', 'company', 'OriginCountry', 'ChineseDescr', 'productgroup'];
            let tt = sails.services.utilsservice.groupby(quanqiuplinfo, groupargs);
           // console.log(new Date());
            //console.log(tt);
            done();
        })
    });
})