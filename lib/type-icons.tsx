import { 
  Hash, 
  Type, 
  ToggleLeft, 
  Braces, 
  Brackets, 
  Calendar,
  LucideIcon 
} from "lucide-react";

export type JsonType = "string" | "number" | "boolean" | "object" | "array" | "null" | "date";

interface TypeConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const typeConfigMap: Record<JsonType, TypeConfig> = {
  string: {
    icon: Type,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  number: {
    icon: Hash,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  boolean: {
    icon: ToggleLeft,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  object: {
    icon: Braces,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
  array: {
    icon: Brackets,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
  },
  null: {
    icon: Type,
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
  },
  date: {
    icon: Calendar,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
  },
};

export function getJsonType(value: any): JsonType {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") return "object";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") {
    // Check if it's a date string
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "date";
    return "string";
  }
  return "string";
}

export function getTypeLabel(value: any): string {
  return getJsonType(value);
}

export function getTypeConfig(type: JsonType): TypeConfig {
  return typeConfigMap[type];
}

interface TypeIconProps {
  value: any;
  className?: string;
}

export function TypeIcon({ value, className = "" }: TypeIconProps) {
  const type = getJsonType(value);
  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <div className={`flex items-center justify-center w-6 h-6 rounded ${config.bgColor} ${className}`}>
      <Icon className={`w-3.5 h-3.5 ${config.color}`} />
    </div>
  );
}
