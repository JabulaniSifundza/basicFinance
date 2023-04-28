const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());
const financialInfo = require('./routes/financial')
//parse form data 
app.use(bodyParser.urlencoded({ extended: true }));
//parse JSON data
app.use(express.json())
// Serve static files from the public directory
app.use(express.static('public'));
// Set the index.html file as the homepage
app.use('/', financialInfo)



// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});