"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/config";

export const Social = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const onClick = async (provider: "google" | "github") => {
    try {
      if (provider === "google") {
        const googleProvider = new GoogleAuthProvider();
        await signInWithPopup(auth, googleProvider);

      }

      if (provider === "github") {
        const githubProvider = new GithubAuthProvider();
        await signInWithPopup(auth, githubProvider);
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
        className="w-full bg-neutral-600"
        onClick={() => onClick("google")}
      >
        <FcGoogle className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        size="lg"
        className="w-full bg-neutral-600"
        onClick={() => onClick("github")}
      >
        <FaGithub className="h-5 w-5" />
      </Button>
    </div>
  );
};
