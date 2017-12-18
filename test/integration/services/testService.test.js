var assert = require('assert');

describe('Common Service', function() {

  it('should exist', function() {

    assert.ok(sails.services.baseutilservice);
    assert.ok(global.baseUtilService);

  });

  describe('#getWhereCondition(condition)', function() {

    it('should return true if object is not owned by the requesting user', function(done) {

      var objectNotOwnedByUser = {
        owner: 2
      };
      const conditionallNumber ={ "condition": {"custid":-1},  "pageIndex": 1, "sortby": "id ASC", "pageSize": 50 };
      const wherecondition={  };
      const conditionString = { "condition": {"username":'test'},  "pageIndex": 1, "sortby": "id ASC", "pageSize": 50 };
      let tt= sails.services.baseutilservice.getWhereCondition(conditionallNumber.condition);
      let zz= sails.services.baseutilservice.getWhereCondition(conditionString.condition);
      assert.equal(JSON.stringify(tt), JSON.stringify(wherecondition));
      assert.equal(JSON.stringify(sails.services.baseutilservice.getWhereCondition(conditionString.condition)), JSON.stringify({"username":{contains:'test'}}));

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
