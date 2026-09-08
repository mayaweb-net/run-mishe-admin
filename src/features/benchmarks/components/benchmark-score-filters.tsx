import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BenchmarkScoreListQuery } from "@/features/benchmarks/types";

interface BenchmarkScoreFiltersProps {
  query: BenchmarkScoreListQuery;
  onChange: (patch: Partial<BenchmarkScoreListQuery>) => void;
  sortOptions: Array<{ value: string; label: string }>;
  sourceOptions: Array<{ value: string; label: string }>;
  benchmarkOptions: Array<{ value: string; label: string }>;
}

export function BenchmarkScoreFilters({
  query,
  onChange,
  sortOptions,
  sourceOptions,
  benchmarkOptions,
}: BenchmarkScoreFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <div className="relative xl:col-span-2">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query.q ?? ""}
          placeholder="جستجو در قطعه، بنچمارک یا منبع..."
          className="ps-8"
          onChange={(event) => onChange({ q: event.target.value, page: 1 })}
        />
      </div>

      <Select
        value={query.source ?? "all"}
        onValueChange={(value) =>
          onChange({
            source: !value || value === "all" ? undefined : value,
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="منبع" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه منابع</SelectItem>
          {sourceOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query.benchmarkSlug ?? "all"}
        onValueChange={(value) =>
          onChange({
            benchmarkSlug: !value || value === "all" ? undefined : value,
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="بنچمارک" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه بنچمارک‌ها</SelectItem>
          {benchmarkOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={`${query.sortBy ?? "score"}:${query.sortOrder ?? "desc"}`}
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
