export type InformationReliability =
  | "Measured"
  | "User Observed"
  | "Seller Provided"
  | "Laboratory Verified"
  | "Unverified";

export type EvaluationInput = {
  gemstoneId?: string;
  variety: string;
  caratWeight: number;

  color: {
    hue: string;
    tone: string;
    saturation: string;
    distribution: string;
    zoning: string;
  };

  clarity: {
    nakedEye: string;
    loupe10x: string;
    inclusionType: string;
    inclusionLocation: string;
    severity: string;
  };

  cut: {
    length: number;
    width: number;
    depth: number;
    symmetry: string;
    polish: string;
    windowing: string;
    extinction: string;
    bulging: string;
  };

  treatment: {
    status: string;
    type: string;
  };

  origin: {
    value: string;
    reliability: string;
  };

  informationReliability: {
    measurements: InformationReliability;
    treatment: InformationReliability;
    origin: InformationReliability;
  };
};
