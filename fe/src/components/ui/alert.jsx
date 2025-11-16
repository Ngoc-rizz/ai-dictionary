export function Alert({ children, className }) {
  return (
    <div
      className={`border rounded-md p-3 flex items-start gap-3 bg-muted/30 my-2 ${className}`}
    >
      {children}
    </div>
  );
}

export function AlertDescription({ children }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}
