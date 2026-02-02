import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers["stripe-signature"];
  let event;

  // verify signature
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
    // handle ONLY payment_intent.succeeded (tumhare Stripe me yehi aa raha hai)
    if (event.type !== "payment_intent.succeeded") {
      return response.json({ received: true });
    }

    const paymentIntent = event.data.object;

    // payment_intent -> checkout session nikaalo
    const sessions = await stripe.checkout.sessions.list({
      payment_intent: paymentIntent.id,
      limit: 1,
    });

    const session = sessions.data[0];
    if (!session || !session.metadata) {
      return response.json({ received: true });
    }

    const { transactionId, appId } = session.metadata;
    if (appId !== "quickgpt") {
      return response.json({ received: true });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      isPaid: false,
    });

    if (!transaction) {
      return response.json({ received: true });
    }

    // add credits
    await User.updateOne(
      { _id: transaction.userId },
      { $inc: { credits: transaction.credits } }
    );

    // mark paid
    transaction.isPaid = true;
    await transaction.save();

    console.log("Credits updated successfully");

    return response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return response.status(500).send("Internal Server Error");
  }
};