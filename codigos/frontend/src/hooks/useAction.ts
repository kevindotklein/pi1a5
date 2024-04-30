import { useToast } from "@/components/ui/use-toast";
import { displayErrorHandler } from "../app/errors/displayErrorHandler";

export const useAction = () => {
  const { toast } = useToast();

  return async (action: () => Promise<void>, onError?: () => Promise<void>) => {
    try {
      await action();
    } catch (err: any) {
      console.error(err);

      console.log(onError);

      if (onError) onError();

      const { title, message } = displayErrorHandler(err);

      toast({
        variant: "destructive",
        title: title,
        description: message,
      });
    }
  };
};
