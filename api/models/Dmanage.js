module.exports = {
    autoCreatedBy: false,
    attributes: {
        sku: {
            "type": "String",
            "size": 255
        },
        companyid: {
            "type": "Integer",
            "size": 50
        },
        trade_name: {
            "type": "String",
            "size": 255
        },
        specifications_model: {
            "type": "String",
            "size": 255
        },
        goods_name: {
            "type": "String",
            "size": 255
        },
        goods_nameEN: {
            "type": "String",
            "size": 255
        },
        other_name: {
            "type": "String",
            "size": 255
        },
        hs_code: {
            "type": "String",
            "size": 50
        },
        cspec: {
            "type": "String",
        },
        goods_description: {
            "type": "String"
        },
        classify_basis: {
            "type": "String"
        },
        goods_description_archive: {
            "type": "String",
            "size": 500
        },
        submissions_archive: {
            "type": "String",
            "size": 500
        },
        errmemo: {
            "type": "String",
            "size": 500
        },
        finallcharge: {
            "type": "Integer",
            "size": 50
        },
        declaredate: {
            "type": "String",
            "size": 50
        },
        valididate: {
            "type": "String",
            "size": 50
        },
        updateperson: {
            "type": "String",
            "size": 50
        },
        back3: {
            "type": "String",
            "size": 255
        },
        innerno: {
            "type": "String",
            "size": 50
        },
        innerstatus: {
            "type": "String",
            "size": 50
        },
        dataflag: {
            "type": "Boolean",
            "size": 1
        },
        cancelflag: {
            "type": "Boolean",
            "size": 1
        },
        sycroflag: {
            "type": "Boolean",
            "size": 1
        },
        createdAt: {
            "type": "datetime"
        },
        updatedAt: {
            "type": "datetime"
        },
        flowinfo: {
            collection: 'Flowinfo',
            via: 'parentid'
        }
    }
}