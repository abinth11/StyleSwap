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

`Usage`

To use this app, follow these steps:

Create an account by clicking on the "Sign up" button.
Browse products by clicking on the "Shop" button.
Click on a product to view its details and add it to your cart.
View your cart by clicking on the cart icon in the top right corner.
Checkout by entering your shipping and payment information.




`API documentation`

This app includes two module Admin and User.And the  API has the following endpoints:

# ADMIN
`GET /api/products - get a list of all products`

GET /api/products/:id - get a single product by ID
POST /api/orders - create a new order
GET /api/orders/:id - get a single order by ID
To use the API, send requests to the appropriate endpoint with the required data in the request body. Responses will be returned in JSON format.

# USER


`Database schema`

This app uses MongoDB to store data. The database schema is as follows(this is a sample schema, this app is built with mongoclient & contails 18 collections)
```mongodb sample schema
const productSchema = {
name: { type: String, required: true },
price: { type: Number, required: true },
description: { type: String, required: true },
image: { type: String, required: true },
};
const address = 
const admin = 
const cart = 
const categories = 
const colors = 
const coupons = 
const couponTemplates = 
const guestUsers = 
const orderStatus = 
const orders = 
const productsTemplate 
const products 
const rating = 
const sizes = 
const subcategories = 
const users = 
const visitors = 
const wallet = 

const userSchema = {
username: { type: String, required: true },
email: { type: String, required: true },
password: { type: String, required: true },
};

const orderSchema = {
user: { type: String, required: true },
products: [
{
productId: { type: String, required: true },
quantity: { type: Number, required: true },
},
],
total: { type: Number, required: true },
date: { type: Date, required: true, default: Date.now },
};
```
`Contributing`

Contributions are welcome! If you'd like to contribute to this project, please follow these guidelines:

Fork the repository and create a new branch for your changes.
Make your changes and test them thoroughly.
Submit a pull request with a clear description of your changes and why they are necessary.

`Contact`

If you have any questions or feedback about this app, you can contact the author at abinth250@gmail.com
