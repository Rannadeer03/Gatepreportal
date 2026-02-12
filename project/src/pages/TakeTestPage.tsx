import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { Clock, Save, AlertTriangle, Shield } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { useExamProctoring } from '../hooks/useExamProctoring';
import ProctoringWarningModal from '../components/ProctoringWarningModal';

interface Question {
  id: string;
  question_text: string;
  type: 'text' | 'image';
  options: string[];
  correct_option: string;
  image_url?: string;
  explanation?: string;
}

interface Test {
  id: string;
  title: string;
  subject: string;
  duration: number;
  time_limit?: number;
  is_scheduled: boolean;
  access_window_start?: string;
  access_window_end?: string;
}

const TakeTestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Exam Proctoring System
  const proctoring = useExamProctoring({
    testId: testId || '',
    studentId: user?.id || '',
    maxViolations: 3, // Students get 3 warnings
    warningDuration: 5000, // 5 seconds
    enableFullscreen: true, // Require fullscreen mode
    autoSubmitOnMaxViolations: true, // Auto-submit after max violations
    trackTimeAway: true, // Track time spent away from exam
    preventCopyPaste: true, // Disable copy/paste
    preventRightClick: true, // Disable right-click
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (profile?.role !== 'student') {
      navigate('/student-main-dashboard');
      return;
    }

    fetchTest();
  }, [user, profile, testId]);

  const fetchTest = async () => {
    try {
      if (!user) {
        setError('User not authenticated');
        return;
      }

      // Fetch test details
      const { data: testData, error: testError } = await supabase
        .from('academic_tests')
        .select('*')
        .eq('id', testId)
        .single();

      console.log('testData', testData, 'testError', testError);

      if (testError) throw testError;
      setTest(testData);

      // Fetch question IDs from academic_test_questions first
      const { data: testQuestionIdsData, error: testQuestionIdsError } = await supabase
        .from('academic_test_questions')
        .select('question_id')
        .eq('test_id', testId)
        .order('question_order');

      console.log('testQuestionIdsData', testQuestionIdsData, 'testQuestionIdsError', testQuestionIdsError);

      if (testQuestionIdsError) throw testQuestionIdsError;

      const questionIds = testQuestionIdsData.map((q: any) => q.question_id);

      // Now fetch the actual question details using the IDs from academic_questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('academic_questions')
        .select('id, question_text, type, options, correct_option, image_url, explanation')
        .in('id', questionIds);

      console.log('questionsData', questionsData, 'questionsError', questionsError);

      if (questionsError) throw questionsError;
      setQuestions(questionsData as Question[]);

      // Check if test result exists
      const { data: resultData, error: resultError } = await supabase
        .from('academic_test_results')
        .select('*')
        .eq('test_id', testId)
        .eq('student_id', user.id)
        .maybeSingle();

      console.log('resultData', resultData, 'resultError', resultError);

      if (resultData) {
        setAnswers(resultData.answers || {});
        if (resultData.started_at) {
          const timeElapsed = Math.floor((Date.now() - new Date(resultData.started_at).getTime()) / 1000 / 60);
          setTimeLeft((testData.time_limit || testData.duration) - timeElapsed);
        }
      } else {
        // Check again before insert to avoid race conditions
        const { data: checkResult } = await supabase
          .from('academic_test_results')
          .select('*')
          .eq('test_id', testData.id)
          .eq('student_id', user.id)
          .maybeSingle();
        if (checkResult) {
          // Resume any existing test (even if completed)
          setAnswers(checkResult.answers || {});
          setTimeLeft(testData.time_limit || testData.duration);
          return;
        }
        // Create new test result with upsert
        const { data, error } = await supabase
          .from('academic_test_results')
          .upsert([
            {
              test_id: testData.id,
              student_id: user.id,
              total_questions: questionsData.length,
              status: 'in_progress',
              started_at: new Date().toISOString(),
              answers: {}
            }
          ], { onConflict: 'test_id,student_id' })
          .select()
          .single();

        if (error) {
          if (error.code === '409' || error.message?.includes('duplicate key')) {
            setError('You have already started this test. Please resume or contact your teacher if you are stuck.');
          } else {
            setError(error.message || 'An error occurred while starting the test.');
          }
          console.error('Test result upsert error:', error);
          return;
        }
        setAnswers(data.answers || {});
        setTimeLeft(testData.time_limit || testData.duration);
      }
    } catch (error: any) {
      console.error('Error fetching test:', error);
      setError(error.message || 'An error occurred while fetching the test.');
    }
  };

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Auto-save progress
    saveProgress();
  };

  const saveProgress = async () => {
    try {
      const { error } = await supabase
        .from('academic_test_results')
        .update({
          answers,
          updated_at: new Date().toISOString()
        })
        .eq('test_id', testId)
        .eq('student_id', user?.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error saving progress:', error);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // Calculate score
      let correctAnswers = 0;
      let wrongAnswers = 0;
      let unattempted = 0;

      questions.forEach(question => {
        const answer = answers[question.id];
        if (!answer) {
          unattempted++;
        } else if (answer === question.correct_option) {
          correctAnswers++;
        } else {
          wrongAnswers++;
        }
      });

      const score = (correctAnswers / questions.length) * 100;

      // Update test result
      const { error } = await supabase
        .from('academic_test_results')
        .update({
          status: 'completed',
          score,
          correct_answers: correctAnswers,
          wrong_answers: wrongAnswers,
          unattempted,
          submitted_at: new Date().toISOString(),
          time_taken: test?.time_limit || test?.duration || 0 - timeLeft,
          answers
        })
        .eq('test_id', testId)
        .eq('student_id', user?.id);

      if (error) throw error;

      // Create notification for teachers
      if (test && profile) {
        await notificationService.createTestCompletionNotification(
          test.id,
          test.title,
          profile.full_name || 'Student',
          Math.round(score),
          questions.length
        );
      }

      // Navigate to results page
      navigate(`/test-result/${testId}`);
    } catch (error: any) {
      if (error.code === '23505') {
        setError('You have already submitted this test.');
      } else {
        setError(error.message || 'An error occurred while submitting the test.');
      }
      setIsSubmitting(false);
    }
  };

  // Auto-submit when max violations reached
  useEffect(() => {
    if (proctoring.shouldAutoSubmit && !isSubmitting) {
      handleSubmit();
    }
  }, [proctoring.shouldAutoSubmit]);

  if (!test || !questions.length) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading test...</p>
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
          {/* Test Header */}
          <div className="border-b pb-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{test.title}</h1>
                <p className="text-gray-600">{test.subject}</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Proctoring Status Indicator */}
                <div className="flex items-center space-x-2">
                  <Shield className={`h-5 w-5 ${proctoring.violations === 0 ? 'text-green-500' :
                      proctoring.violations >= 2 ? 'text-red-500' :
                        'text-yellow-500'
                    }`} />
                  <span className="text-sm text-gray-600">
                    Violations: {proctoring.violations}/3
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{timeLeft} minutes left</span>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Submit Test
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Proctoring Info Banner */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="ml-3 text-sm text-blue-800">
                  <p className="font-medium">Proctoring Enabled</p>
                  <p className="mt-1 text-blue-700">
                    This exam is being monitored. Do not switch tabs, exit fullscreen, or use copy/paste. You have 3 chances before auto-submission.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error submitting test
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-8">
            {questions.map((question, index) => (
              <div key={question.id} className="border-b pb-6">
                <div className="flex items-start space-x-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-medium">
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
                      {question.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option}
                            checked={answers[question.id] === option}
                            onChange={() => handleAnswerChange(question.id, option)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                          <span className="text-gray-700">
                            {option.startsWith('[IMG]') ? (
                              <img
                                src={option.replace('[IMG]', '')}
                                alt={`Option ${optionIndex + 1}`}
                                className="h-20 w-auto"
                              />
                            ) : (
                              option
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Proctoring Warning Modal */}
      <ProctoringWarningModal
        isOpen={proctoring.showWarning}
        violations={proctoring.violations}
        maxViolations={3}
        message={proctoring.warningMessage}
        timeAwaySeconds={proctoring.timeAwaySeconds}
        onDismiss={proctoring.dismissWarning}
        shouldAutoSubmit={proctoring.shouldAutoSubmit}
      />
    </div>
  );
};

export default TakeTestPage; 