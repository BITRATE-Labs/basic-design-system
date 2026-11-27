import { BoldIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function IconTooltipTrigger() {
  return (
    <Tooltip>
      <TooltipTrigger render={<Button size="icon" />}>
        <BoldIcon />
      </TooltipTrigger>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" />}>
        <BoldIcon />
      </TooltipTrigger>
      <TooltipTrigger render={<Button size="icon" aria-label="Bold" />}>
        <BoldIcon />
      </TooltipTrigger>
      <TooltipTrigger aria-label="Bold" render={<Button size="icon" />}>
        <BoldIcon />
      </TooltipTrigger>
      <TooltipTrigger render={<Button size="icon" aria-labelledby="bold-label" />}>
        <BoldIcon />
      </TooltipTrigger>
      <TooltipTrigger render={<Button />}>Bold</TooltipTrigger>
      <TooltipContent>Bold</TooltipContent>
    </Tooltip>
  );
}
