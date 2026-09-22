import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FpsSampleListQuery,
  QualityPreset,
  ScreenResolution,
} from "@/features/fps/types";
import { presetLabels, resolutionLabels } from "@/features/fps/types";

interface FpsSampleFiltersProps {
  query: FpsSampleListQuery;
  onChange: (patch: Partial<FpsSampleListQuery>) => void;
  sortOptions: Array<{ value: string; label: string }>;
}

const resolutions = Object.keys(resolutionLabels) as ScreenResolution[];
const presets = Object.keys(presetLabels) as QualityPreset[];

export function FpsSampleFilters({
  query,
  onChange,
  sortOptions,
}: FpsSampleFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <div className="relative xl:col-span-2">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query.q ?? ""}
          placeholder="جستجو در بازی، GPU، CPU یا منبع..."
          className="ps-8"
          onChange={(event) => onChange({ q: event.target.value, page: 1 })}
        />
      </div>

      <Select
        value={query.resolution ?? "all"}
        onValueChange={(value) =>
          onChange({
            resolution:
              !value || value === "all"
                ? undefined
                : (value as ScreenResolution),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="رزولوشن" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه رزولوشن‌ها</SelectItem>
          {resolutions.map((resolution) => (
            <SelectItem key={resolution} value={resolution}>
              {resolutionLabels[resolution]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query.preset ?? "all"}
        onValueChange={(value) =>
          onChange({
            preset:
              !value || value === "all" ? undefined : (value as QualityPreset),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="پریست" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه پریست‌ها</SelectItem>
          {presets.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {presetLabels[preset]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
          <SelectItem value="notebookcheck">notebookcheck</SelectItem>
          <SelectItem value="user">user</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={`${query.sortBy ?? "capturedAt"}:${query.sortOrder ?? "desc"}`}
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
