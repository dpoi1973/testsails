module.exports = {
    autoCreatedBy: false,
    attributes: {
        trade_name: {
            "type": "String",
            "size": 255
        },
        settlement_name: {
            "type": "String",
            "size": 255
        },
        contract_name: {
            "type": "String",
            "size": 255
        },
        trade_code:{
            "type": "String",
            "size": 50
        },
        account: {
            "type": "String",
            "size": 50
        },
        password: {
            "type": "String",
            "size": 50
        },
        records: {
            "type": "String",
            "size": 50
        },
        upload_company: {
            "type": "String",
            "size": 255
        },
        hand_mode: {
            "type": "String",
            "size": 255
        },
        hand_detail: {
            "type": "String",
            "size": 255
        },
        settlement_mode: {
            "type": "String",
            "size": 50
        },
        unsettlement_money: {
            "type": "String",
            "size": 50
        },
        unback_money: {
            "type": "String",
            "size": 50
        },
        chargeid: {
            "type": "String",
            "size": 50
        },
        contractid: {
            "type": "String",
            "size": 50
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
        },
        charge: {
            collection: 'charge',
            via: 'companyid'
        }
    }
}