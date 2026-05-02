/**
 * Core Salary Calculator
 * Handles Gross, Net, LOP, PF, and Tax calculations
 */

const calculateSalary = ({
  baseSalary,
  allowances = [],
  deductions = [],
  attendance = { totalDays: 30, lopDays: 0 },
  pfEnabled = true,
  taxEnabled = true,
}) => {
  const base = parseFloat(baseSalary.toString());
  
  // 1. Calculate LOP (Loss of Pay)
  const dailyRate = base / attendance.totalDays;
  const lopAmount = dailyRate * attendance.lopDays;
  const salaryAfterLop = base - lopAmount;

  // 2. Add Allowances
  const totalAllowances = allowances.reduce((sum, a) => sum + parseFloat(a.amount.toString()), 0);
  const grossSalary = salaryAfterLop + totalAllowances;

  // 3. Calculate Deductions
  let statutoryDeductions = 0;
  
  // Simple PF Calculation (e.g., 12% of base)
  if (pfEnabled) {
    const pfAmount = salaryAfterLop * 0.12;
    statutoryDeductions += pfAmount;
  }

  // Simple Tax Calculation (Place-holder logic)
  if (taxEnabled && grossSalary > 50000) {
    const taxAmount = (grossSalary - 50000) * 0.10; // 10% above 50k
    statutoryDeductions += taxAmount;
  }

  const otherDeductions = deductions.reduce((sum, d) => sum + parseFloat(d.amount.toString()), 0);
  const totalDeductions = statutoryDeductions + otherDeductions;

  // 4. Final Net Salary
  const netSalary = grossSalary - totalDeductions;

  return {
    baseSalary: base,
    lopAmount: parseFloat(lopAmount.toFixed(2)),
    grossSalary: parseFloat(grossSalary.toFixed(2)),
    statutoryDeductions: parseFloat(statutoryDeductions.toFixed(2)),
    otherDeductions: parseFloat(otherDeductions.toFixed(2)),
    totalDeductions: parseFloat(totalDeductions.toFixed(2)),
    netSalary: parseFloat(netSalary.toFixed(2)),
    breakdown: {
      pf: pfEnabled ? parseFloat((salaryAfterLop * 0.12).toFixed(2)) : 0,
      tax: taxEnabled && grossSalary > 50000 ? parseFloat(((grossSalary - 50000) * 0.10).toFixed(2)) : 0,
    }
  };
};

module.exports = { calculateSalary };
