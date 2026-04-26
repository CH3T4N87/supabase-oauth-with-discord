'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { saveToken } from '@/lib/auth';
import Cookies from 'js-cookie';
import api from '@/lib/api';
import {
  fetchDiscordUser,
  parseDiscordCallbackHash,
  validateDiscordState
} from '@/lib/discord-auth';
import { Suspense } from 'react';

function AuthCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const completeDiscordLogin = async () => {
      const existingToken = searchParams.get('token');

      if (existingToken) {
        saveToken(existingToken);
        Cookies.set('token', existingToken, { expires: 7 });
        router.push('/dashboard');
        return;
      }

      const { accessToken, state, error } = parseDiscordCallbackHash();

      if (error || !accessToken || !validateDiscordState(state)) {
        router.push('/login');
        return;
      }

      try {
        const discordUser = await fetchDiscordUser(accessToken);
        const response = await api.post('/auth/discord/client-login', discordUser);
        const token = response.data?.token as string | undefined;

        if (!token) {
          throw new Error('Missing app token');
        }

        saveToken(token);
        Cookies.set('token', token, { expires: 7 });
        window.history.replaceState({}, document.title, window.location.pathname);
        router.push('/dashboard');
      } catch {
        router.push('/login');
      }
    };

    void completeDiscordLogin();
  }, [router, searchParams]);

  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Signing you in...</p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Signing you in...</p>
        </div>
      </main>
    }>
      <AuthCallbackClient />
    </Suspense>
  );
}