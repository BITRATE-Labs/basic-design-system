import { cn } from "cn";

export function ZIndexClasses({ raised }: { raised: boolean }) {
  return (
    <div className="relative z-[9999]">
      <p className={cn("z-50", raised && "md:z-10")}>Numeric</p>
      <p className="-z-1 z-(--layer)">Negative and variable</p>
      <p className="isolate z-auto">Allowed</p>
    </div>
  );
}
