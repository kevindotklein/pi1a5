"use client";

import { Button } from "@/components/ui/button";

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
import { Social } from "@/components/auth/social";
import { getAuth, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useToast } from "@/components/ui/use-toast";
import { useAction } from "@/hooks/useAction";
import { useLoading } from "@/contexts/loading";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { X } from "lucide-react";
import Toast from "@/components/common/toast";

export default function Login() {
  const { toast } = useToast();
  const { setLoading } = useLoading();
  const action = useAction();

  const { t, i18n } = useTranslation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showToast, setShowToast] = useState(false);

  type ToastType = "SUCCESS" | "ERROR";
  const [toastType, setToastType] = useState<ToastType>("SUCCESS");
  const [toastMessage, setToastMessage] = useState<string>("");

  const formSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);

    const { email, password } = values;

    await action(
      async () => {
        await signInWithEmailAndPassword(auth, email, password);

        setLoading(false);
        router.push("/common/dashboard");
      },
      async () => {
        setLoading(false);
      }
    );
  };

  const sendEmailPasswordReset = (e: any) => {
    e.preventDefault();

    sendPasswordResetEmail(getAuth(), resetEmail)
      .then(() => {
        setToastMessage("E-mail de redefinição de senha enviado!");

      })
      .catch(() => {
        setToastType("ERROR");
        setToastMessage("Erro ao enviar o e-mail. Verifique se o e-mail está correto.")
      });
    
    setIsModalOpen(false);
    setShowToast(true);

    setResetEmail("");
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="h-full flex flex-col gap-4 tablet:w-full">
      <div className="h-full flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-3xl font-bold flex gap-2 items-center text-neutral-100">
            studyflow
          </h3>
          <h2 className="text-sm text-secondary-200 text-neutral-300">
            {t("login.subtitle")}
          </h2>
        </div>
        <Form {...form}>
          <div className="h-full">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full h-full flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="!text-white">
                        {t("login.email")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("login.email-input")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="!text-white">
                        {t("login.password")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder={t("login.password-input")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-row">
                  <p onClick={(e) => { e.preventDefault(); openModal(); }} className="text-white text-sm cursor-pointer underline">Reset password</p>
              </div>

              <Social />

              <div className="flex items-baseline justify-between mt-8 gap-2 tablet:!flex-col tablet:w-full">
                <Button variant="link" asChild>
                  <Link
                    href="/auth/register"
                    className="text-sm hover:underline tablet:!text-xs text-white tablet:w-full"
                  >
                    {t("login.register-question")}
                  </Link>
                </Button>

                <Button variant="default" size="lg" className="tablet:w-full">
                  {t("login.submit-button")}
                </Button>
              </div>
            </form>
          </div>
        </Form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            
            <div className="flex justify-between">
            <h3 className="text-xl font-bold mb-4">Recuperar Senha</h3>
            <X className="cursor-pointer hover:text-red-600 duration-0" onClick={closeModal} />
            </div>
            <p className="mb-4">Insira seu e-mail para recuperar a senha</p>

            <form onSubmit={sendEmailPasswordReset}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 w-full"
                >
                  Enviar
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {showToast &&
        <Toast message={toastMessage} onClose={() => setShowToast(false)} type={toastType}/>}

    </div>
  );
}
