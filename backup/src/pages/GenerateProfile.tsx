import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { MapPin, Mail, Phone, Building2, Briefcase } from 'lucide-react';

function GenerateProfile() {
  const [profile, setProfile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const [profileData, socialData] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single(),
        supabase
          .from('social_links')
          .select('*')
          .eq('user_id', user.id),
      ]);

      if (profileData.data) setProfile(profileData.data);
      if (socialData.data) setSocialLinks(socialData.data);
    };

    fetchData();
  }, []);

  if (!profile) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Cover Image */}
        {profile.cover_image_url && (
          <div className="h-48 w-full overflow-hidden">
            <img
              src={profile.cover_image_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="relative px-6 pt-16 pb-6">
          {/* Profile Image */}
          {profile.profile_image_url && (
            <div className="absolute -top-16 left-6">
              <img
                src={profile.profile_image_url}
                alt={profile.profile_image_title}
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{profile.profile_name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <p className="text-lg text-gray-600">{profile.occupation}</p>
              </div>
              {profile.company && (
                <div className="flex items-center space-x-2 mt-1">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <p className="text-gray-600">{profile.company} • {profile.job_title}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {profile.description && (
              <div className="prose max-w-none text-gray-600">
                <p>{profile.description}</p>
              </div>
            )}

            {/* Contact & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Contact Information</h3>
                <ul className="space-y-2">
                  {profile.email && (
                    <li className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{profile.email}</span>
                    </li>
                  )}
                  {profile.phone && (
                    <li className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{profile.phone}</span>
                    </li>
                  )}
                  {profile.alternate_email && (
                    <li className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span>{profile.alternate_email} (Alternative)</span>
                    </li>
                  )}
                  {profile.alternate_phone && (
                    <li className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span>{profile.alternate_phone} (Alternative)</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Location & Additional Details */}
              <div className="space-y-3">
                {profile.location && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Location</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      {profile.location_url ? (
                        <a 
                          href={profile.location_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          {profile.location}
                        </a>
                      ) : (
                        <span>{profile.location}</span>
                      )}
                    </div>
                  </div>
                )}
                {profile.date_of_birth && (
                  <div>
                    <h3 className="font-semibold text-gray-900">Date of Birth</h3>
                    <p className="mt-2 text-gray-600">
                      {format(new Date(profile.date_of_birth), 'MMMM do, yyyy')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Connect</h3>
                <div className="flex flex-wrap gap-4">
                  {socialLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {link.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateProfile;