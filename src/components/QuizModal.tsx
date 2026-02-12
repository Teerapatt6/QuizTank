import React, { useState, useEffect } from 'react';

// Types
export type QuizType = 'single' | 'multiple' | 'fill';

export interface QuizChoice {
    id: string;
    label: string; // A, B, C, D
    text: string;
}

export interface QuizQuestion {
    text: string;
    choices?: QuizChoice[]; // For single/multiple choice
    correctAnswers: string[]; // Array of correct answer IDs or text
    multipleCount?: number; // For multiple choice: how many to select (default 2)
}

export interface QuizModalProps {
    type: QuizType;
    question: QuizQuestion;
    onSubmit: (result: { correct: boolean; selectedAnswers: string[] }) => void;
    onClose: () => void;
    isOpen: boolean;
}

export const QuizModal: React.FC<QuizModalProps> = ({
    type,
    question,
    onSubmit,
    onClose,
    isOpen,
}) => {
    // State management
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
    const [fillAnswer, setFillAnswer] = useState('');
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedAnswers([]);
            setFillAnswer('');
            setShowFeedback(false);
        }
    }, [isOpen]);

    // Handle single/multiple choice selection
    const handleChoiceClick = (choiceId: string) => {
        if (type === 'single') {
            setSelectedAnswers([choiceId]);
        } else if (type === 'multiple') {
            const maxSelections = question.multipleCount || 2;
            if (selectedAnswers.includes(choiceId)) {
                // Deselect
                setSelectedAnswers(selectedAnswers.filter((id) => id !== choiceId));
            } else {
                // Select (if not at max)
                if (selectedAnswers.length < maxSelections) {
                    setSelectedAnswers([...selectedAnswers, choiceId]);
                }
            }
        }
    };

    // Check if answer is correct
    const checkAnswer = (): boolean => {
        if (type === 'fill') {
            // Case-insensitive comparison for fill-in
            return question.correctAnswers.some(
                (correct) => correct.toLowerCase().trim() === fillAnswer.toLowerCase().trim()
            );
        } else {
            // For single/multiple choice
            if (selectedAnswers.length !== question.correctAnswers.length) {
                return false;
            }
            return selectedAnswers.every((answer) =>
                question.correctAnswers.includes(answer)
            );
        }
    };

    // Handle submit
    const handleSubmit = () => {
        const correct = checkAnswer();
        setIsCorrect(correct);
        setShowFeedback(true);

        // Show feedback briefly, then call onSubmit
        setTimeout(() => {
            onSubmit({
                correct,
                selectedAnswers: type === 'fill' ? [fillAnswer] : selectedAnswers,
            });
            setShowFeedback(false);
        }, 600);
    };

    // Determine if submit should be disabled
    const isSubmitDisabled = () => {
        if (type === 'fill') {
            return fillAnswer.trim() === '';
        } else if (type === 'multiple') {
            const requiredCount = question.multipleCount || 2;
            return selectedAnswers.length !== requiredCount;
        } else {
            return selectedAnswers.length === 0;
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl pointer-events-auto transform transition-all duration-300 ${showFeedback
                            ? isCorrect
                                ? 'ring-4 ring-green-400'
                                : 'ring-4 ring-red-400 animate-shake'
                            : ''
                        }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Section */}
                    <div className="text-center pt-8 pb-4 px-6">
                        <div className="text-5xl mb-3">🎯</div>
                        <h2 className="text-3xl font-bold text-gray-800">
                            Answer to Fire!
                        </h2>
                    </div>

                    {/* Question Section */}
                    <div className="px-6 pb-6">
                        <div className="bg-blue-50 rounded-xl p-6 shadow-sm border border-blue-100">
                            <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                                {question.text}
                            </p>
                        </div>
                    </div>

                    {/* Answer Section */}
                    <div className="px-6 pb-6">
                        {/* Single Choice */}
                        {type === 'single' && question.choices && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {question.choices.map((choice) => {
                                    const isSelected = selectedAnswers.includes(choice.id);
                                    return (
                                        <button
                                            key={choice.id}
                                            onClick={() => handleChoiceClick(choice.id)}
                                            className={`
                        flex items-center gap-3 p-4 rounded-xl border-2 
                        transition-all duration-200 text-left
                        ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 shadow-md'
                                                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                                                }
                      `}
                                        >
                                            <span
                                                className={`
                        flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                        font-bold text-sm
                        ${isSelected
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }
                      `}
                                            >
                                                {choice.label}
                                            </span>
                                            <span className="text-gray-700 font-medium">
                                                {choice.text}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Multiple Choice */}
                        {type === 'multiple' && question.choices && (
                            <>
                                <div className="text-center mb-4">
                                    <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold">
                                        Select {question.multipleCount || 2} answers
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {question.choices.map((choice) => {
                                        const isSelected = selectedAnswers.includes(choice.id);
                                        return (
                                            <button
                                                key={choice.id}
                                                onClick={() => handleChoiceClick(choice.id)}
                                                className={`
                          flex items-center gap-3 p-4 rounded-xl border-2 
                          transition-all duration-200 text-left
                          ${isSelected
                                                        ? 'border-purple-500 bg-purple-50 shadow-md'
                                                        : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-sm'
                                                    }
                        `}
                                            >
                                                <span
                                                    className={`
                          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                          font-bold text-sm
                          ${isSelected
                                                            ? 'bg-purple-500 text-white'
                                                            : 'bg-gray-100 text-gray-600'
                                                        }
                        `}
                                                >
                                                    {choice.label}
                                                </span>
                                                <span className="text-gray-700 font-medium">
                                                    {choice.text}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* Fill-in Answer */}
                        {type === 'fill' && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Enter your answer
                                </label>
                                <input
                                    type="text"
                                    value={fillAnswer}
                                    onChange={(e) => setFillAnswer(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !isSubmitDisabled()) {
                                            handleSubmit();
                                        }
                                    }}
                                    placeholder="Type your answer here..."
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 
                    focus:border-blue-400 focus:ring-4 focus:ring-blue-100 
                    outline-none transition-all duration-200 text-lg"
                                    autoFocus
                                />
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="px-6 pb-6">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled()}
                            className={`
                w-full py-4 rounded-xl font-bold text-lg text-white
                transition-all duration-200 transform
                ${isSubmitDisabled()
                                    ? 'bg-gray-300 cursor-not-allowed opacity-50'
                                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
                                }
              `}
                        >
                            Submit Answer
                        </button>
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="bg-gray-50 rounded-b-2xl px-6 py-4 flex justify-between items-center border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-lg">⚡</span>
                            <span>+3 Ammo for correct answer</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-lg">❤️</span>
                            <span>-1 Heart for wrong answer</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom shake animation */}
            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
        </>
    );
};

export default QuizModal;
