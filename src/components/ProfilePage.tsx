// src/components/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Profile {
  id: string;
  username: string;
  email: string;
  // Add any additional fields as needed
}

const ProfilePage: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('ProfilePage render: token =', token);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching profile with token:', token);
        const response = await fetch('http://localhost:5001/api/user/profile', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Profile response status:', response.status);
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        console.log('Fetched profile data:', data);
        setProfile(data);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  if (loading) {
    console.log('ProfilePage loading...');
    return <div className="text-white p-4">Loading profile...</div>;
  }
  if (error) {
    console.log('ProfilePage error:', error);
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }
  if (!profile) {
    console.log('ProfilePage: no profile data available');
    return <div className="text-white p-4">No profile data available.</div>;
  }

  console.log('ProfilePage rendering profile:', profile);
  return (
    <div className="p-4">
      <h2 className="text-2xl text-white mb-4">User Profile</h2>
      <p className="text-white">Username: {profile.username}</p>
      <p className="text-white">Email: {profile.email}</p>
      {/* Add other profile details as needed */}
    </div>
  );
};

export default ProfilePage;