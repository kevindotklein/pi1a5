import { Check } from "lucide-react";
import { useState } from "react";

export default function TaskCheckbox() {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(!isClicked);
  }

  return (
    <div className={`p-1 cursor-pointer rounded-sm border ${isClicked ? "border-green-400 bg-green-200" : "border-gray-300"}`} onClick={handleClick}>
      <Check color={`${isClicked ? "green" : "gray"}`} size={26} />
    </div>
  );
}
