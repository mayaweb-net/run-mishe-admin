import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardwarePicker } from "@/features/games/components/hardware-picker";
import type { GameRequirementInput } from "@/features/games/types";
import { requirementTierLabels } from "@/features/games/types";

interface GameRequirementsEditorProps {
  requirements: GameRequirementInput[];
  editing: boolean;
  onChange: (tier: GameRequirementInput["tier"], patch: Partial<GameRequirementInput>) => void;
}

function RequirementFields({
  requirement,
  editing,
  onChange,
}: {
  requirement: GameRequirementInput;
  editing: boolean;
  onChange: (patch: Partial<GameRequirementInput>) => void;
}) {
  const readOnly = !editing;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <HardwarePicker
          kind="cpu"
          label="CPU"
          disabled={readOnly}
          value={
            requirement.cpuId && requirement.cpuName
              ? { id: requirement.cpuId, name: requirement.cpuName }
              : null
          }
          onChange={(value) =>
            onChange({
              cpuId: value?.id ?? null,
              cpuName: value?.name ?? null,
            })
          }
        />
      </div>

      <div className="md:col-span-2">
        <HardwarePicker
          kind="gpu"
          label="GPU"
          disabled={readOnly}
          value={
            requirement.gpuId && requirement.gpuName
              ? { id: requirement.gpuId, name: requirement.gpuName }
              : null
          }
          onChange={(value) =>
            onChange({
              gpuId: value?.id ?? null,
              gpuName: value?.name ?? null,
            })
          }
        />
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <Label>متن خام منبع CPU</Label>
        <Input
          value={requirement.rawCpuText ?? ""}
          readOnly
          disabled
          className="bg-muted/40"
          placeholder="متن خام requirement از منبع"
        />
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <Label>متن خام منبع GPU</Label>
        <Input
          value={requirement.rawGpuText ?? ""}
          readOnly
          disabled
          className="bg-muted/40"
          placeholder="متن خام requirement از منبع"
        />
      </div>

      <div className="space-y-1.5">
        <Label>RAM (GB)</Label>
        <Input
          type="number"
          value={requirement.ramGb ?? ""}
          readOnly={readOnly}
          disabled={readOnly}
          className={readOnly ? "bg-muted/40" : undefined}
          onChange={(event) =>
            onChange({
              ramGb: event.target.value === "" ? null : Number(event.target.value),
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label>VRAM (GB)</Label>
        <Input
          type="number"
          value={requirement.vramGb ?? ""}
          readOnly={readOnly}
          disabled={readOnly}
          className={readOnly ? "bg-muted/40" : undefined}
          onChange={(event) =>
            onChange({
              vramGb: event.target.value === "" ? null : Number(event.target.value),
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label>OS</Label>
        <Input
          value={requirement.os ?? ""}
          readOnly={readOnly}
          disabled={readOnly}
          className={readOnly ? "bg-muted/40" : undefined}
          placeholder="Windows 10 64-bit"
          onChange={(event) => onChange({ os: event.target.value || null })}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Storage (GB)</Label>
        <Input
          type="number"
          value={requirement.storageGb ?? ""}
          readOnly={readOnly}
          disabled={readOnly}
          className={readOnly ? "bg-muted/40" : undefined}
          onChange={(event) =>
            onChange({
              storageGb:
                event.target.value === "" ? null : Number(event.target.value),
            })
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label>DirectX</Label>
        <Input
          value={requirement.directX ?? ""}
          readOnly={readOnly}
          disabled={readOnly}
          className={readOnly ? "bg-muted/40" : undefined}
          onChange={(event) => onChange({ directX: event.target.value || null })}
        />
      </div>

      <div className="flex items-center gap-2 pt-7">
        <Checkbox
          checked={requirement.needsSsd}
          disabled={readOnly}
          onCheckedChange={(checked) =>
            onChange({ needsSsd: checked === true })
          }
        />
        <Label>نیاز به SSD</Label>
      </div>

      <div className="space-y-1.5 md:col-span-2">
        <Label>یادداشت</Label>
        <Input
          value={requirement.notes ?? ""}
          readOnly={readOnly}
          disabled={readOnly}
          className={readOnly ? "bg-muted/40" : undefined}
          onChange={(event) => onChange({ notes: event.target.value || null })}
        />
      </div>
    </div>
  );
}

export function GameRequirementsEditor({
  requirements,
  editing,
  onChange,
}: GameRequirementsEditorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {requirements.map((requirement) => (
        <div key={requirement.tier} className="rounded-xl border p-4">
          <h3 className="mb-3 text-sm font-semibold">
            {requirementTierLabels[requirement.tier]}
          </h3>
          <RequirementFields
            requirement={requirement}
            editing={editing}
            onChange={(patch) => onChange(requirement.tier, patch)}
          />
        </div>
      ))}
    </div>
  );
}
