import { useToast } from "@/components/ui/use-toast";
import { displayErrorHandler } from "../errors/displayErrorHandler";

export const useAction = () => {
  const { toast } = useToast();

  return async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (err: any) {
      const { title, message } = displayErrorHandler(err);

      toast({
        variant: "destructive",
        title: title,
        description: message,
      });
    }
  };
};
