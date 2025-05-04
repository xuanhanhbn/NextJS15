import { SessionProvider } from 'next-auth/react';
import { setRequestLocale } from 'next-intl/server';

export default async function AuthLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <SessionProvider>
      {props.children}
    </SessionProvider>
  );
}
