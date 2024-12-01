import { Check, PencilIcon, Plus } from "lucide-react";
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
import { useAction } from "@/hooks/useAction";
import { firestore } from "@/firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useToast } from "../ui/use-toast";
import TaskReviewCheckbox from "./taskReviewCheckbox";

interface Props {
  id: any;
  hours: number;
  title: string;
  subject: string;
  description: string;
  is_finished: boolean;
  needs_review: boolean;
  hightlighted: number | null;
  setHightlighted: (index: number | null) => void;
  setActiveCard: (index: number | null) => void;
  commentary: any;
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
  needs_review,
  hightlighted,
  setHightlighted,
  setActiveCard,
  commentary,
  index,
  prio,
}: Props) {
  const ref = useRef() as any;
  const { t, i18n } = useTranslation();
  const action = useAction();
  const { toast } = useToast();

  const [commentaryOpen, setCommentaryOpen] = useState(commentary);
  const [newCommentary, setCommentary] = useState(commentary || "");

  const saveCommentary = async () => {
    if (!newCommentary) return;

    await action(async () => {
      const docRef = doc(firestore, "tasks", id);

      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const notice = docSnap.data();
        await setDoc(docRef, {
          ...notice,
          commentary: newCommentary,
        });

        toast({
          title: "Sucesso!",
          description: "Comentário salvo com sucesso.",
        });
      }
    });
  };

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
            ? "bg-green-100 opacity-50"
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

        {is_finished && (
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <p className="text-sm text-neutral-500 select-none">
              Tarefa concluída
            </p>
          </div>
        )}
      </div>

      <Dialog>
        <DialogTrigger ref={ref} />

        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{subject}</DialogDescription>

            <div className="flex flex-col gap-5 w-full py-5">
              <p className="text-md text-neutral-700">{description}</p>

              <div className="flex w-full justify-between gap-2 items-center">
                <div className="flex gap-2 items-center">
                  <TaskCheckbox id={id} is_finished={is_finished} />
                  <p className="text-sm text-neutral-600">
                    {t("common-task.done")}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <TaskReviewCheckbox id={id} needs_review={needs_review} />
                  <p className="text-sm text-neutral-600">Preciso revisar</p>
                </div>
              </div>

              <div className="flex w-full justify-end gap-2 items-center">
                {!commentaryOpen && (
                  <div
                    className="flex gap-2 items-center"
                    onClick={() => setCommentaryOpen(true)}
                  >
                    <span className="text-sm text-neutral-700 cursor-pointer">
                      Escrever observação
                    </span>
                    <PencilIcon size={15} color="#1a1a1a" />
                  </div>
                )}
              </div>
            </div>

            {commentaryOpen ? (
              <div className="flex flex-col gap-2 w-full py-5">
                <span className="text-sm text-neutral-700">
                  Suas observações:
                </span>
                <textarea
                  className="w-full border border-neutral-500 rounded-md p-3 text-sm text-neutral-700"
                  placeholder="Adicione um comentário"
                  value={newCommentary}
                  onChange={(e) => setCommentary(e.target.value)}
                  spellCheck="false"
                />

                {commentary !== newCommentary && (
                  <div className="flex justify-between">
                    <Button
                      onClick={() => {
                        if (!newCommentary) return setCommentaryOpen(false);

                        setCommentary(commentary);
                      }}
                      style={{
                        backgroundColor: "white",
                        color: "#0D4290",
                        borderRadius: "10px",
                        width: "fit-content",
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={saveCommentary}
                      disabled={!commentary}
                      style={{
                        backgroundColor: "#0D4290",
                        color: "white",
                        borderRadius: "10px",
                        width: "fit-content",
                      }}
                    >
                      Salvar
                    </Button>
                  </div>
                )}
              </div>
            ) : null}

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
