import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  Globe,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  MessageCircle,
  Pin,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';

const socialPlatforms = [
  { id: 'website', icon: Globe, label: 'Website' },
  { id: 'twitter', icon: Twitter, label: 'Twitter' },
  { id: 'facebook', icon: Facebook, label: 'Facebook' },
  { id: 'instagram', icon: Instagram, label: 'Instagram' },
  { id: 'youtube', icon: Youtube, label: 'YouTube' },
  { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
  { id: 'whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { id: 'pinterest', icon: Pin, label: 'Pinterest' },
  { id: 'tiktok', icon: Share2, label: 'TikTok' },
];

function Social() {
  const [socialLinks, setSocialLinks] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('social_links')
        .select('*')
        .eq('user_id', user.id);

      if (data) {
        const links = {};
        data.forEach(link => {
          links[link.platform] = link.url;
        });
        setSocialLinks(links);
      }
    };

    fetchSocialLinks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const links = Object.entries(socialLinks)
        .filter(([_, url]) => url) // Only include non-empty URLs
        .map(([platform, url]) => ({
          platform,
          url,
          user_id: user.id
        }));

      const { error } = await supabase
        .from('social_links')
        .upsert(links);

      if (error) throw error;
      toast.success('Social links updated successfully!');
    } catch (error) {
      toast.error('Error updating social links');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Social Links</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {socialPlatforms.map((platform) => (
              <div 
                key={platform.id}
                className="bg-gray-50 p-4 rounded-lg transition-all hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center space-x-3 sm:w-1/4">
                    <platform.icon className="w-5 h-5 text-gray-500" />
                    <label className="block text-sm font-medium text-gray-700">
                      {platform.label}
                    </label>
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                      value={socialLinks[platform.id] || ''}
                      onChange={(e) =>
                        setSocialLinks({ ...socialLinks, [platform.id]: e.target.value })
                      }
                      placeholder={`Enter your ${platform.label} URL`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Social Links'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Social;