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
// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});