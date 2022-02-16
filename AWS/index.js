require('dotenv').config();
const mysql = require('mysql2');
const { database } = require('./keys');
const { google } = require('googleapis');
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
});
const spreadsheetId = process.env.SPREADSHEET_ID;


exports.handler = async function (event) {
    const promise = new Promise(async function() {
        const conexion = mysql.createConnection({
            host: database.host,
            user: database.user,
            password: database.password,
            port: database.port,
            database: database.database
        });
        const client = await auth.getClient();
        const googleSheet = google.sheets({ version: 'v4', auth: client });
        try {
            var sql = `SELECT date,
            symbol,
            reportedCurrency, 
            cik,
            fillingDate,
            acceptedDate,
            calendarYear,
            period,
            cashAndCashEquivalents,
            shortTermInvestments,
            cashAndShortTermInvestments,
            netReceivables,
            inventory,
            otherCurrentAssets,
            totalCurrentAssets,
            propertyPlantEquipmentNet,
            goodwill,
            intangibleAssets,
            goodwillAndIntangibleAssets,
            longTermInvestments,
            taxAssets,
            otherNonCurrentAssets,
            totalNonCurrentAssets,
            otherAssets,
            totalAssets,
            accountPayables,
            shortTermDebt,
            taxPayables,
            deferredRevenue,
            otherCurrentLiabilities,
            totalCurrentLiabilities,
            longTermDebt,
            deferredRevenueNonCurrent,
            deferredTaxLiabilitiesNonCurrent,
            otherNonCurrentLiabilities,
            totalNonCurrentLiabilities,
            otherLiabilities,
            capitalLeaseObligations,
            totalLiabilities,
            preferredStock,
            commonStock,
            retainedEarnings,
            accumulatedOtherComprehensiveIncomeLoss,
            othertotalStockholdersEquity,
            totalStockholdersEquity,
            totalLiabilitiesAndStockholdersEquity,
            minorityInterest,
            totalEquity,
            totalLiabilitiesAndTotalEquity,
            totalInvestments,
            totalDebt,
            netDebt,
            link,
            finalLink FROM ${process.env.TABLE_BALANCE_SHEET}`;
            conexion.query(sql, function (err, resultado) {
                if (err) throw err;
                JSON.stringify(resultado);
                trasladarBalanceSheet(resultado);
            });
        } catch (error) {
            console.error(error);
        }
        async function trasladarBalanceSheet(resultado){
            try {
                await googleSheet.spreadsheets.values.clear({
                    auth,
                    spreadsheetId,
                    range: `${process.env.ID_HOJA_RANGO}`
                });
                var datos = [];
                for (let i = 0; i < resultado.length; i++) {
                    datos.push([
                        resultado[i].date,
                        resultado[i].symbol,
                        resultado[i].reportedCurrency,
                        resultado[i].cik,
                        resultado[i].fillingDate,
                        resultado[i].acceptedDate,
                        resultado[i].calendarYear,
                        resultado[i].period,
                        resultado[i].cashAndCashEquivalents,
                        resultado[i].shortTermInvestments,
                        resultado[i].cashAndShortTermInvestments,
                        resultado[i].netReceivables,
                        resultado[i].inventory,
                        resultado[i].otherCurrentAssets,
                        resultado[i].totalCurrentAssets,
                        resultado[i].propertyPlantEquipmentNet,
                        resultado[i].goodwill,
                        resultado[i].intangibleAssets,
                        resultado[i].goodwillAndIntangibleAssets,
                        resultado[i].longTermInvestments,
                        resultado[i].taxAssets,
                        resultado[i].otherNonCurrentAssets,
                        resultado[i].totalNonCurrentAssets,
                        resultado[i].otherAssets,
                        resultado[i].totalAssets,
                        resultado[i].accountPayables,
                        resultado[i].shortTermDebt,
                        resultado[i].taxPayables,
                        resultado[i].deferredRevenue,
                        resultado[i].otherCurrentLiabilities,
                        resultado[i].totalCurrentLiabilities,
                        resultado[i].longTermDebt,
                        resultado[i].deferredRevenueNonCurrent,
                        resultado[i].deferredTaxLiabilitiesNonCurrent,
                        resultado[i].otherNonCurrentLiabilities,
                        resultado[i].totalNonCurrentLiabilities,
                        resultado[i].otherLiabilities,
                        resultado[i].capitalLeaseObligations,
                        resultado[i].totalLiabilities,
                        resultado[i].preferredStock,
                        resultado[i].commonStock,
                        resultado[i].retainedEarnings,
                        resultado[i].accumulatedOtherComprehensiveIncomeLoss,
                        resultado[i].othertotalStockholdersEquity,
                        resultado[i].totalStockholdersEquity,
                        resultado[i].totalLiabilitiesAndStockholdersEquity,
                        resultado[i].minorityInterest,
                        resultado[i].totalEquity,
                        resultado[i].totalLiabilitiesAndTotalEquity,
                        resultado[i].totalInvestments,
                        resultado[i].totalDebt,
                        resultado[i].netDebt,
                        resultado[i].link,
                        resultado[i].finalLink
                    ]);
                }
                await googleSheet.spreadsheets.values.append({
                    auth,
                    spreadsheetId,
                    range: `${process.env.ID_HOJA_RANGO}`,
                    valueInputOption: "USER_ENTERED",
                    requestBody: {
                        "range": `${process.env.ID_HOJA_RANGO}`,
                        "values": datos
                    }
                });
                console.log('Datos agregados correctamente.');
            } catch (error) {
                console.error(error);
            }
            await finalizarEjecucion();
        };
        async function finalizarEjecucion() {
            conexion.end()
        }
    });
    return promise;
};