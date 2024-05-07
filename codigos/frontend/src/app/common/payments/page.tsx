"use client";

import PaymentForm from "@/components/common/payment";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";
import "../../../locales/i18n";

export default function Payments() {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  return (
    <div className="flex flex-col items-center gap-5 justify-between text-neutral-50 w-full mt-5">
      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
    </div>
  );
}
