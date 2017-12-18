module.exports = {
    init: function (req, res) {
        var obj = {};
        obj.custname = '安捷伦科技(中国)有限公司';
        obj.custid = 806;
        obj.invoiceconfig = {};
        obj.invoiceconfig['Top Model Harmonized Tariff Code_NATL'] = 'HSCode';
        obj.invoiceconfig['Country of Origin Code'] = 'COO';
        obj.invoiceconfig['Item Number'] = 'sku';
        obj.invoiceconfig['Quant Shipped'] = 'Qty';
        obj.invoiceconfig['Net Weight'] = 'NetWeight';
        obj.invoiceconfig['realdeclprice'] = 'Price'; 
        obj.invoiceconfig['realtotalprice'] = 'TotalPriceCIF';
        parseconfig.create(obj)
            .then(data => {
                res.json(data);
            })
            .catch(err => {
                res.json(err);
            })
    }
}