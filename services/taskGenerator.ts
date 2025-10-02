import { Operation, Task } from '../types';

const rand = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Weighted list of operations for more balanced distribution
const operations = [
  { op: Operation.Add, weight: 15 },
  { op: Operation.Subtract, weight: 15 },
  { op: Operation.Multiply, weight: 15 },
  { op: Operation.Divide, weight: 15 },
  { op: Operation.Square, weight: 15 },
  { op: Operation.Cube, weight: 10 },
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

const generateTask = (id: number, enabledOps?: Operation[], taskComplexity: number | 'random' = 'random'): Task => {
    let numTerms: number;
    if (taskComplexity === 'random') {
        const choices = [2, 2, 2, 2, 3, 3, 4]; // Weighted random: mostly 2, sometimes 3, rarely 4
        numTerms = choices[rand(0, choices.length - 1)];
    } else {
        numTerms = taskComplexity;
    }

    let numbers: number[] = [];
    let questionText = '';
    let questionSpeech = '';
    let answer = 0;
    const operation = selectOperation(enabledOps);

    // Generate the base operation (first two terms)
    switch (operation) {
        case Operation.Add: {
            const n1 = rand(100, 999);
            const n2 = rand(100, 999);
            numbers = [n1, n2];
            answer = n1 + n2;
            questionText = `${n1} + ${n2}`;
            questionSpeech = `${n1} plus ${n2}`;
            break;
        }
        case Operation.Subtract: {
            const n1 = rand(500, 1500);
            const n2 = rand(100, n1 - 100);
            numbers = [n1, n2];
            answer = n1 - n2;
            questionText = `${n1} - ${n2}`;
            questionSpeech = `${n1} minus ${n2}`;
            break;
        }
        case Operation.Multiply: {
            const n1 = rand(11, 99);
            const n2 = rand(11, 30);
            numbers = [n1, n2];
            answer = n1 * n2;
            questionText = `${n1} × ${n2}`;
            questionSpeech = `${n1} mal ${n2}`;
            break;
        }
        case Operation.Divide: {
            const divisor = rand(2, 25);
            const quotient = rand(10, 50);
            const dividend = divisor * quotient;
            numbers = [dividend, divisor];
            answer = quotient;
            questionText = `${dividend} ÷ ${divisor}`;
            questionSpeech = `${dividend} geteilt durch ${divisor}`;
            break;
        }
        case Operation.Square: {
            const n = rand(11, 40);
            numbers = [n];
            answer = n * n;
            questionText = `${n}²`;
            questionSpeech = `${n} im Quadrat`;
            break;
        }
        case Operation.Cube: {
            const n = rand(3, 10);
            numbers = [n];
            answer = n * n * n;
            questionText = `${n}³`;
            questionSpeech = `${n} hoch drei`;
            break;
        }
        case Operation.SquareRoot: {
            const n = rand(5, 30);
            const base = n * n;
            numbers = [base];
            answer = n;
            questionText = `√${base}`;
            questionSpeech = `Wurzel aus ${base}`;
            break;
        }
    }

    // Chain additional operations for complexity > 2
    // We'll only chain addition and subtraction to keep it mentally manageable.
    const chainOps = [Operation.Add, Operation.Subtract];

    for (let i = 2; i < numTerms; i++) {
        const nextOp = chainOps[rand(0, 1)];
        if (nextOp === Operation.Add) {
            const n = rand(10, 500);
            numbers.push(n);
            answer += n;
            questionText += ` + ${n}`;
            questionSpeech += ` plus ${n}`;
        } else { // Subtract
            const n = rand(10, Math.min(answer - 10, 500));
            numbers.push(n);
            answer -= n;
            questionText += ` - ${n}`;
            questionSpeech += ` minus ${n}`;
        }
    }

    questionText += ' = ?';

    return { id, operation, numbers, questionText, questionSpeech, answer };
};


export const generateRun = (enabledOps?: Operation[], count: number = 20, taskComplexity: number | 'random' = 'random'): Task[] => {
  const tasks: Task[] = [];
  for (let i = 0; i < count; i++) {
    tasks.push(generateTask(i, enabledOps, taskComplexity));
  }
  return tasks;
};