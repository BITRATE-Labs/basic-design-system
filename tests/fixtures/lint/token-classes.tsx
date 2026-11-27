import { cn } from "cn";

export function TokenClasses({ active }: { active: boolean }) {
  return (
    <div className="bg-primary text-primary-foreground border-border p-4">
      <p className={cn("text-muted-foreground", active && "hover:bg-accent/50")}>Tokens</p>
    </div>
  );
}
