import { SignedIn, UserProfile } from '@clerk/nextjs';
import React from 'react';

const UserProfilePage = () => {
  return (
    <div>
      <h2>/pages/user</h2>
      <SignedIn>
        <h2>SignedIn</h2>
      </SignedIn>
      <UserProfile />
    </div>
  );
};

export default UserProfilePage;