import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Test {
  id: string;
  title: string;
  subject: string;
  is_active: boolean;
  created_at: string;
}

interface TestResult {
  id: string;
  test_id: string;
  student_id: string;
  score: number;
  submitted_at: string | null;
  student_name: string;
}

const AcademicTestResults: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('academic_tests')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setTests(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch tests');
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const fetchResults = async (test: Test) => {
    setLoading(true);
    setError(null);
    setSelectedTest(test);
    try {
      const { data, error } = await supabase
        .from('academic_test_results')
        .select(`id, test_id, student_id, score, submitted_at, profiles:student_id(name)`)
        .eq('test_id', test.id)
        .order('score', { ascending: false });
      if (error) throw error;
      const mappedResults: TestResult[] = (data as any[]).map((result) => ({
        id: result.id,
        test_id: result.test_id,
        student_id: result.student_id,
        score: result.score,
        submitted_at: result.submitted_at,
        student_name: result.profiles?.name || 'Unknown',
      }));
      setResults(mappedResults);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => {
          if (selectedTest) {
            setSelectedTest(null);
            setResults([]);
          } else {
            navigate('/academic/teacher-dashboard');
          }
        }}
        className="flex items-center mb-6 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-6 w-6 text-gray-600"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
        <span className="ml-2">{selectedTest ? 'Back to Test List' : 'Back to Dashboard'}</span>
      </button>

      <h1 className="text-2xl font-bold mb-6">Academic Test Results</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading && <div className="text-gray-500 mb-4">Loading...</div>}

      {!selectedTest ? (
        <div>
          <h2 className="text-lg font-semibold mb-4">Select a Test</h2>
          <div className="grid gap-4">
            {tests.length === 0 && <div className="text-gray-500">No tests found.</div>}
            {tests.map((test) => (
              <button
                key={test.id}
                onClick={() => fetchResults(test)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${test.is_active ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-lg">{test.title}</div>
                    <div className="text-sm text-gray-600">{test.subject}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${test.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{test.is_active ? 'Active' : 'Completed'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold mb-4">Results for: <span className="text-blue-700">{selectedTest.title}</span></h2>
          {results.length === 0 ? (
            <div className="text-gray-500">No results found for this test.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border rounded-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b text-left">Student Name</th>
                    <th className="px-4 py-2 border-b text-left">Score</th>
                    <th className="px-4 py-2 border-b text-left">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td className="px-4 py-2 border-b">{result.student_name}</td>
                      <td className="px-4 py-2 border-b">{result.score}</td>
                      <td className="px-4 py-2 border-b">{result.submitted_at ? new Date(result.submitted_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademicTestResults; 