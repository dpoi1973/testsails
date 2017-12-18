module.exports = {
    autoCreatedBy: false,
    attributes: {

        "serialno": {
            type: 'integer'
        },

        "templeteElementName": {
            type: 'String'
        },
        "fieldName": {
            type: 'String'
        },
        "fieldReadName": {
            type: 'String'
        },
        "defaultValue": {
            type: 'String'
        },
        "canModify": {
            type: 'boolean'
        },
        "templeteElementMemo": {
            type: 'String'
        },
        "selectedList": {
            type: 'array'
        },
        "required": {
            type: 'boolean'
        },
        "eventStr": {
            type: 'String'
        },
        "arrayFieldname": {
            type: 'String'
        },
        "Regex": {
            type: 'String'
        },

        owner: {
            model: 'templateformhead'
        },
        toJSON: function() {
            var obj = this.toObject();
            obj.recordUpdateFlag = 0;
            return obj;
        }
    }

}