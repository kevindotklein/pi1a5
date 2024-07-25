import { useState } from "react";

interface Props {
  onClick: () => void;
  label: string;
}

export default function DayCheckbox({ onClick, label }: Props) {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(!isClicked);
    onClick();
  };

  return (
    <div
      className={`w-12 h-11 my-1 rounded-sm font-bold flex justify-center items-center cursor-pointer select-none ${
        isClicked
          ? "bg-blue-200 text-blue-800 border-2 border-blue-800"
          : "bg-neutral-200"
      }`}
      onClick={handleClick}
    >
      {label}
    </div>
  );
}
