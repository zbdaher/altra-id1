import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Image, Loader2 } from 'lucide-react';

function BasicDetails() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    urlAlias: '',
    profileName: '',
    occupation: '',
    profileImageUrl: '',
    profileImageTitle: '',
    coverImageUrl: '',
    description: '',
    email: '',
    phone: '',
    alternateEmail: '',
    alternatePhone: '',
    location: '',
    locationUrl: '',
    dateOfBirth: '',
    company: '',
    jobTitle: '',
  });
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [publicProfileUrl, setPublicProfileUrl] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to continue');
        navigate('/auth');
        return;
      }

      // Load existing profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) {
        toast.error('Error loading profile');
        return;
      }

      if (profile) {
        setFormData({
          urlAlias: profile.url_alias || '',
          profileName: profile.profile_name || '',
          occupation: profile.occupation || '',
          profileImageUrl: profile.profile_image_url || '',
          profileImageTitle: profile.profile_image_title || '',
          coverImageUrl: profile.cover_image_url || '',
          description: profile.description || '',
          email: profile.email || '',
          phone: profile.phone || '',
          alternateEmail: profile.alternate_email || '',
          alternatePhone: profile.alternate_phone || '',
          location: profile.location || '',
          locationUrl: profile.location_url || '',
          dateOfBirth: profile.date_of_birth || '',
          company: profile.company || '',
          jobTitle: profile.job_title || '',
        });

        if (profile.url_alias) {
          setPublicProfileUrl(`${window.location.origin}/p/${profile.url_alias}`);
        }
      }
    };

    checkAuth();
  }, [navigate]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'cover') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Only image files are allowed');
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${session.user.id}-${Date.now()}.${fileExt}`;

      if (type === 'profile') setUploadingProfile(true);
      else setUploadingCover(true);

      const { error: uploadError, data } = await supabase.storage
        .from('profile-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(fileName);

      setFormData(prev => ({
        ...prev,
        ...(type === 'profile' 
          ? { 
              profileImageUrl: publicUrl,
              profileImageTitle: file.name 
            }
          : { coverImageUrl: publicUrl })
      }));

      toast.success(`${type === 'profile' ? 'Profile' : 'Cover'} image uploaded successfully`);
    } catch (error) {
      toast.error(`Error uploading ${type} image`);
      console.error(error);
    } finally {
      if (type === 'profile') setUploadingProfile(false);
      else setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to continue');
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          url_alias: formData.urlAlias,
          profile_name: formData.profileName,
          occupation: formData.occupation,
          profile_image_url: formData.profileImageUrl,
          profile_image_title: formData.profileImageTitle,
          cover_image_url: formData.coverImageUrl,
          description: formData.description,
          email: formData.email,
          phone: formData.phone,
          alternate_email: formData.alternateEmail,
          alternate_phone: formData.alternatePhone,
          location: formData.location,
          location_url: formData.locationUrl,
          date_of_birth: formData.dateOfBirth || null,
          company: formData.company,
          job_title: formData.jobTitle,
          user_id: session.user.id
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      
      // Update public profile URL
      if (formData.urlAlias) {
        setPublicProfileUrl(`${window.location.origin}/p/${formData.urlAlias}`);
      }
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Error updating profile');
      console.error(error);
    }
  };

  const inputClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white";

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Basic Details</h2>
      
      {/* Public Profile URL */}
      {publicProfileUrl && (
        <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
          <h3 className="text-lg font-medium text-indigo-900 mb-2">Your Public Profile</h3>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={publicProfileUrl}
              className="flex-1 p-2 bg-white rounded border border-indigo-200 text-indigo-700"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicProfileUrl);
                toast.success('Profile URL copied to clipboard!');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Copy URL
            </button>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
        {/* Profile Identity */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">URL Alias</label>
              <input
                type="text"
                className={inputClasses}
                value={formData.urlAlias}
                onChange={(e) => setFormData({ ...formData, urlAlias: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profile Name</label>
              <input
                type="text"
                className={inputClasses}
                value={formData.profileName}
                onChange={(e) => setFormData({ ...formData, profileName: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Profile Images */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Images</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
              <div className="flex items-center space-x-4">
                {formData.profileImageUrl && (
                  <img
                    src={formData.profileImageUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                )}
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    {uploadingProfile ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Image className="w-5 h-5 mr-2" />
                    )}
                    {uploadingProfile ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'profile')}
                    disabled={uploadingProfile}
                  />
                </label>
              </div>
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              <div className="flex items-center space-x-4">
                {formData.coverImageUrl && (
                  <img
                    src={formData.coverImageUrl}
                    alt="Cover"
                    className="w-32 h-20 rounded object-cover"
                  />
                )}
                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                  <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    {uploadingCover ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <Image className="w-5 h-5 mr-2" />
                    )}
                    {uploadingCover ? 'Uploading...' : 'Upload Image'}
                  </span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'cover')}
                    disabled={uploadingCover}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Occupation</label>
              <input
                type="text"
                className={inputClasses}
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                className={inputClasses}
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title</label>
              <input
                type="text"
                className={inputClasses}
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
          <textarea
            rows={4}
            className={inputClasses}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Write a brief description about yourself..."
          />
        </div>

        {/* Contact Information */}
        <div className="border-b pb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Email</label>
              <input
                type="email"
                className={inputClasses}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Primary Phone</label>
              <input
                type="tel"
                className={inputClasses}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alternative Email</label>
              <input
                type="email"
                className={inputClasses}
                value={formData.alternateEmail}
                onChange={(e) => setFormData({ ...formData, alternateEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Alternative Phone</label>
              <input
                type="tel"
                className={inputClasses}
                value={formData.alternatePhone}
                onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Location & Additional Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location & Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                className={inputClasses}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., San Francisco, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location URL</label>
              <input
                type="url"
                className={inputClasses}
                value={formData.locationUrl}
                onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                placeholder="e.g., Google Maps link"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input
                type="date"
                className={inputClasses}
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}

export default BasicDetails;