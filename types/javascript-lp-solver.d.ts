declare module 'javascript-lp-solver' {
  export interface LpModel {
    optimize: string;
    opType: 'min' | 'max';
    constraints: Record<string, { min?: number; max?: number; equal?: number }>;
    variables: Record<string, Record<string, number>>;
    ints?: Record<string, number>;
    binaries?: Record<string, number>;
    unrestricted?: Record<string, number>;
  }

  export interface LpSolution {
    feasible: boolean;
    result: number;
    bounded?: boolean;
    isCurrentContext?: boolean;
    [key: string]: any;
  }

  export function Solve(model: LpModel): LpSolution;

  const solver: {
    Solve: (model: LpModel) => LpSolution;
    Model: any;
    MultiObjective: any;
  };

  export default solver;
}
