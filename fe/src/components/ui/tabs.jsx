import { useState } from "react";

export function Tabs({ defaultValue, children, className }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className={className}>
      {children.map((child) => {
        if (!child) return null;

        if (child.type.displayName === "TabsList") {
          return (
            <child.type
              key={child.key}
              {...child.props}
              value={value}
              onChange={setValue}
            />
          );
        }

        if (
          child.type.displayName === "TabsContent" &&
          child.props.value === value
        ) {
          return child;
        }

        return null;
      })}
    </div>
  );
}

export function TabsList({ children, value, onChange, className }) {
  return (
    <div className={className}>
      {children.map((child) => (
        <child.type
          key={child.props.value}
          {...child.props}
          active={value}
          onChange={onChange}
        />
      ))}
    </div>
  );
}
TabsList.displayName = "TabsList";

export function TabsTrigger({ value, active, onChange, children, className }) {
  const isActive = value === active;
  return (
    <button
      onClick={() => onChange(value)}
      className={`${className} ${
        isActive ? "bg-muted text-primary" : "opacity-60"
      }`}
    >
      {children}
    </button>
  );
}
TabsTrigger.displayName = "TabsTrigger";

export function TabsContent({ children }) {
  return <>{children}</>;
}
TabsContent.displayName = "TabsContent";
