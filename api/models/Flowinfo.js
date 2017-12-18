module.exports = {
    autoCreatedBy: false,
    attributes: {
        parentable: {
            "type": "String",
            "size": 150
        },
        parentid: {
            model: 'Dmanage'
        },
        flowid: {
            "type": "Integer",
            "size": 11
        },
        flowname: {
            "type": "String",
            "size": 150
        },
        memo: {
            "type": "String",
            "size": 255
        },
        operateperson: {
            "type": "String",
            "size": 150
        },
        operatedate: {
            "type": "datetime"
        },
        createdAt: {
            "type": "datetime"
        },
        updatedAt: {
            "type": "datetime"
        }
    }
}