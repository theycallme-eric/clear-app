import { Toaster as Sonner, toast as sonnerToast } from "sonner";
import { chamferedToast } from "@/components/ChamferedToast";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: "group toast !bg-transparent !border-none !shadow-none !p-0",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

/**
 * Toast API - wraps sonner with chamfered toast styling
 *
 * Usage:
 *   toast.success("Title")
 *   toast.error("Error message")
 *   toast.info("Info message")
 */
const toast = {
  ...sonnerToast,
  success: chamferedToast.success,
  error: chamferedToast.error,
  info: chamferedToast.info,
};

export { Toaster, toast };
