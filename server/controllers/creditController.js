import Transaction from "../models/Transaction.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Plans (same as sir)
const plans = [
  {
    _id: "basic",
    name: "Basic",
    price: 10,
    credits: 100,
  },
  {
    _id: "pro",
    name: "Pro",
    price: 20,
    credits: 500,
  },
  {
    _id: "premium",
    name: "Premium",
    price: 30,
    credits: 1000,
  },
];

// ✅ GET ALL PLANS
export const getPlans = async (req, res) => {
  try {
    res.json({ success: true, plans });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ PURCHASE PLAN
export const purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    // Find plan
    const plan = plans.find((p) => p._id === planId);
    if (!plan) {
      return res.json({ success: false, message: "Invalid plan" });
    }

    // ✅ Create transaction (DB me entry banegi)
    const transaction = await Transaction.create({
      userId,
      planId: plan._id,
      amount: plan.price,
      credits: plan.credits,
      isPaid: false,
    });

    const origin = req.headers.origin;

    // ✅ Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: plan.price * 100,
            product_data: {
              name: plan.name,
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/loading`,
      cancel_url: `${origin}`,
      metadata: {
        transactionId: transaction._id.toString(), // ⭐ FIX
        appId: "quickgpt",
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
