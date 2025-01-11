import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, MapPin, Mail, Phone, Building2, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

function SearchProfile() {
  const [urlAlias, setUrlAlias] = useState('');
  const [profile, setProfile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlAlias.trim()) {
      toast.error('Please enter a URL alias');
      return;
    }

    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('url_alias', urlAlias.trim())
        .single();

      if (profileError) throw profileError;

      if (!profileData) {
        toast.error('Profile not found');
        setProfile(null);
        setSocialLinks([]);
        return;
      }

      setProfile(profileData);

      const { data: socialData } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', profileData.user_id);

      setSocialLinks(socialData || []);
    } catch (error) {
      toast.error('Error fetching profile');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Search Profile</h2>
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="urlAlias" className="block text-sm font-medium text-gray-700 mb-1">
                Enter URL Alias
              </label>
              <input
                type="text"
                id="urlAlias"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={urlAlias}
                onChange={(e) => setUrlAlias(e.target.value)}
                placeholder="Enter profile URL alias"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="self-end px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                'Searching...'
              ) : (
                <>
                  <Search className="w-4 h-4 inline-block mr-2" />
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Profile Display */}
        {profile && (
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="flex items-start space-x-4">
              {profile.profile_image_url && (
                <img
                  src={profile.profile_image_url}
                  alt={profile.profile_name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{profile.profile_name}</h3>
                <p className="text-gray-600 flex items-center mt-1">
                  <Briefcase className="w-4 h-4 mr-2" />
                  {profile.occupation}
                </p>
                {profile.company && (
                  <p className="text-gray-600 flex items-center mt-1">
                    <Building2 className="w-4 h-4 mr-2" />
                    {profile.company} • {profile.job_title}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {profile.description && (
              <div className="prose max-w-none">
                <p className="text-gray-700">{profile.description}</p>
              </div>
            )}

            {/* Contact & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">Contact Information</h4>
                <ul className="space-y-2">
                  {profile.email && (
                    <li className="flex items-center space-x-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </li>
                  )}
                  {profile.phone && (
                    <li className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Location & Additional Details */}
              <div className="space-y-3">
                {profile.location && (
                  <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <p className="flex items-center space-x-2 text-gray-600 mt-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </p>
                  </div>
                )}
                {profile.date_of_birth && (
                  <div>
                    <h4 className="font-semibold text-gray-900">Date of Birth</h4>
                    <p className="text-gray-600 mt-2">
                      {format(new Date(profile.date_of_birth), 'MMMM do, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Social Links</h4>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchProfile;