"use client";

import { FcGoogle } from "react-icons/fc";
import { FaFacebookSquare, FaGithub } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/firebase/config";

export const Social = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const onClick = async (provider: "google" | "facebook") => {
    try {
      if (provider === "google") {
        const googleProvider = new GoogleAuthProvider();
        await signInWithPopup(auth, googleProvider);
      }

      if (provider === "facebook") {
        const facebookProvider = new FacebookAuthProvider();
        await signInWithPopup(auth, facebookProvider);
      }

      router.push(callbackUrl || DEFAULT_LOGIN_REDIRECT);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex items-center w-full gap-x-2">
      <Button
        type="button"
        size="lg"
        className="w-full bg-neutral-800"
        onClick={() => onClick("google")}
      >
        <FcGoogle className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        size="lg"
        className="w-full bg-neutral-800"
        onClick={() => onClick("facebook")}
      >
        <FaFacebookSquare className="h-5 w-5" />
      </Button>
    </div>
  );
};
