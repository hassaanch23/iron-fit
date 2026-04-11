/** WHO-style thresholds (kg/m²). */
export const BMI_UNDERWEIGHT_MAX = 18.5;
export const BMI_NORMAL_MAX = 25;
export const BMI_OVERWEIGHT_MAX = 30;

export type BmiCategory = { label: string; color: string };

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < BMI_UNDERWEIGHT_MAX) return { label: 'Underweight', color: '#F4B740' };
  if (bmi < BMI_NORMAL_MAX) return { label: 'Normal', color: '#2EBD85' };
  if (bmi < BMI_OVERWEIGHT_MAX) return { label: 'Overweight', color: '#FF9800' };
  return { label: 'Obese', color: '#E53935' };
}

export function calcBmi(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm || weightKg <= 0 || heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export type BmiInfo = { label: string; color: string; suggestion: string };

export function getBmiInfo(bmi: number): BmiInfo {
  const { label, color } = getBmiCategory(bmi);
  if (bmi < BMI_UNDERWEIGHT_MAX)
    return { label, color, suggestion: 'Consider a calorie-surplus diet with strength training to gain healthy weight.' };
  if (bmi < BMI_NORMAL_MAX)
    return { label, color, suggestion: 'Great shape! Maintain your routine with balanced nutrition and regular exercise.' };
  if (bmi < BMI_OVERWEIGHT_MAX)
    return { label, color, suggestion: 'Try adding more cardio and reducing calorie intake to gradually lose weight.' };
  return { label, color, suggestion: 'Consult a professional. Start with low-impact exercises and a structured diet plan.' };
}
