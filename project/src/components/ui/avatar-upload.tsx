import React, { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AvatarUploadProps {
  avatarUrl?: string;
  userId: string;
  onUpload: (url: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ avatarUrl, userId, onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and WebP images are allowed');
        setUploading(false);
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should not exceed 5MB');
        setUploading(false);
        return;
      }
      const ext = file.name.split('.').pop();
      const filePath = `${userId}/${Date.now()}.${ext}`;
      // Upload to Supabase Storage (avatars bucket)
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      // Get public URL
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error('Failed to get public URL');
      onUpload(data.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative group">
        <img
          src={avatarUrl || '/default-avatar.png'}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg bg-gray-200"
        />
        <button
          type="button"
          className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 focus:outline-none"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          title="Change photo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
      {uploading && <p className="text-blue-600 mt-2">Uploading...</p>}
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
};

export default AvatarUpload; 