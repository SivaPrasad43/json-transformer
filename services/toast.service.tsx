import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info, Sparkles, Clipboard, Trash, Rocket } from "lucide-react";

export const toastService = {
  success: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      className: "border-green-500/30 bg-green-950/80",
    });
  },

  error: (message: string, description?: string) => {
    toast.error(message, {
      description,
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      className: "border-red-500/30 bg-red-950/80",
    });
  },

  warning: (message: string, description?: string) => {
    toast.warning(message, {
      description,
      icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
      className: "border-yellow-500/30 bg-yellow-950/80",
    });
  },

  info: (message: string, description?: string) => {
    toast.info(message, {
      description,
      icon: <Info className="w-4 h-4 text-blue-500" />,
      className: "border-blue-500/30 bg-blue-950/80",
    });
  },

  // Custom variants
  transform: (message: string, description?: string) => {
    toast.success(message, {
      description,
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      className: "border-indigo-500/30 bg-indigo-950/80",
    });
  },

  copied: (text: string) => {
    toast.success("Copied to clipboard", {
      description: text,
      icon: <Clipboard className="w-4 h-4 text-green-500" />,
      className: "border-green-500/30 bg-green-950/80",
    });
  },

  deleted: (message: string) => {
    toast.success(message, {
      icon: <Trash className="w-4 h-4 text-green-500" />,
      className: "border-green-500/30 bg-green-950/80",
    });
  },

  apiTest: (message: string, time: number) => {
    toast.success(message, {
      description: `Response received in ${time}ms`,
      icon: <Rocket className="w-4 h-4 text-green-500" />,
      className: "border-green-500/30 bg-green-950/80",
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
};
