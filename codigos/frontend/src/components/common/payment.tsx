"use client";

import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import axios from "axios";
import React from "react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { t, i18n } = useTranslation();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url =
      process.env.environment === "prod"
        ? "https://studyflow-three.vercel.app"
        : "http://localhost:3000";

    stripe?.redirectToCheckout({
      lineItems: [{ price: "price_1PCpPdDt62iTpm5zepnVBJbg", quantity: 1 }],
      mode: "subscription",
      successUrl: `${url}/common/payments/success`,
      cancelUrl: `${url}/common/payments/cancel`,
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full flex flex-col items-center justify-center"
    >
      {/* <CardElement /> */}
      <Button type="submit" variant="default" size="lg">
        {t("payments.check-in.message")}
      </Button>
    </form>
  );
}
