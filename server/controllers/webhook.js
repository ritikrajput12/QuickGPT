import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature error:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type !== "checkout.session.completed") {
      return response.json({ received: true });
    }

    const session = event.data.object;

    if (!session.metadata) {
      console.log("No metadata found in session");
      return response.json({ received: true });
    }

    const { transactionId, appId } = session.metadata;

    if (appId !== "quickgpt") {
      console.log("Invalid appId");
      return response.json({ received: true });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      isPaid: false,
    });

    if (!transaction) {
      console.log("Transaction not found or already paid");
      return response.json({ received: true });
    }

    await User.updateOne(
      { _id: transaction.userId },
      { $inc: { credits: transaction.credits } }
    );

    transaction.isPaid = true;
    await transaction.save();

    console.log("Credits added successfully");

    return response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return response.status(500).send("Internal Server Error");
  }
};