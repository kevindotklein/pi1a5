/* eslint-disable react/no-unescaped-entities */
"use client";

import { Button } from "@/components/ui/button";
import { auth, firestore, storage } from "@/firebase/config";
import {
  addDoc,
  collection,
  query,
  setDoc,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionOnce } from "react-firebase-hooks/firestore";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Download, Trash } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Loading from "@/components/common/loading";

import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { useAction } from "@/hooks/useAction";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/user";
import { useFunctions } from "@/hooks/useFunctions";
import { Textarea } from "../ui/textarea";
import { useLoading } from "@/contexts/loading";
import { useTranslation } from "react-i18next";

export default function NoticeRetry({
  triggerRef,
  notice,
}: {
  triggerRef: any;
  notice: any;
}) {
  const action = useAction();
  const { toast } = useToast();

  const { refresh } = useAuth();
  const { processNotice } = useFunctions();
  const { loading, setLoading } = useLoading();

  const [user] = useAuthState(auth);

  const inputRef = useRef(null) as any;
  const drop = useRef(null) as any;
  const closeRef = useRef(null) as any;

  const [progresspercent, setProgresspercent] = useState(0);
  const [shouldInputContent, setShouldInputContent] = useState(true);
  const [manualNoticeContent, setManualNoticeContent] = useState("");

  const { t, i18n } = useTranslation();

  const formSchema = z.object({
    name: z.string().min(5),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: notice?.name,
    },
  });

  useEffect(() => {
    if (notice) form.setValue("name", notice.name);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name } = values;

    if (!name) {
      return toast({
        variant: "destructive",
        title: t("notice-upload.invalid-name"),
        description: t("notice-upload.upload-name"),
      });
    }

    if (manualNoticeContent && shouldInputContent) {
      await proccessNotice({
        downloadURL: "no_url",
        name,
      });
      return;
    }

    await proccessNotice({
      name: notice.name,
      downloadURL: notice.url,
    });
  };

  const proccessNotice = async ({
    name,
    downloadURL,
    isRetry,
    tryNumber = 1,
  }: {
    name?: string;
    downloadURL: string;
    isRetry?: boolean;
    tryNumber?: number;
  }) => {
    setLoading(
      isRetry
        ? t("notice-upload.load-file-error")
        : t("notice-upload.loading-message-2")
    );

    processNotice({
      previous_notice_id: notice.id,
      url: downloadURL,
      notice_content: manualNoticeContent || "",
      user_uid: user?.uid || "",
      file_name: notice?.file_name,
      notice_name: name || "",
      file_hash: notice.file_hash,
    });

    refresh();

    toast({
      title: "Estamos processando o seu edital",
      description:
        "Por favor, aguarde enquanto o processo é executado. Você receberá uma notificação quando o processo for concluído.",
    });

    setProgresspercent(0);
    setLoading(false);

    form.reset();

    closeRef.current.click();
  };

  const deleteNotice = async () => {
    await deleteDoc(doc(firestore, "notices", notice.id));
    refresh();

    toast({
      title: "Sucesso!",
      description: "Seu edital foi apagado com sucesso!",
    });

    closeRef.current.click();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div ref={triggerRef} />
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Houve um erro ao processar seu edital...</DialogTitle>
          <DialogDescription>
            Vamos tentar processar novamente
          </DialogDescription>

          {progresspercent ? (
            <div className="flex gap-3">
              <Progress value={progresspercent} />
              {progresspercent}%
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-4">
              <Form {...form}>
                <div className="h-full">
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="w-full h-full flex flex-col justify-between gap-4"
                  >
                    <span className="text-wrap whitespace-nowrap text-ellipsis">
                      Arquivo enviado: <br />{" "}
                      {notice?.file_name
                        ? notice?.file_name.length > 30
                          ? notice?.file_name.substring(0, 30) + "..." + " .pdf"
                          : notice?.file_name
                        : ""}
                    </span>

                    <div className="flex flex-col gap-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t("notice-upload.modal.notice-name")}
                            </FormLabel>
                            <FormControl>
                              <Input
                                disabled
                                placeholder={t(
                                  "notice-upload.modal.notice-name-input"
                                )}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {shouldInputContent && (
                        <div className="flex flex-col gap-5">
                          <h3>{t("notice-upload.errors.extract-content")}</h3>

                          <span className="text-red-600">{notice?.error}</span>

                          <FormItem>
                            <FormLabel>
                              {t("notice-upload.modal.manually.notice-content")}
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={t(
                                  "notice-upload.modal.manually.notice-content-input"
                                )}
                                className="resize-none min-h-[200px]"
                                value={manualNoticeContent}
                                onChange={(e: any) =>
                                  setManualNoticeContent(e.target.value)
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <DialogClose asChild>
                        <Button
                          ref={closeRef}
                          variant="secondary"
                          style={{
                            borderRadius: "10px",
                          }}
                        >
                          {t("notice-upload.modal.cancel-button")}
                        </Button>
                      </DialogClose>

                      <Button
                        // disabled={loading}
                        type="submit"
                        style={{
                          backgroundColor: "#0D4290",
                          color: "white",
                          borderRadius: "10px",
                        }}
                      >
                        {t("notice-upload.modal.submit-button")}
                      </Button>
                    </div>

                    <Button
                      type="button"
                      onClick={() => deleteNotice()}
                      variant="destructive"
                      style={{
                        borderRadius: "10px",
                      }}
                    >
                      Apagar Edital
                    </Button>
                  </form>
                </div>
              </Form>
            </div>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
