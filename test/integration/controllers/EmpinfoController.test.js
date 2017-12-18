var assert = require('assert');
var request = require('supertest');
var _ = require('lodash');

var adminAuth = {
    Authorization: 'Basic YWRtaW46YWRtaW4xMjM0'
};
var registersuser={
    username:'kensundjj',
    emailaddress:'kensun@',
    password:'kensun117'
};

var adminuser= {identifier:'admin',password:'admin1234'}

// describe('EmpinfoController ',function(){
//     describe()

// });

 describe('ControllerActionAuth Controller', function () {
     
    // describe('login as admin',()=>{
    //     it('login ok',(done)=>{
    //         request(sails.hooks.http.app)
    //         .post('/register')
    //         .field('identifier', adminuser.identifier)
    //         .field('password',adminuser.password)
    //         .expect(200)
    //         .end((err,res)=>{
    //          console.log(err,res);

    //             var resultuser=res;
    //             assert.equal(resultuser.username=adminuser.identifier);
    //         })

    //     })

    // });
    describe('public register',()=>{
        it('should be return username',(done)=>{
            request(sails.hooks.http.app)
            .post('/userregister')
            
           // .post('/ControllerActionAuth/register')
            .field('username', registersuser.username)
            .field('password',registersuser.password)
            .expect(200)
            .end((err,res)=>{
                console.log(err,res.body);
                
                const resultuser=res.body;
                assert.ifError(err);
                assert.ifError(resultuser.error);
                assert.equal(resultuser.username,registersuser.username);
                done(err);
            });

        })
    });
    describe('admin re register',()=>{
        it('should be return 用户已存在',(done)=>{
            request(sails.hooks.http.app)
            .post('/userregister')
            .field('username', 'admin')
            .field('password',registersuser.password)
            .expect(400)
            .end((err,res)=>{           
                const result=res.body;
                console.log('zz'+result);
                assert.ifError(err);
              
                //assert.ifError(resultuser.error);
                assert.equal('用户已存在',result.error);
                done(err);
            });

        })

    });
});
