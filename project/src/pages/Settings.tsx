import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import AvatarUpload from '../components/ui/avatar-upload';
import jsPDF from 'jspdf';

const departmentOptions = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Information Technology',
];
const themeOptions = ['system', 'light', 'dark'];

const Settings: React.FC = () => {
  const { user, profile, setProfile } = useAuthStore();
  const [fullName, setFullName] = useState(profile?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [phone, setPhone] = useState(profile?.phone_number || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [dob, setDob] = useState(profile?.dob || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [linkedin, setLinkedin] = useState(profile?.linkedin_url || '');
  const [github, setGithub] = useState(profile?.github_url || '');
  const [theme, setTheme] = useState(profile?.theme || 'system');
  const [notifications, setNotifications] = useState(profile?.notification_preferences || { email: true, inApp: true });
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
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
      setAvatarUrl(avatarUrl);
      setProfile({
        ...profile,
        id: user.id,
        name: profile?.name || '',
        email: profile?.email || '',
        role: (profile?.role ?? 'student') as 'student' | 'teacher' | 'admin',
        avatar_url: avatarUrl,
        created_at: profile?.created_at || '',
        updated_at: profile?.updated_at || '',
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    // Prepare update data and filter out undefined values
    const updateData: Record<string, any> = {
      name: fullName,
      avatar_url: avatarUrl,
      phone_number: phone,
      department,
      dob,
      bio,
      linkedin_url: linkedin,
      github_url: github,
      theme,
      notification_preferences: notifications,
    };
    Object.keys(updateData).forEach(
      key => (updateData[key] === undefined || updateData[key] === '') && delete updateData[key]
    );
    console.log('Updating profile with:', updateData);
    const userId = user?.id || '';
    if (!userId) {
      setError('User not found. Please log in again.');
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);
    setLoading(false);
    if (!error) {
      setProfile({
        ...profile,
        id: userId,
        name: fullName,
        email,
        avatar_url: avatarUrl,
        phone_number: phone,
        department,
        dob,
        bio,
        linkedin_url: linkedin,
        github_url: github,
        theme,
        notification_preferences: notifications,
        role: (profile?.role ?? 'student') as 'student' | 'teacher' | 'admin',
        created_at: profile?.created_at || '',
        updated_at: profile?.updated_at || '',
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1000);
    } else {
      setError('Failed to update profile');
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (!error) {
      setSuccess('Password updated successfully!');
      setPassword('');
    } else {
      setError('Failed to update password');
    }
  };

  const handleEmailChange = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    const { error } = await supabase.auth.updateUser({ email });
    setLoading(false);
    if (!error) {
      setSuccess('Email update requested! Check your new email for a confirmation link.');
    } else {
      setError('Failed to update email');
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Student Profile', 10, 10);
    doc.text(`Name: ${fullName}`, 10, 20);
    doc.text(`Email: ${email}`, 10, 30);
    doc.text(`Phone: ${phone}`, 10, 40);
    doc.text(`Department: ${department}`, 10, 50);
    doc.text(`DOB: ${dob}`, 10, 60);
    doc.text(`Bio: ${bio}`, 10, 70);
    doc.text(`LinkedIn: ${linkedin}`, 10, 80);
    doc.text(`GitHub: ${github}`, 10, 90);
    doc.save('profile.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-col items-center">
          {user && (
            <AvatarUpload avatarUrl={avatarUrl} userId={user.id} onUpload={handleAvatarUpload} />
          )}
          <CardTitle className="mt-4">Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {error && <div className="text-red-600">{error}</div>}
            {success && <div className="text-green-600">{success}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
                <Button onClick={handleEmailChange} className="mt-2" size="sm">Update Email</Button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <select value={department} onChange={e => setDepartment(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                  <option value="">Select a department</option>
                  {departmentOptions.map(dep => <option key={dep} value={dep}>{dep}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Theme</label>
                <select value={theme} onChange={e => setTheme(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                  {themeOptions.map(opt => <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" rows={3} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                <input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="https://linkedin.com/in/username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GitHub</label>
                <input type="url" value={github} onChange={e => setGithub(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="https://github.com/username" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="block text-sm font-medium text-gray-700">Notifications</label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={notifications.email} onChange={e => setNotifications((n: any) => ({ ...n, email: e.target.checked }))} /> Email
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={notifications.inApp} onChange={e => setNotifications((n: any) => ({ ...n, inApp: e.target.checked }))} /> In-App
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Change Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md p-2" placeholder="New password" />
              <Button onClick={handlePasswordChange} className="mt-2" size="sm">Update Password</Button>
            </div>
            <div className="flex justify-between items-center mt-6">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save All Changes'}
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline">Download Profile as PDF</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings; 