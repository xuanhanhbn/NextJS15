import { getI18nPath } from '@/utils/Helpers';
import { signIn } from 'next-auth/react';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type ISignInPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ISignInPageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignInPage(props: ISignInPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="flex flex-col items-center space-y-4">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <button
        onClick={() => signIn('keycloak', { callbackUrl: getI18nPath('/dashboard', locale) })}
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Sign in with Keycloak
      </button>
    </div>
  );
}
