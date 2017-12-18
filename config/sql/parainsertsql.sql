
insert into helppara
(paratypeName,paraCode,paraRawName,paraHelpEn,keyUni,paraDisplayName,paraOtherJson)



select '币制' paratype,CURR_CODE,CURR_NAME,CURR_SYMB,CONCAT(CURR_SYMB,CURR_CODE),CONCAT(CURR_NAME,'[',CURR_CODE,']'), JSON_OBJECT('RMBRate',RMBRate,'USDRate',USDRate) from CURR


select * from CURR

insert into helppara
(paratypeName,paraCode,paraRawName,paraHelpEn,keyUni,paraDisplayName)





select '国别' paratype,country_co,country_na,country_en,CONCAT(country_en,country_co),CONCAT(country_na,'[',country_co,']')  from  invoiceCountryView

