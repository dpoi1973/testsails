module.exports = {
    autoCreatedBy: false,
    attributes: {
        charge_type: {
            "type": "String",
            "size": 50
        },
        unit: {
            "type": "String",
            "size": 50
        },
        chargenum: {
            "type": "integer"
        },
        companyid: {
            model: 'Company'
        },
        back1: {
            "type": "String",
            "size": 50
        },
        back2: {
            "type": "String",
            "size": 50
        },
        back3: {
            "type": "String",
            "size": 50
        },
        back4: {
            "type": "String",
            "size": 50
        },
        back5: {
            "type": "String",
            "size": 50
        },
        createdAt: {
            "type": "datetime"
        },
        updatedAt: {
            "type": "datetime"
        }
    }
}