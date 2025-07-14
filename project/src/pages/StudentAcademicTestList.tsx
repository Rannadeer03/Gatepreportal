import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface AcademicTest {
  id: string;
  title: string;
  subject: string;
  is_active: boolean;
  created_at: string;
}

const StudentAcademicTestList: React.FC = () => {
  const [tests, setTests] = useState<AcademicTest[]>([]);
  const [attemptedTestIds, setAttemptedTestIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchTestsAndAttempts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all active academic tests
        const { data: testsData, error: testsError } = await supabase
          .from('academic_tests')
          .select('*')
          .order('created_at', { ascending: false });
        if (testsError) throw testsError;
        setTests(testsData || []);

        // Fetch attempted test IDs for this student
        if (user?.id) {
          const { data: resultsData, error: resultsError } = await supabase
            .from('academic_test_results')
            .select('test_id')
            .eq('student_id', user.id)
            .eq('status', 'completed');
          if (resultsError) throw resultsError;
          setAttemptedTestIds((resultsData || []).map((r: any) => r.test_id));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tests');
      } finally {
        setLoading(false);
      }
    };
    fetchTestsAndAttempts();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-base font-medium">Back to Dashboard</span>
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">Available Academic Tests</h1>
        <p className="text-center text-lg text-gray-600 mb-10">Select a test to begin. Only active tests are available.</p>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {loading ? (
          <div className="text-center text-gray-500">Loading tests...</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {tests.filter(test => test.is_active && !attemptedTestIds.includes(test.id)).length === 0 && <div className="text-gray-500 text-center">No tests available.</div>}
            {tests.filter(test => test.is_active && !attemptedTestIds.includes(test.id)).map((test) => (
              <div key={test.id} className="bg-white rounded-xl shadow p-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-lg mr-4">
                    <FileText className="h-7 w-7 text-red-500" />
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-gray-900">{test.title}</div>
                    <div className="text-sm text-gray-600">{test.subject}</div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/take-test/${test.id}`)}
                  className="bg-red-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Start Test
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAcademicTestList; 