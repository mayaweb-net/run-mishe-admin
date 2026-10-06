import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HardwarePicker } from "@/features/games/components/hardware-picker";
import { createAdminFpsSamples, updateAdminFpsSample } from "@/features/fps/api";
import { GamePicker } from "@/features/fps/components/game-picker";
import type {
  CreateFpsSampleEntry,
  FpsSampleListItem,
  QualityPreset,
  ScreenResolution,
} from "@/features/fps/types";
import { presetLabels, resolutionLabels } from "@/features/fps/types";

type NamedRef = { id: string; name: string };

type EntryDraft = {
  key: string;
  resolution: ScreenResolution;
  preset: QualityPreset;
  avgFps: string;
  onePercentLow: string;
};

const RESOLUTIONS = Object.keys(resolutionLabels) as ScreenResolution[];
const PRESETS = Object.keys(presetLabels) as QualityPreset[];

const DEFAULT_MATRIX: Array<Pick<EntryDraft, "resolution" | "preset">> = [
  { resolution: "R1080P", preset: "LOW" },
  { resolution: "R1080P", preset: "MEDIUM" },
  { resolution: "R1080P", preset: "HIGH" },
  { resolution: "R1080P", preset: "ULTRA" },
  { resolution: "R1440P", preset: "ULTRA" },
  { resolution: "R2160P", preset: "ULTRA" },
];

function newKey() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function defaultEntries(): EntryDraft[] {
  return DEFAULT_MATRIX.map((row) => ({
    key: newKey(),
    resolution: row.resolution,
    preset: row.preset,
    avgFps: "",
    onePercentLow: "",
  }));
}

interface FpsSampleFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  sample?: FpsSampleListItem | null;
  initialGameId?: string;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export function FpsSampleFormDialog({
  open,
  mode,
  sample = null,
  initialGameId,
  onOpenChange,
  onSaved,
}: FpsSampleFormDialogProps) {
  const [game, setGame] = useState<NamedRef | null>(null);
  const [cpu, setCpu] = useState<NamedRef | null>(null);
  const [gpu, setGpu] = useState<NamedRef | null>(null);
  const [entries, setEntries] = useState<EntryDraft[]>(defaultEntries);
  const [confidence, setConfidence] = useState("0.9");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit-mode single fields
  const [resolution, setResolution] = useState<ScreenResolution>("R1080P");
  const [preset, setPreset] = useState<QualityPreset>("HIGH");
  const [avgFps, setAvgFps] = useState("");
  const [onePercentLow, setOnePercentLow] = useState("");

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSaving(false);

    if (mode === "edit" && sample) {
      setGame({ id: sample.game.id, name: sample.game.name });
      setCpu({ id: sample.cpu.id, name: sample.cpu.name });
      setGpu({ id: sample.gpu.id, name: sample.gpu.name });
      setResolution(sample.resolution);
      setPreset(sample.preset);
      setAvgFps(String(sample.avgFps));
      setOnePercentLow(
        sample.onePercentLow != null ? String(sample.onePercentLow) : "",
      );
      setConfidence(String(sample.confidence));
      setSourceUrl(sample.sourceUrl ?? "");
      return;
    }

    setGame(null);
    setCpu(null);
    setGpu(null);
    setEntries(defaultEntries());
    setConfidence("0.9");
    setSourceUrl("");
  }, [open, mode, sample, initialGameId]);

  function updateEntry(key: string, patch: Partial<EntryDraft>) {
    setEntries((prev) =>
      prev.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function removeEntry(key: string) {
    setEntries((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.key !== key)));
  }

  function addEntry() {
    setEntries((prev) => [
      ...prev,
      {
        key: newKey(),
        resolution: "R1080P",
        preset: "HIGH",
        avgFps: "",
        onePercentLow: "",
      },
    ]);
  }

  async function handleSubmit() {
    setError(null);

    if (!game || !cpu || !gpu) {
      setError("بازی، CPU و GPU را انتخاب کنید.");
      return;
    }

    const conf = Number(confidence);
    if (!Number.isFinite(conf) || conf < 0 || conf > 1) {
      setError("اطمینان باید بین ۰ و ۱ باشد.");
      return;
    }

    setSaving(true);
    try {
      if (mode === "create") {
        const payloadEntries: CreateFpsSampleEntry[] = [];
        for (const row of entries) {
          const fps = Number(row.avgFps);
          if (!row.avgFps.trim()) continue;
          if (!Number.isFinite(fps) || fps <= 0) {
            setError("مقدار FPS نامعتبر در یکی از ردیف‌ها.");
            setSaving(false);
            return;
          }
          const low = row.onePercentLow.trim()
            ? Number(row.onePercentLow)
            : undefined;
          if (low != null && (!Number.isFinite(low) || low < 0)) {
            setError("مقدار 1% low نامعتبر است.");
            setSaving(false);
            return;
          }
          payloadEntries.push({
            resolution: row.resolution,
            preset: row.preset,
            avgFps: fps,
            onePercentLow: low,
            upscaler: "NONE",
            rayTracing: false,
            frameGen: false,
          });
        }
        if (payloadEntries.length === 0) {
          setError("حداقل یک ردیف با FPS پر کنید.");
          setSaving(false);
          return;
        }

        await createAdminFpsSamples({
          gameId: game.id,
          cpuId: cpu.id,
          gpuId: gpu.id,
          source: "manual",
          sourceUrl: sourceUrl.trim() || undefined,
          confidence: conf,
          entries: payloadEntries,
        });
      } else if (sample) {
        const fps = Number(avgFps);
        if (!Number.isFinite(fps) || fps <= 0) {
          setError("FPS نامعتبر است.");
          setSaving(false);
          return;
        }
        const low = onePercentLow.trim() ? Number(onePercentLow) : null;
        if (low != null && (!Number.isFinite(low) || low < 0)) {
          setError("1% low نامعتبر است.");
          setSaving(false);
          return;
        }
        await updateAdminFpsSample(sample.id, {
          gameId: game.id,
          cpuId: cpu.id,
          gpuId: gpu.id,
          resolution,
          preset,
          avgFps: fps,
          onePercentLow: low,
          confidence: conf,
          source: sample.source === "manual" ? "manual" : sample.source,
          sourceUrl: sourceUrl.trim() || null,
        });
      }

      onOpenChange(false);
      onSaved?.();
    } catch {
      setError("ذخیره با خطا مواجه شد.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "افزودن نمونه‌های FPS" : "ویرایش نمونه FPS"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "CPU و GPU ثابت؛ برای هر رزولوشن/پریست یک FPS وارد کنید. منبع: دستی."
              : "ویرایش یک ردیف نمونه."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-3">
            <GamePicker value={game} onChange={setGame} />
            <HardwarePicker kind="cpu" label="CPU" value={cpu} onChange={setCpu} />
            <HardwarePicker kind="gpu" label="GPU" value={gpu} onChange={setGpu} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>اطمینان (۰–۱)</Label>
              <Input
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
                inputMode="decimal"
              />
            </div>
            <div className="space-y-1.5">
              <Label>لینک منبع (اختیاری)</Label>
              <Input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {mode === "create" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>آرایهٔ تنظیمات (رزولوشن / پریست / FPS)</Label>
                <Button type="button" size="sm" variant="outline" onClick={addEntry}>
                  <Plus />
                  ردیف
                </Button>
              </div>

              <div className="space-y-2">
                {entries.map((row) => (
                  <div
                    key={row.key}
                    className="grid grid-cols-[1fr_1fr_5rem_5rem_auto] items-end gap-2"
                  >
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">رزولوشن</span>
                      <Select
                        value={row.resolution}
                        onValueChange={(value) =>
                          value &&
                          updateEntry(row.key, {
                            resolution: value as ScreenResolution,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RESOLUTIONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {resolutionLabels[r]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">پریست</span>
                      <Select
                        value={row.preset}
                        onValueChange={(value) =>
                          value &&
                          updateEntry(row.key, {
                            preset: value as QualityPreset,
                          })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRESETS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {presetLabels[p]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">FPS</span>
                      <Input
                        value={row.avgFps}
                        inputMode="decimal"
                        placeholder="—"
                        onChange={(e) =>
                          updateEntry(row.key, { avgFps: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">1% low</span>
                      <Input
                        value={row.onePercentLow}
                        inputMode="decimal"
                        placeholder="—"
                        onChange={(e) =>
                          updateEntry(row.key, {
                            onePercentLow: e.target.value,
                          })
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeEntry(row.key)}
                      aria-label="حذف ردیف"
                    >
                      <Trash2 className="text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                ردیف‌های خالی نادیده گرفته می‌شوند. منبع ذخیره‌شده:{" "}
                <code>manual</code>
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1.5">
                <Label>رزولوشن</Label>
                <Select
                  value={resolution}
                  onValueChange={(value) =>
                    value && setResolution(value as ScreenResolution)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESOLUTIONS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {resolutionLabels[r]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>پریست</Label>
                <Select
                  value={preset}
                  onValueChange={(value) =>
                    value && setPreset(value as QualityPreset)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map((p) => (
                      <SelectItem key={p} value={p}>
                        {presetLabels[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>avg FPS</Label>
                <Input
                  value={avgFps}
                  inputMode="decimal"
                  onChange={(e) => setAvgFps(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>1% low</Label>
                <Input
                  value={onePercentLow}
                  inputMode="decimal"
                  onChange={(e) => setOnePercentLow(e.target.value)}
                />
              </div>
            </div>
          )}

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            انصراف
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
