import { QuizType, QuizQuestion } from '../components/QuizModal';

/**
 * Sample questions for TankGame quiz triggers
 * Each question is linked to a trigger box on the map
 */

export interface GameQuestion extends QuizQuestion {
    id: string;
    type: QuizType;
}

export const sampleQuestions: GameQuestion[] = [
    // Question 1: Single Choice (from screenshot example)
    {
        id: 'q1',
        type: 'single',
        text: 'Given that an n-sided polygon has 35 diagonals,\nwhat is the sum of its interior angles (in degrees)?',
        choices: [
            { id: 'a', label: 'A', text: '1,080 degrees' },
            { id: 'b', label: 'B', text: '1,260 degrees' },
            { id: 'c', label: 'C', text: '1,440 degrees' },
            { id: 'd', label: 'D', text: '1,800 degrees' },
        ],
        correctAnswers: ['c'], // n=10, sum = (10-2)*180 = 1,440
    },

    // Question 2: Multiple Choice
    {
        id: 'q2',
        type: 'multiple',
        text: 'Which of the following are prime numbers?',
        choices: [
            { id: 'a', label: 'A', text: '17' },
            { id: 'b', label: 'B', text: '21' },
            { id: 'c', label: 'C', text: '23' },
            { id: 'd', label: 'D', text: '27' },
        ],
        correctAnswers: ['a', 'c'], // 17 and 23 are prime
        multipleCount: 2,
    },

    // Question 3: Fill-in Answer
    {
        id: 'q3',
        type: 'fill',
        text: 'What is the value of π (pi) rounded to 2 decimal places?',
        correctAnswers: ['3.14', '3,14'], // Accept both formats
    },

    // Question 4: Single Choice (Math)
    {
        id: 'q4',
        type: 'single',
        text: 'What is the derivative of f(x) = x² + 3x - 5?',
        choices: [
            { id: 'a', label: 'A', text: '2x + 3' },
            { id: 'b', label: 'B', text: 'x² + 3' },
            { id: 'c', label: 'C', text: '2x - 5' },
            { id: 'd', label: 'D', text: 'x + 3' },
        ],
        correctAnswers: ['a'],
    },

    // Question 5: Fill-in Answer (Science)
    {
        id: 'q5',
        type: 'fill',
        text: 'What is the chemical symbol for gold?',
        correctAnswers: ['Au', 'AU', 'au'],
    },
];

/**
 * Get a question by ID
 */
export function getQuestionById(id: string): GameQuestion | undefined {
    return sampleQuestions.find((q) => q.id === id);
}
