'use strict'
module.exports = {
    getallUnit: function(req, res) {
        ciq2edi.find({ paratype: 'Unit' })
        .then(paras=>{
            res.json(paras);
        })
    }

};