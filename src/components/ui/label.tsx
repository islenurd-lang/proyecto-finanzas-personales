import { cn } from "@/lib/utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export default function Label({ className, children, required, ...props }: LabelProps) {
  return (
    <label
      className={cn("block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1", className)}
      {...props}
    >
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
}
