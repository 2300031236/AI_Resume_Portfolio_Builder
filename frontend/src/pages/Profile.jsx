import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Upload, AlertCircle, Check } from 'lucide-react';

const Profile = () => {
  const { user, updateProfileImage } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.');
        return;
      }
      setSelectedFile(file);
      setError('');
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image file first.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      await updateProfileImage(selectedFile);
      setSuccess(true);
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">User Profile</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your student profile credentials and avatar.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 md:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative group">
              <img
                src={user.profileImageUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                alt="Avatar"
                className="h-32 w-32 rounded-full border-2 border-indigo-500 object-cover shadow-md"
              />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-800 dark:text-slate-100">{user.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Student / Fresh Graduate</p>
          </div>
          
          <div className="mt-6 space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <User className="mr-2 h-4 w-4 text-indigo-500" />
              <span className="font-medium text-slate-800 dark:text-slate-200">{user.name}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Mail className="mr-2 h-4 w-4 text-indigo-500" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="mr-2 h-4 w-4 text-indigo-500" />
              <span>Joined {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'recently'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/50 bg-white p-6 shadow-sm dark:border-slate-850 dark:bg-slate-900 md:col-span-2">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Change Profile Picture</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-8 dark:border-slate-700">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                <div className="mt-4 flex text-sm text-slate-600 dark:text-slate-400">
                  <label className="relative cursor-pointer rounded-md font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PNG, JPG, SVG up to 10MB</p>
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">{selectedFile.name}</span>
                <span className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                <Check className="h-5 w-5 shrink-0" />
                <span>Profile picture uploaded successfully!</span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile}
              className="flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600"
            >
              {uploading ? 'Uploading...' : 'Save Avatar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
