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
router.route('https://basic-finance.vercel.app/financial-literacy').post(financialLiteracy)
router.route('https://basic-finance.vercel.app/investment-calculations').post(investmentCalculations)
router.route('https://basic-finance.vercel.app/compoundInterest').post(compoundInterest)
router.route('https://basic-finance.vercel.app/loan-armotization').post(loanArmotization)
router.route('https://basic-finance.vercel.app/cagr').post(cagr)
router.route('https://basic-finance.vercel.app/historicalStockData').post(historicalStockData)
router.route('https://basic-finance.vercel.app/discountFactor').post(discountFactor)
router.route('https://basic-finance.vercel.app/futureValue').post(futureValue)
router.route('https://basic-finance.vercel.app/budgetCalculations').post(budgetCalculations)
router.route('https://basic-finance.vercel.app/roi').post(roi)
router.route('https://basic-finance.vercel.app/npv').post(npv)
router.route('https://basic-finance.vercel.app/accountingCalculations').post(accountingCalculations)
router.route('https://basic-finance.vercel.app/testPdf').get(testPdf)
// router.route('/').get(getHome)
// router.route('/financial-literacy').post(financialLiteracy)
// router.route('/investment-calculations').post(investmentCalculations)
// router.')

module.exports = router;