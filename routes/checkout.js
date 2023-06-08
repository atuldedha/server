const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
console.log(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post("/", async (req, res) => {
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

module.exports = router;
