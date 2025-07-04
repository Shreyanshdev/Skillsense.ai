'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/services/api';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const skipAuth = PUBLIC_ROUTES.includes(pathname);
    if (skipAuth) {
      setCheckingAuth(false);
      return;
    }

    const checkAuth = async () => {
      try {
        await api.get('/auth/me'); // checks access token
        setCheckingAuth(false);
      } catch {
        try {
          await api.post('/auth/refresh-token'); // auto refresh
          setCheckingAuth(false);
        } catch {
          router.replace('/login'); // both failed → logout
        }
      }
    };

    checkAuth();
  }, [pathname]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
}
