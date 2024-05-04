"use client";

import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

export const useFunctions = () => {
  const { toast } = useToast();

  const url =
    process.env.environment === "production"
      ? "https://us-central1-noz-ifsp.cloudfunctions.net"
      : "http://127.0.0.1:5001/noz-ifsp/us-central1";

  const processNotice = async ({
    url: noticeUrl,
    notice_content
  }: {
    url: string;
    notice_content: string;
  }) => {
    try {
      const response = await axios.post(
        `${url}/getContentFromPdf`,
        { url: noticeUrl, notice_content },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.error) throw response.data.error;

      if (!response.data)
        throw "error processing notice";

      return {
        notice_content: response.data
      };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "error processing notice",
        description: error?.message || error,
      });

      return {
        error: error?.message || error,
      }
    }
  };

  return {
    processNotice,
  };
};
