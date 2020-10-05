const cors = require('cors');
const express = require('express');
const stripe = require('stripe')('sk_test_51HO0KCESOl6tMOVpp2c81gag8m1uxOxbYBLzYxpLc6DWl4r2FwcVE5QDuWNYXar7MSqBj4dbG1Tfapj1FQIJ0lGp00m8KFS3ZQ');

const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => {
    res.send('Hello world');
});


app.post('/payment', (req, res) => {
    const {product, token} = req.body;
    console.log("PRODUCT ", product);
    console.log("PRICE ", product.price);
    const idempotencyKey = uuidv4();

    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then(customer => {
        stripe.charges.create({
            amount: product.price * 100,
            currency: 'usd',
            customer: customer.id,
            reciept_email: token.email,
            description: 'product desc'
        },{idempotencyKey})
        .then(result => res.status(200).json(result))
        .catch(err => console.log(err))
    })
});

app.post('/create-checkout-session', async (req, res) => {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'T-shirt',
            },
            unit_amount: 2000,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'http://localhost:4200/',
      cancel_url: 'http://localhost:4200/',
    });
  console.log(session);
    res.json({ id: session.id });
  });

app.listen(3000, () => console.log('Listening on port 3000'));