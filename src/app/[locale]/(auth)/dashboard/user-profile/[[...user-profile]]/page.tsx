import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';

type IUserProfilePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: IUserProfilePageProps) {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'UserProfile',
  });

  return {
    title: t('meta_title'),
    description: t('meta_title'), // Using meta_title as meta_description is not defined
  };
}

export default async function UserProfilePage(props: IUserProfilePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const session = await getServerSession(authOptions);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      {session?.user && (
        <div className="space-y-2">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt="Profile"
              className="rounded-full"
              width={96}
              height={96}
            />
          )}
          <p>
            Name:
            {' '}
            {session.user.name || 'Not provided'}
          </p>
          <p>
            Email:
            {' '}
            {session.user.email}
          </p>
        </div>
      )}
    </div>
  );
}
