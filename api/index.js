const express = require('express');
const bodyParser = require('body-parser');
const Finance = require('financejs');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const yahooFinance = require('yahoo-finance');
const app = express();
app.use(bodyParser.json());
const financialInfo = require('../routes/financial')
//parse form data 
app.use(bodyParser.urlencoded({ extended: true }));
//parse JSON data
app.use(express.json())
// Serve static files from the public directory
app.use(express.static('public'));
// Set the index.html file as the homepage
app.use('/', financialInfo)

app.post('/api/armortize',  (req, res) => {
  const { loanAmount, interestRate, loanPeriod } = req.query;
  try{
      const finance = new Finance();
      const result = finance.AM(loanAmount, loanPeriod, interestRate);
      res.status(200).json(result);
  }
  catch(err){
      res.status(500).json({error: err})
  }
})


app.post('/api/compound', (req, res)=>{
  const {interestRate, compoundPeriods, principal, periodsRemaining} = req.body;
    try{
        const finance = new Finance();
        const result = finance.CI(interestRate, compoundPeriods, principal, periodsRemaining);
        res.status(200).json(result)
    }
    catch(err){
        res.status(500).json({error: err})
    }
})

app.post('/api/budget', (req, res)=>{
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
})

app.post('/api/incomestate', (req, res)=>{
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
})

app.post('/api/cagr', (req, res)=>{
  const {initial, final, periods} = req.body;
  try{
      const finance = new Finance();
      const result = finance.CAGR(initial, final, periods);
      res.status(200).json(result)
  }
  catch(err){
      res.status(500).json({error: err})
  }
})

app.post('/api/roi', (req, res)=>{
  const {initial, final} = req.body;
    try{
        const finance = new Finance();
        const result = finance.ROI(initial, final);
        res.status(200).json(result)
    }
    catch(err){
        res.status(500).json({error: err})
    }
})

app.post('/api/df', (req, res)=>{
  const {rate, periods} = req.body;
  try{
      const finance = new Finance();
      const result = finance.DF(rate, periods);
      res.status(200).json(result)
  }
  catch(err){
      res.status(500).json({error: err})
  }
})

app.post('/api/profile', (req, res)=>{
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
})
// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});