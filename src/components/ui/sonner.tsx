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
        unstyled: true,
        style: {
          background: "transparent",
          border: "none",
          boxShadow: "none",
          padding: 0,
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
