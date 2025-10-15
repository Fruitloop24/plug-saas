import { SignUp } from '@clerk/nextjs';

export const runtime = 'edge';

export default function Page() {
  return (
    <div>
      <SignUp />
    </div>
  );
}
