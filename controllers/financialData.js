const Finance = require('financejs');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const yahooFinance = require('yahoo-finance');
const express = require('express');
const bodyParser = require('body-parser');
const portfolio = require('finance')
const app = express();
app.use(bodyParser.json());

const getHome = (req, res) => {
    res.status(200).sendFile(__dirname + '/public/index.html');
}
const testPdf = async(req, res)=>{
    const {title} = req.query
    try{
        const PDFdoc = await PDFDocument.create();
        const page = PDFdoc.addPage([300, 400]);
        const font = await PDFdoc.embedFont(PDFDocument.Font.Helvetica);
        const text = "Hello World";
        const fontSize = 24;
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);
        const pageWidth = page.getSize().width;
        const pageHeight = page.getSize().height;

        page.drawText(text, {
            x: (pageWidth - textWidth) / 2,
            y: (pageHeight - textHeight) / 2,
            size: fontSize,
            font: font,
        });
        const pdfBytes = await PDFdoc.save();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=example.pdf");
        res.send(Buffer.from(pdfBytes));  
    }
    catch(err){
        res.status(500).send("Error generating PDF");
        console.error(err);
    }
}


const loanArmotization = (req, res) => {
    const { loanAmount, interestRate, loanPeriod } = req.query;
    try{
        const finance = new Finance();
        const result = finance.AM(loanAmount, loanPeriod, interestRate);
        res.status(200).json(result);
    }
    catch(err){
        res.status(500).json({error: err})
    }
}

const compoundInterest = (req, res) => {
    const {interestRate, compoundPeriods, principal, periodsRemaining} = req.body;
    try{
        const finance = new Finance();
        const result = finance.CI(interestRate, compoundPeriods, principal, periodsRemaining);
        res.status(200).json(result)
    }
    catch(err){
        res.status(500).json({error: err})
    }
}

const futureValue = (req, res) => {
    const {rate, amount, periods} = req.query;
    try{
        const finance = new Finance();
        const result = finance.FV(rate, amount, periods);
        res.status(200).json(result)
    }
    catch(err){
        res.status(500).json({error: err})
    }
}

async function createMonthlyBudgetDoc(totalIncome, totalExpenses, totalSavings, savingsGoal, surplusDeficit, incomeToExpensesRatio){
    const pdfDoc = await PDFDocument.create();
    const primaryFont = await pdfDoc.embedFont(fontkit.openSync('fonts/Lato-Regular.ttf'));
    const secondaryFont = await pdfDoc.embedFont(fontkit.openSync('fonts/PlusJakartaSans-VariableFont_wght.ttf'));
    const highlightFont = await pdfDoc.embedFont(fontkit.openSync('fonts/Lato-Light.ttf'));
    const page = pdfDoc.addPage();
    const {width, height} = page.getSize();

    const titleFontSize = 30
    const subtitleFontSize = 18.5
    const normalTextFontSize = 12
    const higlightsFontSize = 11
    page.drawText('Monthly Budget Breakdown', {
        x: width / 2,
        y: height - 4 * normalTextFontSize,
        size: titleFontSize,
        font: primaryFont,
        color: 'black',
    })

    page.drawText('Total Monthly Income', {
        x: 50,
        y: height - 6 * normalTextFontSize,
        size: normalTextFontSize,
        font: secondaryFont,
        color: 'black'
    })

    page.drawText(`${totalIncome}`,{
        x: 200,
        y: height - 6 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Total Monthly Expenses', {
        x: 50,
        y: height - 8 * normalTextFontSize,
        size: normalTextFontSize,
        font: secondaryFont,
        color: 'black'
    })

    page.drawText(`${totalExpenses}`,{
        x: 200,
        y: height - 8 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Surplus or Deficit', {
        x: 50,
        y: height - 10 * normalTextFontSize,
        size: normalTextFontSize,
        font: secondaryFont,
        color: 'black'
    })

    page.drawText(`${surplusDeficit}`,{
        x: 200,
        y: height - 10 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: `${surplusDeficit > 0 ? 'green' : 'red'}`
    })

    page.drawText('Total Monthly Savings', {
        x: 50,
        y: height - 12 * normalTextFontSize,
        size: normalTextFontSize,
        font: secondaryFont,
        color: 'black'
    })

    page.drawText(`${totalSavings}`,{
        x: 200,
        y: height - 12 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Savings Goal (For next month)', {
        x: 50,
        y: height - 14 * normalTextFontSize,
        size: normalTextFontSize,
        font: secondaryFont,
        color: 'black'
    })

    page.drawText(`${savingsGoal}`,{
        x: 200,
        y: height - 14 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Budget Ratios', {
        x: width / 2,
        y: height - 15 * normalTextFontSize,
        size: normalTextFontSize,
        font: secondaryFont,
        color: 'black'
    })

    page.drawText('Income to Expenses', {
        x: 50,
        y: height - 16 * normalTextFontSize,
        size: normalTextFontSize,
        font: secondaryFont,
        color: 'black'
    })

    page.drawText(`${incomeToExpensesRatio}`, {
        x: 200,
        y: height - 16 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: `${incomeToExpensesRatio > 1 ? 'green' : 'red'}`
    })

    return pdfDoc;
}




const budgetCalculations = async (req, res) => {
    const {totalIncome, totalExpenses, totalSavings, savingsGoal} = req.body;
    try{
        const incomeToExpensesRatio =  totalExpenses / totalIncome;
        const savingsToGoalRatio = Number(totalSavings) / Number(savingsGoal);
        const surplusDeficit = totalIncome - totalExpenses;
        const surplusDeficitRatio = surplusDeficit / totalIncome;
        res.status(200).json({incomeToExpensesRatio: incomeToExpensesRatio, savingsToGoalRatio: savingsToGoalRatio, surplusDeficitRatio: surplusDeficitRatio, surplusDeficit: surplusDeficit})
    }
    catch(err){
        res.status(500).json({error: err})
    } 
}

async function createPDF(company, revenue, costOfRevenue, grossProfit, operatingExpenses, operatingIncome, corporateTax, netProfit, grossMargin, operatingMargin, profitMargin){
    const pdfDoc = await PDFDocument.create();
    //add fonts here

    const primaryFont = await pdfDoc.embedFont(fontkit.openSync('fonts/Lato-Regular.ttf'));
    const secondaryFont = await pdfDoc.embedFont(fontkit.openSync('fonts/PlusJakartaSans-VariableFont_wght.ttf'));
    const highlightFont = await pdfDoc.embedFont(fontkit.openSync('fonts/Lato-Light.ttf'));
    const page = pdfDoc.addPage();
    const {width, height} = page.getSize();

    const titleFontSize = 30
    const subtitleFontSize = 18.5
    const normalTextFontSize = 12
    const higlightsFontSize = 11
    page.drawText(`${company}`, {
        x: width / 2,
        y: height - 4 * normalTextFontSize,
        size: titleFontSize,
        font: primaryFont,
        color: 'black',
    })

    page.drawText('Income Statement', {
        x: width / 2,
        y: height - 6 * normalTextFontSize,
        size: subtitleFontSize,
        font: secondaryFont,
        color: 'black',
    })

    page.drawText('Revenue', {
        x: 50,
        y: height - 8 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black',
    })

    page.drawText(`${revenue}`,{
        x: 200,
        y: height - 8 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black',
    })

    page.drawText('Cost of Revenue', {
        x: 50,
        y: height - 10 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black',
    })

    page.drawText(`${costOfRevenue}`,{
        x: 200,
        y: height - 10 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black',
    })

    page.drawText('Gross Profit', {
        x: 50,
        y: height - 12 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont, 
        color: 'black'
    })

    page.drawText(`${grossProfit}`,{
        x: 200,
        y: height - 12 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Operating Expenses', {
        x: 50,
        y: height - 14 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText(`${operatingExpenses}`, {
        x: 200,
        y: height - 14 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Operating Income', {
        x: 50,
        y: height - 16 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText(`${operatingIncome}`,{
        x: 200,
        y: height - 16 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Tax Expense',{
        x: 50,
        y: height - 18 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText(`${corporateTax}`,{
        x: 200,
        y: height - 18 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Net Income', {
        x: 50,
        y: height - 20 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText(`${netProfit}`,{
        x: 200,
        y: height - 20 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Financial Ratios',{
        x: 50,
        y: height - 22 * normalTextFontSize,
        size: normalTextFontSize,
        font: secondaryFont,
        color: 'black'
    })

    page.drawText('Gross Margin',{
        x: 50,
        y: height - 23 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Companies use gross margin to measure how their production costs relate to their revenues.',{
        x: 50,
        y: height - 24 * normalTextFontSize,
        size: higlightsFontSize,
        font: highlightFont,
        color: 'black'
    })

    page.drawText(`${grossMargin}`, {
        x: 200,
        y: height - 24 * normalTextFontSize,
        size: higlightsFontSize,
        font: highlightFont,
        color: 'black'
    })

    page.drawText('Operating Margin',{
        x: 50,
        y: height - 25 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Companies use operating margin to measure how revenue relates to operating costs.',{
        x: 50,
        y: height - 26 * normalTextFontSize,
        size: higlightsFontSize,
        font: highlightFont,
        color: 'black'
    })

    page.drawText(`${operatingMargin}`, {
        x: 200,
        y: height - 26 * normalTextFontSize,
        size: higlightsFontSize,
        font: highlightFont,
        color: 'black'
    })

    page.drawText('Net Margin',{
        x: 50,
        y: height - 27 * normalTextFontSize,
        size: normalTextFontSize,
        font: primaryFont,
        color: 'black'
    })

    page.drawText('Companies use operating margin to measure how the net profit relates to company costs.',{
        x: 50,
        y: height - 28 * normalTextFontSize,
        size: higlightsFontSize,
        font: highlightFont,
        color: 'black'
    })

    page.drawText(`${profitMargin}`, {
        x: 200,
        y: height - 28 * normalTextFontSize,
        size: higlightsFontSize,
        font: highlightFont,
        color: 'black'
    })
    //const pdfBytes = await pdfDoc.save();
    return 
}

const accountingCalculations = async (req, res) => {
    const {netProfit, revenue, grossProfit, operatingIncome} = req.body;
    try{
        const netMarg = ((Number(netProfit) / Number(revenue)) * 100).toFixed(2);
        const grossMarg = ((Number(grossProfit) / Number(revenue)) * 100).toFixed(2)
        const operatingMarg = ((Number(operatingIncome) / Number(revenue)) * 100).toFixed(2)
        res.status(200).json({netMarg: netMarg, grossMarg: grossMarg, operatingMarg: operatingMarg})
    }
    catch(err){
        res.status(500).json({error: err})
    }
}


const cagr = (req, res)=>{
    const {initial, final, periods} = req.body;
    try{
        const finance = new Finance();
        const result = finance.CAGR(initial, final, periods);
        res.status(200).json(result)
    }
    catch(err){
        res.status(500).json({error: err})
    }
}

const roi = (req, res) => {
    const {initial, final} = req.body;
    try{
        const finance = new Finance();
        const result = finance.ROI(initial, final);
        res.status(200).json(result)
    }
    catch(err){
        res.status(500).json({error: err})
    }
}

const discountFactor = (req, res) => {
    const {rate, periods} = req.body;
    try{
        const finance = new Finance();
        const result = finance.DF(rate, periods);
        res.status(200).json(result)
    }
    catch(err){
        res.status(500).json({error: err})
    }
}

const npv = (req, res)=>{
    const {discount, initial, cashflows} = req.body;
    try{
        const finance = new Finance();
        const result = finance.NPV(discount, initial, ...cashflows);
        res.status(200).json(result)
    }
    catch(err){
        res.status(500).json({error: err})
    }
}


const investmentCalculations = (req, res) => {
    const {ticker} = req.body;
    try{
        yahooFinance.quote({
            symbol: ticker,
            modules: ['financialData', 'summaryDetail']
        }).then(data => {
            res.status(200).json(data)
        }).catch(err => {
            console.log(err)
            res.status(500).json({error: err})
        })
    }
    catch(err){
        res.status(500).json({error: err})
    }
}

async function getStockData(symbols){
    const stockData = await yahooFinance.quote({
        symbol: symbols[0],
        modules: ['financialData']
    })
    return stockData;
}

const historicalStockData = (req, res) =>{
    const {prods} = req.body
    const lows = Array(prods.length).fill(0);
    const highs = Array(prods.length).fill(-1);
    try{
        const params = {
            prods: prods,
            referenceDate: "Wed Dec 07 2022 12:00:00",
            lows: lows,
            highs: highs
        }
        portfolio.portfolio.getOptimalPortfolio(params, (err, result) => {
            if(!err){
                res.status(200).json({optimal:result.optim.solution, parameters: prods})
            }
            else{
                res.status(500).json({error: err})
            }
        })
    }
    catch(err){
        res.status(500).json({error: err})
    }
}

async function financialLiteracy(req, res){
    const query = req.query.query;
    try{
        const model = new HuggingFaceInference({
            model: 'distilbert-base-cased-distilled-squad',
            apiKey: "YOUR-API-KEY", // In Node.js defaults to process.env.HUGGINGFACEHUB_API_KEY
        });
        const tools = [
            new SerpAPI(process.env.SERP_API_KEY, {
                location: "Chicago,Illinois,United States",
                hl: "en",
                gl: "us",
            }),
            new WebBrowser()
        ]

        const executor = initializeAgentExecutorWithOptions(tools, model,{
            agentType: "zero-shot-react-description",
            verbose: true,
        })

        const result = await executor.call({query});
        res.status(200).json(result)

    }
    catch(err){
        res.status(500).json({error: err})
    }

}

module.exports = {
    financialLiteracy,
    investmentCalculations,
    compoundInterest,
    loanArmotization,
    cagr,
    discountFactor,
    futureValue,
    historicalStockData,
    getHome,
    budgetCalculations,
    roi,
    npv,
    accountingCalculations,
    testPdf
}