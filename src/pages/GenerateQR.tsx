import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Download, Share2 } from 'lucide-react';

function GenerateQR() {
  const [profile, setProfile] = useState(null);
  const [qrValue, setQrValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        toast.error('Error fetching profile');
        return;
      }

      if (data) {
        setProfile(data);
        // Fix: Use correct URL path format
        setQrValue(`${window.location.origin}/p/${data.url_alias}`);
      } else {
        toast.error('Please create your profile first in Basic Details');
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.profile_name}'s Profile`,
          text: 'Check out my profile!',
          url: qrValue
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error('Error sharing profile');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(qrValue);
        toast.success('Profile URL copied to clipboard!');
      } catch (error) {
        toast.error('Error copying to clipboard');
      }
    }
  };

  const handleDownload = () => {
    const svg = document.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = 'qr-code.png';
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="animate-pulse">
            <div className="h-64 w-64 bg-gray-200 rounded-lg mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile?.url_alias) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600">
            Please set a URL alias in Basic Details first before generating a QR code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile QR Code</h2>
          
          {qrValue && (
            <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
              <QRCodeSVG 
                value={qrValue} 
                size={256}
                level="H"
                includeMargin={true}
              />
            </div>
          )}

          <p className="text-gray-600 text-center mb-6">
            Scan this QR code to view your profile
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={handleDownload}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="w-5 h-5 mr-2" />
              Download QR Code
            </button>
            
            <button
              onClick={handleShare}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GenerateQR;