import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";

let stripeClient: Stripe | null = null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Create Stripe PaymentIntent
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripeClient) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
          return res.status(503).json({ error: "Stripe API Key is not configured in environment variables." });
        }
        stripeClient = new Stripe(key);
      }

      const { amount, currency } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Valid amount is required" });
      }

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(amount * 100), // convert to cents
        currency: currency || "usd",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Stripe payment intent creation error:", error);
      res.status(500).json({ error: error.message || "Failed to create payment intent" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
