import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/user";
import { LoadingProvider } from "@/contexts/loading";
import { motion } from "framer-motion";
import Transition from "@/components/common/transition";

const mulish = Mulish({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "studyflow",
  description: "made by noz, for noz usage only",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${mulish.className} bg-neutral-100`}>
        <LoadingProvider>
          <AuthProvider>
            <Transition>
              {children}
              <Toaster />
            </Transition>
          </AuthProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
