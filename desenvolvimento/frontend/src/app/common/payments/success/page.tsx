"use client";

import React from "react";
import "../../../../locales/i18n";
import { useTranslation } from "react-i18next";

export default function PaymentSuccess() {
  const { t, i18n } = useTranslation();

  return (
    <div className="flex flex-col items-center gap-5 justify-between text-neutral-50 w-full">
      <h1>{t("payments.success.message")}</h1>
    </div>
  );
}
