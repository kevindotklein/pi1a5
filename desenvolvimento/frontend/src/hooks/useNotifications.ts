import { NotificationContext } from "@/contexts/notification";
import { useContext } from "react";

const useNotification = () => {
  const {
    notifications,
    hasPendingNotifications,
    getNotifications,
    readNotification,
    readNotifications,
  } = useContext(NotificationContext);

  return {
    notifications,
    hasPendingNotifications,
    getNotifications,
    readNotification,
    readNotifications,
  };
};

export default useNotification;
