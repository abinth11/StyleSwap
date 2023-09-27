`StyleSwap`

StyleSwap is a e-commerce app built with Node.js, Express,Redis and MongoDB. It allows users to browse and purchase products online.

# Frameworks and libraries used

Node.js Express - used to build the entire backend 
Redis - used to cache the data for better performace(build on top of mongodb)
Mongodb - MongoDB native driver is used as the database
Handlebars - is used as the template engine
jQuery - is used to build few parts of the front end & making api calls via ajax
Chart.js - for drawing charts and graphs
Font awesome & Line awesome - for icons

# Third pary modules & api's used 

Cloudinary - for storing images in the cloud
Razorpay - payment gateway
Paypal - payment gateway 
Redis - is a no sql database, that can be used to cache the data to improve the perfomance of the applications(it is built on top of mongoDB)
Multer - for sending multiple images to the server
Twilio - for managing messages(otp )
Cron - is a npm package that can be used to run query on a particular time

You can check the package.json to get more details about the packages used with version

`Installation`

To run this app locally, follow these steps:

Clone the repository: git clone https://github.com/abinth11/Ecommerce-app
Install Node.js and MongoDB if you haven't already.
Install dependencies: npm install
Create a .env file in the root directory and set the following environment variables:
MONGODB_URI - the URI for your MongoDB database
SECRET_KEY - a secret key for encrypting session data
Start the server: npm start
