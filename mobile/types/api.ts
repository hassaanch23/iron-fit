export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type Profile = {
  user_id: number;
  name: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal_type: string | null;
  target_value: number | null;
};

export type Activity = {
  id: number;
  user_id: number;
  kind: string;
  steps: number;
  distance_km: number;
  calories: number;
  duration_min: number;
  started_at: string;
};

export type Dashboard = {
  total_steps_week: number;
  total_distance_week: number;
  total_calories_week: number;
  total_duration_week: number;
  workouts_week: number;
};

export type HistoryPoint = {
  period: string;
  steps: number;
  distance_km: number;
  calories: number;
  duration_min: number;
};
