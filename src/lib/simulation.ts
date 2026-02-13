export interface NetworkProfileConfig {
  fps: { base: number; variance: number };
  width: number;
  height: number;
  jitter: number;
  packetLoss: number;
}

const PROFILE_CONFIGS: Record<string, NetworkProfileConfig> = {
  none: { fps: { base: 30, variance: 2 }, width: 1280, height: 720, jitter: 1, packetLoss: 0 },
  "wifi-good": { fps: { base: 28, variance: 3 }, width: 1280, height: 720, jitter: 5, packetLoss: 0 },
  "jio-4g-good": { fps: { base: 25, variance: 4 }, width: 960, height: 540, jitter: 15, packetLoss: 1 },
  "jio-4g-poor": { fps: { base: 18, variance: 5 }, width: 640, height: 480, jitter: 40, packetLoss: 3 },
  "airtel-4g": { fps: { base: 22, variance: 4 }, width: 960, height: 540, jitter: 20, packetLoss: 2 },
  "3g": { fps: { base: 10, variance: 4 }, width: 480, height: 360, jitter: 80, packetLoss: 5 },
  "2g": { fps: { base: 5, variance: 3 }, width: 320, height: 240, jitter: 150, packetLoss: 10 },
};

export function getProfileConfig(profileId: string): NetworkProfileConfig {
  return PROFILE_CONFIGS[profileId] || PROFILE_CONFIGS.none;
}

export function generateMetrics(profileId: string, isDropped: boolean) {
  if (isDropped) {
    return { fps: 0, width: 0, height: 0, packets_lost: 100, freeze_count: 1, jitter: 999 };
  }
  const config = getProfileConfig(profileId);
  const fps = Math.max(0, config.fps.base + (Math.random() - 0.5) * 2 * config.fps.variance);
  return {
    fps: Math.round(fps * 10) / 10,
    width: config.width,
    height: config.height,
    packets_lost: Math.round(Math.random() * config.packetLoss),
    freeze_count: fps < 10 ? 1 : 0,
    jitter: Math.round(config.jitter + (Math.random() - 0.5) * config.jitter * 0.5),
  };
}

export function getStatusColor(fps: number): "success" | "warning" | "destructive" {
  if (fps >= 24) return "success";
  if (fps >= 15) return "warning";
  return "destructive";
}

export function getStatusEmoji(fps: number): string {
  if (fps >= 24) return "🟢";
  if (fps >= 15) return "🟡";
  return "🔴";
}

export function analyzeParticipantMetrics(metrics: { fps: number | null; freeze_count: number | null; width: number | null; height: number | null }[]) {
  const fpsValues = metrics.map((m) => m.fps ?? 0);
  const avgFps = fpsValues.length > 0 ? fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length : 0;
  const totalFreezes = metrics.reduce((a, m) => a + (m.freeze_count ?? 0), 0);
  const issues: string[] = [];
  if (avgFps < 15) issues.push("Low FPS");
  if (totalFreezes > 3) issues.push("Excessive Freezing");
  const minRes = Math.min(...metrics.map((m) => (m.height ?? 720)));
  if (minRes < 480) issues.push("Quality Degradation");

  let status: "pass" | "warn" | "fail" = "pass";
  if (avgFps < 15) status = "fail";
  else if (avgFps < 24) status = "warn";

  return { avgFps: Math.round(avgFps * 10) / 10, totalFreezes, issues, status };
}
