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
  DataQuality,
  FormFactor,
  HardwareListQuery,
  Vendor,
} from "@/features/hardware/types";
import {
  formFactorLabels,
  qualityLabels,
  vendorLabels,
} from "@/features/hardware/types";

interface HardwareFiltersProps {
  query: HardwareListQuery;
  onChange: (patch: Partial<HardwareListQuery>) => void;
  sortOptions: Array<{ value: string; label: string }>;
}

const vendors = Object.keys(vendorLabels) as Vendor[];
const formFactors = Object.keys(formFactorLabels) as FormFactor[];
const qualities = Object.keys(qualityLabels) as DataQuality[];

export function HardwareFilters({
  query,
  onChange,
  sortOptions,
}: HardwareFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <div className="relative xl:col-span-2">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query.q ?? ""}
          placeholder="جستجو در نام، slug یا alias..."
          className="ps-8"
          onChange={(event) => onChange({ q: event.target.value, page: 1 })}
        />
      </div>

      <Select
        value={query.vendor ?? "all"}
        onValueChange={(value) =>
          onChange({
            vendor: value === "all" ? undefined : (value as Vendor),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="سازنده" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه سازنده‌ها</SelectItem>
          {vendors.map((vendor) => (
            <SelectItem key={vendor} value={vendor}>
              {vendorLabels[vendor]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query.formFactor ?? "all"}
        onValueChange={(value) =>
          onChange({
            formFactor: value === "all" ? undefined : (value as FormFactor),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="فرم‌فاکتور" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه فرم‌فاکتورها</SelectItem>
          {formFactors.map((formFactor) => (
            <SelectItem key={formFactor} value={formFactor}>
              {formFactorLabels[formFactor]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={query.quality ?? "all"}
        onValueChange={(value) =>
          onChange({
            quality: value === "all" ? undefined : (value as DataQuality),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="کیفیت داده" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه کیفیت‌ها</SelectItem>
          {qualities.map((quality) => (
            <SelectItem key={quality} value={quality}>
              {qualityLabels[quality]}
            </SelectItem>
          ))}
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
