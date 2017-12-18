module.exports = {
    connection: 'mysqldev74',
    autoCreatedBy: false,
    // connection: 'redis',
    attributes: {
        ie_flag: {
          type: 'string'
        },
        pre_entry_id: {
          type: 'string'
        },
        agent_code: {
          type: 'string'
        },
        agent_name: {
          type: 'string'
        },
        is_status: {
         type: 'string'
        },
        username: {
          type: 'string'
        },
        create_date: {
          type: 'string'
        },
        del_flag: {
          type: 'string'
        },
        "EDI_NO": {
          type: 'string',
          primaryKey: true
        },
        "COP_NO": {
          type: 'string'
        },
        "DECL_PORT": {
          type: 'string'
        },
        "AllocateCOPNO": {
          type: 'string'
        }
    }
}