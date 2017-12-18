var assert = require('assert');

describe('action permisson Service', function() {

  it('should exist', function() {

    assert.ok(sails.services.actionpermissionservice);
    assert.ok(global.actionpermissionservice);

  });

  describe('#addRolestoUser', function() {

    it('add roles to user ', function(done) {

      var objectNotOwnedByUser = {
        owner: 2
      };

      const username='admin';
     // const roles=
      let tt= sails.services.actionpermissionservice.addRolesToUser(username,["admin"]);
      const conditionallNumber ={ "condition": {"custid":-1},  "pageIndex": 1, "sortby": "id ASC", "pageSize": 50 };
      const wherecondition={  };
      const conditionString = { "condition": {"username":'test'},  "pageIndex": 1, "sortby": "id ASC", "pageSize": 50 };
     // assert.equal(JSON.stringify(sails.services.baseutilservice.getWhereCondition(conditionallNumber.condition)), JSON.stringify(wherecondition));
      //assert.equal(JSON.stringify(sails.services.baseutilservice.getWhereCondition(conditionString.condition)), JSON.stringify({"username":{contains:'test'}}));

      done();

    });
    it('should return or not convert', function(done) {

      var objectNotOwnedByUser = {
        owner: 2
      };
      const conditionallNumber ={ "condition": {"custid":-1},  "pageIndex": 1, "sortby": "id ASC", "pageSize": 50 };
      const wherecondition={  };
      const conditionString = { "condition": {"username":'test'},  "pageIndex": 1, "sortby": "id ASC", "pageSize": 50 };
      assert.equal(JSON.stringify(sails.services.baseutilservice.getWhereCondition(conditionallNumber.condition)), JSON.stringify(wherecondition));
      assert.equal(JSON.stringify(sails.services.baseutilservice.getWhereCondition(conditionString.condition)), JSON.stringify({"username":{contains:'test'}}));

      done();

    });
    

    it('should return false if object is owned by the requesting user', function(done) {

      var objectOwnedByUser = {
        owner: 1
      };
      var user = 1;

      assert.equal(sails.services.permissionservice.isForeignObject(user)(objectOwnedByUser), false);

      done();
    });

  });

  

 
  //TODO: add unit tests for #findTargetObjects()

  //TODO: add unit tests for #findModelPermissions()

});
