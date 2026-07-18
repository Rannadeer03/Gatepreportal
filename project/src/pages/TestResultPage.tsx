import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface TestResult {
  id: string;
  test_id: string;
  student_id: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  unattempted: number;
  time_taken: number;
  started_at: string;
  submitted_at: string;
  status: string;
  answers: Record<string, string>;
}

interface Question {
  id: string;
  question_text: string;
  type: 'text' | 'image';
  options: string[];
  correct_option: string;
  image_url?: string;
  explanation?: string;
}

interface TestQuestion {
  question_id: string;
  questions: {
    id: string;
    question_text: string;
    type: 'text' | 'image';
    options: string[];
    correct_option: string;
    image_url?: string;
    explanation?: string;
  };
}

const TestResultPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchTestResult();
  }, [user, testId]);

  const fetchTestResult = async () => {
    if (!user || !testId) return;

    try {
      // A test result can live in either the mock-test schema (test_results /
      // test_questions / questions) or the academic-portal schema
      // (academic_test_results / academic_test_questions / academic_questions).
      // Try the mock-test tables first, fall back to the academic ones.
      let resultsTable = 'test_results';
      let testQuestionsTable = 'test_questions';
      let questionsRelation = 'questions';

      let { data: resultData, error: resultError } = await supabase
        .from(resultsTable)
        .select('*')
        .eq('test_id', testId)
        .eq('student_id', user.id)
        .maybeSingle();

      if (!resultData && !resultError) {
        resultsTable = 'academic_test_results';
        testQuestionsTable = 'academic_test_questions';
        questionsRelation = 'academic_questions';

        ({ data: resultData, error: resultError } = await supabase
          .from(resultsTable)
          .select('*')
          .eq('test_id', testId)
          .eq('student_id', user.id)
          .maybeSingle());
      }

      if (resultError) throw resultError;
      if (!resultData) throw new Error('No result found for this test.');
      setTestResult(resultData);

      // Fetch questions from whichever schema the result came from
      const { data: questionsData, error: questionsError } = await supabase
        .from(testQuestionsTable)
        .select(`
          question_id,
          ${questionsRelation} (
            id,
            question_text,
            type,
            options,
            correct_option,
            image_url,
            explanation
          )
        `)
        .eq('test_id', testId)
        .order('question_order');

      if (questionsError) throw questionsError;
      const typedQuestions = (questionsData as unknown as TestQuestion[]).map(q => {
        const question = (q as any)[questionsRelation] ?? q.questions;
        return {
          id: question.id,
          question_text: question.question_text,
          type: question.type as 'text' | 'image',
          options: question.options as string[],
          correct_option: question.correct_option,
          image_url: question.image_url,
          explanation: question.explanation
        };
      });
      setQuestions(typedQuestions);
    } catch (error: any) {
      console.error('Error fetching test result:', error);
      setError(error.message);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-md">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Couldn't load your results</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!testResult || !questions.length) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading results...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Result Summary */}
          <div className="border-b pb-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Results</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-sm text-green-600">Correct Answers</p>
                    <p className="text-2xl font-bold text-green-700">{testResult.correct_answers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="h-8 w-8 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm text-red-600">Wrong Answers</p>
                    <p className="text-2xl font-bold text-red-700">{testResult.wrong_answers}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm text-yellow-600">Unattempted</p>
                    <p className="text-2xl font-bold text-yellow-700">{testResult.unattempted}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-sm text-blue-600">Time Taken</p>
                    <p className="text-2xl font-bold text-blue-700">{testResult.time_taken} mins</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Final Score</p>
                <p className="text-3xl font-bold text-gray-900">{testResult.score.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-8">
            {questions.map((question, index) => {
              const studentAnswer = testResult.answers[question.id];
              const isCorrect = studentAnswer === question.correct_option;

              return (
                <div
                  key={question.id}
                  className={`border rounded-lg p-6 ${
                    isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium mb-4">
                        {question.question_text}
                      </p>
                      {question.image_url && (
                        <img
                          src={question.image_url}
                          alt="Question"
                          className="max-w-md mb-4 rounded-lg"
                        />
                      )}
                      <div className="space-y-3">
                        {question.options.map((option, optionIndex) => {
                          const isSelected = studentAnswer === option;
                          const isCorrectOption = option === question.correct_option;

                          return (
                            <div
                              key={optionIndex}
                              className={`p-3 border rounded-lg ${
                                isSelected
                                  ? isCorrect
                                    ? 'bg-green-100 border-green-300'
                                    : 'bg-red-100 border-red-300'
                                  : isCorrectOption
                                  ? 'bg-green-100 border-green-300'
                                  : 'bg-white'
                              }`}
                            >
                              {option.startsWith('[IMG]') ? (
                                <img
                                  src={option.replace('[IMG]', '')}
                                  alt={`Option ${optionIndex + 1}`}
                                  className="h-20 w-auto"
                                />
                              ) : (
                                option
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {question.explanation && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">Explanation:</p>
                          <p className="mt-1 text-blue-700">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultPage; 