import { firestore } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { Check } from "lucide-react";
import { useState } from "react";

export default function TaskCheckbox({
  id,
  is_finished,
}: {
  id: string | null;
  is_finished: boolean;
}) {
  const [isClicked, setIsClicked] = useState(is_finished);

  const handleClick = () => {
    setIsClicked(!isClicked);

    const taskDocRef = doc(firestore, "tasks", id as string);

    setDoc(
      taskDocRef,
      {
        is_finished: !isClicked,
      },
      { merge: true }
    );
  };

  return (
    <div
      className={`p-1 cursor-pointer rounded-sm border ${
        isClicked ? "border-green-400 bg-green-200" : "border-gray-300"
      }`}
      onClick={handleClick}
    >
      <Check color={`${isClicked ? "green" : "gray"}`} size={20} />
    </div>
  );
}
