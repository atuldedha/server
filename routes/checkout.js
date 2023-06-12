const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createOrder, capturePayment } = require("../config/paypal-api");
const router = express.Router();

// helper function for paypal
const calculateTotalPrice = (product) => {
  let price = 0;
  product?.map((item) => {
    price += item?.price;
  });
  return price;
};

// stripe route
router.post("/stripe-checkout", async (req, res) => {
  const { amount, id } = req.body;

  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      // change this to dynamic and send description from frontend
      description: "testing",
      payment_method: id,
      confirm: true,
    });

    console.log(payment, "Payment");
    res.status(200).json({ message: "Payment Successful", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Payment Failed", message: error?.message });
  }
});

// paypal route for create order
router.post("/paypal-checkout/create-order", async (req, res) => {
  const { product } = req.body;

  const totalPrice = calculateTotalPrice(product);
  const description = product[0]?.description;

  const dataToSend = { totalPrice, description };
  try {
    const order = await createOrder(dataToSend);
    res.json(order);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error?.message });
  }
});

// paypal router for capturing payment
router.post("/paypal-checkout/capture-paypal-orderr", async (req, res) => {
  const { orderID } = req.body;
  try {
    const captureData = await paypal.capturePayment(orderID);
    res.json(captureData);
  } catch (err) {
    res.status(500).json({ message: err?.message });
  }
});

module.exports = router;
