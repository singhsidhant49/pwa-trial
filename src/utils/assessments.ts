import type { Category } from "../db/types";
import type { FinancialInputs, LegalInputs, HealthInputs, ReputationInputs, TimeEnergyInputs } from "../scoring/scoring";

export function labelFor(c: Category) {
    return (
        {
            financial: "Financial",
            legal: "Legal",
            health: "Health",
            reputation: "Reputation",
            time_energy: "Time & Energy"
        } as Record<Category, string>
    )[c];
}


export function isValidCategory(c: any): c is Category {
    return ["financial", "legal", "health", "reputation", "time_energy"].includes(String(c));
}


export function defaultFinancial(): FinancialInputs {
    return { assetConcentration: "<30", incomeSources: ">3", liquidityHorizon: "<6m", debtLoad: "low", counterpartyConcentration: "low", taxComplexity: "low", fxDependence: "low", largeUpcomingCommitment: "no", volatilityTolerance: "high" };
}

export function defaultLegal(): LegalInputs {
    return { activeContractsCount: "<5", contractClarity: "clear", jurisdictionCount: "single", complianceStatus: "fully_compliant", ndaIpAgreements: "complete", trademarkProtection: "registered", partnersShareholders: "1-3", activeDisputes: "no", advisorEmploymentAgreements: "complete" };
}


export function defaultHealth(): HealthInputs {
    return { stress: "low", sleepAvg: ">7h", irregularSleep: "rare", checkupsMissed: "0", travelDaysPerMonth: "<3", exerciseNutrition: "regular", burnoutSignals: "no", ignoredDiscomfort: "no", recoveryScheduled: "regular" };
}


export function defaultReputation(): ReputationInputs {
    return { controversialPartnersClients: "0", publicCommunicationPerWeek: "0", socialMediaPresence: "no", brandAlignment: "consistent", internalComplaints: "none", footprintReview: "regular", recentReputationEvents: "none", roleVisibility: "low" };
}


export function defaultTimeEnergy(): TimeEnergyInputs {
    return { majorProjects: "<=1", weeklyMeetingHours: "<10", dailyContextSwitches: "<10", microDecisionsPerDay: "<20", delegation: "high", lowImpactHoursPerDay: "<2", deepWorkHoursPerWeek: ">10", restScheduling: "regular", daysWithoutFullRestPastMonth: "<10", lateNightWork: "rare" };
}
