module.exports = {
    geteEDINObyCOPNO: function (req, res) {
        var COP_NO = req.query.COP_NO;
        if (COP_NO) {
            EDINOInfos.findOne({ AllocateCOPNO: COP_NO })
                .then(result => {
                    if (result) {
                        res.json(result.EDI_NO);
                    }
                    else {
                        res.json('');
                    }
                })
        }
        else{
            res.json('');
        }
    }
}