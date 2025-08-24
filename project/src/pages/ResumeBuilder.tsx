import React, { useState, useEffect, useMemo, useDeferredValue, useRef, useCallback } from 'react';
import { 
  Download, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Edit3, 
  Save,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
  Palette,
  Type,
  Layout,
  RotateCcw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { pdfExportService } from '../services/pdfExportService';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
    summary: string;
  };
  experience: Array<{
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa: string;
    description: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: number;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies: string;
    link: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    link: string;
  }>;
  languages: Array<{
    id: string;
    name: string;
    proficiency: string;
  }>;
}

const templates = [
  { id: 'minimal', name: 'Minimal', preview: 'Simple and clean' },
  { id: 'creative', name: 'Creative', preview: 'Bold and modern' },
  { id: 'corporate', name: 'Corporate', preview: 'Professional and structured' },
  { id: 'academic', name: 'Academic', preview: 'Scholarly and detailed' },
  { id: 'tech', name: 'Tech', preview: 'Sleek and contemporary' }
];

const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      linkedin: '',
      github: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    languages: []
  });

  const [selectedTemplate, setSelectedTemplate] = useState('minimal');
  const [previewMode, setPreviewMode] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [customization, setCustomization] = useState({
    accentColor: '#3b82f6',
    fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    textSize: 'base',
    layout: 'one-column' as 'one-column' | 'two-column'
  });
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'summary',
    'experience',
    'projects',
    'education',
    'skills',
    'certifications',
    'languages'
  ]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveButtonText, setSaveButtonText] = useState('Save');

  const deferredResumeData = useDeferredValue(resumeData);
  const previewRef = useRef<HTMLDivElement>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addItem = (section: keyof ResumeData) => {
    const newItem = {
      id: generateId(),
      ...getDefaultItem(section)
    };

    setResumeData(prev => ({
      ...prev,
      [section]: [...(prev[section] as any[]), newItem]
    }));
  };

  const getDefaultItem = (section: keyof ResumeData) => {
    switch (section) {
      case 'experience':
        return {
          title: '',
          company: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          description: ''
        };
      case 'education':
        return {
          degree: '',
          institution: '',
          location: '',
          startDate: '',
          endDate: '',
          current: false,
          gpa: '',
          description: ''
        };
      case 'skills':
        return {
          name: '',
          level: 3
        };
      case 'projects':
        return {
          name: '',
          description: '',
          technologies: '',
          link: ''
        };
      case 'certifications':
        return {
          name: '',
          issuer: '',
          date: '',
          link: ''
        };
      case 'languages':
        return {
          name: '',
          proficiency: 'Intermediate'
        };
      default:
        return {};
    }
  };

  const updateItem = useCallback((section: keyof ResumeData, id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map((item: any) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  }, []);

  const removeItem = useCallback((section: keyof ResumeData, id: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((item: any) => item.id !== id)
    }));
  }, []);

  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  }, []);

  const moveSection = (index: number, direction: 'up' | 'down') => {
    setSectionOrder(prev => {
      const newOrder = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newOrder.length) return prev;
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      return newOrder;
    });
  };

  const handlePrint = () => {
    window.print();
  };



  const exportResume = async () => {
    try {
      await pdfExportService.exportResume(resumeData, selectedTemplate, customization.accentColor, customization.fontFamily);
    } catch (error) {
      // Silent error handling for security
    }
  };

    const saveResume = () => {
    try {
      localStorage.setItem('resumeData', JSON.stringify(resumeData));
      localStorage.setItem('resumePrefs', JSON.stringify({ selectedTemplate, customization, sectionOrder }));
      
      // Show success feedback using React state
      setSaveButtonText('Saved!');
      setSaveStatus('saved');
      
      setTimeout(() => {
        setSaveButtonText('Save');
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      alert('Failed to save resume. Please try again.');
    }
  };

  const clearResume = () => {
    if (window.confirm('Are you sure you want to clear all resume data? This action cannot be undone.')) {
      try {
        localStorage.removeItem('resumeData');
        localStorage.removeItem('resumePrefs');
        
        // Reset to initial state
        setResumeData({
          personalInfo: {
            name: '',
            email: '',
            phone: '',
            location: '',
            website: '',
            linkedin: '',
            github: '',
            summary: ''
          },
          experience: [],
          education: [],
          skills: [],
          projects: [],
          certifications: [],
          languages: []
        });
        
        setSelectedTemplate('minimal');
        setCustomization({
          accentColor: '#3b82f6',
          fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
          textSize: 'base',
          layout: 'one-column' as 'one-column' | 'two-column'
        });
        setSectionOrder([
          'summary',
          'experience',
          'projects',
          'education',
          'skills',
          'certifications',
          'languages'
        ]);
        
        alert('Resume cleared successfully!');
      } catch (error) {
        alert('Failed to clear resume. Please try again.');
      }
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('resumeData');
      if (saved) {
        const parsedData = JSON.parse(saved);
        setResumeData(parsedData);
      }
      
      const savedPrefs = localStorage.getItem('resumePrefs');
      if (savedPrefs) {
        try {
          const { selectedTemplate: st, customization: cz, sectionOrder: so } = JSON.parse(savedPrefs);
          if (st) setSelectedTemplate(st);
          if (cz) setCustomization(cz);
          if (Array.isArray(so) && so.length) setSectionOrder(so);
        } catch (error) {
          // Silent error handling for security
        }
      }
    } catch (error) {
      // Silent error handling for security
    }
  }, []);

  // Auto-save effect with better debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSaveStatus('saving');
      
      try {
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
        localStorage.setItem('resumePrefs', JSON.stringify({ selectedTemplate, customization, sectionOrder }));
        setSaveStatus('saved');
        
        // Reset status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 1500); // Increased debounce time for better performance

    return () => clearTimeout(timeoutId);
  }, [resumeData, selectedTemplate, customization, sectionOrder]);

  // Suggestions - memoized for performance
  const skillSuggestions = useMemo(() => [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Python', 'Django', 'REST APIs', 'Git', 'Docker', 'Kubernetes', 'CI/CD', 'AWS', 'GCP', 'Azure', 'Unit Testing', 'Jest', 'Playwright'
  ], []);

  const achievementSuggestions = useMemo(() => [
    'Improved application performance by 30% by optimizing rendering',
    'Led a team of 4 to deliver project 2 weeks early',
    'Reduced cloud costs by 20% via resource right-sizing',
    'Implemented comprehensive test suite, increasing coverage to 85%'
  ], []);

  // Memoized section navigation for better performance
  const sectionNavigation = useMemo(() => [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'experience', name: 'Experience', icon: Briefcase },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'skills', name: 'Skills', icon: Award },
    { id: 'projects', name: 'Projects', icon: FileText },
    { id: 'certifications', name: 'Certifications', icon: Award },
    { id: 'languages', name: 'Languages', icon: Globe }
  ], []);

  const addSkillSuggestion = useCallback((name: string) => {
    const exists = resumeData.skills.some(s => s.name.toLowerCase() === name.toLowerCase());
    if (exists) return;
    const newItem = { id: generateId(), name, level: 4 } as any;
    setResumeData(prev => ({ ...prev, skills: [...prev.skills, newItem] }));
  }, [resumeData.skills]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
            <p className="text-gray-600">Create a professional resume in minutes</p>
            <div className="flex items-center mt-2">
              {saveStatus === 'saving' && (
                <span className="text-sm text-blue-600 flex items-center">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </span>
              )}
                             {saveStatus === 'saved' && (
                 <span className="text-sm text-green-600 flex items-center">
                   <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                   </svg>
                   Saved
                 </span>
               )}
               {saveStatus === 'error' && (
                 <span className="text-sm text-red-600 flex items-center">
                   <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                   </svg>
                   Save failed
                 </span>
               )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
                         <Button 
               onClick={saveResume} 
               disabled={saveStatus === 'saving' || saveStatus === 'saved'}
               className={saveStatus === 'saved' ? 'bg-green-600 hover:bg-green-700' : ''}
             >
               {saveStatus === 'saved' ? (
                 <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                 </svg>
               ) : (
                 <Save className="w-4 h-4 mr-2" />
               )}
               {saveButtonText}
             </Button>
            <Button onClick={exportResume} title="Download as PDF">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>

            <Button onClick={handlePrint} variant="outline" title="Open print dialog">
              <FileText className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button onClick={clearResume} variant="outline" title="Clear all data" className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400">
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Selection */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Layout className="w-5 h-5 mr-2" />
                Template
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="text-sm font-medium">{template.name}</div>
                    <div className="text-xs text-gray-500">{template.preview}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Customization */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Customize
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Accent Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={customization.accentColor}
                      onChange={(e) => setCustomization(c => ({ ...c, accentColor: e.target.value }))}
                      className="h-9 w-12 p-1 border rounded"
                    />
                    <Input
                      value={customization.accentColor}
                      onChange={(e) => setCustomization(c => ({ ...c, accentColor: e.target.value }))}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Font Family</label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={customization.fontFamily}
                    onChange={(e) => setCustomization(c => ({ ...c, fontFamily: e.target.value }))}
                  >
                    <option value="Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif">Inter / System Sans</option>
                    <option value="Georgia, Cambria, Times New Roman, Times, serif">Georgia / Serif</option>
                    <option value="Arial, Helvetica, sans-serif">Arial / Sans</option>
                    <option value="'Courier New', Courier, monospace">Courier New / Monospace</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Layout</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCustomization(c => ({ ...c, layout: 'one-column' }))}
                      className={`p-2 border rounded ${customization.layout === 'one-column' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >One Column</button>
                    <button
                      onClick={() => setCustomization(c => ({ ...c, layout: 'two-column' }))}
                      className={`p-2 border rounded ${customization.layout === 'two-column' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >Two Column</button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Navigation */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Sections</h3>
                             <div className="space-y-2">
                 {sectionNavigation.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center p-3 rounded-lg transition-all ${
                        activeSection === section.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {section.name}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Reorder Sections</h4>
                <div className="space-y-1">
                  {sectionOrder.map((sec, idx) => (
                    <div key={sec} className="flex items-center justify-between p-2 rounded border bg-white">
                      <span className="text-sm capitalize">{sec}</span>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm" onClick={() => moveSection(idx, 'up')} title="Move up">↑</Button>
                        <Button variant="outline" size="sm" onClick={() => moveSection(idx, 'down')} title="Move down">↓</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Edit3 className="w-5 h-5 mr-2" />
                {activeSection === 'personal' ? 'Personal Information' :
                 activeSection === 'experience' ? 'Work Experience' :
                 activeSection === 'education' ? 'Education' :
                 activeSection === 'skills' ? 'Skills' :
                 activeSection === 'projects' ? 'Projects' :
                 activeSection === 'certifications' ? 'Certifications' :
                 'Languages'}
              </h3>

              {/* Personal Information */}
              {activeSection === 'personal' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <Input
                      value={resumeData.personalInfo.name}
                      onChange={(e) => updatePersonalInfo('name', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      value={resumeData.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <Input
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <Input
                      value={resumeData.personalInfo.location}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="New York, NY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Professional Summary</label>
                    <Textarea
                      value={resumeData.personalInfo.summary}
                      onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                      placeholder="Brief professional summary..."
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {/* Experience */}
              {activeSection === 'experience' && (
                <div className="space-y-4">
                  {resumeData.experience.map((exp) => (
                    <Card key={exp.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Experience</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem('experience', exp.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <Input
                          placeholder="Job Title"
                          value={exp.title}
                          onChange={(e) => updateItem('experience', exp.id, 'title', e.target.value)}
                        />
                        <Input
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) => updateItem('experience', exp.id, 'company', e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input
                            placeholder="Start Date"
                            value={exp.startDate}
                            onChange={(e) => updateItem('experience', exp.id, 'startDate', e.target.value)}
                          />
                          <Input
                            placeholder="End Date or Present"
                            value={exp.endDate}
                            onChange={(e) => updateItem('experience', exp.id, 'endDate', e.target.value)}
                          />
                        </div>
                        <Textarea
                          placeholder="Job description..."
                          value={exp.description}
                          onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                          rows={3}
                        />
                        <div className="flex flex-wrap gap-2">
                          {achievementSuggestions.map(s => (
                            <button key={s} onClick={() => updateItem('experience', exp.id, 'description', (exp.description ? exp.description + '\n' : '') + '• ' + s)} className="text-xs px-2 py-1 rounded border hover:bg-gray-50" title="Add achievement">+ {s}</button>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                  <Button
                    variant="outline"
                    onClick={() => addItem('experience')}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                </div>
              )}

              {/* Education */}
              {activeSection === 'education' && (
                <div className="space-y-4">
                  {resumeData.education.map((edu) => (
                    <Card key={edu.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Education</h4>
                        <Button variant="ghost" size="sm" onClick={() => removeItem('education', edu.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <Input placeholder="Degree" value={edu.degree} onChange={(e) => updateItem('education', edu.id, 'degree', e.target.value)} />
                        <Input placeholder="Institution" value={edu.institution} onChange={(e) => updateItem('education', edu.id, 'institution', e.target.value)} />
                        <div className="grid grid-cols-2 gap-3">
                          <Input placeholder="Start Date" value={edu.startDate} onChange={(e) => updateItem('education', edu.id, 'startDate', e.target.value)} />
                          <Input placeholder="End Date or Present" value={edu.endDate} onChange={(e) => updateItem('education', edu.id, 'endDate', e.target.value)} />
                        </div>
                        <Input placeholder="GPA (optional)" value={edu.gpa} onChange={(e) => updateItem('education', edu.id, 'gpa', e.target.value)} />
                        <Textarea placeholder="Description (optional)" rows={3} value={edu.description} onChange={(e) => updateItem('education', edu.id, 'description', e.target.value)} />
                      </div>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={() => addItem('education')} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Education
                  </Button>
                </div>
              )}

              {/* Skills */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  {resumeData.skills.map((skill) => (
                    <Card key={skill.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Skill</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem('skills', skill.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <Input
                          placeholder="Skill name"
                          value={skill.name}
                          onChange={(e) => updateItem('skills', skill.id, 'name', e.target.value)}
                        />
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Proficiency Level: {skill.level}/5
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={skill.level}
                            onChange={(e) => updateItem('skills', skill.id, 'level', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    {skillSuggestions.map(s => (
                      <button key={s} onClick={() => addSkillSuggestion(s)} className="text-xs px-2 py-1 rounded border hover:bg-gray-50" title="Add skill">+ {s}</button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => addItem('skills')}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              )}

              {/* Projects */}
              {activeSection === 'projects' && (
                <div className="space-y-4">
                  {resumeData.projects.map((project) => (
                    <Card key={project.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Project</h4>
                        <Button variant="ghost" size="sm" onClick={() => removeItem('projects', project.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <Input placeholder="Project Name" value={project.name} onChange={(e) => updateItem('projects', project.id, 'name', e.target.value)} />
                        <Input placeholder="Technologies (comma separated)" value={project.technologies} onChange={(e) => updateItem('projects', project.id, 'technologies', e.target.value)} />
                        <Textarea placeholder="Description" rows={3} value={project.description} onChange={(e) => updateItem('projects', project.id, 'description', e.target.value)} />
                        <Input placeholder="Link (optional)" value={project.link} onChange={(e) => updateItem('projects', project.id, 'link', e.target.value)} />
                      </div>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={() => addItem('projects')} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Project
                  </Button>
                </div>
              )}

              {/* Certifications */}
              {activeSection === 'certifications' && (
                <div className="space-y-4">
                  {resumeData.certifications.map((cert) => (
                    <Card key={cert.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Certification</h4>
                        <Button variant="ghost" size="sm" onClick={() => removeItem('certifications', cert.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <Input placeholder="Certification Name" value={cert.name} onChange={(e) => updateItem('certifications', cert.id, 'name', e.target.value)} />
                        <Input placeholder="Issuer" value={cert.issuer} onChange={(e) => updateItem('certifications', cert.id, 'issuer', e.target.value)} />
                        <Input placeholder="Date" value={cert.date} onChange={(e) => updateItem('certifications', cert.id, 'date', e.target.value)} />
                        <Input placeholder="Link (optional)" value={cert.link} onChange={(e) => updateItem('certifications', cert.id, 'link', e.target.value)} />
                      </div>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={() => addItem('certifications')} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Certification
                  </Button>
                </div>
              )}

              {/* Languages */}
              {activeSection === 'languages' && (
                <div className="space-y-4">
                  {resumeData.languages.map((lang) => (
                    <Card key={lang.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">Language</h4>
                        <Button variant="ghost" size="sm" onClick={() => removeItem('languages', lang.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-3">
                        <Input placeholder="Language" value={lang.name} onChange={(e) => updateItem('languages', lang.id, 'name', e.target.value)} />
                        <Input placeholder="Proficiency (e.g., Native, Fluent)" value={lang.proficiency} onChange={(e) => updateItem('languages', lang.id, 'proficiency', e.target.value)} />
                      </div>
                    </Card>
                  ))}
                  <Button variant="outline" onClick={() => addItem('languages')} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Language
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Preview
              </h3>
              <div
                ref={previewRef}
                className="bg-white p-6 rounded-lg shadow-sm border content-visibility-auto cis-800 print-area"
                style={{ fontFamily: customization.fontFamily }}
              >
                {/* Header */}
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {deferredResumeData.personalInfo.name || 'Your Name'}
                    </h1>
                    <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-500">
                      {deferredResumeData.personalInfo.email && (
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {deferredResumeData.personalInfo.email}
                        </span>
                      )}
                      {deferredResumeData.personalInfo.phone && (
                        <span className="flex items-center">
                          <Phone className="w-4 h-4 mr-1" />
                          {deferredResumeData.personalInfo.phone}
                        </span>
                      )}
                      {deferredResumeData.personalInfo.location && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {deferredResumeData.personalInfo.location}
                        </span>
                      )}
                    </div>
                  </div>
                  {selectedTemplate !== 'minimal' && (
                    <div className="h-1 rounded" style={{ backgroundColor: customization.accentColor }} />
                  )}
                </div>

                {/* Body layout */}
                {customization.layout === 'two-column' ? (
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-1">
                      {/* Left column: skills, certifications, languages */}
                      {deferredResumeData.skills.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Skills</h2>
                          <div className="flex flex-wrap gap-2">
                            {deferredResumeData.skills.map((skill) => (
                              <span key={skill.id} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: customization.accentColor + '20', color: customization.accentColor }}>
                                {skill.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {deferredResumeData.certifications.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Certifications</h2>
                          <div className="space-y-2 text-sm">
                            {deferredResumeData.certifications.map((c) => (
                              <div key={c.id}>
                                <div className="font-medium">{c.name}</div>
                                <div className="text-gray-500">{c.issuer} {c.date ? `• ${c.date}` : ''}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {deferredResumeData.languages.length > 0 && (
                        <div className="mb-6">
                          <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Languages</h2>
                          <div className="space-y-1 text-sm">
                            {deferredResumeData.languages.map((l) => (
                              <div key={l.id}>{l.name} — {l.proficiency}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="col-span-2">
                      {/* Right column follows section order */}
                      {sectionOrder.map((sec) => (
                        <div key={sec} className="mb-6">
                          {sec === 'summary' && deferredResumeData.personalInfo.summary && (
                            <>
                              <h2 className="text-base font-semibold mb-2" style={{ color: customization.accentColor }}>Summary</h2>
                              <p className="text-gray-700 whitespace-pre-line">{deferredResumeData.personalInfo.summary}</p>
                            </>
                          )}
                          {sec === 'experience' && deferredResumeData.experience.length > 0 && (
                            <>
                              <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Experience</h2>
                              {deferredResumeData.experience.map((exp) => (
                                <div key={exp.id} className="mb-4">
                                  <div className="flex items-baseline justify-between">
                                    <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                                    {(exp.startDate || exp.endDate) && (
                                      <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600 mb-1">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                                  <p className="text-sm text-gray-700 whitespace-pre-line">{exp.description}</p>
                                </div>
                              ))}
                            </>
                          )}
                          {sec === 'projects' && deferredResumeData.projects.length > 0 && (
                            <>
                              <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Projects</h2>
                              {deferredResumeData.projects.map((p) => (
                                <div key={p.id} className="mb-4">
                                  <h3 className="font-semibold text-gray-900">{p.name}</h3>
                                  {p.technologies && <div className="text-xs text-gray-500 mb-1">{p.technologies}</div>}
                                  <p className="text-sm text-gray-700 whitespace-pre-line">{p.description}</p>
                                  {p.link && <a href={p.link} className="text-xs" style={{ color: customization.accentColor }} target="_blank" rel="noreferrer">{p.link}</a>}
                                </div>
                              ))}
                            </>
                          )}
                          {sec === 'education' && deferredResumeData.education.length > 0 && (
                            <>
                              <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Education</h2>
                              {deferredResumeData.education.map((e) => (
                                <div key={e.id} className="mb-3">
                                  <div className="flex items-baseline justify-between">
                                    <h3 className="font-semibold text-gray-900">{e.degree}</h3>
                                    {(e.startDate || e.endDate) && (
                                      <span className="text-xs text-gray-500">{e.startDate} - {e.endDate || 'Present'}</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">{e.institution}{e.location ? `, ${e.location}` : ''}</div>
                                  {e.gpa && <div className="text-xs text-gray-500">GPA: {e.gpa}</div>}
                                  {e.description && <p className="text-sm text-gray-700 whitespace-pre-line">{e.description}</p>}
                                </div>
                              ))}
                            </>
                          )}
                          {sec === 'skills' && deferredResumeData.skills.length > 0 && customization.layout !== 'two-column' && (
                            <>
                              <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Skills</h2>
                              <div className="flex flex-wrap gap-2">
                                {deferredResumeData.skills.map((skill) => (
                                  <span key={skill.id} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: customization.accentColor + '20', color: customization.accentColor }}>
                                    {skill.name}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                          {sec === 'certifications' && deferredResumeData.certifications.length > 0 && customization.layout !== 'two-column' && (
                            <>
                              <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Certifications</h2>
                              <div className="space-y-2 text-sm">
                                {deferredResumeData.certifications.map((c) => (
                                  <div key={c.id}>
                                    <div className="font-medium">{c.name}</div>
                                    <div className="text-gray-500">{c.issuer} {c.date ? `• ${c.date}` : ''}</div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                          {sec === 'languages' && deferredResumeData.languages.length > 0 && customization.layout !== 'two-column' && (
                            <>
                              <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Languages</h2>
                              <div className="space-y-1 text-sm">
                                {deferredResumeData.languages.map((l) => (
                                  <div key={l.id}>{l.name} — {l.proficiency}</div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    {sectionOrder.map((sec) => (
                      <div key={sec} className="mb-6">
                        {sec === 'summary' && deferredResumeData.personalInfo.summary && (
                          <>
                            <h2 className="text-base font-semibold mb-2" style={{ color: customization.accentColor }}>Summary</h2>
                            <p className="text-gray-700 whitespace-pre-line">{deferredResumeData.personalInfo.summary}</p>
                          </>
                        )}
                        {sec === 'experience' && deferredResumeData.experience.length > 0 && (
                          <>
                            <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Experience</h2>
                            {deferredResumeData.experience.map((exp) => (
                              <div key={exp.id} className="mb-4">
                                <div className="flex items-baseline justify-between">
                                  <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                                  {(exp.startDate || exp.endDate) && (
                                    <span className="text-xs text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mb-1">{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>
                                <p className="text-sm text-gray-700 whitespace-pre-line">{exp.description}</p>
                              </div>
                            ))}
                          </>
                        )}
                        {sec === 'projects' && deferredResumeData.projects.length > 0 && (
                          <>
                            <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Projects</h2>
                            {deferredResumeData.projects.map((p) => (
                              <div key={p.id} className="mb-4">
                                <h3 className="font-semibold text-gray-900">{p.name}</h3>
                                {p.technologies && <div className="text-xs text-gray-500 mb-1">{p.technologies}</div>}
                                <p className="text-sm text-gray-700 whitespace-pre-line">{p.description}</p>
                                {p.link && <a href={p.link} className="text-xs" style={{ color: customization.accentColor }} target="_blank" rel="noreferrer">{p.link}</a>}
                              </div>
                            ))}
                          </>
                        )}
                        {sec === 'education' && deferredResumeData.education.length > 0 && (
                          <>
                            <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Education</h2>
                            {deferredResumeData.education.map((e) => (
                              <div key={e.id} className="mb-3">
                                <div className="flex items-baseline justify-between">
                                  <h3 className="font-semibold text-gray-900">{e.degree}</h3>
                                  {(e.startDate || e.endDate) && (
                                    <span className="text-xs text-gray-500">{e.startDate} - {e.endDate || 'Present'}</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">{e.institution}{e.location ? `, ${e.location}` : ''}</div>
                                {e.gpa && <div className="text-xs text-gray-500">GPA: {e.gpa}</div>}
                                {e.description && <p className="text-sm text-gray-700 whitespace-pre-line">{e.description}</p>}
                              </div>
                            ))}
                          </>
                        )}
                        {sec === 'skills' && deferredResumeData.skills.length > 0 && (
                          <>
                            <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Skills</h2>
                            <div className="flex flex-wrap gap-2">
                              {deferredResumeData.skills.map((skill) => (
                                <span key={skill.id} className="px-3 py-1 rounded-full text-sm" style={{ backgroundColor: customization.accentColor + '20', color: customization.accentColor }}>
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          </>
                        )}
                        {sec === 'certifications' && deferredResumeData.certifications.length > 0 && (
                          <>
                            <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Certifications</h2>
                            <div className="space-y-2 text-sm">
                              {deferredResumeData.certifications.map((c) => (
                                <div key={c.id}>
                                  <div className="font-medium">{c.name}</div>
                                  <div className="text-gray-500">{c.issuer} {c.date ? `• ${c.date}` : ''}</div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                        {sec === 'languages' && deferredResumeData.languages.length > 0 && (
                          <>
                            <h2 className="text-base font-semibold mb-3" style={{ color: customization.accentColor }}>Languages</h2>
                            <div className="space-y-1 text-sm">
                              {deferredResumeData.languages.map((l) => (
                                <div key={l.id}>{l.name} — {l.proficiency}</div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder; 