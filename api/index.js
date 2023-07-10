const express = require('express');
const bodyParser = require('body-parser');
const Finance = require('financejs');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const yahooFinance = require('yahoo-finance');
const nodemailer = require('nodemailer');
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

const app_email = 'admin@setthetable.app'
const app_pass = 'eamjfkonjezpsybj'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: app_email,
        pass: app_pass
    }
})

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

app.post('/api/mailer', async(req, res)=>{
    const {name, email, message} = req.body;
    try{
        const mailOptions = {
            from: "Set The Table",
            to: email,
            subject: 'New Message from Set The Table',
            html: `<head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Registration Email chef for ${name}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
                    </style>
                </head>
                <body>
                <div>
                    <table
                    style="width: 100%; 
                    height: 300px;
                    background-color: #FFFFFF;
                    margin-left: auto;
                    margin-right: auto">
                        <tr>
                            <td style="text-align: center;">
                                <img src="https://firebasestorage.googleapis.com/v0/b/setthetable-app.appspot.com/o/sttLogo.png?alt=media&token=9ee37110-cdb1-4722-99cb-950499aa0750" alt="Set The Table Logo"
                                style="
                                width: 300px;
                                height: 300px;
                                cursor: pointer;
                                margin-bottom: 20px;">
                            </td>
                        </tr>
                        
                    </table>
                    <h2 style="font-size: 32px;
                    font-family: Roboto, Arial, sans-serif;
                    text-align: center;
                    margin-bottom: 38px;">Hello & Thank you for registering with Set The Table Chef
                    <br> 
                    ${name}!</h2>
                    <p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">Thank you for signing up with Set The Table. Please be patient with us as we review your profile.
                    The approval process is how we ensure that customers have the highest quality experience on our platform. You will receive an email notifying you whether your profile has been approved or 
                    if there are any modifications to make that may strengthen your profile. Please rememeber to send us a copy of your ID as well as your qualification documents as this will help us speed up the process 
                    of approving your profile. Once we have approved your profile, you will then be added to our gallery of Chefs for customers to choose from.
                    </p>
                    <p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">Thank you for your time and patience. 
                    In the meantime, you can visit the link below to learn more about our platform and add the web application to your home screen.</p>
                    <a href="https://setthetable.app/appPage.html"
                    style="height: 60.8px; 
                    width: 132.6px;
                    text-decoration: none;
                    color: #FFFFFF;
                    background-color: #348C31;
                    box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
                    font-family: Roboto, Arial, sans-serif;
                    padding: 16px;
                    font-size: 19.8px; 
                    border-radius: 12px;
                    margin-top: 30px;
                    margin-bottom: 40px;">Learn More</a>
                    <p style="font-size: 19.8px; 
                    font-family: Roboto, Arial, sans-serif; margin-top: 30px;">Thank you for choosing Set The Table.</p>
                    <p style="font-size: 19.8px; 
                    font-family: Roboto, Arial, sans-serif;text-align: center; margin-top: 60px;">Set the Table; <span style="color: #348C31">serve a memory.</span></p>
                    <div style="background-color: #000000; height: 100px; width: 100%;">
                        <a href="https://setthetable.app/termsAndConditions.html" 
                        style="color: #FFFFFF;
                        text-decoration: none;
                        margin-top: 30px;
                        width: 80%;
                        font-family: Roboto, Arial, sans-serif;
                        padding: 10px;
                        padding-top: 30px;
                        font-size: 19.8px;
                        margin-left: auto;
                        margin-right: auto;
                        ">Terms</a>
                    </div>
                </div>
            </body>`
        }
        await transporter.sendMail(mailOptions)
        res.status(200).json({message: 'Email sent'})
    }
    catch(err){
        console.log(err)
        res.status(500).json(err)
    
    }


})
// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});



    
