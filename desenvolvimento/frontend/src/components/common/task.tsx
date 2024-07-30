import { Check } from "lucide-react";
import TaskCheckbox from "./taskCheckbox";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface Props {
  id: any;
  hours: number;
  title: string;
  subject: string;
  description: string;
  is_finished: boolean;
  hightlighted: number | null;
  setHightlighted: (index: number | null) => void;
  setActiveCard: (index: number | null) => void;
  index: number;
  prio: number;
}

export default function Task({
  id,
  hours,
  title,
  subject,
  description,
  is_finished,
  hightlighted,
  setHightlighted,
  setActiveCard,
  index,
  prio,
}: Props) {
  const ref = useRef() as any;
  const { t, i18n } = useTranslation();

  return (
    <>
      <div
        onClick={() => ref.current.click()}
        draggable
        onDragStart={() => {
          setActiveCard(index);
          setHightlighted(index);
        }}
        onDragEnd={() => {
          setActiveCard(null);
        }}
        key={id}
        className={`w-full flex flex-col gap-4 p-3 ${
          hightlighted == index
            ? "bg-blue-100"
            : is_finished
            ? "bg-green-100"
            : "bg-neutral-100"
        } border border-neutral-500 rounded-sm cursor-grab transition-all hover:bg-neutral-200`}
      >
        <div className="flex flex-col gap-1 break-words select-none">
          <div className="flex items-center justify-end w-full">
            <div className="flex items-center justify-center gap-2 rounded-md bg-blue-800 px-2 py-1 text-xs text-white select-none">
              {hours} hora{hours > 1 ? "s" : ""}
            </div>
          </div>
          <h3 className="text-lg font-bold text-black leading-5 select-none">
            {title}
          </h3>
          <h4 className="text-sm font-bold text-neutral-500 select-none">
            {subject}
          </h4>
        </div>

        <p className="text-sm text-neutral-500 select-none">
          {description.length > 100
            ? description.substring(0, 100) + "..."
            : description}
        </p>
      </div>

      <Dialog>
        <DialogTrigger ref={ref} />

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{subject}</DialogDescription>

            <div className="flex flex-col gap-5 w-full py-5">
              <p className="text-md text-neutral-700">{description}</p>

              <div className="flex gap-2 items-center">
                <TaskCheckbox id={id} is_finished={is_finished} />
                <p className="text-sm text-neutral-600">
                  {t("common-task.done")}
                </p>
              </div>
            </div>

            <DialogClose asChild>
              <Button variant="secondary">
                {t("common-task.close-button")}
              </Button>
            </DialogClose>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
