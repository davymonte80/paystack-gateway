export const POLICIES = {
  terms: {
    eyebrow: "The small print",
    title: "Terms & conditions",
    introduction:
      "Clear expectations make for a better experience. These terms cover use of Coffee and its checkout.",
    sections: [
      { title: "Payments", copy: "Payments are securely handled by Paystack. An order is confirmed only after the transaction is verified by our server." },
      { title: "Order information", copy: "You are responsible for providing accurate payment information. Email is optional and only needed if you want a receipt or order updates." },
      { title: "Acceptable use", copy: "We may pause or cancel orders connected to fraudulent activity, misuse, or a breach of these terms." },
    ],
  },
  refunds: {
    eyebrow: "Order support",
    title: "Refund & return policy",
    introduction:
      "We want every order to arrive just right. If something goes wrong, contact us within 14 days.",
    sections: [
      { title: "Eligible returns", copy: "Physical products may be returned when they arrive damaged, incorrect, or otherwise materially different from the order." },
      { title: "Subscriptions", copy: "Subscription cancellations apply to future deliveries and follow the terms shown when the subscription is purchased." },
      { title: "Refund timing", copy: "Approved refunds are sent through Paystack and may take 5–10 business days to appear, depending on your bank." },
    ],
  },
  privacy: {
    eyebrow: "Your information",
    title: "Privacy policy",
    introduction:
      "We collect only what we need to create, verify, and support your coffee payment.",
    sections: [
      { title: "Information we use", copy: "We use transaction details to create and verify payment records. If you provide an email address, we use it for receipts and order updates." },
      { title: "Payment security", copy: "Coffee does not store card details. Sensitive payment information is collected and processed by Paystack." },
      { title: "Data sharing", copy: "We do not sell customer data. Information is shared only with services needed to process and support your order." },
    ],
  },
};
