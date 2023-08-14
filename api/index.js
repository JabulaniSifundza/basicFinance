const express = require('express');
const bodyParser = require('body-parser');
const Finance = require('financejs');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
//const yahooFinance = require('yahoo-finance');
const yahooFinance = require('yahoo-finance2').default; 
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

app.post('/api/profile', async(req, res)=>{
  const {ticker} = req.body;
  try{
	const data = await yahooFinance.quoteSummary(ticker);
	res.status(200).json(data)
  }
  catch(error){
  	res.status(500).json({"error": error.name, "message": error.message})
  }
})


app.post('/api/userWelcome', async(req, res)=>{
    const {name, email, message} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
        subject: `Welcome ${name}!`,
            html: `<head>
				<meta charset="UTF-8">
				<meta http-equiv="X-UA-Compatible" content="IE=edge">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Welcome Email for ${name}</title>

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
					margin-bottom: 38px;">Hello & Welcome to Set The Table 
					<br> 
					${name}!</h2>
					<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">Set The Table's mission is to meet your culinary desires at the highest level possible.
						Whether you are a Chef or a customer, we bring you industry leading service delivery through our web application.
						As a customer, you can now book or hire private Chefs at the click of a button.
						As a Chef, you can take control over your income and commitments with Set The Table. Please remember to keep your email notifications as most of our communication will come in via your inbox
					</p>
					<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">To sign in and start managing your requests, click the link below.</p>
					<a href="https://setthetable.app/app/userLogin.html"
					style="height: 60.8px; 
					width: 120.6px;
					text-decoration: none;
					color: #FFFFFF;
					background-color: #348C31;
					box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
					font-family: Roboto, Arial, sans-serif;
					padding: 16px;
					font-size: 19.8px; 
					border-radius: 12px;
					margin-top: 30px;
					margin-bottom: 40px;">Sign In</a>
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


app.post('/api/chefApp', async(req, res)=>{
    const {name, email, chefId} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
            subject: `Your registration has been received ${name}! ID: ${chefId}`,
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

app.post('/api/chefWelcome', async(req, res)=>{
    const {name, email, message} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
        subject: `Your profile has been approved ${name}! Chef ID: ${message}.`,
            html: `
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="X-UA-Compatible" content="IE=edge">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Welcome Email chef for ${name}</title>
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
					margin-bottom: 38px;">Welcome to Set The Table Chef
					<br> 
					${name}!</h2>
					<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">Your profile has been approved and added to our gallery of Chefs! You can now login to create quotations and edit your profile. Set The Table's mission is to meet your culinary desires at the highest level possible.
						Whether you are a Chef or a customer, we bring you industry leading service delivery through our web application.
						As a customer, you can now book or hire private Chefs at the click of a button.
						As a Chef, you can take control over your income and commitments with Set The Table. 
						Please remember to keep your email notifications as most of our communication will come in via your inbox.
						Here are a few other things to be aware of as you sign in and navigate our platform:
						<br>
						- The 🏠 (Home) icon in the footer will take you to the homepage, where you can view your booking requests and create quotations or decline requests.
						<br>
						- The 📩 (Inbox) icon in the footer will take you to your inbox where your customers can message you after they've booked your services. We have created this chat to protect you from unwanted communication that may happen off the platform which we cannot assist with if any issues were to arise.
						<br>
						- The 🗓️ (Calendar) icon in the footer will take you to your confirmed information where you may view your confirmed bookings and their dates.
						<br>
						- The 👤 (Profile) icon in the header allows you to update your account information and see how users see your account with Profile View.
						<br>
						- Please note that Set The Table’s 15% connector’s fee is included in every quotation amount sent to your customer.
						<br>
					</p>
					<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">To sign in and start managing your requests, click the link below.</p>
					<a href="https://setthetable.app/app/chefLogin.html"
					style="height: 60.8px; 
					width: 120.6px;
					text-decoration: none;
					color: #FFFFFF;
					background-color: #348C31;
					box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
					font-family: Roboto, Arial, sans-serif;
					padding: 16px;
					font-size: 19.8px; 
					border-radius: 12px;
					margin-top: 30px;
					margin-bottom: 40px;">Sign In</a>
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

app.post('/api/chefImprove', async(req, res)=>{
const {name, email, chefId, suggestions} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
        subject: `Profile Review Suggestions for Chef ${name}. Ref: ${chefId}`,
			html:`<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Quotation Request Received</title>
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
				margin-bottom: 38px;">We would like to suggest some changes to your account</h2>
				<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">
				Chef ${name}, upon reviewing your account we would like to suggest additions/modifications to your profile to make it a stronger profile. Please review the suggested changes and get back to us with the required information and/or assets to make these changes:
				<br>
				<br>
				${suggestions}
				</p>
				<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">
				Please get back to us with the suggested changes at this address so we may continue to review and ultimately approve your profile. Thank you for your time and patience.
				</p>
				<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">In the meantime, you can view the latest Chefs added to our gallery.</p>
				<a href="https://setthetable.app/index.html"
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
				margin-bottom: 40px;">View Gallery</a>
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
					margin-right: auto;">
						Terms
					</a>
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

app.post('/api/chefBook', async(req, res)=>{
const {name, email, requestId, bookingDate, guests, location, cuisine} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
            subject: `You have received a Quotation Request from ${name}. Request Number: ${requestId}`,
			html: `<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Quotation Request Received</title>
		
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
			    margin-bottom: 38px;">${name} would like a quotation for an event on ${bookingDate}.</h2>
			    <p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">They are expecting ${guests} guests at ${location}.
					They would like you to make: ${cuisine}.
				</p>
				<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">Sign in below to manage your requests.</p>
				<a href="https://setthetable.app/app/chefLogin.html"
				style="height: 60.8px; 
				width: 120.6px;
				text-decoration: none;
				color: #FFFFFF;
				background-color: #348C31;
				box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
				font-family: Roboto, Arial, sans-serif;
				padding: 16px;
				font-size: 19.8px; 
				border-radius: 12px;
				margin-top: 30px;
				margin-bottom: 40px;">Sign In</a>
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
					margin-right: auto;">
						Terms of service
					</a>
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


app.post('/api/userQuote', async(req, res)=>{
const {name, email, requestId, bookingDate} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
            subject: `You have receieved a quotation from Chef ${name}. Request Number: ${requestId}`,
			html: `<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Quotation Received</title>
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
				margin-bottom: 38px;">You have received a quotation from Chef ${name}</h2>
				<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">One of our chefs has responded to your booking request for ${bookingDate} with their quotation.
					Now you can provide your guests with an unforgettable culinary experience. We hope the proposed menu is to your liking!
					<br>
					<br>
					If you would like to cancel a booking, please email care@setthetable.app with cancellation information like your reason(s)
					and the request number. Please see cancellation policy in our terms of service.
				</p>
				<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">To view the quotation and pay, sign in below.</p>
				<a href="https://setthetable.app/app/userLogin.html"
				style="height: 60.8px; 
				width: 120.6px;
				text-decoration: none;
				color: #FFFFFF;
				background-color: #348C31;
				box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
				font-family: Roboto, Arial, sans-serif;
				padding: 16px;
				font-size: 19.8px; 
				border-radius: 12px;
				margin-top: 30px;
				margin-bottom: 40px;">Sign In</a>
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
					">Terms of service</a>
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

app.post('/api/userRevision', async(req, res)=>{
const {name, email, requestId, date, revisions} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
			subject: `Booking Request Revisions for booking on ${date}. Request Number: ${requestId}`,
			html: `<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Quotation Request Received</title>
		
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
				margin-bottom: 38px;">${name} would like some revisions made to a quotation you sent to them.</h2>
				<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">
		        ${name} would like to revise some things about the quotation you sent them. Please review the suggested changes and get back to them:
				<br>
				<br>
				${revisions}
				</p>
				<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">
				You can find quotation revisions under the Revision Requests tab in your home page. This is where you can make the requested revisions to your quotation and re-quote the customer.
				</p>
				<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">Sign in below to view revise this and any other requests.</p>
				<a href="https://setthetable.app/app/chefLogin.html"
				style="height: 60.8px; 
				width: 120.6px;
				text-decoration: none;
				color: #FFFFFF;
				background-color: #348C31;
				box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
				font-family: Roboto, Arial, sans-serif;
				padding: 16px;
				font-size: 19.8px; 
				border-radius: 12px;
				margin-top: 30px;
				margin-bottom: 40px;">Sign In</a>
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
					margin-right: auto;">
						Terms
					</a>
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


app.post('/api/chefDecline', async(req, res)=>{
const {name, email, requestId, bookingDate, reason} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
            subject: `Booking Request Decline. Request Number: ${requestId}}`,
			html: `<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Quotation Request Received</title>
		
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
				margin-bottom: 38px;">Chef ${name} will be unavailable to fulfill your request.</h2>
				<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">
				We regret to inform you that Chef ${name} will not be available to fulfill your requested booking on ${bookingDate}.
				<br>
				${reason}
				</p>
				<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">Sign in below to view and book other Chefs.</p>
				<a href="https://setthetable.app/app/userLogin.html"
				style="height: 60.8px; 
				width: 120.6px;
				text-decoration: none;
				color: #FFFFFF;
				background-color: #348C31;
				box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
				font-family: Roboto, Arial, sans-serif;
				padding: 16px;
				font-size: 19.8px; 
				border-radius: 12px;
				margin-top: 30px;
				margin-bottom: 40px;">Sign In</a>
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
					margin-right: auto;">
						Terms
					</a>
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

app.post('/api/chefPaid', async(req, res)=>{
    const {name, email, bookingDate, requestId, charged, location} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
            subject: `Confirmed Booking from ${name} on ${bookingDate}. Request Number: ${requestId}`,
			html: `<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Confirmed Booking</title>
		
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
				margin-bottom: 38px;">Booking Confirmed!!</h2>
				<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">We are delighted to inform you that ${name} has confirmed their booking for ${bookingDate}. 
				This means they were happy with your quotation and have paid the ZAR ${charged} that you quoted.
				The address where you will be setting the table is:
				<br>
				${location}
				<br>
				</p>
				<br>
				<br>
				<br>
				<small style="text-align: center; color: #000000; font-family: Roboto, Arial, sans-serif;"> 
				Set The Table charges 15% to facilitate bookings on the Chef's behalf.
				</small>
				<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">Sign in below to potentially find more bookings.</p>
				<a href="https://setthetable.app/app/chefLogin.html"
				style="height: 60.8px; 
				width: 120.6px;
				text-decoration: none;
				color: #FFFFFF;
				background-color: #348C31;
				box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
				font-family: Roboto, Arial, sans-serif;
				padding: 16px;
				font-size: 19.8px; 
				border-radius: 12px;
				margin-top: 30px;
				margin-bottom: 40px;">Sign In</a>
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
					">Terms of service</a>
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

app.post('/api/userReceipt', async(req, res)=>{
const {name, email, bookingDate, requestId, charged} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
            subject: `Confirmed Booking with Chef ${name} on ${bookingDate}. Request Number: ${requestId}`,
			html: `<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Booking Has Been Confirmed</title>
		
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
				margin-bottom: 38px;">Your Booking Has Been Confirmed!</h2>
				<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">
		        We are delighted to inform you that your booking request for Chef ${name} on ${bookingDate} has been confirmed.
				We have receieved the quoted amount of ZAR ${charged} plus the transaction fee.
				We hope you will delight in the culinary experience served by the Chef. 
				<br>
				<br>
				If you would like to cancel a booking, please email care@setthetable.app with cancellation information like your reason(s)
				and the request number. Please see cancellation policy in our terms of service.
				</p>
				<small style="text-align: center; color: #000000; font-family: Roboto, Arial, sans-serif;"> 
				Set The Table charges 4.5% to facilitate payment transactions.
				</small>
				<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">Sign in below to create more booking requests.</p>
				<a href="https://setthetable.app/app/userLogin.html"
				style="height: 60.8px; 
				width: 120.6px;
				text-decoration: none;
				color: #FFFFFF;
				background-color: #348C31;
				box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
				font-family: Roboto, Arial, sans-serif;
				padding: 16px;
				font-size: 19.8px; 
				border-radius: 12px;
				margin-top: 30px;
				margin-bottom: 40px;">Sign In</a>
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
					">Terms of service</a>
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

app.post('/api/adminPaid', async(req, res)=>{
    const {customer, chef, requestId, quoted, paid, transport, service, date, location} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
			//"smmdladla@icloud.com"
            from: `"Set The Table" <${app_email}>`,
            to: app_email,
            subject: `Paid Booking between Chef ${chef} and ${customer}. Request Number: ${requestId}`,
			html: `<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Booking Has Been Paid</title>
		
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
margin-bottom: 38px;">A payment has been made by ${customer} to book Chef ${chef}.</h2>
				<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">
The payment details are as follows:
				<br>
			Quoted Price: R ${quoted}
				Transport Cost: R ${transport}
				Service Fee: R ${service}
				<br>
				Paid Amount: R ${paid}
				<br>
				<br>
					The booking is set for ${date} at ${location}.
				</p>
				<small style="text-align: center; color: #000000; font-family: Roboto, Arial, sans-serif;"> 
				Set the Table; Serve a memory.
				</small>
				<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">Sign in below to create more booking requests.</p>
				<a href="https://setthetable.app/app/userLogin.html"
				style="height: 60.8px; 
				width: 120.6px;
				text-decoration: none;
				color: #FFFFFF;
				background-color: #348C31;
				box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
				font-family: Roboto, Arial, sans-serif;
				padding: 16px;
				font-size: 19.8px; 
				border-radius: 12px;
				margin-top: 30px;
				margin-bottom: 40px;">Sign In</a>
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
					">Terms of service</a>
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

app.post('/api/userMsg', async(req, res)=>{
const {name, email, message, messageId} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
            subject: `You have received a message from ${name}. Chat Number: ${messageId}`,
			html: `<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Message From ${name}</title>
		
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
				margin-bottom: 38px;">You have a new message from ${name}</h2>
				<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">
				You have recieved a message from ${name}. Your message is as follows:
				<br>
				"${message}"
				<br>
				<br>
				Please note that you will have to habitually check your inbox for new messages from your customers as to not miss any updates on your booking.
				</p>
				<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">Sign in below to respond to this message via your inbox.</p>
				<a href="https://setthetable.app/app/chefLogin.html"
				style="height: 60.8px; 
				width: 120.6px;
				text-decoration: none;
				color: #FFFFFF;
				background-color: #348C31;
				box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
				font-family: Roboto, Arial, sans-serif;
				padding: 16px;
				font-size: 19.8px; 
				border-radius: 12px;
				margin-top: 30px;
				margin-bottom: 40px;">Sign In</a>
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

app.post('/api/adminApp', async(res, req)=>{

    const {name, email, chefId} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: app_email,
            subject: `New Chef Application from Chef ${name}! ID: ${chefId}`,
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
					margin-bottom: 38px;">Chef ${name} has sent an application</h2>
					<br>
				    <p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">You have a new application to review from Chef ${name}.
					</p>
					<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">Log in blelow to review the application.</p>
					<a href="https://setthetable.app/app/adminLogin.html"
					style="height: 60.8px; 
					width: 120.6px;
					text-decoration: none;
					color: #FFFFFF;
					background-color: #348C31;
					box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
					font-family: Roboto, Arial, sans-serif;
					padding: 16px;
					font-size: 19.8px; 
					border-radius: 12px;
					margin-top: 30px;
					margin-bottom: 40px;">Login</a>
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
    catch(error){
		console.log(error)
        res.status(500).json(error)

    }
})


app.post('/api/chefDenial', async(req, res)=>{
const {name, email, message} = req.body;
    try{
        const mailOptions = {
            //'"Your Name" <your-email@gmail.com>'
            from: `"Set The Table" <${app_email}>`,
            to: email,
			subject: `Application Denied for Chef ${name}. Ref: ${message}`,
			html:`<head>
			<meta charset="UTF-8">
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>Quotation Request Received</title>
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
				<h4 style="font-size: 32px;
				font-family: Roboto, Arial, sans-serif;
				text-align: center;
				margin-bottom: 38px;">Unfortunately we cannot add you to our gallery of chefs</h4>
				<p style="font-size: 19.8px; font-family: Roboto, Arial, sans-serif;">
				Chef ${name}, upon reviewing your account we would like to inform you that at this time, we cannot add you to our gallery of chefs. 
				In future, please ensure that you have the relevant qualifications and experience to be added to our gallery.
				Please also ensure that the images you select to upload are high quality images.
				<br>
				</p>
			<p style="font-family: Roboto, Arial, sans-serif;font-size: 19.8px; margin-bottom: 30px;">In the meantime, you can view the latest Chefs added to our gallery as an example.</p>
				<a href="https://setthetable.app/index.html"
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
				margin-bottom: 40px;">View Gallery</a>
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
					margin-right: auto;">
						Terms
					</a>
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



    
