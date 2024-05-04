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

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    stripe?.redirectToCheckout({
      lineItems: [{ price: "price_1PCpPdDt62iTpm5zepnVBJbg", quantity: 1 }],
      mode: "payment",
      successUrl: "http://localhost:3000", // Defina uma página para apresentar sucesso no pagamento
      cancelUrl: "http://localhost:3000", // Defina uma página para apresentar erro no pagamento
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full flex flex-col items-center justify-center"
    >
      {/* <CardElement /> */}
      <Button type="submit" variant="default" size="lg">
        test payment integration
      </Button>
    </form>
  );
}
