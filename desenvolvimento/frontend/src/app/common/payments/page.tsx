"use client";

import PaymentForm from "@/components/common/payment";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React from "react";
import "../../../locales/i18n";
import { t } from "i18next";

export default function Payments() {
  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  return (
    <div className="flex flex-col items-center gap-5 justify-between text-neutral-50 w-full mt-5">
      <h1 className="text-xl font-bold text-black tablet:text-center">
        {t("payments.integration-test.message")}{" "}
        <strong className="text-blue-800 cursor-pointer">R$ 29,90</strong>:
      </h1>
      <Elements stripe={stripePromise}>
        <PaymentForm />
      </Elements>
    </div>
  );
}
