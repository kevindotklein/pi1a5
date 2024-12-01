import useNotification from "@/hooks/useNotifications";
import { useEffect, useState } from "react";

const Notification = ({ notification }: { notification: any }) => {
  const { readNotification, readNotifications } = useNotification();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [hasRead, setHasRead] = useState(notification.read);

  const should_shorten_description = notification.description.length > 80;

  useEffect(() => {
    if (notification.read || !readNotifications?.length) return;
    const is_notification_read = readNotifications.includes(notification.id);
    setHasRead(is_notification_read);
  }, [readNotifications, notification.read, notification.id]);

  return (
    <>
      <div
        key={notification.id}
        className="relative w-full flex items-start gap-2.5 p-2.5"
        onClick={() => {
          setIsDescriptionOpen(!isDescriptionOpen);
          readNotification(notification.id);
          setHasRead(true);
        }}
      >
        {/* Notification Dot */}
        <div className="absolute top-[0.5rem] left-[-0.1rem] bg-blue-600 rounded-full h-2 w-2"></div>

        {/* Infos Container */}
        <div className="flex flex-col gap-1 w-full pt-1 cursor-pointer">
          {/* Title */}
          <div className="flex justify-between items-start w-full">
            <h3 className="text-lg text-blue-600">{notification.title}</h3>
            <div
              className={`text-xs px-2 py-1 rounded-full ${
                hasRead ? "bg-gray-200 text-gray-700" : "bg-blue-600 text-white"
              }`}
            >
              <span>{hasRead ? notification.time_since_creation : "NOVA"}</span>
            </div>
          </div>

          {/* Description */}
          <p
            dangerouslySetInnerHTML={{
              __html: isDescriptionOpen
                ? `<p>${notification.description}</p>${
                    should_shorten_description
                      ? "<strong>Ver menos</strong>"
                      : ""
                  }`
                : `<p>${notification.description.substring(0, 80)}${
                    should_shorten_description ? "..." : ""
                  }</p>${
                    should_shorten_description
                      ? "<strong>Saiba mais</strong>"
                      : ""
                  }`,
            }}
            className="text-sm text-gray-800"
          />

          {/* External Link */}
          {isDescriptionOpen && notification.link ? (
            <a
              href={notification.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-blue-500 no-underline"
            >
              Acesse aqui para saber mais
            </a>
          ) : null}
        </div>
      </div>

      <hr />
    </>
  );
};

export default Notification;
