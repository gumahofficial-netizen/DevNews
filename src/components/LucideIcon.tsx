import React from "react";
import * as Icons from "lucide-react";

interface LucideIconProps {
  name: string;
  className?: string;
}

export function LucideIcon({ name, className = "" }: LucideIconProps) {
  // Get icon component by string name, fallback to Globe if not found
  const IconComponent = (Icons as any)[name] || Icons.Globe;
  return <IconComponent className={className} />;
}
