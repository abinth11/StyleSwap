`E-commerce App`

This is an e-commerce app built with Node.js, Express, and MongoDB. It allows users to browse and purchase products online.

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

This app includes an API for third-party integration. The API has the following endpoints:

`GET /api/products - get a list of all products`

GET /api/products/:id - get a single product by ID
POST /api/orders - create a new order
GET /api/orders/:id - get a single order by ID
To use the API, send requests to the appropriate endpoint with the required data in the request body. Responses will be returned in JSON format.

`Database schema`

This app uses MongoDB to store data. The database schema is as follows(this is a sample schema, this app is built with mongoclient)
```mongodb sample schema
const productSchema = {
name: { type: String, required: true },
price: { type: Number, required: true },
description: { type: String, required: true },
image: { type: String, required: true },
};

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
