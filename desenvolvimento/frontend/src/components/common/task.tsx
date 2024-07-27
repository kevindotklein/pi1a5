import { Check } from "lucide-react";
import TaskCheckbox from "./taskCheckbox";

interface Props {
  id: any;
  hours: number;
  title: string;
  subject: string;
  description: string;
  setActiveCard: (index: number | null) => void;
  index: number;
}

export default function Task({
  id,
  hours,
  title,
  subject,
  description,
  setActiveCard,
  index
}: Props) {
  return (
    <div
      draggable
      onDragStart={() => {setActiveCard(index)}}
      onDragEnd={() => {setActiveCard(null)}}
      key={id}
      className="flex flex-col gap-4 p-4 bg-neutral-100 max-w-[200px] border border-neutral-500 rounded-sm cursor-grab"
    >
      <div className="flex flex-col gap-1 break-words">
        <div className="flex items-center justify-between w-full mb-2">
          <TaskCheckbox />
          <div className="flex items-center justify-center gap-2 rounded-md bg-blue-800 px-2 py-1 text-xs text-white select-none">
            {hours} horas
          </div>
        </div>
        <h3 className="text-lg font-bold text-black leading-5 select-none">{title}</h3>
        <h4 className="text-sm font-bold text-neutral-500 select-none">{subject}</h4>
      </div>

      <p className="text-sm text-neutral-500 select-none">
        {description.length > 100
          ? description.substring(0, 100) + "..."
          : description}
      </p>
    </div>
  );
}
