"use client";

import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/user";
import axios from "axios";

export const useFunctions = () => {
  const { toast } = useToast();
  const { refresh } = useAuth();

  const url =
    process.env.environment === "prod"
      ? "https://us-central1-noz-ifsp.cloudfunctions.net"
      : "http://127.0.0.1:5001/noz-ifsp/us-central1";

  const processNotice = async ({
    previous_notice_id,
    url: noticeUrl,
    notice_content,
    user_uid,
    file_name,
    notice_name,
    file_hash,
  }: {
    previous_notice_id?: any;
    url: string;
    notice_content: string;
    user_uid: string;
    file_name: string;
    notice_name: string;
    file_hash: string;
  }) => {
    try {
      const response = await axios.post(
        `${url}/getContentFromPdf`,
        {
          previous_notice_id,
          url: noticeUrl,
          notice_content,
          user_uid,
          file_name,
          notice_name,
          file_hash,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.error) throw response.data.error;

      if (!response.data) throw "Houve um erro ao processar o edital:";

      refresh();

      toast({
        variant: "default",
        title: "Sucesso!",
        description:
          "Seu edital foi processado com sucesso! Confira suas matérias.",
      });

      return {
        notice_content: response.data,
      };
    } catch (error: any) {
      console.log(error);

      if (
        error?.message?.includes("JSON") ||
        (typeof error === "string" && error?.includes("JSON"))
      )
        return { error: error?.message ?? error };

      toast({
        variant: "destructive",
        title: "Houve um erro ao processar o edital:",
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

  const extractInfos = async ({ text }: { text: any }) => {
    try {
      const response = await axios.post(
        `${url}/extractInfos`,
        { text },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.error) throw response.data.error;

      if (!response.data || !response.data?.infos)
        throw "Erro ao extrair informações";

      return {
        infos: response.data?.infos,
      };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao extrair informações",
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
    extractInfos,
  };
};
