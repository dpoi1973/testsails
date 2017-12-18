module.exports = {
    getQuery: function (req, res) {
        baoguantempletecopy.find({}).exec(function (err, data) {
            return res.json(data);
        })
    },


    transformtemplete: function (req, res) {
        var i = 0;
        baoguantempletecopy.find({}).exec(function (err, datas) {
            async.each(datas, function (data, cb) {
                console.log(i++);
                TemplateFormHead.findOne({ TempleteName: data.TempleteName }).then(tpl => {
                    if (!tpl) {
                        var elements = data.tempeleteElements;
                        delete data.tempeleteElements;
                        delete data.id;
                        TemplateFormHead.create(data).exec(function (err, temps) {
                            // console.log(err);
                            // console.log(temps);
                            async.each(elements, function (el, cb1) {
                                el.owner = temps.id;
                                TempleteElement.create(el).exec(function (nerr, ele) {
                                    cb1(nerr);
                                });
                            }, function (err) {
                                cb(err)
                            })
                        });
                    }
                    else {
                        cb();
                    }
                })
            }, function (err) {
                if (err)
                    res.json(err);
                else
                    res.json('ok');
            })

        })
    },

    savetemplete: function (req, res) {
        var source = req.body;

        var elements = source.tempeleteElements;
        //source.LastUpdatePersonName="";
        source.tempeleteElements = [];
        console.log(source);
        TemplateFormHead.create(source).exec(function (err, temps) {
            console.log(err)
            console.log(temps)
            console.log(temps.id)
            for (var i = 0; i < elements.length; i++) {
                var el = elements[i];
                el.owner = temps.id;
                //console.log(el)
                TempleteElement.create(el).exec(function (nerr, ele) {
                    console.log(nerr)
                    console.log(ele)
                });
            }
        });
    },


    mysqltomongo: function (req, res) {
        TemplateFormHead.find({}).exec(function (err, datas) {
            if (err) {
                res.json(err);
            } else {
                async.mapSeries(datas, function (data, callback) {
                    TempleteElement.find({ owner: data.id }).exec(function (err, temps) {
                        if (err) {
                            res.json(err);
                        } else if (temps.length > 0) {
                            delete data['templateObj'];
                            delete data['ciqObj'];
                            delete data['id'];
                            delete data['createdAt'];
                            delete data['updatedAt'];
                            delete data['formheadElements'];
                            async.mapSeries(temps, function (tem, cb) {
                                delete tem['Regex'];
                                delete tem['owner'];
                                delete tem['id'];
                                delete tem['createdAt'];
                                delete tem['updatedAt'];
                                delete tem['recordUpdateFlag'];
                                if (tem.selectedList) {
                                    tem.selectedList = tem.selectedList[0];
                                } else {
                                    tem.selectedList = '';
                                }
                                cb(null, tem);
                            }, function (err, temp) {
                                data.tempeleteElements = temp;
                                data.goodsCustid = "00000000-0000-0000-0000-000000000000";
                                data.CustID = "00000000-0000-0000-0000-000000000000";
                                console.log(data);
                                BaoguanTemplete.findOrCreate({TempleteName:data.TempleteName},data).exec(function (nerr, ele) {
                                    if (nerr) {
                                        callback(nerr);
                                    } else {
                                        console.log(ele)
                                        callback(null, data);
                                    }
                                });
                            });
                        } else {
                            delete data['templateObj'];
                            delete data['ciqObj'];
                            delete data['id'];
                            delete data['createdAt'];
                            delete data['updatedAt'];
                            delete data['formheadElements'];
                            data.tempeleteElements = [];
                            data.goodsCustid = "00000000-0000-0000-0000-000000000000";
                            data.CustID = "00000000-0000-0000-0000-000000000000";
                            BaoguanTemplete.findOrCreate({TempleteName:data.TempleteName}, data).exec(function (nerr, ele) {
                                if (nerr) {
                                    callback(nerr);
                                } else {
                                    console.log(ele)
                                    callback(null, data);
                                }
                            });
                        }
                    })
                }, function (err, results) {
                    if (err) {
                        console.log(err)
                        res.json(err)
                    } else {
                        console.log(results)
                        res.end('success')
                    }
                })
            }
        })
    }
}