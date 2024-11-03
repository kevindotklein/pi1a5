"use client";

import React, { useEffect, useState, ReactNode } from "react";
import {
  collection,
  doc,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useAuth } from "./user";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "@/firebase/config";
import { useCollection } from "react-firebase-hooks/firestore";

interface Notification {
  id: string;
  route?: string;
  read: boolean;
}

interface NotificationResponse {
  notifications: Notification[];
  read_notifications: string[];
  has_pending_notifications: boolean;
  total_rows: number;
}

interface NotificationContextType {
  notifications?: Notification[];
  hasPendingNotifications: boolean;
  getNotifications: (page?: number) => Promise<void>;
  readNotification: (id: string) => Promise<void>;
  readNotifications: string[];
}

export const NotificationContext = React.createContext<NotificationContextType>(
  {
    notifications: [],
    hasPendingNotifications: false,
    getNotifications: async () => {},
    readNotification: async () => {},
    readNotifications: [],
  }
);

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { userData } = useAuth();
  const [user, loading] = useAuthState(auth) as any;

  console.log(user.uid);

  const notificationRef = collection(firestore, "notifications");
  const notificationQuery = query(
    notificationRef,
    where("user_uid", "==", user.uid as string)
  );

  const [notificationsSnap] = useCollection(notificationQuery, {});

  const [notifications, setNotifications] = useState<
    Notification[] | undefined
  >(undefined);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);

  const [hasPendingNotifications, setHasPendingNotifications] =
    useState<boolean>(false);

  useEffect(() => {
    if (!notifications) return;

    if (readNotifications.length === (notifications?.length ?? 0)) {
      setHasPendingNotifications(false);
    }
  }, [readNotifications, notifications]);

  useEffect(() => {
    const notificationData = notificationsSnap?.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (notificationData) getNotifications(notificationData as any);
  }, [notificationsSnap]);

  console.log(notifications);
  const getNotifications = async (notifications: any): Promise<void> => {
    setNotifications(notifications);

    setReadNotifications(
      notifications.filter((n: any) => n.read).map((n: any) => n.id)
    );

    setHasPendingNotifications(notifications.some((n: any) => !n.read));
  };

  const readNotification = async (id: string): Promise<void> => {
    if (readNotifications.includes(id)) return;

    const docRef = doc(firestore, "notifications", id);
    await updateDoc(docRef, {
      read: true,
    });

    setReadNotifications((prev) => [...prev, id]);
  };

  const contextValue: NotificationContextType = {
    notifications,
    hasPendingNotifications,
    getNotifications,
    readNotification,
    readNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
