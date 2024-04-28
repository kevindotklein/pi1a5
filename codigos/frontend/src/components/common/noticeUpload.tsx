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

export default function NoticeUpload({
  hasNotice,
  setHasNotice,
}: {
  hasNotice: boolean;
  setHasNotice: (hasNotice: boolean) => void;
}) {
  const action = useAction();
  const { toast } = useToast();

  const { refresh } = useAuth();
  const { processNotice } = useFunctions();

  const [user] = useAuthState(auth);

  const inputRef = useRef(null) as any;
  const drop = useRef(null) as any;

  const [fileToUpload, setFileToUpload] = useState<File>(null as any);
  const [progresspercent, setProgresspercent] = useState(0);
  const [loading, setLoading] = useState(false);

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
        title: "invalid file type",
        description: "please upload a pdf file",
      });
    }

    if (!name) {
      return toast({
        variant: "destructive",
        title: "invalid name",
        description: "please insert a name for the notice",
      });
    }

    await action(
      async () => {
        setLoading(true);

        const file_name = (Math.random() + 1).toString(36).substring(7);

        const storageRef = ref(storage, `notices/${file_name}`);
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            // setProgresspercent(progress);
          },
          (error) => {
            toast({
              variant: "destructive",
              title: "error!",
              description: error.message,
            });
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            await processNotice(downloadURL);

            addDoc(collection(firestore, "notices"), {
              name,
              file_name: fileToUpload.name,
              url: downloadURL,
              user_uid: user ? user?.uid : "anonymous",
              processed: true,
            });

            const userDocRef = doc(firestore, "users", user?.uid as string);

            setDoc(
              userDocRef,
              {
                has_notice: true,
                notice_name: name,
              },
              { merge: true }
            );

            refresh();

            setFileToUpload(null as any);

            toast({
              title: "file uploaded!",
              description: "your notice has been uploaded successfully!",
            });

            setProgresspercent(0);
            setLoading(false);
          }
        );
      },
      async () => {
        setLoading(false);
        setProgresspercent(0);
      }
    );
  };

  return (
    <main className="flex flex-col items-center gap-5 justify-between p-24 text-neutral-50">
      <h1>
        you still haven't uploaded any notice, let's get started by uploading a
        file?
      </h1>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary">Upload</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>upload a file</DialogTitle>
            <DialogDescription>
              drag and drop a file here or click to select a file
            </DialogDescription>

            {progresspercent ? (
              <div className="flex gap-3">
                <Progress value={progresspercent} />
                {progresspercent}%
              </div>
            ) : (
              <div className="mt-5 flex flex-col gap-10">
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
                  drop file or click here
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
                            {fileToUpload.name}

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
                          <div className="text-neutral-500">
                            no file selected
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-5">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="insert the notice name"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-center justify-between w-full">
                        <DialogClose asChild>
                          <Button variant="secondary">cancel</Button>
                        </DialogClose>

                        <Button 
                        // disabled={loading} 
                        type="submit">
                          upload
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
