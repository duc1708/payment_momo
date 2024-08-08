// server.js
const express = require("express");
const axios = require("axios");
const crypto = require('crypto');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/payment", async (req, res) => {
    try {
        const accessKey = 'F8BBA842ECF85';
        const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
        const orderInfo = 'pay with MoMo';
        const partnerCode = 'MOMO';
        const redirectUrl = 'http://localhost:3000/payment-success'; // Update this to your frontend URL
        const ipnUrl = 'http://localhost:5000/callback';
        const requestType = "payWithMethod";
        const amount = req.body.amount;
        const orderId = partnerCode + new Date().getTime();
        const requestId = orderId;
        const extraData = '';
        const orderGroupId = '';
        const autoCapture = true;
        const lang = 'vi';

        if (amount < 1000 || amount > 50000000) {
            return res.status(400).json({
                statusCode: 400,
                message: "Amount must be between 1000 and 50000000 VND",
            });
        }

        const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto.createHmac('sha256', secretKey)
            .update(rawSignature)
            .digest('hex');

        const requestBody = {
            partnerCode: partnerCode,
            partnerName: "Test",
            storeId: "MomoTestStore",
            requestId: requestId,
            amount: amount,
            orderId: orderId,
            orderInfo: orderInfo,
            redirectUrl: redirectUrl,
            ipnUrl: ipnUrl,
            lang: lang,
            requestType: requestType,
            autoCapture: autoCapture,
            extraData: extraData,
            orderGroupId: orderGroupId,
            signature: signature
        };

        const option = {
            method: "POST",
            url: "https://test-payment.momo.vn/v2/gateway/api/create",
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(JSON.stringify(requestBody))
            },
            data: requestBody
        };

        const result = await axios(option);
        if (result.data.resultCode !== 0) {
            return res.status(400).json({
                statusCode: 400,
                message: result.data.message,
                data: result.data
            });
        }

        return res.status(200).json({ payUrl: result.data.payUrl });
    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: "Server error",
            error: error.response ? error.response.data : error.message
        });
    }
});

app.post("/callback", (req, res) => {
    console.log("Callback:");
    console.log(req.body);

    // Redirect to the frontend with success indication
    res.redirect('http://localhost:3000/payment-success'); // Update this to your success URL
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
