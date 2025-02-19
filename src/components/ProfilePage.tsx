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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/user/profile', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data = await response.json();
        console.log(data)
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  if (loading) return <div className="text-white p-4">Loading profile...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!profile) return <div className="text-white p-4">No profile data available.</div>;

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