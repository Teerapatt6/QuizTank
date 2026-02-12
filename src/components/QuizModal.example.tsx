import React, { useState } from 'react';
import { QuizModal, QuizQuestion, QuizType } from './QuizModal';

/**
 * Example usage of QuizModal component
 * This demonstrates all three question types: single, multiple, and fill
 */
export const QuizModalExample: React.FC = () => {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [currentQuizType, setCurrentQuizType] = useState<QuizType>('single');
    const [ammo, setAmmo] = useState(10);
    const [hearts, setHearts] = useState(3);

    // Example questions for each type
    const singleChoiceQuestion: QuizQuestion = {
        text: 'Given that an n-sided polygon has 35 diagonals,\nwhat is the sum of its interior angles (in degrees)?',
        choices: [
            { id: 'a', label: 'A', text: '1,080 degrees' },
            { id: 'b', label: 'B', text: '1,260 degrees' },
            { id: 'c', label: 'C', text: '1,440 degrees' },
            { id: 'd', label: 'D', text: '1,800 degrees' },
        ],
        correctAnswers: ['c'], // 1,440 degrees is correct
    };

    const multipleChoiceQuestion: QuizQuestion = {
        text: 'Which of the following are prime numbers?',
        choices: [
            { id: 'a', label: 'A', text: '17' },
            { id: 'b', label: 'B', text: '21' },
            { id: 'c', label: 'C', text: '23' },
            { id: 'd', label: 'D', text: '27' },
        ],
        correctAnswers: ['a', 'c'], // 17 and 23 are prime
        multipleCount: 2,
    };

    const fillInQuestion: QuizQuestion = {
        text: 'What is the capital of France?',
        correctAnswers: ['Paris', 'paris'], // Accept multiple variations
    };

    // Get current question based on type
    const getCurrentQuestion = (): QuizQuestion => {
        switch (currentQuizType) {
            case 'single':
                return singleChoiceQuestion;
            case 'multiple':
                return multipleChoiceQuestion;
            case 'fill':
                return fillInQuestion;
            default:
                return singleChoiceQuestion;
        }
    };

    // Handle quiz submission
    const handleQuizSubmit = (result: { correct: boolean; selectedAnswers: string[] }) => {
        console.log('Quiz result:', result);

        if (result.correct) {
            // Correct answer: add ammo
            setAmmo((prev) => prev + 3);
            console.log('✅ Correct! +3 Ammo');
        } else {
            // Wrong answer: lose heart
            setHearts((prev) => Math.max(0, prev - 1));
            console.log('❌ Wrong! -1 Heart');
        }

        // Close modal and resume game
        setTimeout(() => {
            setIsQuizOpen(false);
            // Here you would resume your game logic
            console.log('Game resumed');
        }, 100);
    };

    // Handle modal close (without answering)
    const handleQuizClose = () => {
        setIsQuizOpen(false);
        console.log('Quiz closed without answering');
    };

    // Open quiz with specific type
    const openQuiz = (type: QuizType) => {
        setCurrentQuizType(type);
        setIsQuizOpen(true);
        // Here you would pause your game logic
        console.log('Game paused');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
            {/* Game Stats */}
            <div className="max-w-4xl mx-auto mb-8 bg-white rounded-xl p-6 shadow-lg">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚡</span>
                        <span className="text-xl font-bold">Ammo: {ammo}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">❤️</span>
                        <span className="text-xl font-bold">Hearts: {hearts}</span>
                    </div>
                </div>
            </div>

            {/* Demo Buttons */}
            <div className="max-w-4xl mx-auto bg-white rounded-xl p-8 shadow-lg">
                <h1 className="text-3xl font-bold mb-6 text-center">QuizModal Demo</h1>
                <p className="text-gray-600 mb-8 text-center">
                    Click a button below to test different quiz types
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => openQuiz('single')}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        <div className="text-2xl mb-2">📝</div>
                        Single Choice
                    </button>

                    <button
                        onClick={() => openQuiz('multiple')}
                        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        <div className="text-2xl mb-2">✅</div>
                        Multiple Choice
                    </button>

                    <button
                        onClick={() => openQuiz('fill')}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                        <div className="text-2xl mb-2">✏️</div>
                        Fill-in Answer
                    </button>
                </div>

                {/* Instructions */}
                <div className="mt-8 p-6 bg-gray-50 rounded-xl">
                    <h3 className="font-bold text-lg mb-3">How to integrate:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700">
                        <li>Import the QuizModal component</li>
                        <li>Set up state for quiz visibility and game stats</li>
                        <li>Pause game when modal opens</li>
                        <li>Handle onSubmit to update ammo/hearts</li>
                        <li>Resume game when modal closes</li>
                    </ol>
                </div>
            </div>

            {/* Quiz Modal */}
            <QuizModal
                type={currentQuizType}
                question={getCurrentQuestion()}
                onSubmit={handleQuizSubmit}
                onClose={handleQuizClose}
                isOpen={isQuizOpen}
            />

            {/* Simulated Game Canvas (blurred when quiz is open) */}
            <div
                className={`fixed inset-0 -z-10 transition-all duration-300 ${isQuizOpen ? 'blur-sm' : ''
                    }`}
            >
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-6xl opacity-20">🎮 Game Canvas</div>
                </div>
            </div>
        </div>
    );
};

export default QuizModalExample;
