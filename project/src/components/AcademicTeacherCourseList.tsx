import { Download, Eye, FileText, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import type { CourseMaterial, Subject } from '../services/api';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AcademicTeacherCourseList: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [materialType, setMaterialType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const dbSubjects = await api.getSubjects();
        setSubjects(dbSubjects || []);
        let allMaterials: CourseMaterial[] = [];
        if (dbSubjects && dbSubjects.length > 0) {
          for (const subject of dbSubjects) {
            const subjectMaterials = await api.getCourseMaterialsBySubject(subject.id, 'academic');
            allMaterials.push(...subjectMaterials);
          }
        }
        setMaterials(allMaterials);
      } catch (err) {
        setError('Failed to load data. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleViewMaterial = (material: CourseMaterial) => {
    window.open(`${api.baseUrl}/materials/${material.path}`, '_blank');
  };

  const handleDownload = (material: CourseMaterial) => {
    const link = document.createElement('a');
    link.href = `${api.baseUrl}/materials/${material.path}`;
    link.download = material.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (materialId: string) => {
    try {
      setError('');
      await api.deleteCourseMaterial(materialId, 'academic');
      setMaterials((prev) => prev.filter((m) => m.id !== materialId));
      setMessage('Material deleted successfully.');
    } catch (err) {
      setError('Failed to delete course material. Please try again.');
    }
  };

  const filteredMaterials = materials.filter((material) => {
    const subjectMatch = !selectedSubject || material.subject_id === selectedSubject;
    const typeMatch = !materialType || material.materialType === materialType;
    return subjectMatch && typeMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/academic/teacher-dashboard')}
        className="flex items-center mb-6 text-gray-600 hover:text-gray-900 transition-colors"
        aria-label="Back to Dashboard"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-6 w-6 text-gray-600"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>
        <span className="ml-2">Back to Dashboard</span>
      </button>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Academic Course Materials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Material Type</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="lecture">Lecture Notes</option>
              <option value="presentation">Presentation</option>
              <option value="tutorial">Tutorial</option>
              <option value="video">Video Lecture</option>
              <option value="reference">Reference Material</option>
            </select>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {message && <div className="text-green-500 text-sm mb-2">{message}</div>}
        {isLoading ? (
          <div className="animate-pulse bg-gray-200 h-20 rounded-md"></div>
        ) : filteredMaterials.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No materials found.</p>
        ) : (
          <div className="space-y-4">
            {filteredMaterials.map((material) => {
              const subject = subjects.find((s) => s.id === material.subject_id);
              return (
                <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{material.title}</h3>
                      <p className="text-sm text-gray-500">{material.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{subject?.name} ({subject?.code})</span>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">{material.materialType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button onClick={() => handleViewMaterial(material)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDownload(material)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download">
                      <Download className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(material.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcademicTeacherCourseList; 