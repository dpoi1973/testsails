'use strict'
var loopback = require('loopback');

module.exports = {
    searchby: function (req, res) {
        let condition = req.body;
        let whereObj = utilsService.getWhereCondition(condition.condition);
        var responseresult = { status: '', totalCount: 0, pageIndex: 0, pageSize: 0, datas: [] };
        TemplateFormHead.count({ where: whereObj }).then(function (resultcount) {
            responseresult.totalCount = resultcount;

            return TemplateFormHead.find({
                where: whereObj,
                skip: (condition.pageIndex - 1) * condition.pageSize,
                limit: condition.pageSize,
                select: ['TempleteName', 'CreateDate', 'CreatePersonName', 'LastUpdateDate', 'LastUpdatePersonName', 'id'],
                sort: condition.sortby?condition.sortby:null
            });
        })
            .then(function (results) {
                responseresult.status = 'OK';
                responseresult.datas = results;
                res.json(responseresult);
            })
            .error(function (er) {
                res.json({ status: 'error', err: er.message });
            });
    },

    getMubanObj: function (req, res) {
        var name = req.param('name');

        TemplateFormHead.findOne({ TempleteName: name })
            .populate('formheadElements')

            .then(updaterecord => {
                //console.log(updaterecord);

                if (updaterecord.templateObj) {
                    res.json(updaterecord)
                }
                else {
                    FormHead.find().limit(1).then(stuctls => {
                        var stuct = stuctls[0];
                        var result = {};
                        result.TempleteName = updaterecord.TempleteName;
                        var len = updaterecord.formheadElements.length;
                        while (len--) {
                            result[updaterecord.formheadElements[len].fieldName] = {};
                            result[updaterecord.formheadElements[len].fieldName].value = updaterecord.formheadElements[len].defaultValue;
                            result[updaterecord.formheadElements[len].fieldName].readonly = !updaterecord.formheadElements[len].canModify;
                            result[updaterecord.formheadElements[len].fieldName].required = updaterecord.formheadElements[len].required;
                            result[updaterecord.formheadElements[len].fieldName].Regex = updaterecord.formheadElements[len].Regex;
                        }
                        for (var key in stuct) {
                            if (result[key] == null) {
                                result[key] = {};
                                result[key].value = '';
                                result[key].readonly = false;
                                result[key].required = false;
                                result[key].Regex = '';
                            }
                        }
                        updaterecord.formheadElements=null;
                        delete updaterecord.formheadElements;
                        updaterecord.templateObj = result;
                        res.json(updaterecord)
                    })
                }
            })

            .error(er => {
                res.json({ status: 'error', err: er.message });
            });


    },

    getFormHeadTemplatebyID(req, res) {
        var id = req.params.id;

        TemplateFormHead.findOne({ id: id })
            .populate('formheadElements')

            .then(updaterecord => {
                //console.log(updaterecord);
                res.json(updaterecord)
            })

            .error(er => {
                res.json({ status: 'error', err: er.message });
            });


    },

    // findOne: function (req, res) {
    //     // var id=req.id;
    //     TemplateFormHead.findOne({ id: req.param('id') })
    //         .populate(['formheadElements'])
    //         .then(data => {
    //             return res.json(data);

    //         })
    //         .catch(err => {
    //             return res.err(err);
    //         })

    // },



    updateTemplateElements(req, res) {
        var id = req.param[id];


        var updatejson = req.body;

        // Promise.delay(10).then(function() {

        //         return [ TempleteElement.update({ id: id }, updatejson),
        //             fs.readFileAsync("file2.txt")
        //         ];
        //     }).all()
        //     .then(function([file1text, file2text]) {
        //         if (file1text === file2text) {
        //             console.log("files are equal");
        //         } else {
        //             console.log("files are not equal");
        //         }
        //     });

        // var exsist=_.filter(updatejson.formheadElements,function(ele){
        //     return ele.id>0;
        // })
        var newobj = _.filter(updatejson.formheadElements, function (ele) {
            return ele.id < 0;
        })
        //updatejson.formheadElements=exsist;



        for (var j = 0; j < newobj.length; j++) {
            delete newobj[j].id;
            //     console.log(newobj[j])
            // TempleteElement.findOrCreate(newobj[j]).exec(function(err,fin){

            //})
        }


        TemplateFormHead.update({ id: updatejson.id }, updatejson)
            .then(updaterecord => {

                res.json({ status: 'OK', resultdata: updaterecord })
            })
            .error(er => {
                //console.log(er);
                res.json({ status: 'error', err: er.message });
            });









    },
    update: function (req, res) {
        var id = req.param('id');


        var updatejson = req.body;
        var newobj = _.filter(updatejson.formheadElements, function (ele) {
            return ele.id < 0;
        })
        //updatejson.formheadElements=exsist;



        for (var j = 0; j < newobj.length; j++) {
            delete newobj[j].id;
            //     console.log(newobj[j])
            // TempleteElement.findOrCreate(newobj[j]).exec(function(err,fin){

            //})
        }


        TemplateFormHead.update({ id: updatejson.id }, updatejson)
            .then(updaterecord => {

                res.json(updaterecord[0])
            })
            .error(er => {
                //console.log(er);
                res.json({ status: 'error', err: er.message });
            });

    },
    getDBmodel(req, res) {
        var typeconf = {
            mssql: {
                nvarchar: "string",
                varchar: "string",
                char: "string",
                nchar: "string",
                uniqueidentifier: "string",
                money: "number",
                decimal: "number",
                bit: "boolean",
                binary: "buffer",
                datetime: "date",
                date: "date",
                int: "number"
            },
            mysql: {
                nvarchar: "string",
                varchar: "string",
                char: "string",
                nchar: "string",
                uniqueidentifier: "string",
                money: "number",
                decimal: "number",
                bit: "boolean",
                binary: "buffer",
                datetime: "date",
                date: "date",
                int: "number",
                longtext: "string"
            },
        }

        var sqlpara = req.body;
        if (sqlpara.type) {
            var ds = loopback.createDataSource(sqlpara.type, sqlpara.config);
            ds.discoverModelProperties(sqlpara.table, function (err, props) {
                console.log(props);
                var saildef = {};
                saildef.attributes = {};
                if (typeconf[sqlpara.type]) {
                    props.forEach(function (cb) {
                        console.log(cb);
                        // console.log(defs.getPropertyType(cb));
                        saildef.attributes[cb.columnName] = {};
                        if (typeconf[sqlpara.type][cb.dataType]) {
                            saildef.attributes[cb.columnName].type = typeconf[sqlpara.type][cb.dataType];
                        }
                        else {
                            saildef.attributes[cb.columnName].type = "any";
                        }
                        if (cb.dataLength) {
                            saildef.attributes[cb.columnName].size = cb.dataLength;
                        }

                    });
                }
                else {
                    props.forEach(function (cb) {
                        console.log(cb);
                        // console.log(defs.getPropertyType(cb));
                        saildef.attributes[cb.columnName] = {};
                        saildef.attributes[cb.columnName].type = cb.dataType;
                        saildef.attributes[cb.columnName].size = cb.dataLength;
                    });
                }
                res.json(saildef);

            });
        }
        else {
            res.json("");
        }





    },
    gettemplatename(req,res){
        TemplateFormHead.find({ select: ['TempleteName']})
        .then(result=>{
           return res.json(result);
        })
    }


};