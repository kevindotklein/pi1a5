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
import { auth, firestore, storage } from "@/firebase/config";
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
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

export default function Register() {
  const { toast } = useToast();
  const action = useAction();
  const { setLoading } = useLoading();

  const { t, i18n } = useTranslation();

  const [userData, setUserData] = useState(null) as any;
  const [step, setStep] = useState(0) as any;

  const router = useRouter();

  const svgToFile = (svgContent: string, filename: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const file = new File([blob], filename, { type: 'image/svg+xml' });
  
    return file;
  }

  const onSubmit = async (data: any) => {
    const { email, password } = data;

    setLoading(true);
    await action(
      async () => {
        await createUserWithEmailAndPassword(auth, email, password);

        const userId = auth.currentUser?.uid;

        delete data.password;

        const fileName = (Math.random() + 1).toString(36).substring(7);

        const storageRef = ref(storage, `users/${fileName}`);
        
        fetch('/assets/cap.svg')
          .then(response => response.text())
          .then(svgContent => {
            const file = svgToFile(svgContent, 'sample.svg');
            const uploadUser = uploadBytesResumable(storageRef, file);
            uploadUser.on(
              "state_changed",
              (snapshot: any) => {
                const progress = Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
              },
              (error: any) => {
                toast({
                  variant: "destructive",
                  title: t("notice-upload.error"),
                  description: error.message,
                });
              },
              async () => {
                const url = await getDownloadURL(uploadUser.snapshot.ref);
                await setDoc(doc(firestore, "users", userId as string), {
                  ...data,
                  has_notice: false,
                  plan: "free",
                  url
                });
              }
            )
          })
          .catch(error => console.error('Erro ao carregar o SVG:', error));

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
      title: "Seus dados",
      description: "Preencha seus dados para continuar",
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
      title: "Por que você está aqui?",
      description: "Nos conte um pouco mais sobre seus estudos",
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
      title: "Senha e Privacidade",
      description: "Crie uma senha e aceite os termos",
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
