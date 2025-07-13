'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/hooks/use-auth';
import RecordingControls from '@/src/components/RecordingControls';

export default function RecordPage() {
  console.log('RecordPage rendered');
  const { user, profile, isLoading } = useAuth(); 
  const router = useRouter(); 

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-dark-primary-bg text-dark-text-light">
        <p>Loading application...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-dark-primary-bg text-dark-text-light">
        <p>Loading user profile...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col justify-center px-4 bg-dark-primary-bg text-dark-text-light text-center">
      <h1 className="text-xl font-bold mb-4">Record Your Ideas</h1>
      <p className="mb-2">Welcome, {profile.email}</p>
      <p className="mb-2">Credits: {profile.credits.toLocaleString()}</p>
      <RecordingControls />
    </div>
  );
}