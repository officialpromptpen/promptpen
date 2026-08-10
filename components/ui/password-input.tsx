import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

function PasswordInput({
  className,
  placeholder = "Enter password",
  ...props
}: Omit<React.ComponentProps<"input">, "type"> & { placeholder?: string }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="pp:relative">
      <input
        className={cn(
          "pp:flex pp:h-9 pp:w-full pp:rounded-lg pp:border pp:border-input pp:bg-background pp:px-3 pp:py-1.5 pp:pr-10 pp:text-sm pp:shadow-xs pp:outline-none pp:transition-colors pp:focus-visible:border-ring pp:focus-visible:ring-3 pp:focus-visible:ring-ring/50 pp:disabled:cursor-not-allowed pp:disabled:opacity-50",
          className
        )}
        data-slot="input"
        placeholder={placeholder}
        type={showPassword ? "text" : "password"}
        {...props}
      />
      <button
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="pp:absolute pp:top-0 pp:right-0 pp:flex pp:h-full pp:w-9 pp:items-center pp:justify-center pp:text-muted-foreground pp:transition-colors hover:pp:text-foreground"
        onClick={() => setShowPassword(!showPassword)}
        tabIndex={-1}
        title={showPassword ? "Hide password" : "Show password"}
        type="button"
      >
        {showPassword ? (
          <EyeOff className="pp:size-4" />
        ) : (
          <Eye className="pp:size-4" />
        )}
      </button>
    </div>
  );
}

export { PasswordInput };
