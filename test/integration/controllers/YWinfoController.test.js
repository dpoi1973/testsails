var assert = require('assert');

var request = require('supertest');


describe('public register',()=>{
        it('should be return username',(done)=>{
            request(sails.hooks.http.app)
            .get('/userregister')
           // .post('/ControllerActionAuth/register')
            .field('id', 'registersuser.username')
            //.field('password',registersuser.password)
            .expect(200)
            .end((err,res)=>{
               // console.log(err,res.body);
                
                const resultuser=res.body;
                assert.ifError(err);
                assert.ifError(resultuser.error);
                assert.equal(resultuser.username,registersuser.username);
                done(err);
            });

        })
    });