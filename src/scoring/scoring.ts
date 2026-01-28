// src/scoring/scoring.ts
export type RiskLevel = "low" | "medium" | "high";
export type Trend = "increasing" | "stable" | "decreasing";

export function trendFromDelta(delta: number): Trend {
  if (delta >= 2) return "increasing";
  if (delta <= -2) return "decreasing";
  return "stable";
}

function clampMinLevel(level: RiskLevel, min: RiskLevel): RiskLevel {
  const rank: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };
  return rank[level] < rank[min] ? min : level;
}

/* =========================
   1) Financial
========================= */
export type FinancialInputs = {
  assetConcentration: "<30" | "30-50" | ">50";
  incomeSources: "1" | "2-3" | ">3";
  liquidityHorizon: "<6m" | "6-12m" | ">12m";
  debtLoad: "low" | "moderate" | "high";
  counterpartyConcentration: "low" | "high";
  taxComplexity: "low" | "moderate" | "high";
  fxDependence: "low" | "moderate" | "high";
  largeUpcomingCommitment: "no" | "yes";
  volatilityTolerance: "high" | "low";
};

export function scoreFinancial(i: FinancialInputs) {
  let score = 0;
  score += i.assetConcentration === ">50" ? 3 : i.assetConcentration === "30-50" ? 2 : 0;
  score += i.incomeSources === "1" ? 2 : i.incomeSources === "2-3" ? 1 : 0;
  score += i.liquidityHorizon === ">12m" ? 3 : i.liquidityHorizon === "6-12m" ? 2 : 0;
  score += i.debtLoad === "high" ? 3 : i.debtLoad === "moderate" ? 2 : 0;
  score += i.counterpartyConcentration === "high" ? 2 : 0;
  score += i.taxComplexity === "high" ? 2 : i.taxComplexity === "moderate" ? 1 : 0;
  score += i.fxDependence === "high" ? 2 : i.fxDependence === "moderate" ? 1 : 0;
  score += i.largeUpcomingCommitment === "yes" ? 2 : 0;
  score += i.volatilityTolerance === "low" ? 1 : 0;

  const level: RiskLevel = score >= 13 ? "high" : score >= 6 ? "medium" : "low";
  return { score, level, highRiskCount: score >= 13 ? 1 : 0 };
}

/* =========================
   2) Legal
========================= */
export type LegalInputs = {
  activeContractsCount: "<5" | "5-9" | ">=10";
  contractClarity: "clear" | "somewhat_vague" | "verbal_unclear";
  jurisdictionCount: "single" | "multiple_domestic" | "multi_country";
  complianceStatus: "fully_compliant" | "partial" | "non_compliant_unknown";
  ndaIpAgreements: "complete" | "partial" | "missing";
  trademarkProtection: "registered" | "in_process" | "none";
  partnersShareholders: "1-3" | "4-10" | ">10";
  activeDisputes: "no" | "yes";
  advisorEmploymentAgreements: "complete" | "partial" | "none";
};

export function scoreLegal(i: LegalInputs) {
  const p: Record<string, number> = {};

  p.activeContractsCount = i.activeContractsCount === ">=10" ? 2 : i.activeContractsCount === "5-9" ? 1 : 0;
  p.contractClarity = i.contractClarity === "verbal_unclear" ? 3 : i.contractClarity === "somewhat_vague" ? 2 : 0;
  p.jurisdictionCount = i.jurisdictionCount === "multi_country" ? 2 : i.jurisdictionCount === "multiple_domestic" ? 1 : 0;
  p.complianceStatus = i.complianceStatus === "non_compliant_unknown" ? 3 : i.complianceStatus === "partial" ? 1 : 0;
  p.ndaIpAgreements = i.ndaIpAgreements === "missing" ? 2 : i.ndaIpAgreements === "partial" ? 1 : 0;
  p.trademarkProtection = i.trademarkProtection === "none" ? 2 : i.trademarkProtection === "in_process" ? 1 : 0;
  p.partnersShareholders = i.partnersShareholders === ">10" ? 2 : i.partnersShareholders === "4-10" ? 1 : 0;
  p.activeDisputes = i.activeDisputes === "yes" ? 3 : 0;
  p.advisorEmploymentAgreements = i.advisorEmploymentAgreements === "none" ? 2 : i.advisorEmploymentAgreements === "partial" ? 1 : 0;

  const score = Object.values(p).reduce((a, b) => a + b, 0);
  let level: RiskLevel = score >= 10 ? "high" : score >= 4 ? "medium" : "low";

  // Spec note: if any single factor scores 3, set at least "High"
  const any3 = Object.values(p).some(v => v >= 3);
  if (any3) level = clampMinLevel(level, "high");

  const dominantFactor = Object.entries(p).sort((a, b) => b[1] - a[1])[0]?.[0] || "Compliance";

  return { score, level, any3, dominantFactor, highRiskCount: level === "high" ? 1 : 0 };
}

/* =========================
   3) Health
========================= */
export type HealthInputs = {
  stress: "low" | "medium" | "high";
  sleepAvg: ">7h" | "5-7h" | "<5h";
  irregularSleep: "rare" | "occasional" | "frequent";
  checkupsMissed: "0" | "1-2" | ">=3";
  travelDaysPerMonth: "<3" | "3-10" | ">10";
  exerciseNutrition: "regular" | "irregular" | "none";
  burnoutSignals: "no" | "yes";
  ignoredDiscomfort: "no" | "yes";
  recoveryScheduled: "regular" | "occasional" | "none";
};

export function scoreHealth(i: HealthInputs, persistenceBonus?: Partial<Record<keyof HealthInputs, number>>) {
  const b = (k: keyof HealthInputs) => persistenceBonus?.[k] ?? 0;
  let score = 0;

  score += (i.stress === "high" ? 3 : i.stress === "medium" ? 2 : 0) + b("stress");
  score += (i.sleepAvg === "<5h" ? 3 : i.sleepAvg === "5-7h" ? 2 : 0) + b("sleepAvg");
  score += (i.irregularSleep === "frequent" ? 2 : i.irregularSleep === "occasional" ? 1 : 0) + b("irregularSleep");
  score += (i.checkupsMissed === ">=3" ? 2 : i.checkupsMissed === "1-2" ? 1 : 0) + b("checkupsMissed");
  score += (i.travelDaysPerMonth === ">10" ? 2 : i.travelDaysPerMonth === "3-10" ? 1 : 0) + b("travelDaysPerMonth");
  score += (i.exerciseNutrition === "none" ? 2 : i.exerciseNutrition === "irregular" ? 1 : 0) + b("exerciseNutrition");
  score += (i.burnoutSignals === "yes" ? 3 : 0) + b("burnoutSignals");
  score += (i.ignoredDiscomfort === "yes" ? 2 : 0) + b("ignoredDiscomfort");
  score += (i.recoveryScheduled === "none" ? 2 : i.recoveryScheduled === "occasional" ? 1 : 0) + b("recoveryScheduled");

  const level: RiskLevel = score >= 9 ? "high" : score >= 4 ? "medium" : "low";

  const factors = {
    stress: (i.stress === "high" ? 3 : i.stress === "medium" ? 2 : 0),
    sleep: (i.sleepAvg === "<5h" ? 3 : i.sleepAvg === "5-7h" ? 2 : 0) + (i.irregularSleep === "frequent" ? 2 : 0),
    travel: (i.travelDaysPerMonth === ">10" ? 2 : 0)
  };
  const dominantFactor = Object.entries(factors).sort((a, b) => b[1] - a[1])[0]?.[0] || "stress";

  return { score, level, dominantFactor, highRiskCount: level === "high" ? 1 : 0 };
}

/* =========================
   4) Reputation
========================= */
export type ReputationInputs = {
  controversialPartnersClients: "0" | "1" | ">=2";
  publicCommunicationPerWeek: "0" | "1-3" | ">3";
  socialMediaPresence: "no" | "yes";
  brandAlignment: "consistent" | "uncertain" | "misaligned";
  internalComplaints: "none" | "minor" | "serious";
  footprintReview: "regular" | "occasional" | "never";
  recentReputationEvents: "none" | "minor_negative" | "major_negative";
  roleVisibility: "low" | "medium" | "high";
};

export function scoreReputation(i: ReputationInputs) {
  const pts: number[] = [];

  pts.push(i.controversialPartnersClients === ">=2" ? 3 : i.controversialPartnersClients === "1" ? 2 : 0);
  pts.push(i.publicCommunicationPerWeek === ">3" ? 2 : i.publicCommunicationPerWeek === "1-3" ? 1 : 0);
  pts.push(i.socialMediaPresence === "yes" ? 1 : 0);
  pts.push(i.brandAlignment === "misaligned" ? 3 : i.brandAlignment === "uncertain" ? 2 : 0);
  pts.push(i.internalComplaints === "serious" ? 3 : i.internalComplaints === "minor" ? 2 : 0);
  pts.push(i.footprintReview === "never" ? 2 : i.footprintReview === "occasional" ? 1 : 0);
  pts.push(i.recentReputationEvents === "major_negative" ? 3 : i.recentReputationEvents === "minor_negative" ? 1 : 0);
  pts.push(i.roleVisibility === "high" ? 2 : i.roleVisibility === "medium" ? 1 : 0);

  const score = pts.reduce((a, b) => a + b, 0);
  const any3 = pts.some(p => p >= 3);

  const level: RiskLevel =
    score >= 8 || any3 ? "high" :
      score >= 4 ? "medium" : "low";

  const factors = {
    association: (pts[0] || 0),
    communication: (pts[1] || 0) + (pts[2] || 0),
    leadership: (pts[4] || 0) + (pts[7] || 0)
  };
  const dominantFactor = Object.entries(factors).sort((a, b) => b[1] - a[1])[0]?.[0] || "association";

  return { score, level, any3, dominantFactor, highRiskCount: level === "high" ? 1 : 0 };
}

/* =========================
   5) Time & Energy
========================= */
export type TimeEnergyInputs = {
  majorProjects: "<=1" | "2-3" | ">3";
  weeklyMeetingHours: "<10" | "10-20" | ">20";
  dailyContextSwitches: "<10" | "10-20" | ">20";
  microDecisionsPerDay: "<20" | "20-50" | ">50";
  delegation: "high" | "medium" | "low";
  lowImpactHoursPerDay: "<2" | "2-4" | ">4";
  deepWorkHoursPerWeek: ">10" | "5-10" | "<5";
  restScheduling: "regular" | "occasional" | "none";
  daysWithoutFullRestPastMonth: "<10" | "10-20" | ">20";
  lateNightWork: "rare" | "occasional" | "frequent";
};

export function scoreTimeEnergy(i: TimeEnergyInputs) {
  const p: Record<string, number> = {};

  p.majorProjects = i.majorProjects === ">3" ? 3 : i.majorProjects === "2-3" ? 2 : 0;
  p.weeklyMeetingHours = i.weeklyMeetingHours === ">20" ? 3 : i.weeklyMeetingHours === "10-20" ? 2 : 0;
  p.dailyContextSwitches = i.dailyContextSwitches === ">20" ? 2 : i.dailyContextSwitches === "10-20" ? 1 : 0;
  p.microDecisionsPerDay = i.microDecisionsPerDay === ">50" ? 2 : i.microDecisionsPerDay === "20-50" ? 1 : 0;
  p.delegation = i.delegation === "low" ? 2 : i.delegation === "medium" ? 1 : 0;
  p.lowImpactHoursPerDay = i.lowImpactHoursPerDay === ">4" ? 2 : i.lowImpactHoursPerDay === "2-4" ? 1 : 0;
  p.deepWorkHoursPerWeek = i.deepWorkHoursPerWeek === "<5" ? 2 : i.deepWorkHoursPerWeek === "5-10" ? 1 : 0;
  p.restScheduling = i.restScheduling === "none" ? 2 : i.restScheduling === "occasional" ? 1 : 0;
  p.daysWithoutFullRestPastMonth = i.daysWithoutFullRestPastMonth === ">20" ? 2 : i.daysWithoutFullRestPastMonth === "10-20" ? 1 : 0;
  p.lateNightWork = i.lateNightWork === "frequent" ? 2 : i.lateNightWork === "occasional" ? 1 : 0;

  const score = Object.values(p).reduce((a, b) => a + b, 0);
  const level: RiskLevel = score >= 13 ? "high" : score >= 6 ? "medium" : "low";

  const factors = {
    meetings: p.weeklyMeetingHours,
    decisions: p.microDecisionsPerDay + p.delegation,
    commitments: p.majorProjects + p.dailyContextSwitches
  };

  const dominantFactor = Object.entries(factors).sort((a, b) => b[1] - a[1])[0]?.[0] || "meetings";

  return { score, level, dominantFactor, highRiskCount: level === "high" ? 1 : 0 };
}
