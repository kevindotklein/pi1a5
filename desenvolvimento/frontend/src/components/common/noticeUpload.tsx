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

export default function NoticeUpload({
  hasNotice,
  setHasNotice,
  triggerRef,
}: {
  hasNotice: boolean;
  setHasNotice: (hasNotice: boolean) => void;
  triggerRef: any;
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

  const [fileToUpload, setFileToUpload] = useState<File>(null as any);
  const [progresspercent, setProgresspercent] = useState(0);
  const [shouldInputContent, setShouldInputContent] = useState(false);
  const [manualNoticeContent, setManualNoticeContent] = useState("");

  const { t, i18n } = useTranslation();

  const formSchema = z.object({
    name: z.string().min(5),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const dropElement = drop.current;
    if (!dropElement) return;

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const { files } = e.dataTransfer;

      if (files && files.length) {
        setFileToUpload(files[0] as File);
      }
    };

    dropElement.addEventListener("dragover", handleDragOver);
    dropElement.addEventListener("drop", handleDrop);

    return () => {
      dropElement.removeEventListener("dragover", handleDragOver);
      dropElement.removeEventListener("drop", handleDrop);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drop, drop?.current]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name } = values;

    if (!fileToUpload || fileToUpload.type !== "application/pdf") {
      return toast({
        variant: "destructive",
        title: t("notice-upload.invalid-type"),
        description: t("notice-upload.upload-file"),
      });
    }

    const getHashFile = async (file: File) => {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
      return bufferToHex(hashBuffer);
    };

    const bufferToHex = (buffer: ArrayBuffer) => {
      return [...new Uint8Array(buffer)]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }

    try {
      const hash = await getHashFile(fileToUpload);
      console.log(hash);
    } catch (error) {
      return toast({
        variant: "destructive",
        title: t("notice-upload.invalid-type"),
        description: t("notice-upload.upload-file"),
      });
    }

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

    await action(
      async () => {
        setLoading(t("notice-upload.loading-message-1"));

        const file_name = (Math.random() + 1).toString(36).substring(7);

        const storageRef = ref(storage, `notices/${file_name}`);
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

        uploadTask.on(
          "state_changed",
          (snapshot: any) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            // setProgresspercent(progress);
          },
          (error: any) => {
            toast({
              variant: "destructive",
              title: t("notice-upload.error"),
              description: error.message,
            });
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            await proccessNotice({
              name,
              downloadURL,
            });
          }
        );
      },
      async () => {
        setLoading(false);
        setProgresspercent(0);

        toast({
          title: t("notice-upload.error"),
          description: t("notice-upload.upload-file-error"),
        });
      }
    );
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
      url: downloadURL,
      notice_content: manualNoticeContent || "",
      user_uid: user?.uid || "",
      file_name: fileToUpload?.name,
      notice_name: name || "",
    });

    refresh();

    setFileToUpload(null as any);

    toast({
      title: "Estamos processando o seu edital",
      description:
        "Por favor, aguarde enquanto o processo é executado. Você receberá uma notificação quando o processo for concluído.",
    });

    setProgresspercent(0);
    setLoading(false);

    setHasNotice(true);
    form.reset();

    closeRef.current.click();
  };

  const show_upload = !hasNotice && hasNotice !== null;

  return (
    <main
      className={
        show_upload
          ? "flex flex-col items-center gap-5 justify-between p-24 text-black tablet:p-6"
          : "hidden"
      }
    >
      {show_upload ? (
        <h1 className="text-xl font-bold text-black tablet:text-center">
          {t("notice-upload.no-upload-message")}{" "}
          <strong className="text-blue-800 cursor-pointer">
            {t("notice-upload.file")}
          </strong>{" "}
          ?
        </h1>
      ) : null}

      <Dialog>
        <DialogTrigger asChild>
          {show_upload ? (
            <Button
              ref={triggerRef}
              variant="secondary"
              style={{
                backgroundColor: "#0D4290",
                color: "white",
                borderRadius: "10px",
              }}
            >
              {t("notice-upload.upload-button")}
            </Button>
          ) : (
            <div ref={triggerRef} />
          )}
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("notice-upload.modal.title")}</DialogTitle>
            <DialogDescription>
              {t("notice-upload.modal.subtitle")}
            </DialogDescription>

            {progresspercent ? (
              <div className="flex gap-3">
                <Progress value={progresspercent} />
                {progresspercent}%
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-4">
                <input
                  title="upload file"
                  ref={inputRef}
                  className="hidden"
                  type="file"
                  onChange={(e) =>
                    setFileToUpload(
                      e.target.files
                        ? (e.target.files[0] as File)
                        : (null as any)
                    )
                  }
                  accept=".pdf"
                />
                <div
                  className="w-full flex items-center justify-center border-2 border-dashed border-neutral-600 p-5 rounded-lg cursor-pointer"
                  onClick={() => inputRef.current.click()}
                  ref={drop}
                >
                  {t("notice-upload.modal.upload-input")}
                </div>

                <Form {...form}>
                  <div className="h-full">
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="w-full h-full flex flex-col justify-between gap-4"
                    >
                      <div className="flex-col flex gap-5">
                        {fileToUpload ? (
                          <div
                            className="min-w-[300px] flex items-center justify-between gap-5 p-3 border-solid border-2 border-neutral-600 rounded-sm "
                            key={fileToUpload.name}
                          >
                            {fileToUpload.name.length > 30 ? (
                              <div className="text-neutral-500">
                                {fileToUpload.name.substring(0, 30)}...
                              </div>
                            ) : (
                              <div className="text-neutral-500">
                                {fileToUpload.name}
                              </div>
                            )}

                            <div className="flex gap-2 items-center justify-center">
                              <Trash
                                color="red"
                                size={16}
                                className="cursor-pointer"
                                onClick={() => setFileToUpload(null as any)}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="text-neutral-700">
                            {t("notice-upload.modal.no-file-message")}
                          </div>
                        )}
                      </div>

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

                            <FormItem>
                              <FormLabel>
                                {t(
                                  "notice-upload.modal.manually.notice-content"
                                )}
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
                    </form>
                  </div>
                </Form>
              </div>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </main>
  );
}
