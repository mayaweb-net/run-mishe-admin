import { useEffect, useMemo, useState } from "react";
import { Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  applyRequirementMatches,
  fetchRequirementSuggestions,
} from "@/features/games/api";
import type {
  ApplyRequirementMatchItem,
  RequirementFieldSuggestions,
} from "@/features/games/types";
import { requirementTierLabels } from "@/features/games/types";

function fieldKey(field: Pick<RequirementFieldSuggestions, "tier" | "kind">) {
  return `${field.tier}-${field.kind}`;
}

const kindLabels = {
  CPU: "CPU",
  GPU: "GPU",
} as const;

const sourceLabels = {
  exact: "تطابق دقیق",
  search: "جستجو",
} as const;

interface GameRequirementMatchDialogProps {
  gameId: string | null;
  gameName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplied?: () => void;
}

export function GameRequirementMatchDialog({
  gameId,
  gameName,
  open,
  onOpenChange,
  onApplied,
}: GameRequirementMatchDialogProps) {
  const [fields, setFields] = useState<RequirementFieldSuggestions[]>([]);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});

  const actionableFields = useMemo(
    () =>
      fields.filter(
        (field) => !field.isLinked && field.suggestions.length > 0,
      ),
    [fields],
  );

  useEffect(() => {
    if (!open || !gameId) {
      return;
    }

    const activeGameId = gameId;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      setFields([]);
      setSelection({});

      try {
        const suggestions = await fetchRequirementSuggestions(activeGameId);
        if (cancelled) return;

        setFields(suggestions);

        const defaults: Record<string, string> = {};
        for (const field of suggestions) {
          if (field.isLinked || field.suggestions.length === 0) continue;
          defaults[fieldKey(field)] = field.suggestions[0]!.hardwareId;
        }
        setSelection(defaults);
      } catch {
        if (!cancelled) {
          setError("بارگذاری پیشنهادها با خطا مواجه شد.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, gameId]);

  async function handleApply() {
    if (!gameId) return;

    const matches: ApplyRequirementMatchItem[] = actionableFields
      .map((field) => {
        const hardwareId = selection[fieldKey(field)];
        if (!hardwareId) return null;

        return {
          tier: field.tier,
          kind: field.kind,
          hardwareId,
        };
      })
      .filter((match): match is ApplyRequirementMatchItem => match != null);

    if (matches.length === 0) {
      setError("حداقل یک اتصال را انتخاب کنید.");
      return;
    }

    setApplying(true);
    setError(null);

    try {
      await applyRequirementMatches(gameId, { matches });
      onApplied?.();
      onOpenChange(false);
    } catch {
      setError("اعمال اتصال‌ها با خطا مواجه شد.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="size-4" />
            پیشنهاد اتصال — {gameName}
          </DialogTitle>
          <DialogDescription>
            بر اساس متن خام Steam، نزدیک‌ترین CPU/GPU پیشنهاد می‌شود. موارد
            انتخاب‌شده به‌عنوان اتصال ادمین ثبت می‌شوند.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
            ))}
          </div>
        ) : error && fields.length === 0 ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : actionableFields.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            اتصال ناقصی با پیشنهاد خودکار پیدا نشد. همه فیلدها متصل هستند یا
            متن خام قابل مسیریابی نیست.
          </p>
        ) : (
          <div className="space-y-4">
            {fields.map((field) => {
              const key = fieldKey(field);
              const hasSuggestions = field.suggestions.length > 0;

              return (
                <section
                  key={key}
                  className="space-y-2 rounded-xl border bg-muted/20 p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">
                      {requirementTierLabels[field.tier]} — {kindLabels[field.kind]}
                    </span>
                    {field.isLinked ? (
                      <Badge
                        variant="outline"
                        className="border-emerald-500/40 text-emerald-600"
                      >
                        متصل: {field.currentHardwareName}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-amber-500/40 text-amber-600"
                      >
                        ناقص
                      </Badge>
                    )}
                  </div>

                  {field.rawText ? (
                    <p className="text-xs text-muted-foreground">
                      متن خام: {field.rawText}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">بدون متن خام</p>
                  )}

                  {field.isLinked ? null : hasSuggestions ? (
                    <div className="space-y-2">
                      {field.suggestions.map((suggestion) => {
                        const inputId = `${key}-${suggestion.hardwareId}`;
                        const checked = selection[key] === suggestion.hardwareId;

                        return (
                          <label
                            key={inputId}
                            htmlFor={inputId}
                            className="flex cursor-pointer items-start gap-2 rounded-lg border bg-background p-2 has-checked:border-primary/50 has-checked:bg-primary/5"
                          >
                            <input
                              id={inputId}
                              type="radio"
                              name={key}
                              className="mt-1"
                              checked={checked}
                              onChange={() =>
                                setSelection((current) => ({
                                  ...current,
                                  [key]: suggestion.hardwareId,
                                }))
                              }
                            />
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="font-medium">
                                {suggestion.hardwareName}
                              </div>
                              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                                <Badge variant="secondary">
                                  {sourceLabels[suggestion.source]}
                                </Badge>
                                <span>امتیاز: {suggestion.matchScore.toFixed(2)}</span>
                                {suggestion.alias ? (
                                  <span>alias: {suggestion.alias}</span>
                                ) : null}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      پیشنهادی یافت نشد.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        )}

        {error && fields.length > 0 ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            disabled={applying}
            onClick={() => onOpenChange(false)}
          >
            انصراف
          </Button>
          <Button
            disabled={loading || applying || actionableFields.length === 0}
            onClick={() => void handleApply()}
          >
            {applying ? "در حال اعمال..." : "تأیید اتصال‌ها"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
