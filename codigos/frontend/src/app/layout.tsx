import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/user";
import { LoadingProvider } from "@/contexts/loading";

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
      <body className={`${mulish.className} bg-neutral-900`}>
        <LoadingProvider>
          <AuthProvider>{children}</AuthProvider>
        </LoadingProvider>

        <Toaster />
      </body>
    </html>
  );
}
