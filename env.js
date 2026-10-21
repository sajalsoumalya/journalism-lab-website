// ═══════════════════════════════════════════════════════
//  FIREBASE ENV CONFIG (Client Runtime Fallback)
//  At container runtime in Dokploy, 40-envsubst-on-envjs.sh
//  overwrites this file with the actual environment values.
// ═══════════════════════════════════════════════════════
window.__ENV__ = window.__ENV__ || {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  FIREBASE_API_KEY: "",
  FIREBASE_AUTH_DOMAIN: "",
  FIREBASE_DATABASE_URL: "",
  FIREBASE_PROJECT_ID: "",
  FIREBASE_STORAGE_BUCKET: "",
  FIREBASE_MESSAGING_SENDER_ID: "",
  FIREBASE_APP_ID: "",
  ADMIN_EMAILS: "",
  CAPTCHA_API_KEY: "",
  CAPTCHA_SITE_KEY: ""
};
