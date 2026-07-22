import { BadgeCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const lowerStatus = status.toLowerCase();
  
  let variantClass = "bg-gray-100 text-gray-800 border-gray-200";
  let Icon = Info;
  
  if (lowerStatus === "pending") {
    variantClass = "bg-amber-100 text-amber-800 border-amber-200";
  } else if (lowerStatus === "paid" || lowerStatus === "completed" || lowerStatus === "success") {
    variantClass = "bg-green-100 text-green-800 border-green-200";
    Icon = BadgeCheck;
  } else if (lowerStatus === "cancelled" || lowerStatus === "failed") {
    variantClass = "bg-red-100 text-red-800 border-red-200";
  }
  
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border", variantClass, className)}>
      <Icon className="h-3.5 w-3.5" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}