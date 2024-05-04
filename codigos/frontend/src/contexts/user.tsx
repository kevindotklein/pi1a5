"use client";

import { auth, firestore } from "@/firebase/config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export const AuthContext = createContext({
  refresh: () => {},
  userData: null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, loading] = useAuthState(auth) as any;

  const [userData, setUserData] = useState(null) as any;

  useEffect(() => {
    if (loading) return;

    if (user) getUserData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const getUserData = async () => {
    if (!user) return;

    const docRef = doc(firestore, "users", user.uid as string);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      let data = docSnap.data();

      if (data.has_notice) {
        const noticesRef = collection(firestore, "notices");
        const noticesQuery = query(
          noticesRef,
          where("user_uid", "==", user.uid)
        );
        const noticesSnap = await getDocs(noticesQuery);

        const notices = [] as any;

        for (const notice of noticesSnap.docs) {
          const id = notice.id;

          const subjectRef = collection(firestore, "subjects");
          const subjectQuery = query(subjectRef, where("notice_id", "==", id));
          const subjectSnap = await getDocs(subjectQuery);

          const subjects = subjectSnap.docs.map((doc: any) => doc.data());

          notices.push({ id, ...notice.data(), subjects });
        }

        data = { ...data, notices };
      }

      setUserData(data);
    }
  };

  const contextValue = {
    refresh: getUserData,
    userData: { ...userData, auth_info: user },
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
