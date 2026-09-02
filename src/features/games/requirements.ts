import type {
  GameRequirement,
  GameRequirementInput,
  GameRequirementOption,
} from "@/features/games/types";

const editableTiers = ["MINIMUM", "RECOMMENDED"] as const;
const adminOptionPrefix = "admin:";

function emptyRequirement(tier: GameRequirementInput["tier"]): GameRequirementInput {
  return {
    tier,
    cpuId: null,
    gpuId: null,
    cpuName: null,
    gpuName: null,
    rawCpuText: null,
    rawGpuText: null,
    os: null,
    ramGb: null,
    vramGb: null,
    storageGb: null,
    directX: null,
    needsSsd: false,
    notes: null,
  };
}

function pickAdminOption(options: GameRequirementOption[], kind: "CPU" | "GPU") {
  const adminOption = options.find(
    (option) =>
      option.kind === kind && option.matchedText.startsWith(adminOptionPrefix),
  );

  if (adminOption) return adminOption;

  return options.find(
    (option) =>
      option.kind === kind && (kind === "CPU" ? option.cpu : option.gpu),
  );
}

export function createDefaultRequirements(): GameRequirementInput[] {
  return editableTiers.map((tier) => emptyRequirement(tier));
}

export function requirementsFromDetail(
  requirements: GameRequirement[],
): GameRequirementInput[] {
  return editableTiers.map((tier) => {
    const existing = requirements.find((requirement) => requirement.tier === tier);

    if (!existing) {
      return emptyRequirement(tier);
    }

    const cpuOption = pickAdminOption(existing.options, "CPU");
    const gpuOption = pickAdminOption(existing.options, "GPU");

    return {
      tier,
      cpuId: cpuOption?.cpu?.id ?? null,
      gpuId: gpuOption?.gpu?.id ?? null,
      cpuName:
        cpuOption?.cpu?.name ??
        cpuOption?.matchedText ??
        existing.rawCpuText,
      gpuName:
        gpuOption?.gpu?.name ??
        gpuOption?.matchedText ??
        existing.rawGpuText,
      rawCpuText: existing.rawCpuText,
      rawGpuText: existing.rawGpuText,
      os: existing.os,
      ramGb: existing.ramGb,
      vramGb: existing.vramGb,
      storageGb: existing.storageGb,
      directX: existing.directX,
      needsSsd: existing.needsSsd,
      notes: existing.notes,
    };
  });
}

export function hasRequirementContent(requirement: GameRequirementInput): boolean {
  return (
    Boolean(requirement.cpuId) ||
    Boolean(requirement.gpuId) ||
    Boolean(requirement.rawCpuText?.trim()) ||
    Boolean(requirement.rawGpuText?.trim()) ||
    Boolean(requirement.os?.trim()) ||
    requirement.ramGb != null ||
    requirement.vramGb != null ||
    requirement.storageGb != null ||
    Boolean(requirement.directX?.trim()) ||
    Boolean(requirement.notes?.trim()) ||
    requirement.needsSsd
  );
}

export function toRequirementsPayload(requirements: GameRequirementInput[]) {
  return requirements.map(
    ({ cpuName: _cpuName, gpuName: _gpuName, ...requirement }) => ({
      tier: requirement.tier,
      cpuId: requirement.cpuId,
      gpuId: requirement.gpuId,
      rawCpuText: requirement.rawCpuText?.trim() || null,
      rawGpuText: requirement.rawGpuText?.trim() || null,
      os: requirement.os?.trim() || null,
      ramGb: requirement.ramGb ?? null,
      vramGb: requirement.vramGb ?? null,
      storageGb: requirement.storageGb ?? null,
      directX: requirement.directX?.trim() || null,
      needsSsd: requirement.needsSsd,
      notes: requirement.notes?.trim() || null,
    }),
  );
}
