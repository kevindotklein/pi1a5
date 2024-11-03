import { useState } from "react";

import useNotification from "@/hooks/useNotifications";
import { X } from "lucide-react";
import Notification from "./notification";

const Notifications = ({
  openNotifications,
  setOpenNotifications,
}: {
  openNotifications?: boolean;
  setOpenNotifications: (openNotifications: boolean) => void;
}) => {
  const { getNotifications, notifications, readNotifications } =
    useNotification();

  const [filter, setFilter] = useState("not_read");
  const [animationIn, setAnimationIn] = useState(true);

  const filteredNotifications = notifications?.filter((notification) => {
    if (filter === "not_read")
      return !notification.read && !readNotifications.includes(notification.id);
    return true;
  });

  return (
    <div
      className={`transition-all fixed top-0 left-0 w-full h-full flex justify-center items-center z-50 ${
        openNotifications ? "bg-gray-900 bg-opacity-50" : "hidden"
      }`}
    >
      {/* Modal Container */}
      <div
        className={`${
          animationIn ? "animate-slideIn" : "animate-slideOut"
        } transition-all shadow-lg w-[400px] sm:w-full h-auto bg-white flex flex-col gap-2 rounded-lg p-5 z-50`}
      >
        {/* Title */}
        <div className="relative flex justify-center items-start py-2 bg-gray-50">
          <h1 className="text-lg text-blue-600 font-semibold">Notificações</h1>

          <X
            onClick={() => {
              setAnimationIn(false);
              setTimeout(() => setOpenNotifications(false), 500);
            }}
            className="absolute right-5 top-2 cursor-pointer text-gray-600"
          />
        </div>

        {/* Notification Filters */}
        <div className="flex gap-2 px-3">
          <div
            onClick={() => setFilter("not_read")}
            className={`p-2 rounded-lg cursor-pointer text-sm ${
              filter === "not_read"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-blue-600"
            }`}
          >
            Não lida
          </div>
          <div
            onClick={() => setFilter("all")}
            className={`p-2 rounded-lg cursor-pointer text-sm ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-transparent text-blue-600"
            }`}
          >
            Todas
          </div>
        </div>

        {/* Notification List */}
        <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto py-5 px-3 sm:max-h-[calc(100vh-130px)]">
          <div className="flex flex-col gap-2">
            {filteredNotifications?.length === 0 ? (
              <span className="text-base py-5">Nenhuma notificação</span>
            ) : (
              filteredNotifications?.map((notification) => (
                <Notification
                  key={notification.id}
                  notification={notification}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
