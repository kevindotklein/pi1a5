"use client";

import { auth, firestore } from "@/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export const AuthContext = createContext({
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
      setUserData(docSnap.data());
    }
  };

  const contextValue = {
    userData: { ...userData, auth_info: user },
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
