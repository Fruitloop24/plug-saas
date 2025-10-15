import { SignIn } from '@clerk/nextjs';

export const runtime = 'edge';

export default function Page() {
  return (
    <div>
      here?
      <SignIn
        routing={'path'}
        path={'/sign-in'}
        signUpUrl={'/sign-up'}
      />
    </div>
  );
}
