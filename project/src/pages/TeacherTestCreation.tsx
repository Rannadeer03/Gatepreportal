import React, { useState } from 'react';
import { Save, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Question } from '../types/index';
import { notificationService } from '../services/notificationService';

const TeacherTestCreation: React.FC = () => {
  const navigate = useNavigate();
  const [testTitle, setTestTitle] = useState('');
  const [testSubject, setTestSubject] = useState('');
  const [testDuration, setTestDuration] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    teacher_id: 1,
    subject_id: '',
    question_text: '',
    type: 'text',
    options: ['', '', '', ''],
    correct_option: '',
    difficulty_level: 'medium',
    explanation: ''
  });

  const handleSaveQuestion = () => {
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      teacher_id: questions.length + 2,
      subject_id: '',
      question_text: '',
      type: 'text',
      options: ['', '', '', ''],
      correct_option: '',
      difficulty_level: 'medium',
      explanation: ''
    });
  };

  const handleSubmitTest = async () => {
    try {
      const testData = {
        title: testTitle,
        subject: testSubject,
        duration: testDuration,
        questions: questions.map(q => ({
          teacher_id: q.teacher_id,
          subject_id: q.subject_id,
          question_text: q.question_text,
          type: q.type,
          options: q.options,
          correct_option: q.correct_option,
          difficulty_level: q.difficulty_level,
          explanation: q.explanation
        }))
      };
      const test = await api.createTest(testData);
      
      // Create notification for all students
      if (test && test.id) {
        await notificationService.createTestNotification(
          test.id,
          testTitle,
          testSubject || 'General'
        );
      }
      
      navigate('/teacher-dashboard');
    } catch (error) {
      console.error('Error creating test:', error);
    }
  };

  return (
    <div>
      <h1>Create Test for Teachers</h1>
      <input
        type="text"
        value={testTitle}
        onChange={(e) => setTestTitle(e.target.value)}
        placeholder="Test Title"
      />
      <input
        type="text"
        value={testSubject}
        onChange={(e) => setTestSubject(e.target.value)}
        placeholder="Test Subject"
      />
      <input
        type="number"
        value={testDuration}
        onChange={(e) => setTestDuration(parseInt(e.target.value))}
        placeholder="Duration (minutes)"
      />
      <div>
        {questions.map((q, index) => (
          <div key={index}>
            <p>{q.question_text}</p>
            <button onClick={() => setQuestions(questions.filter((_, i) => i !== index))}>
              <Trash2 />
            </button>
          </div>
        ))}
      </div>
      <button onClick={handleSaveQuestion}>
        <Plus /> Add Question
      </button>
      <button onClick={handleSubmitTest}>
        <Save /> Save Test
      </button>
    </div>
  );
};

export default TeacherTestCreation;
