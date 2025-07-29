import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import AvatarUpload from '../components/ui/avatar-upload';
import jsPDF from 'jspdf';
import { Linkedin, Github } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Profile: React.FC = () => {
  const { user, profile, setProfile } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || !profile) {
    return null;
  }

  const handleAvatarUpload = async (avatarUrl: string) => {
    try {
      // Update the profile in the database
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating avatar:', error);
        return;
      }

      // Update the local state
      setProfile({
        ...profile,
        avatar_url: avatarUrl
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Student Profile', 10, 10);
    doc.text(`Name: ${profile.name}`, 10, 20);
    doc.text(`Email: ${user.email}`, 10, 30);
    doc.text(`Phone: ${profile.phone_number || ''}`, 10, 40);
    doc.text(`Department: ${profile.department || ''}`, 10, 50);
    doc.text(`DOB: ${profile.dob || ''}`, 10, 60);
    doc.text(`Bio: ${profile.bio || ''}`, 10, 70);
    doc.text(`LinkedIn: ${profile.linkedin_url || ''}`, 10, 80);
    doc.text(`GitHub: ${profile.github_url || ''}`, 10, 90);
    doc.save('profile.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4">
            <Button
              onClick={() => {
                if (profile.role === 'student') {
                  navigate('/student-main-dashboard');
                } else if (profile.role === 'teacher') {
                  navigate('/teacher-main-dashboard');
                } else if (profile.role === 'admin') {
                  navigate('/admin-dashboard');
                }
              }}
              variant="outline"
              className="flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 mr-2">
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Back
            </Button>
          </div>
          <Card>
            <CardHeader className="flex flex-col items-center">
              <AvatarUpload avatarUrl={profile.avatar_url} userId={user.id} onUpload={handleAvatarUpload} />
              <CardTitle className="mt-4 text-3xl font-bold">{profile.name || 'Profile'}</CardTitle>
              <p className="text-gray-500">{profile.role}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-sm text-gray-900 break-all">{user.email}</p>
                  </div>
                  {profile.phone_number && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.phone_number}</p>
                    </div>
                  )}
                  {profile.department && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Department</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.department}</p>
                    </div>
                  )}
                  {profile.dob && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.dob}</p>
                    </div>
                  )}
                  {profile.theme && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Theme</h3>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{profile.theme}</p>
                    </div>
                  )}
                  {profile.notification_preferences && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Notifications</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {profile.notification_preferences.email ? 'Email' : ''}
                        {profile.notification_preferences.email && profile.notification_preferences.inApp ? ', ' : ''}
                        {profile.notification_preferences.inApp ? 'In-App' : ''}
                      </p>
                    </div>
                  )}
                  {profile.registration_number && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Registration Number</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.registration_number}</p>
                    </div>
                  )}
                  {profile.faculty_id && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Faculty ID</h3>
                      <p className="mt-1 text-sm text-gray-900">{profile.faculty_id}</p>
                    </div>
                  )}
                </div>
                {profile.bio && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Bio</h3>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{profile.bio}</p>
                  </div>
                )}
                <div className="flex gap-4 items-center">
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn">
                      <Linkedin className="h-6 w-6 text-blue-700 hover:text-blue-900" />
                    </a>
                  )}
                  {profile.github_url && (
                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" title="GitHub">
                      <Github className="h-6 w-6 text-gray-800 hover:text-black" />
                    </a>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4">
                  <Button
                    onClick={() => navigate('/settings')}
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                  <Button onClick={handleDownloadPDF} variant="outline">Download as PDF</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 