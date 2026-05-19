export interface SavingsGoal {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  isCompleted: boolean;
}

export interface CreateGoalPayload {
  name: string;
  description?: string;
  targetAmount: number;
  targetDate?: string;
}

export interface UpdateGoalPayload {
  name?: string;
  description?: string;
  targetAmount?: number;
  currentAmount?: number;
  targetDate?: string;
  isCompleted?: boolean;
}
