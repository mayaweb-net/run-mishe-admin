import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BenchmarkListQuery, HardwareKind } from "@/features/benchmarks/types";
import { hardwareKindLabels } from "@/features/benchmarks/types";

interface BenchmarkDefinitionFiltersProps {
  query: BenchmarkListQuery;
  onChange: (patch: Partial<BenchmarkListQuery>) => void;
  sortOptions: Array<{ value: string; label: string }>;
}

const targets = Object.keys(hardwareKindLabels) as HardwareKind[];

export function BenchmarkDefinitionFilters({
  query,
  onChange,
  sortOptions,
}: BenchmarkDefinitionFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <div className="relative xl:col-span-2">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query.q ?? ""}
          placeholder="جستجو در نام، slug یا vendor..."
          className="ps-8"
          onChange={(event) => onChange({ q: event.target.value, page: 1 })}
        />
      </div>

      <Select
        value={query.target ?? "all"}
        onValueChange={(value) =>
          onChange({
            target: value === "all" ? undefined : (value as HardwareKind),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="هدف" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه اهداف</SelectItem>
          {targets.map((target) => (
            <SelectItem key={target} value={target}>
              {hardwareKindLabels[target]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query.isActive ?? "all"}
        onValueChange={(value) =>
          onChange({
            isActive:
              value === "all" ? undefined : (value as "true" | "false"),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="وضعیت" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه وضعیت‌ها</SelectItem>
          <SelectItem value="true">فعال</SelectItem>
          <SelectItem value="false">غیرفعال</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={`${query.sortBy ?? "name"}:${query.sortOrder ?? "asc"}`}
        onValueChange={(value) => {
          if (!value) return;
          const [sortBy, sortOrder] = value.split(":") as [
            string,
            "asc" | "desc",
          ];
          onChange({ sortBy, sortOrder, page: 1 });
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="مرتب‌سازی" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
