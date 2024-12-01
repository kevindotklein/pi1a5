import { firestore } from "@/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "../ui/use-toast";

export default function TaskReviewCheckbox({
  id,
  needs_review,
}: {
  id: string | null;
  needs_review: boolean;
}) {
  const { toast } = useToast();

  const [isClicked, setIsClicked] = useState(needs_review);

  const handleClick = () => {
    setIsClicked(!isClicked);

    const taskDocRef = doc(firestore, "tasks", id as string);

    setDoc(
      taskDocRef,
      {
        needs_review: !isClicked,
      },
      { merge: true }
    );

    if (!isClicked)
      toast({
        title: "Tarefa de revisão programada!",
        description:
          "Na próxima vez que você gerar suas tarefas, iremos incluir uma tarefa de revisão para este conteúdo.",
      });
  };

  return (
    <div
      className={`p-1/2 cursor-pointer rounded-sm border ${
        isClicked ? "border-blue-400 bg-blue-200" : "border-gray-300"
      }`}
      onClick={handleClick}
    >
      <Check color={`${isClicked ? "blue" : "gray"}`} size={15} />
    </div>
  );
}
