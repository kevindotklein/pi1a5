import { X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  message: string;
  onClose: () => void;
  type: "SUCCESS" | "ERROR";
}

export default function Toast({message, onClose, type}: Props) {

  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 ${type === "SUCCESS" ? "bg-green-500" : "bg-red-500" } text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-4`}>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 focus:outline-none"
        aria-label="Fechar"
      >
        <X />
      </button>
    </div>
  )
}