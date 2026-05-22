// import { cn } from "@/lib/utils";

// interface DividerProps {
//   className?: string;
// }

// export function Divider({ className }: DividerProps) {
//   return <hr className={cn("border-t border-border-200", className)} />;
// }

import { cn } from "@/lib/utils";
interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return <hr className={cn("border-border-300", className)} />;
}
