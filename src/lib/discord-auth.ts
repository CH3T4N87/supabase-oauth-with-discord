const DISCORD_AUTH_URL = 'https://discord.com/oauth2/authorize';
const DISCORD_API_URL = 'https://discord.com/api/users/@me';
const DISCORD_STATE_KEY = 'discord_oauth_state';

const getDiscordRedirectUri = () => {
  if (process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI) {
    return process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI;
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }

  return 'http://localhost:3000/auth/callback';
};

const generateState = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const startDiscordLogin = () => {
  const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

  if (!clientId) {
    throw new Error('Missing NEXT_PUBLIC_DISCORD_CLIENT_ID');
  }

  const state = generateState();
  sessionStorage.setItem(DISCORD_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getDiscordRedirectUri(),
    response_type: 'token',
    scope: 'identify email',
    state
  });

  window.location.href = `${DISCORD_AUTH_URL}?${params.toString()}`;
};

export const parseDiscordCallbackHash = () => {
  const hash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;

  const params = new URLSearchParams(hash);

  return {
    accessToken: params.get('access_token'),
    state: params.get('state'),
    error: params.get('error'),
    errorDescription: params.get('error_description')
  };
};

export const validateDiscordState = (state: string | null) => {
  const savedState = sessionStorage.getItem(DISCORD_STATE_KEY);
  sessionStorage.removeItem(DISCORD_STATE_KEY);
  return !!state && !!savedState && state === savedState;
};

export const fetchDiscordUser = async (accessToken: string) => {
  const response = await fetch(DISCORD_API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch Discord user');
  }

  return response.json();
};
