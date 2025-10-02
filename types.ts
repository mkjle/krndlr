export enum Operation {
  Add,
  Subtract,
  Multiply,
  Divide,
  Square,
  Cube,
  SquareRoot,
}

export interface Task {
  id: number;
  operation: Operation;
  numbers: number[];
  questionText: string;
  questionSpeech: string;
  answer: number;
}

export interface UserAnswer {
  task: Task;
  userAnswer: number | null;
  isCorrect: boolean;
  durationMs: number;
}

export enum GameState {
    Welcome,
    Options,
    Task,
    Summary,
}

export const operationNames: Record<Operation, string> = {
  [Operation.Add]: 'Addition',
  [Operation.Subtract]: 'Subtraktion',
  [Operation.Multiply]: 'Multiplikation',
  [Operation.Divide]: 'Division',
  [Operation.Square]: 'Quadratzahlen',
  [Operation.Cube]: 'Kubikzahlen',
  [Operation.SquareRoot]: 'Wurzelziehen',
};