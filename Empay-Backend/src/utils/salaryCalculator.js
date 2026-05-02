/**
 * Core Salary Calculator
 * Handles Gross, Net, LOP, PF, and Tax calculations
 * Supports fixed and percentage based rules
 */

const calculateSalary = ({
  baseSalary,
  allowances = [],
  deductions = [],
  attendance = { totalDays: 30, lopDays: 0 },
  statutory = { pfEnabled: true, ptEnabled: true, esiEnabled: false, tdsEnabled: false },
}) => {
  const base = parseFloat(baseSalary.toString()) || 0;
  
  // 1. Calculate LOP (Loss of Pay) impact on base
  const dailyRate = base / (attendance.totalDays || 30);
  const lopAmount = dailyRate * (attendance.lopDays || 0);
  const effectiveBase = base - lopAmount;

  // 2. Calculate Allowances
  const computedAllowances = allowances.map(a => {
    let amount = parseFloat(a.amount?.toString() || '0');
    if (a.rateType === 'PERCENTAGE') {
      amount = base * (amount / 100);
    }
    // Pro-rate if needed? (Usually allowances like HRA are pro-rated if based on attendance)
    // For now, let's assume they are fixed or based on original base
    return { name: a.name, amount: parseFloat(amount.toFixed(2)) };
  });

  const totalAllowances = computedAllowances.reduce((sum, a) => sum + a.amount, 0);
  const grossSalary = effectiveBase + totalAllowances;

  // 3. Calculate Statutory Deductions
  const breakdown = {};
  let statutoryTotal = 0;

  if (statutory.pfEnabled) {
    // Standard PF: 12% of effective base (capped at 15000 usually, but let's keep it simple)
    const pfAmount = effectiveBase * 0.12;
    breakdown.pf_employee = parseFloat(pfAmount.toFixed(2));
    breakdown.pf_employer = parseFloat(pfAmount.toFixed(2)); // Company cost component
    statutoryTotal += breakdown.pf_employee;
  }

  if (statutory.ptEnabled) {
    // Simple PT slabs (e.g., 200 per month if gross > 10000)
    const ptAmount = grossSalary > 10000 ? 200 : 0;
    breakdown.professional_tax = ptAmount;
    statutoryTotal += ptAmount;
  }

  if (statutory.esiEnabled) {
    // ESI: 0.75% of gross for employee (if gross <= 21000)
    if (grossSalary <= 21000) {
      const esiAmount = grossSalary * 0.0075;
      breakdown.esi_employee = parseFloat(esiAmount.toFixed(2));
      breakdown.esi_employer = parseFloat((grossSalary * 0.0325).toFixed(2));
      statutoryTotal += breakdown.esi_employee;
    } else {
      breakdown.esi_employee = 0;
      breakdown.esi_employer = 0;
    }
  }

  if (statutory.tdsEnabled) {
    // Simple TDS calculation (e.g., 10% for simplicity in this version)
    // In production this would use tax slab logic
    const tdsAmount = grossSalary > 30000 ? grossSalary * 0.1 : 0;
    breakdown.tds = parseFloat(tdsAmount.toFixed(2));
    statutoryTotal += breakdown.tds;
  }

  // 4. Calculate Other Deductions
  const computedDeductions = deductions.map(d => {
    let amount = parseFloat(d.amount?.toString() || '0');
    if (d.rateType === 'PERCENTAGE') {
      amount = grossSalary * (amount / 100);
    }
    return { name: d.name, amount: parseFloat(amount.toFixed(2)) };
  });

  const otherDeductionsTotal = computedDeductions.reduce((sum, d) => sum + d.amount, 0);
  const totalDeductions = statutoryTotal + otherDeductionsTotal;

  // 5. Final Net Salary
  const netSalary = grossSalary - totalDeductions;

  return {
    baseSalary: base,
    effectiveBase: parseFloat(effectiveBase.toFixed(2)),
    lopAmount: parseFloat(lopAmount.toFixed(2)),
    allowances: computedAllowances,
    deductions: computedDeductions,
    statutory: breakdown,
    grossSalary: parseFloat(grossSalary.toFixed(2)),
    totalDeductions: parseFloat(totalDeductions.toFixed(2)),
    netSalary: parseFloat(netSalary.toFixed(2)),
  };
};

module.exports = { calculateSalary };
