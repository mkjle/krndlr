import { Operation, Task } from '../types';

const TOTAL_TASKS = 20;

const rand = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Weighted list of operations for more balanced distribution
const operations = [
  { op: Operation.Add, weight: 15 },
  { op: Operation.Subtract, weight: 15 },
  { op: Operation.Multiply, weight: 20 },
  { op: Operation.Divide, weight: 15 },
  { op: Operation.Square, weight: 12 },
  { op: Operation.Cube, weight: 8 },
  { op: Operation.SquareRoot, weight: 15 },
];

const selectOperation = (enabledOps?: Operation[]): Operation => {
  const availableOperations = 
    enabledOps && enabledOps.length > 0
      ? operations.filter(op => enabledOps.includes(op.op))
      : operations;

  if (availableOperations.length === 0) return Operation.Add;

  const totalWeight = availableOperations.reduce((sum, op) => sum + op.weight, 0);
  let random = Math.random() * totalWeight;

  for (const op of availableOperations) {
    if (random < op.weight) return op.op;
    random -= op.weight;
  }
  
  return availableOperations[0].op;
};

const generateTask = (id: number, enabledOps?: Operation[]): Task => {
  const operation = selectOperation(enabledOps);
  let numbers: number[] = [];
  let questionText = '';
  let questionSpeech = '';
  let answer = 0;

  switch (operation) {
    case Operation.Add: { // Pure addition
      const n1 = rand(10, 999);
      const n2 = rand(10, 999);
      const n3 = rand(10, 99);
      if (Math.random() > 0.4) {
        numbers = [n1, n2, n3];
        answer = n1 + n2 + n3;
        questionText = `${n1} + ${n2} + ${n3} = ?`;
        questionSpeech = `${n1} plus ${n2} plus ${n3}`;
      } else {
        numbers = [n1, n2];
        answer = n1 + n2;
        questionText = `${n1} + ${n2} = ?`;
        questionSpeech = `${n1} plus ${n2}`;
      }
      break;
    }
    case Operation.Subtract: { // Pure subtraction
      if (Math.random() > 0.5) {
        const n1 = rand(100, 1500);
        const n2 = rand(10, n1 - 10);
        numbers = [n1, n2];
        answer = n1 - n2;
        questionText = `${n1} - ${n2} = ?`;
        questionSpeech = `${n1} minus ${n2}`;
      } else {
        const n1 = rand(200, 500);
        const n2 = rand(50, 250);
        const n3 = rand(50, 250);
        numbers = [n1, n2, n3];
        answer = n1 - n2 - n3;
        questionText = `${n1} - ${n2} - ${n3} = ?`;
        questionSpeech = `${n1} minus ${n2} minus ${n3}`;
      }
      break;
    }
    case Operation.Multiply: {
      if (Math.random() > 0.5) {
        const n1 = rand(11, 99);
        const n2 = rand(11, 99);
        numbers = [n1, n2];
        answer = n1 * n2;
        questionText = `${n1} × ${n2} = ?`;
        questionSpeech = `${n1} mal ${n2}`;
      } else {
        const n1 = rand(100, 999);
        const n2 = rand(2, 9);
        numbers = [n1, n2];
        answer = n1 * n2;
        questionText = `${n1} × ${n2} = ?`;
        questionSpeech = `${n1} mal ${n2}`;
      }
      break;
    }
    case Operation.Divide: {
      const divisor = rand(2, 25);
      const quotient = rand(5, 50);
      const dividend = divisor * quotient;
      numbers = [dividend, divisor];
      answer = quotient;
      questionText = `${dividend} ÷ ${divisor} = ?`;
      questionSpeech = `${dividend} geteilt durch ${divisor}`;
      break;
    }
    case Operation.Square: {
      const n = rand(10, 30);
      numbers = [n];
      answer = n * n;
      questionText = `${n}² = ?`;
      questionSpeech = `${n} im Quadrat`;
      break;
    }
    case Operation.Cube: {
      const n = rand(2, 10);
      numbers = [n];
      answer = n * n * n;
      questionText = `${n}³ = ?`;
      questionSpeech = `${n} hoch drei`;
      break;
    }
    case Operation.SquareRoot: {
      const n = rand(2, 25);
      const base = n * n;
      numbers = [base];
      answer = n;
      questionText = `√${base} = ?`;
      questionSpeech = `Wurzel aus ${base}`;
      break;
    }
  }

  return { id, operation, numbers, questionText, questionSpeech, answer };
};

export const generateRun = (enabledOps?: Operation[], count: number = TOTAL_TASKS): Task[] => {
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    tasks.push(generateTask(i, enabledOps));
  }
  return tasks;
};