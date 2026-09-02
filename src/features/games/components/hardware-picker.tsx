import { useEffect, useId, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { fetchAdminCpus, fetchAdminGpus } from "@/features/hardware/api";

interface HardwareOption {
  id: string;
  name: string;
}

interface HardwarePickerProps {
  kind: "cpu" | "gpu";
  label: string;
  value: HardwareOption | null;
  disabled?: boolean;
  onChange: (value: HardwareOption | null) => void;
}

export function HardwarePicker({
  kind,
  label,
  value,
  disabled = false,
  onChange,
}: HardwarePickerProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(value?.name ?? "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<HardwareOption[]>([]);

  useEffect(() => {
    setQuery(value?.name ?? "");
  }, [value]);

  useEffect(() => {
    if (disabled || !open) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const result =
          kind === "cpu"
            ? await fetchAdminCpus({ q: query.trim() || undefined, limit: 10, page: 1 })
            : await fetchAdminGpus({ q: query.trim() || undefined, limit: 10, page: 1 });

        if (!cancelled) {
          setOptions(
            result.items.map((item) => ({
              id: item.id,
              name: item.name,
            })),
          );
        }
      } catch {
        if (!cancelled) setOptions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [disabled, kind, open, query]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  function handleSelect(option: HardwareOption) {
    onChange(option);
    setQuery(option.name);
    setOpen(false);
  }

  function handleClear() {
    onChange(null);
    setQuery("");
    setOpen(false);
  }

  if (disabled) {
    return (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <Input value={value?.name ?? "—"} readOnly disabled className="bg-muted/40" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <Label htmlFor={listId}>{label}</Label>

      {value ? (
        <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2">
          <Badge variant="secondary">{value.name}</Badge>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="ms-auto"
            onClick={handleClear}
          >
            <X />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id={listId}
            value={query}
            placeholder={`جستجو در ${kind === "cpu" ? "CPU" : "GPU"}...`}
            className="ps-8"
            onFocus={() => setOpen(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
          />
        </div>
      )}

      {open && !value ? (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-popover p-1 shadow-md">
          {loading ? (
            <div className="flex items-center justify-center gap-2 px-3 py-4 text-sm text-muted-foreground">
              <Spinner />
              در حال جستجو...
            </div>
          ) : options.length ? (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                className="flex w-full rounded-sm px-3 py-2 text-start text-sm hover:bg-accent"
                onClick={() => handleSelect(option)}
              >
                {option.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-sm text-muted-foreground">
              موردی پیدا نشد
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
