import { SignedIn, UserProfile } from '@clerk/nextjs';
import type { NextPage } from 'next';
import React from 'react';

const UserProfilePage: NextPage = () => {
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