"use client";

import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

export const useFunctions = () => {
  const { toast } = useToast();

  const processNotice = async (notice_url: string) => {
    console.log(notice_url);
    try {
      await axios.post(
        "http://127.0.0.1:5001/noz-ifsp/us-central1/getContentFromPdf",
        { url: notice_url }
      );
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "error processing notice",
        description: error.message,
      });

      throw error;
    }
  };

  return {
    processNotice,
  };
};
