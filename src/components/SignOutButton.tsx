import { signOut } from 'next-auth/react';

type SignOutButtonProps = {
  children: React.ReactNode;
};

export function SignOutButton({ children }: SignOutButtonProps) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="border-none text-gray-700 hover:text-gray-900"
      type="button"
    >
      {children}
    </button>
  );
}
