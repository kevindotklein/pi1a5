import { useAuth } from "@/contexts/user";
import { auth } from "@/firebase/config";
import useNotification from "@/hooks/useNotifications";
import { Bell, GraduationCap } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Button } from "../ui/button";
import Notifications from "./notifications";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import PaymentForm from "@/components/common/payment";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname() as any;

  const triggerRef = useRef<any>(null);

  useEffect(() => {
    if (!triggerRef.current) return;

    if (window.location.href.includes("open_plans=true"))
      triggerRef.current.click();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerRef.current]);

  const { logout, userData } = useAuth() as any;

  const [user, loading] = useAuthState(auth) as any;
  const { t, i18n } = useTranslation();

  const { hasPendingNotifications } = useNotification();

  const [openNotifications, setOpenNotifications] = useState(false);

  const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
  );

  return (
    <>
      <div className="flex gap-4 items-center justify-between bg-blue-700 w-full pt-2 pr-6 pb-2 pl-6 sticky top-0 z-50">
        <span
          className="text-lg font-bold text-white cursor-pointer flex gap-2 items-center"
          onClick={() => router.push("/common/dashboard")}
        >
          <GraduationCap size={20} />
          studyflow
        </span>
        <div className="flex gap-6 items-center">
          <div
            className="relative cursor-pointer"
            onClick={() => setOpenNotifications(!openNotifications)}
          >
            <Bell size={20} color="white" />
            {hasPendingNotifications && (
              <div className="bg-blue-500 rounded-full h-2 w-2 absolute top-0 right-0" />
            )}
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex gap-5 items-center">
              <div
                className="flex items-center justify-center bg-blue-800 rounded-full p-2 px-5 w-fit cursor-pointer hover:bg-blue-900 transition-all"
                onClick={() => triggerRef.current.click()}
              >
                <span className="text-sm font-bold text-white">
                  {userData?.plan === "paid"
                    ? "Plano Premium"
                    : "Plano Gratuito"}
                </span>
              </div>

              <div className="flex gap-2 items-center">
                <Image
                  src={user?.photoURL || "/favicon.ico"}
                  alt="user avatar"
                  width={30}
                  height={30}
                  className="rounded-full"
                />
                <span className="text-lg font-bold text-white">
                  {userData?.full_name ||
                    userData?.displayName ||
                    userData?.email}
                </span>
              </div>
            </div>

            <Button
              onClick={async () => {
                logout();
              }}
              variant="link"
              className="text-white"
            >
              {t("auth-user-layout.logout-button")}
            </Button>
          </div>
        </div>
      </div>

      {openNotifications && (
        <Notifications
          openNotifications={openNotifications}
          setOpenNotifications={setOpenNotifications}
        />
      )}

      <Dialog>
        <DialogTrigger ref={triggerRef} />

        <DialogContent className="max-w-[40vw] overflow-auto tablet:max-w-[100vw] tablet:overflow-auto">
          <DialogHeader>
            <DialogTitle>{"Planos do Studyflow"}</DialogTitle>
            <DialogDescription>
              Seu plano -{" "}
              {userData?.plan === "paid" ? "Plano Premium" : "Plano Gratuito"}
            </DialogDescription>
          </DialogHeader>

          <p>Confira nossos planos:</p>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6">
            {/* Free Plan */}
            <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-1/3">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Plano Gratuito
              </h2>
              <p className="text-gray-600 mb-4">
                Acesso a todas as funcionalidades da plataforma, com as
                seguintes limitações:
              </p>
              <ul className="list-disc pl-5 mb-4 text-gray-600">
                <li>Upload de apenas 1 edital</li>
                <li>Geração de tarefas por até 3 semanas</li>
              </ul>
              <p className="text-gray-600">
                Experimente e decida se faz sentido adquirir o plano completo.
              </p>
            </div>

            {/* Paid Plan */}
            <div className="bg-blue-600 rounded-lg shadow-md p-6 w-full md:w-1/3">
              <h2 className="text-2xl font-bold text-white mb-4">Plano Pago</h2>
              <p className="text-white mb-4">
                Acesso <strong>ilimitado</strong> a todas as funcionalidades e
                recursos avançados da plataforma:
              </p>
              <ul className="list-disc pl-5 mb-4 text-white font-bold">
                <li>Upload de múltiplos editais</li>
                <li>Geração ilimitada de tarefas</li>
              </ul>
              <p className="text-white mb-4">
                <strong>Preços:</strong>
                <br />
                <strong className="text-2xl">R$ 24,99</strong> / mês ou{" "}
                <strong className="text-2xl">R$ 249,90</strong> / ano
                <br />
                <span>Economize com o plano anual!</span>
              </p>
            </div>
          </div>

          {userData.plan === "free" && (
            <div className="mt-2">
              <Elements stripe={stripePromise}>
                <PaymentForm />
              </Elements>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
