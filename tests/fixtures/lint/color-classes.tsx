import { cn } from "cn";

export function ColorClasses({ active }: { active: boolean }) {
  return (
    <div className="bg-red-500 p-4">
      <p className="hover:text-neutral-400">Palette</p>
      <p className={cn("bg-[#fff]", active && "text-[rgb(0,0,0)]")}>Arbitrary</p>
    </div>
  );
}
