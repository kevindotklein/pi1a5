"use client";

import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

export const useFunctions = () => {
  const { toast } = useToast();

  const url =
    process.env.environment === "prod"
      ? "https://us-central1-noz-ifsp.cloudfunctions.net"
      : "http://127.0.0.1:5001/noz-ifsp/us-central1";

  const processNotice = async ({
    url: noticeUrl,
    notice_content,
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

      if (!response.data) throw "error processing notice";

      return {
        notice_content: response.data,
      };
    } catch (error: any) {
      if (error?.message.contains("JSON")) {
        return {
          retry_error: error?.message || error,
        };
      }
      toast({
        variant: "destructive",
        title: "error processing notice",
        description: error?.message || error,
      });

      return {
        error: error?.message || error,
      };
    }
  };

  const generateTasks = async ({
    hours,
    notice_content,
  }: {
    hours: number;
    notice_content: any;
  }) => {
    try {
      const subjects = notice_content?.subjects.map((subject: any) => {
        return {
          name: subject.name,
          contents: JSON.stringify(subject.contents),
        };
      });

      const response = await axios.post(
        `${url}/generateTasks`,
        { hours, notice_content, subjects },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.error) throw response.data.error;

      if (!response.data || !response.data?.tasks)
        throw "Erro ao gerar tarefas";

      return {
        tasks: response.data?.tasks,
      };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar tarefas",
        description: error?.message || error,
      });

      return {
        error: error?.message || error,
      };
    }
  };

  return {
    processNotice,
    generateTasks,
  };
};
