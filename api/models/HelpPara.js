module.exports = {
    connection: 'paralocalMysqlServer',
    // connection: 'redis',
    attributes: {
        paratypeName: {
            type: 'string',
            size: 20,
            required: true
        },
        paraCode: {
            type: 'string',
            size: 10
        },
        paraRawName: {
            type: 'string',
            size: 50
        },
        paraHelpEn: {
            type: 'string',
            size: 50
        },
        paraOtherJson: {
            type: 'json'
        },
        keyUni: {
            type: 'string'
        },
        paraDisplayName: {
            type: 'string',
            size: 50

        }


    }
}