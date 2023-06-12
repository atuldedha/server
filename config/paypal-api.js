const fetch = require("node-fetch");
const baseURL = process.env.SANDBOX_BASE_URL;

const clientId = process.env.PAYPAL_CLIENT_ID;
const secretId = process.env.PAYPAL_SECRET_ID;

const createOrder = async (data) => {
  const accessToken = await generateAccessToken();
  const url = `${baseURL}/v2/checkout/orders`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: data.totalPrice,
          },
          description: data?.description,
        },
      ],
    }),
  });
  console.log(accessToken, response);
  return handleResponse(response);
};

const capturePayment = async (orderId) => {
  const accessToken = await generateAccessToken();
  const url = `${baseURL}/v2/checkout/orders/${orderId}/capture`;
  const response = await fetch(url, {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleResponse(response);
};

const generateAccessToken = async () => {
  const auth = Buffer.from(clientId + ":" + secretId).toString("base64");
  const response = await fetch(`${baseURL}/v1/oauth2/token`, {
    method: "post",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  const data = await handleResponse(response);
  return data?.access_token;
};

const handleResponse = async (response) => {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  const errorMessage = await response.text();
  throw new Error(errorMessage);
};

module.exports = { createOrder, capturePayment };
