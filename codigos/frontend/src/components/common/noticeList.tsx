"use client";

import Loading from "@/components/common/loading";
import NoticeUpload from "@/components/common/noticeUpload";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/user";
import { auth } from "@/firebase/config";
import { signOut } from "firebase/auth";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function NoticeList() {
  const router = useRouter();

  const { userData } = useAuth() as any;

  const [user, loading] = useAuthState(auth) as any;

  console.log(userData);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 text-white w-full ">
      <h2>your notices</h2>

      {userData?.notices?.length ? (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          {userData.notices.map((notice: any) => (
            <div
              key={notice.id}
              className="flex flex-col gap-3 p-4 border border-neutral-800 rounded-lg w-[50%]"
            >
              <div key={notice.id} className="flex flex-col gap-1">
                <p className="text-lg text-neutral-100 cursor-pointer hover:text-neutral-200">
                  {notice.name}
                </p>
                <span className="text-sm text-neutral-400">
                  {notice.file_name} - uploaded at {notice.created_at}
                </span>
              </div>

              <p>subjects and contents:</p>

              <div className="flex flex-col gap-4 w-full flex-wrap">
                {notice.subjects.map((subject: any) => (
                  <div
                    key={subject.id}
                    className="flex flex-col gap-3 p-4 border border-neutral-500 rounded-sm"
                  >
                    <p className="text-lg text-neutral-100">{subject.name}</p>

                    {subject.contents.map((content: any) => (
                      <div
                        key={content}
                        className="flex flex-col gap-1 p-2 border border-neutral-600 rounded-sm"
                      >
                        <p className="text-sm text-neutral-200">
                          {content}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>no notices yet...</p>
      )}
    </div>
  );
}
