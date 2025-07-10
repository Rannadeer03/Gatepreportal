import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, Download, Eye, Search, ChevronRight, ArrowLeft, Clock, BookOpen } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
}

interface AcademicMaterial {
  id: string;
  title: string;
  description: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  material_type: string;
  path: string;
  filename: string;
  upload_date: string;
}

const StudentAcademicStudyMaterials: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<AcademicMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        // Fetch subjects
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('subjects')
          .select('*');
        if (subjectsError) throw subjectsError;
        setSubjects(subjectsData || []);
        // If a subject is selected, fetch its materials
        if (selectedSubject) {
          const { data: materialsData, error: materialsError } = await supabase
            .from('academic_course_materials')
            .select('*, subjects(name, code)')
            .eq('subject_id', selectedSubject);
          if (materialsError) throw materialsError;
          const transformedMaterials = (materialsData || []).map((material: any) => ({
            id: material.id,
            title: material.title,
            description: material.description,
            subject_id: material.subject_id,
            subject_name: material.subjects?.name || '',
            subject_code: material.subjects?.code || '',
            material_type: material.material_type,
            path: material.path,
            filename: material.filename,
            upload_date: material.created_at
          }));
          setMaterials(transformedMaterials);
        }
      } catch (err) {
        setError('Failed to load study materials. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedSubject]);

  const handleBack = () => {
    if (selectedSubject) {
      setSelectedSubject(null);
      setMaterials([]);
    } else {
      navigate('/student-academic-dashboard');
    }
  };

  const handlePdfAction = async (material: AcademicMaterial, action: 'view' | 'download') => {
    try {
      setError('');
      const { data: { publicUrl } } = supabase.storage
        .from('academic_course_materials')
        .getPublicUrl(material.path);
      if (action === 'view') {
        window.open(publicUrl, '_blank');
      } else {
        const link = document.createElement('a');
        link.href = publicUrl;
        link.download = material.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      setError('Failed to process the file. Please try again later.');
    }
  };

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCurrentSubject = (): Subject | undefined =>
    subjects.find(s => s.id === selectedSubject);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading study materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span className="text-sm font-medium">
            {selectedSubject ? 'Back to Subjects' : 'Back to Dashboard'}
          </span>
        </button>
        {/* Heading */}
        <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-1">Academic Study Materials</h1>
        <p className="text-center text-base text-gray-600 mb-6">
          {selectedSubject ? `Materials for ${getCurrentSubject()?.name}` : 'Browse and access study materials for your subjects.'}
        </p>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        {/* Search */}
        {!selectedSubject && (
          <div className="bg-white rounded-xl shadow p-2 mb-6 drop-shadow-sm">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-pink-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-300 text-sm bg-pink-50 placeholder-pink-300"
              />
            </div>
          </div>
        )}
        {/* Content */}
        {selectedSubject ? (
          // Materials List
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-6 text-center col-span-full border border-gray-100 text-sm">
                <p className="text-gray-500">No study materials available for this subject yet.</p>
              </div>
            ) : (
              materials.map((material) => (
                <div
                  key={material.id}
                  className="bg-white rounded-xl shadow border border-gray-100 p-4 flex flex-col h-full justify-between hover:shadow-lg hover:border-pink-200 transition-all duration-200"
                >
                  <div className="flex items-center mb-3">
                    <div className="p-2 bg-gradient-to-br from-pink-400 to-red-400 rounded-lg mr-2 shadow">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 mb-0.5">{material.title}</h3>
                      <p className="text-xs text-gray-600 mb-0.5">{material.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500 mb-3">
                    <span className="bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
                      {material.material_type}
                    </span>
                    <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full">
                      {material.subject_name} ({material.subject_code})
                    </span>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-0.5" />
                      {new Date(material.upload_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-auto">
                    <button
                      onClick={() => handlePdfAction(material, 'view')}
                      className="inline-flex items-center px-3 py-1.5 border border-pink-200 rounded-lg text-xs font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 hover:border-pink-400 transition"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handlePdfAction(material, 'download')}
                      className="inline-flex items-center px-3 py-1.5 border border-pink-200 rounded-lg text-xs font-semibold text-pink-700 bg-pink-50 hover:bg-pink-100 hover:border-pink-400 transition"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          // Subjects Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredSubjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className="bg-white rounded-xl shadow border border-gray-100 p-5 flex flex-col items-center cursor-pointer hover:shadow-lg hover:border-pink-200 transition-all duration-200 group"
              >
                <div className="p-2.5 bg-gradient-to-br from-pink-400 to-red-400 rounded-lg mb-3 shadow">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-0.5 text-center">{subject.name}</h3>
                <p className="text-xs text-gray-500 text-center mb-1">Code: {subject.code}</p>
                {subject.description && (
                  <p className="text-gray-400 text-center text-xs mb-1">{subject.description}</p>
                )}
                <div className="mt-2 flex items-center justify-center">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-pink-100 group-hover:bg-pink-400 transition">
                    <ChevronRight className="h-4 w-4 text-pink-500 group-hover:text-white" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentAcademicStudyMaterials; 