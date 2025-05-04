import { authOptions } from '@/libs/auth';
import { getServerSession } from 'next-auth';

export async function Hello() {
  const session = await getServerSession(authOptions);
  return (
    <div>
      <p>
        Hello
        {' '}
        {session?.user?.name || session?.user?.email || 'Guest'}
        !
      </p>
    </div>
  );
}
