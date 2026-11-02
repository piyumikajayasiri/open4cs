export type EvaluationStatus =
  | "PENDING"
  | "COMPLETED"
  | "UNAVAILABLE";

export type BaseEvaluationResult = {
  status: EvaluationStatus;
  reason: string;
};

export type ScoredEvaluationResult = BaseEvaluationResult & {
  score: number | null;
};

export type Overall4CEvaluationResult = ScoredEvaluationResult & {
  weights: {
    color: number;
    clarity: number;
    cut: number;
    carat: number;
  };
};
