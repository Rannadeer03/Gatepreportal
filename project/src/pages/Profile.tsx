import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import AvatarUpload from '../components/ui/avatar-upload';
import jsPDF from 'jspdf';
import { Linkedin, Github } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Student Profile', 10, 10);
    doc.text(`Name: ${profile.full_name}`, 10, 20);
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
          <Card>
            <CardHeader className="flex flex-col items-center">
              <AvatarUpload avatarUrl={profile?.avatar_url} userId={user.id} onUpload={() => {}} />
              <CardTitle className="mt-4 text-3xl font-bold">{profile.full_name || 'Profile'}</CardTitle>
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