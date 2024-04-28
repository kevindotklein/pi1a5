"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from "@/firebase/config";
import { useToast } from "@/components/ui/use-toast";
import { useAction } from "@/hooks/useAction";
import { collection, doc, setDoc } from "firebase/firestore";

export default function Register() {
  const { toast } = useToast();
  const action = useAction();

  const formSchema = z.object({
    full_name: z.string().min(3),
    email: z.string().email(),
    password: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { full_name, email, password } = values;

    await action(async () => {
      await createUserWithEmailAndPassword(auth, email, password);

      const userId = auth.currentUser?.uid;

      await setDoc(doc(firestore, "users", userId as string), {
        full_name,
        email,
        has_notice: false,
      });

      router.push("/common/dashboard");
    });
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="h-full flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-3xl font-bold flex gap-2 items-center text-neutral-50">
            studyflow
          </h3>
          <h2 className="text-sm text-neutral-200">
            create your account, really fast
          </h2>
        </div>
        <Form {...form}>
          <div className="h-full">
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full h-full flex flex-col justify-between gap-4"
            >
              <div className="flex flex-col gap-5">
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>name</FormLabel>
                      <FormControl>
                        <Input placeholder="insert your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>e-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="insert your e-mail" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="insert your password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-baseline justify-between mt-8 gap-2 tablet:!flex-col">
                <Button variant="link" asChild>
                  <Link
                    href="/auth/login"
                    className="text-sm hover:underline tablet:!text-xs text-neutral-200"
                  >
                    {"already have an account?"}
                  </Link>
                </Button>

                <Button variant="default" size="lg">
                  register
                </Button>
              </div>
            </form>
          </div>
        </Form>
      </div>
    </div>
  );
}
