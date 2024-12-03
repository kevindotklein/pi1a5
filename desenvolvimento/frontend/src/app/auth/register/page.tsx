"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/firebase/config";
import { useToast } from "@/components/ui/use-toast";
import { useAction } from "@/hooks/useAction";
import { collection, doc, setDoc } from "firebase/firestore";
import { useLoading } from "@/contexts/loading";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import BaseStep from "./steps/baseStep";
import { BookUser, PersonStanding, Shield } from "lucide-react";
import SurveyStep from "./steps/surveyStep";
import PrivacyStep from "./steps/privacyStep";

export default function Register() {
  const { toast } = useToast();
  const action = useAction();
  const { setLoading } = useLoading();

  const { t, i18n } = useTranslation();

  const [userData, setUserData] = useState(null) as any;
  const [step, setStep] = useState(0) as any;

  const router = useRouter();

  const onSubmit = async (data: any) => {
    const { email, password } = data;

    setLoading(true);
    await action(
      async () => {
        await createUserWithEmailAndPassword(auth, email, password);

        const userId = auth.currentUser?.uid;

        delete data.password;

        await setDoc(doc(firestore, "users", userId as string), {
          ...data,
          has_notice: false,
          plan: "free",
        });

        setLoading(false);

        router.push("/common/dashboard?open_plans=true");
      },
      async () => {
        setLoading(false);
      }
    );
  };

  const steps = [
    {
      icon: <PersonStanding size={40} color="white" />,
      title: t("register.your-information"),
      description: t("register.type-information"),
      component: (
        <BaseStep
          setUserData={setUserData}
          userData={userData}
          setStep={setStep}
        />
      ),
    },
    {
      icon: <BookUser size={40} color="white" />,
      title: t("register.you-here"),
      description: t("register.your-studies"),
      component: (
        <SurveyStep
          setUserData={setUserData}
          userData={userData}
          setStep={setStep}
        />
      ),
    },
    {
      icon: <Shield size={40} color="white" />,
      title: t("register.password-privacy"),
      description: t("register.password-terms"),
      component: (
        <PrivacyStep
          setUserData={setUserData}
          userData={userData}
          setStep={setStep}
          submit={onSubmit}
        />
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="h-full flex flex-col gap-2 tablet:w-full">
      <span className="text-sm text-white">
        {step + 1} / {steps.length}
      </span>
      <div className="h-full flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex  gap-3 items-center">
            {currentStep.icon}
            <h3 className="text-3xl font-bold flex gap-2 items-center text-neutral-100">
              {currentStep.title}
            </h3>
          </div>
          <h2 className="text-sm text-neutral-300">
            {currentStep.description}
          </h2>
        </div>

        <div className="min-w-[400px]">{currentStep.component}</div>
      </div>
    </div>
  );
}
