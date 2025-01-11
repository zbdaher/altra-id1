import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { MapPin, Mail, Phone, Building2, Briefcase, AlertCircle } from 'lucide-react';

function PublicProfile() {
  const { urlAlias } = useParams();
  const [profile, setProfile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionError, setConnectionError] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!urlAlias) {
        setError('No URL alias provided');
        setLoading(false);
        return;
      }

      try {
        // First, check if we can connect to Supabase
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Auth session:', session ? 'exists' : 'none');

        // Fetch the profile with debug logging
        console.log('Fetching profile for URL alias:', urlAlias);
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('url_alias', urlAlias)
          .single();

        console.log('Profile fetch result:', { profileData, profileError });

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          if (profileError.message?.includes('FetchError')) {
            setConnectionError(true);
          } else {
            setError(profileError.message);
          }
          setLoading(false);
          return;
        }

        if (!profileData) {
          console.log('No profile found for URL alias:', urlAlias);
          setError('Profile not found');
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch social links with debug logging
        console.log('Fetching social links for user_id:', profileData.user_id);
        const { data: socialData, error: socialError } = await supabase
          .from('social_links')
          .select('*')
          .eq('user_id', profileData.user_id);

        console.log('Social links fetch result:', { socialData, socialError });

        if (!socialError && socialData) {
          setSocialLinks(socialData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Unexpected error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProfile();
  }, [urlAlias]);

  if (connectionError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connection Error</h2>
          <p className="text-gray-600 mb-6">Unable to connect to the database. Please make sure to click the "Connect to Supabase" button in the top right corner.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              Tip: Look for the "Connect to Supabase" button in the top right corner of the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-4xl">
          <div className="h-48 bg-gray-200 w-full"></div>
          <div className="px-6">
            <div className="h-32 w-32 bg-gray-200 rounded-full -mt-16"></div>
            <div className="space-y-4 mt-4">
              <div className="h-8 bg-gray-200 w-1/3"></div>
              <div className="h-4 bg-gray-200 w-1/4"></div>
              <div className="h-4 bg-gray-200 w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 text-sm">
              Please check if the URL is correct and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
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
    </div>
  );
}

export default PublicProfile;