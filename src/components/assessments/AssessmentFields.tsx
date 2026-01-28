import { Select } from "../ui/Select";
import type { FinancialInputs, LegalInputs, HealthInputs, ReputationInputs, TimeEnergyInputs } from "../../scoring/scoring";

export function FinancialFields({ value, onChange }: { value: FinancialInputs; onChange: (v: FinancialInputs) => void }) {
    return (
        <>
            <Select label="Main asset share" value={value.assetConcentration} options={["<30%", "30-50%", ">50%"]} onChange={(e) => onChange({ ...value, assetConcentration: e.target.value as any })} />
            <Select label="Income sources" value={value.incomeSources} options={["1", "2-3", ">3"]} onChange={(e) => onChange({ ...value, incomeSources: e.target.value as any })} />
            <Select label="Cash access time" value={value.liquidityHorizon} options={["<6 months", "6-12 months", ">12 months"]} onChange={(e) => onChange({ ...value, liquidityHorizon: e.target.value as any })} />
            <Select label="Loans and EMIs" value={value.debtLoad} options={["low", "moderate", "high"]} onChange={(e) => onChange({ ...value, debtLoad: e.target.value as any })} />
            <Select label="Dependency on partners" value={value.counterpartyConcentration} options={["low", "high"]} onChange={(e) => onChange({ ...value, counterpartyConcentration: e.target.value as any })} />
            <Select label="Tax and compliance" value={value.taxComplexity} options={["low", "moderate", "high"]} onChange={(e) => onChange({ ...value, taxComplexity: e.target.value as any })} />
            <Select label="Foreign currency risk" value={value.fxDependence} options={["low", "moderate", "high"]} onChange={(e) => onChange({ ...value, fxDependence: e.target.value as any })} />
            <Select label="Planned large purchases" value={value.largeUpcomingCommitment} options={["no", "yes"]} onChange={(e) => onChange({ ...value, largeUpcomingCommitment: e.target.value as any })} />
            <Select label="Price change tolerance" value={value.volatilityTolerance} options={["high", "low"]} onChange={(e) => onChange({ ...value, volatilityTolerance: e.target.value as any })} />
        </>
    );
}

export function LegalFields({ value, onChange }: { value: LegalInputs; onChange: (v: LegalInputs) => void }) {
    return (
        <>
            <Select label="Number of contracts" value={value.activeContractsCount} options={["<5", "5-9", ">=10"]} onChange={(e) => onChange({ ...value, activeContractsCount: e.target.value as any })} />
            <Select label="Agreement clarity" value={value.contractClarity} options={["clear", "somewhat_vague", "verbal/unclear"]} onChange={(e) => onChange({ ...value, contractClarity: e.target.value as any })} />
            <Select label="Number of countries" value={value.jurisdictionCount} options={["single", "multiple_domestic", "multi_country"]} onChange={(e) => onChange({ ...value, jurisdictionCount: e.target.value as any })} />
            <Select label="Compliance status" value={value.complianceStatus} options={["fully_compliant", "partial", "non_compliant"]} onChange={(e) => onChange({ ...value, complianceStatus: e.target.value as any })} />
            <Select label="Legal agreements (NDAs)" value={value.ndaIpAgreements} options={["complete", "partial", "missing"]} onChange={(e) => onChange({ ...value, ndaIpAgreements: e.target.value as any })} />
            <Select label="Trademarks and brand" value={value.trademarkProtection} options={["registered", "in_process", "none"]} onChange={(e) => onChange({ ...value, trademarkProtection: e.target.value as any })} />
            <Select label="Number of partners" value={value.partnersShareholders} options={["1-3", "4-10", ">10"]} onChange={(e) => onChange({ ...value, partnersShareholders: e.target.value as any })} />
            <Select label="Lawsuits or disputes" value={value.activeDisputes} options={["no", "yes"]} onChange={(e) => onChange({ ...value, activeDisputes: e.target.value as any })} />
            <Select label="Advisor agreements" value={value.advisorEmploymentAgreements} options={["complete", "partial", "none"]} onChange={(e) => onChange({ ...value, advisorEmploymentAgreements: e.target.value as any })} />
        </>
    );
}

export function HealthFields({ value, onChange }: { value: HealthInputs; onChange: (v: HealthInputs) => void }) {
    return (
        <>
            <Select label="Stress level" value={value.stress} options={["low", "medium", "high"]} onChange={(e) => onChange({ ...value, stress: e.target.value as any })} />
            <Select label="Sleep amount" value={value.sleepAvg} options={[">7h", "5-7h", "<5h"]} onChange={(e) => onChange({ ...value, sleepAvg: e.target.value as any })} />
            <Select label="Irregular sleep" value={value.irregularSleep} options={["rare", "occasional", "frequent"]} onChange={(e) => onChange({ ...value, irregularSleep: e.target.value as any })} />
            <Select label="Missed health checks" value={value.checkupsMissed} options={["0", "1-2", ">=3"]} onChange={(e) => onChange({ ...value, checkupsMissed: e.target.value as any })} />
            <Select label="Travel days per month" value={value.travelDaysPerMonth} options={["<3", "3-10", ">10"]} onChange={(e) => onChange({ ...value, travelDaysPerMonth: e.target.value as any })} />
            <Select label="Workout and nutrition" value={value.exerciseNutrition} options={["regular", "irregular", "none"]} onChange={(e) => onChange({ ...value, exerciseNutrition: e.target.value as any })} />
            <Select label="Feeling burned out" value={value.burnoutSignals} options={["no", "yes"]} onChange={(e) => onChange({ ...value, burnoutSignals: e.target.value as any })} />
            <Select label="Ignoring physical pain" value={value.ignoredDiscomfort} options={["no", "yes"]} onChange={(e) => onChange({ ...value, ignoredDiscomfort: e.target.value as any })} />
            <Select label="Planned rest" value={value.recoveryScheduled} options={["regular", "occasional", "none"]} onChange={(e) => onChange({ ...value, recoveryScheduled: e.target.value as any })} />
        </>
    );
}

export function ReputationFields({ value, onChange }: { value: ReputationInputs; onChange: (v: ReputationInputs) => void }) {
    return (
        <>
            <Select label="Partner/Client risk" value={value.controversialPartnersClients} options={["0", "1", ">=2"]} onChange={(e) => onChange({ ...value, controversialPartnersClients: e.target.value as any })} />
            <Select label="Public speaking/posting" value={value.publicCommunicationPerWeek} options={["0", "1-3", ">3"]} onChange={(e) => onChange({ ...value, publicCommunicationPerWeek: e.target.value as any })} />
            <Select label="Social media use" value={value.socialMediaPresence} options={["no", "yes"]} onChange={(e) => onChange({ ...value, socialMediaPresence: e.target.value as any })} />
            <Select label="Brand alignment" value={value.brandAlignment} options={["consistent", "uncertain", "misaligned"]} onChange={(e) => onChange({ ...value, brandAlignment: e.target.value as any })} />
            <Select label="Internal complaints" value={value.internalComplaints} options={["none", "minor", "serious"]} onChange={(e) => onChange({ ...value, internalComplaints: e.target.value as any })} />
            <Select label="Online content review" value={value.footprintReview} options={["regular", "occasional", "never"]} onChange={(e) => onChange({ ...value, footprintReview: e.target.value as any })} />
            <Select label="Public perception issues" value={value.recentReputationEvents} options={["none", "minor_negative", "major_negative"]} onChange={(e) => onChange({ ...value, recentReputationEvents: e.target.value as any })} />
            <Select label="Public profile level" value={value.roleVisibility} options={["low", "medium", "high"]} onChange={(e) => onChange({ ...value, roleVisibility: e.target.value as any })} />
        </>
    );
}

export function TimeEnergyFields({ value, onChange }: { value: TimeEnergyInputs; onChange: (v: TimeEnergyInputs) => void }) {
    return (
        <>
            <Select label="Big projects" value={value.majorProjects} options={["<=1", "2-3", ">3"]} onChange={(e) => onChange({ ...value, majorProjects: e.target.value as any })} />
            <Select label="Hours in meetings" value={value.weeklyMeetingHours} options={["<10", "10-20", ">20"]} onChange={(e) => onChange({ ...value, weeklyMeetingHours: e.target.value as any })} />
            <Select label="Task switching" value={value.dailyContextSwitches} options={["<10", "10-20", ">20"]} onChange={(e) => onChange({ ...value, dailyContextSwitches: e.target.value as any })} />
            <Select label="Number of daily decisions" value={value.microDecisionsPerDay} options={["<20", "20-50", ">50"]} onChange={(e) => onChange({ ...value, microDecisionsPerDay: e.target.value as any })} />
            <Select label="Team delegation" value={value.delegation} options={["high", "medium", "low"]} onChange={(e) => onChange({ ...value, delegation: e.target.value as any })} />
            <Select label="Time on low-value tasks" value={value.lowImpactHoursPerDay} options={["<2", "2-4", ">4"]} onChange={(e) => onChange({ ...value, lowImpactHoursPerDay: e.target.value as any })} />
            <Select label="Deep focus time" value={value.deepWorkHoursPerWeek} options={[">10", "5-10", "<5"]} onChange={(e) => onChange({ ...value, deepWorkHoursPerWeek: e.target.value as any })} />
            <Select label="Planned recovery" value={value.restScheduling} options={["regular", "occasional", "none"]} onChange={(e) => onChange({ ...value, restScheduling: e.target.value as any })} />
            <Select label="Days without rest" value={value.daysWithoutFullRestPastMonth} options={["<10", "10-20", ">20"]} onChange={(e) => onChange({ ...value, daysWithoutFullRestPastMonth: e.target.value as any })} />
            <Select label="Late night work" value={value.lateNightWork} options={["rare", "occasional", "frequent"]} onChange={(e) => onChange({ ...value, lateNightWork: e.target.value as any })} />
        </>
    );
}
