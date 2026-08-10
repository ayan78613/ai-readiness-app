// Central config flags for the server.
export const CONFIG = {
  // Default anonymous: employee identity is an opaque client-stored token,
  // never a real name/initials, unless explicitly switched to attributed mode.
  ANONYMOUS_MODE: true,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  PORT: process.env.PORT || 4000
};
