import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type HardwareFieldType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "readonly"
  | "array";

export interface HardwareFieldConfig {
  key: string;
  label: string;
  type: HardwareFieldType;
  options?: Array<{ value: string; label: string }>;
}

interface HardwareDetailFieldsProps {
  fields: HardwareFieldConfig[];
  values: Record<string, unknown>;
  editing: boolean;
  onChange: (key: string, value: unknown) => void;
}

function formatReadonlyValue(value: unknown) {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  if (typeof value === "boolean") return value ? "بله" : "خیر";
  return String(value);
}

function toDateInputValue(value: unknown) {
  if (!value || typeof value !== "string") return "";
  return value.slice(0, 10);
}

export function HardwareDetailFields({
  fields,
  values,
  editing,
  onChange,
}: HardwareDetailFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {fields.map((field) => {
        const value = values[field.key];
        const disabled = !editing || field.type === "readonly";

        if (!editing || field.type === "readonly") {
          return (
            <div key={field.key} className="space-y-1.5">
              <Label>{field.label}</Label>
              <Input
                value={formatReadonlyValue(value)}
                readOnly
                disabled
                className="bg-muted/40"
              />
            </div>
          );
        }

        if (field.type === "boolean") {
          return (
            <div key={field.key} className="flex items-center gap-2 pt-7">
              <Checkbox
                checked={Boolean(value)}
                onCheckedChange={(checked) => onChange(field.key, checked === true)}
              />
              <Label>{field.label}</Label>
            </div>
          );
        }

        if (field.type === "select" && field.options) {
          return (
            <div key={field.key} className="space-y-1.5">
              <Label>{field.label}</Label>
              <Select
                value={value ? String(value) : undefined}
                onValueChange={(next) => onChange(field.key, next)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="انتخاب کنید" />
                </SelectTrigger>
                <SelectContent>
                  {field.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (field.type === "array") {
          return (
            <div key={field.key} className="space-y-1.5">
              <Label>{field.label}</Label>
              <Input
                value={Array.isArray(value) ? value.join(", ") : ""}
                disabled={disabled}
                placeholder="با ویرگول جدا کنید"
                onChange={(event) =>
                  onChange(
                    field.key,
                    event.target.value
                      .split(",")
                      .map((part) => part.trim())
                      .filter(Boolean),
                  )
                }
              />
            </div>
          );
        }

        return (
          <div key={field.key} className="space-y-1.5">
            <Label>{field.label}</Label>
            <Input
              type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
              value={
                field.type === "date"
                  ? toDateInputValue(value)
                  : value == null
                    ? ""
                    : String(value)
              }
              disabled={disabled}
              onChange={(event) => {
                if (field.type === "number") {
                  const next = event.target.value;
                  onChange(field.key, next === "" ? null : Number(next));
                  return;
                }

                if (field.type === "date") {
                  onChange(
                    field.key,
                    event.target.value ? `${event.target.value}T00:00:00.000Z` : null,
                  );
                  return;
                }

                onChange(field.key, event.target.value);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
