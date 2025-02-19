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

  console.log('Component rendered with states:', { loading, error, profile });  // Add this at the top

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
        console.log('Received profile data:', data);  // Modified log
        setProfile(data);
        console.log('Profile state updated');  // New log
        setLoading(false);
        console.log('Loading state updated');  // New log
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  console.log('Before conditional renders:', { loading, error, profile });  // Add this line

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

  console.log('Passed all conditions, about to render profile:', profile);  // Add this line
  // This log is executed on every render when profile is not null.
  console.log('ProfilePage rendering profile:', profile);

  // Add this log right before the return
  console.log('About to render profile component with data:', profile);

  return (
    <div className="p-4 bg-gray-800"> {/* Added background color */}
      <h2 className="text-2xl text-white mb-4">User Profile</h2>
      <p className="text-white">Username: {profile.username}</p>
      <p className="text-white">Email: {profile.email}</p>
      {/* Add other profile details as needed */}
    </div>
  );
};

export default ProfilePage;