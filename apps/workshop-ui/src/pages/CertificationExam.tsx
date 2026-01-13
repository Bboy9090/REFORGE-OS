// Certification Exam Interface
// Take certification exams with scenario-based assessments

import React, { useState } from 'react';

interface ExamQuestion {
  id: string;
  type: 'scenario' | 'multiple-choice' | 'true-false';
  question: string;
  scenario?: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
}

interface Exam {
  id: string;
  level: 'I' | 'II' | 'III';
  title: string;
  description: string;
  questions: ExamQuestion[];
  passingScore: number;
}

export default function CertificationExam() {
  const [selectedLevel, setSelectedLevel] = useState<'I' | 'II' | 'III' | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const mockExams: Record<string, Exam> = {
    I: {
      id: 'level-i',
      level: 'I',
      title: 'Level I - Diagnostic Steward',
      description: 'Test your knowledge of device analysis, ownership verification, and legal classification',
      passingScore: 80,
      questions: [
        {
          id: 'q1',
          type: 'scenario',
          scenario: 'A customer brings in an iPhone 12 with a locked screen. They claim ownership but have no documentation.',
          question: 'What is the appropriate first step?',
          options: [
            'Proceed with device analysis immediately',
            'Request ownership documentation',
            'Attempt to bypass the lock',
            'Decline the service'
          ],
          correctAnswer: 1,
          explanation: 'Ownership verification is required before proceeding with any analysis. Documentation should be requested first.'
        },
        {
          id: 'q2',
          type: 'multiple-choice',
          question: 'What does "capability class" refer to in device analysis?',
          options: [
            'The device\'s processing power',
            'The device\'s security posture and modification research category',
            'The device\'s storage capacity',
            'The device\'s network capabilities'
          ],
          correctAnswer: 1,
          explanation: 'Capability class refers to the device\'s security posture and the category of modification research it has been subject to.'
        },
      ],
    },
    II: {
      id: 'level-ii',
      level: 'II',
      title: 'Level II - Repair Custodian',
      description: 'Test your knowledge of repair compliance and customer transparency',
      passingScore: 85,
      questions: [
        {
          id: 'q1',
          type: 'scenario',
          scenario: 'During a screen replacement, you discover the device has been previously modified with unauthorized software.',
          question: 'What should you do?',
          options: [
            'Continue with the repair',
            'Document the finding and inform the customer',
            'Refuse service',
            'Remove the unauthorized software'
          ],
          correctAnswer: 1,
          explanation: 'All findings must be documented and the customer informed. Unauthorized modifications should be noted in the compliance report.'
        },
      ],
    },
    III: {
      id: 'level-iii',
      level: 'III',
      title: 'Level III - Interpretive Authority',
      description: 'Test your knowledge of high-risk scenarios and external authority routing',
      passingScore: 90,
      questions: [
        {
          id: 'q1',
          type: 'scenario',
          scenario: 'A device requires interpretive review. The ownership confidence is 75%.',
          question: 'What is the correct action?',
          options: [
            'Proceed with interpretive review',
            'Require additional documentation to reach 85% confidence',
            'Route directly to OEM',
            'Decline service'
          ],
          correctAnswer: 1,
          explanation: 'Interpretive review requires ownership confidence of 85% or higher. Additional documentation must be obtained first.'
        },
      ],
    },
  };

  const startExam = (level: 'I' | 'II' | 'III') => {
    setSelectedLevel(level);
    setExam(mockExams[level]);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(null);
  };

  const handleAnswer = (questionId: string, answer: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (exam && currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const resetExam = () => {
    setSelectedLevel(null);
    setExam(null);
    setShowResults(false);
    setScore(null);
    setAnswers({});
    setCurrentQuestion(0);
  };

  const submitExam = () => {
    if (!exam) return;

    let correct = 0;
    exam.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });

    const percentage = (correct / exam.questions.length) * 100;
    setScore(percentage);
    setShowResults(true);
  };

  if (!selectedLevel || !exam) {
    return (
      <section className="certification-exam">
        <div className="container max-w-4xl mx-auto py-8">
          <h2 className="text-3xl font-bold mb-2">Certification Exams</h2>
          <p className="text-gray-600 mb-8">Select a certification level to begin</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['I', 'II', 'III'] as const).map((level) => (
              <div key={level} className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="font-semibold text-lg mb-2">Level {level}</h3>
                <p className="text-sm text-gray-600 mb-4">
                  {mockExams[level].description}
                </p>
                <button
                  onClick={() => startExam(level)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700"
                >
                  Start Exam
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const question = exam.questions[currentQuestion];
  const isLastQuestion = currentQuestion === exam.questions.length - 1;

  return (
    <section className="certification-exam">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">{exam.title}</h2>
          <p className="text-gray-600">Question {currentQuestion + 1} of {exam.questions.length}</p>
        </div>

        {showResults ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Exam Results</h3>
            <div className={`text-4xl font-bold mb-4 ${score! >= exam.passingScore ? 'text-green-600' : 'text-red-600'}`}>
              {score!.toFixed(1)}%
            </div>
            <p className="text-lg mb-4">
              {score! >= exam.passingScore ? 'Congratulations! You passed.' : `You need ${exam.passingScore}% to pass.`}
            </p>
            <button
              onClick={resetExam}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700"
            >
              Return to Exam Selection
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            {question.scenario && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-blue-900 mb-2">Scenario:</p>
                <p className="text-sm text-blue-800">{question.scenario}</p>
              </div>
            )}

            <h3 className="font-semibold text-lg mb-4">{question.question}</h3>

            {question.options && (
              <div className="space-y-2 mb-6">
                {question.options.map((option, index) => (
                  <label
                    key={index}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      answers[question.id] === index ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={index}
                      checked={answers[question.id] === index}
                      onChange={() => handleAnswer(question.id, index)}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex justify-between">
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {isLastQuestion ? (
                <button
                  onClick={submitExam}
                  className="bg-green-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-green-700"
                >
                  Submit Exam
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
