import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DataQuality, DemandTier, GameListQuery } from "@/features/games/types";
import { demandTierLabels, qualityLabels } from "@/features/games/types";

interface GameFiltersProps {
  query: GameListQuery;
  onChange: (patch: Partial<GameListQuery>) => void;
  sortOptions: Array<{ value: string; label: string }>;
}

const demandTiers = Object.keys(demandTierLabels) as DemandTier[];
const qualities = Object.keys(qualityLabels) as DataQuality[];

export function GameFilters({ query, onChange, sortOptions }: GameFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
      <div className="relative xl:col-span-2">
        <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query.q ?? ""}
          placeholder="جستجو در نام، slug، developer..."
          className="ps-8"
          onChange={(event) => onChange({ q: event.target.value, page: 1 })}
        />
      </div>

      <Select
        value={query.demandTier ?? "all"}
        onValueChange={(value) =>
          onChange({
            demandTier: value === "all" ? undefined : (value as DemandTier),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Demand Tier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه demand tierها</SelectItem>
          {demandTiers.map((tier) => (
            <SelectItem key={tier} value={tier}>
              {demandTierLabels[tier]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={
          query.isPublished === undefined
            ? "all"
            : query.isPublished
              ? "published"
              : "draft"
        }
        onValueChange={(value) =>
          onChange({
            isPublished:
              value === "all" ? undefined : value === "published",
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="وضعیت انتشار" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه وضعیت‌ها</SelectItem>
          <SelectItem value="published">منتشر شده</SelectItem>
          <SelectItem value="draft">پیش‌نویس</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={
          query.isPopular === undefined ? "all" : query.isPopular ? "yes" : "no"
        }
        onValueChange={(value) =>
          onChange({
            isPopular: value === "all" ? undefined : value === "yes",
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="محبوبیت" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه</SelectItem>
          <SelectItem value="yes">محبوب</SelectItem>
          <SelectItem value="no">غیرمحبوب</SelectItem>
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
        value={query.reviewStatus ?? "all"}
        onValueChange={(value) =>
          onChange({
            reviewStatus:
              value === "all"
                ? undefined
                : (value as GameListQuery["reviewStatus"]),
            page: 1,
          })
        }
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="وضعیت اتصال" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">همه اتصال‌ها</SelectItem>
          <SelectItem value="UNMATCHED_ANY">هر اتصال ناقص</SelectItem>
          <SelectItem value="UNMATCHED_CPU">CPU متصل‌نشده</SelectItem>
          <SelectItem value="UNMATCHED_GPU">GPU متصل‌نشده</SelectItem>
          <SelectItem value="NEEDS_REVIEW">نیازمند بررسی</SelectItem>
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
