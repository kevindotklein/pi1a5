import { useAuth } from "@/contexts/user";
import { auth } from "@/firebase/config";
import useNotification from "@/hooks/useNotifications";
import { Bell, GraduationCap } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
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

export default function Header() {
  const router = useRouter();
  const pathname = usePathname() as any;

  const triggerRef = useRef<any>(null);

  const { logout, userData } = useAuth() as any;

  const [user, loading] = useAuthState(auth) as any;
  const { t, i18n } = useTranslation();

  const { hasPendingNotifications } = useNotification();

  const [openNotifications, setOpenNotifications] = useState(false);

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
        </DialogContent>
      </Dialog>
    </>
  );
}
