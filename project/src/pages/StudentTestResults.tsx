import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, FileText, Award, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface TestResult {
  id: string;
  test_id: string;
  score: number;
  status: string;
  created_at: string;
  test_title: string;
  subject: string;
}

const StudentTestResults: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('User:', user);
        if (!user?.id) {
          setError('No user found. Please log in again.');
          setLoading(false);
          return;
        }
        // 1. Fetch test results (no join)
        const { data: resultsData, error: resultsError } = await supabase
          .from('test_results')
          .select('id, test_id, score, status, created_at')
          .eq('student_id', user.id)
          .order('created_at', { ascending: false });
        console.log('Results data:', resultsData, 'Error:', resultsError);
        if (resultsError) throw resultsError;
        if (!resultsData || resultsData.length === 0) {
          setResults([]);
          setLoading(false);
          return;
        }
        // 2. Get all unique test_ids, filter out falsy/non-string
        let testIds = Array.from(new Set(resultsData.map((r: any) => r.test_id)));
        testIds = testIds.filter((id) => typeof id === 'string' && !!id);
        console.log('Test IDs for .in():', testIds);
        if (!testIds.length) {
          setResults([]);
          setLoading(false);
          return;
        }
        // 3. Fetch all those tests
        const { data: testsData, error: testsError } = await supabase
          .from('tests')
          .select('id, title, subject')
          .in('id', testIds);
        console.log('Tests data:', testsData, 'Error:', testsError);
        if (testsError) {
          console.error('Supabase testsError:', testsError);
          throw testsError;
        }
        // 4. Merge test details into results
        const testMap: Record<string, { title: string; subject: string }> = {};
        (testsData || []).forEach((t: any) => {
          testMap[t.id] = { title: t.title, subject: t.subject };
        });
        const merged = resultsData.map((r: any) => ({
          ...r,
          test_title: testMap[r.test_id]?.title || 'Untitled',
          subject: testMap[r.test_id]?.subject || 'Unknown',
        }));
        console.log('Merged results:', merged);
        setResults(merged);
      } catch (err: any) {
        setError('Failed to load test results.' + (err?.message ? ' ' + err.message : ''));
        console.error('Test Results Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [user]);

  if (!user?.id) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-600">No user found. Please log in again.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => navigate('/student-dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span className="text-base font-medium">Back to GATE Dashboard</span>
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-4">Test Results</h1>
        <p className="text-center text-lg text-gray-600 mb-8">See your attempted GATE test results below.</p>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-center text-gray-500">No attempted tests found.</div>
        ) : (
          <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-700 border-b">
                  <th className="py-2 px-3 font-semibold">Test</th>
                  <th className="py-2 px-3 font-semibold">Subject</th>
                  <th className="py-2 px-3 font-semibold">Score</th>
                  <th className="py-2 px-3 font-semibold">Status</th>
                  <th className="py-2 px-3 font-semibold">Attempted At</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-emerald-50 transition">
                    <td className="py-2 px-3 flex items-center gap-2"><FileText className="h-4 w-4 text-emerald-500" />{r.test_title}</td>
                    <td className="py-2 px-3">{r.subject}</td>
                    <td className="py-2 px-3 flex items-center gap-1"><Award className="h-4 w-4 text-yellow-500" />{r.score}</td>
                    <td className="py-2 px-3">{r.status}</td>
                    <td className="py-2 px-3 flex items-center gap-1"><Clock className="h-4 w-4 text-gray-400" />{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTestResults; 