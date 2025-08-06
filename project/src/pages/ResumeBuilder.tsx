import React, { useState, useEffect } from 'react';
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
  Layout
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
  { id: 'modern', name: 'Modern', preview: 'Clean and professional' },
  { id: 'classic', name: 'Classic', preview: 'Traditional and elegant' },
  { id: 'creative', name: 'Creative', preview: 'Bold and innovative' },
  { id: 'minimal', name: 'Minimal', preview: 'Simple and clean' }
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

  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [previewMode, setPreviewMode] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');

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

  const updateItem = (section: keyof ResumeData, id: string, field: string, value: any) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).map((item: any) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (section: keyof ResumeData, id: string) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((item: any) => item.id !== id)
    }));
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const exportResume = async () => {
    try {
      await pdfExportService.exportResume(resumeData, selectedTemplate);
    } catch (error) {
      console.error('Error exporting resume:', error);
    }
  };

  const saveResume = () => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  };

  useEffect(() => {
    const saved = localStorage.getItem('resumeData');
    if (saved) {
      setResumeData(JSON.parse(saved));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
            <p className="text-gray-600">Create a professional resume in minutes</p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button onClick={saveResume}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={exportResume}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
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

            {/* Navigation */}
            <Card className="p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Sections</h3>
              <div className="space-y-2">
                {[
                  { id: 'personal', name: 'Personal Info', icon: User },
                  { id: 'experience', name: 'Experience', icon: Briefcase },
                  { id: 'education', name: 'Education', icon: GraduationCap },
                  { id: 'skills', name: 'Skills', icon: Award },
                  { id: 'projects', name: 'Projects', icon: FileText },
                  { id: 'certifications', name: 'Certifications', icon: Award },
                  { id: 'languages', name: 'Languages', icon: Globe }
                ].map((section) => {
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
                        <Textarea
                          placeholder="Job description..."
                          value={exp.description}
                          onChange={(e) => updateItem('experience', exp.id, 'description', e.target.value)}
                          rows={3}
                        />
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
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Preview
              </h3>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {resumeData.personalInfo.name || 'Your Name'}
                  </h1>
                  <div className="flex justify-center space-x-4 text-sm text-gray-500">
                    {resumeData.personalInfo.email && (
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {resumeData.personalInfo.email}
                      </span>
                    )}
                    {resumeData.personalInfo.phone && (
                      <span className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {resumeData.personalInfo.phone}
                      </span>
                    )}
                    {resumeData.personalInfo.location && (
                      <span className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {resumeData.personalInfo.location}
                      </span>
                    )}
                  </div>
                </div>

                {resumeData.personalInfo.summary && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 text-gray-800">Summary</h2>
                    <p className="text-gray-600">{resumeData.personalInfo.summary}</p>
                  </div>
                )}

                {resumeData.experience.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">Experience</h2>
                    {resumeData.experience.map((exp) => (
                      <div key={exp.id} className="mb-4">
                        <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                        <p className="text-gray-600 mb-1">{exp.company}</p>
                        <p className="text-sm text-gray-600">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {resumeData.skills.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {resumeData.skills.map((skill) => (
                        <span
                          key={skill.id}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {skill.name}
                        </span>
                      ))}
                    </div>
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