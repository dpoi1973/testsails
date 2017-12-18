var assert = require('assert');

var request = require('supertest');


describe('para validate ',()=>{
        it('para curr 502 ',(done)=>{
            request(sails.hooks.http.app)
            .get('/formhead/validate?id=insur_curr&&value=5002')
           // .post('/ControllerActionAuth/register')
            .field('id', 'curr')
            .field('value','502')
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