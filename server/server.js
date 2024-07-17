require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500"],
}));

const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
    [1, {price: 100, name: "Bugatti"}],
    [2, {price: 200, name: "Lambo"}]
]);

app.post('/checkout', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id);
                return {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: storeItem.name,
                        },
                        unit_amount: storeItem.price,
                    },
                    quantity: item.quantity,
                };
            }),
            success_url: `${process.env.CLIENT_URL}/success.html`,
            cancel_url: `${process.env.CLIENT_URL}/cancel.html`,
        });
        res.json({ url: session.url });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
