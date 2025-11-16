import * as React from "react";

function Badge({ className, children, variant = "default" }) {
  const baseClass =
    "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1";
  const variantClass =
    {
      default: "bg-primary text-primary-foreground",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-destructive text-white",
      outline: "text-foreground border border-current",
    }[variant] || "";

  return (
    <span className={`${baseClass} ${variantClass} ${className || ""}`}>
      {children}
    </span>
  );
}

export { Badge };
