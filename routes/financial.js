const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const app = express();
app.use(bodyParser.json());
const {
    financialLiteracy,
    investmentCalculations,
    cagr,
    roi,
    compoundInterest,
    loanArmotization, 
    getHome,
    historicalStockData,
    discountFactor,
    futureValue,
    budgetCalculations,
    npv,
    accountingCalculations,
    testPdf} = require('../controllers/financialData');

router.route('/').get(getHome)
router.route('/financial-literacy').post(financialLiteracy)
router.route('/investment-calculations').post(investmentCalculations)
router.route('/compoundInterest').post(compoundInterest)
router.route('/loan-armotization').post(loanArmotization)
router.route('/cagr').post(cagr)
router.route('/historicalStockData').post(historicalStockData)
router.route('/discountFactor').post(discountFactor)
router.route('/futureValue').post(futureValue)
router.route('/budgetCalculations').post(budgetCalculations)
router.route('/roi').post(roi)
router.route('/npv').post(npv)
router.route('/accountingCalculations').post(accountingCalculations)
router.route('/testPdf').get(testPdf)
// router.route('/').get(getHome)
// router.route('/financial-literacy').post(financialLiteracy)
// router.route('/investment-calculations').post(investmentCalculations)
// router.')

module.exports = router;