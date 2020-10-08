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

app.post('/create-checkout-session', async (req, res) => {
  let connectedAccCustomer
  try {
    connectedAccCustomer = await stripe.customers.retrieve(req.body.customerId, { stripeAccount: `${req.body.connectedAcc}` });
  }
  catch ({ statusCode = 0 }) {
    if (statusCode == 404) {
      //------no customer exists
    }
  }

  const session = await stripe.checkout.sessions.create({
    payment_intent_data: {
      setup_future_usage: 'off_session',
    },
    ...(connectedAccCustomer ? { customer: connectedAccCustomer.id } : {}),
    payment_method_types: ['card'],
    line_items: [{
      price: `${req.body.priceId}`,
      quantity: 1,
    }],
    mode: 'payment',
    success_url: 'http://localhost:4200/',
    cancel_url: 'http://localhost:4200/',
  }
    , { stripeAccount: `${req.body.connectedAcc}` }
  );
  res.json({ id: session.id });
});

app.listen(3001, () => console.log('Listening on port 3001'));