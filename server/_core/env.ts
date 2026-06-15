export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  intercomApiKey: process.env.INTERCOM_API_KEY ?? "",
  intercomWorkspaceId: process.env.INTERCOM_WORKSPACE_ID ?? "",
  // WAVV IdP OIDC
  wavvOidcClientId: process.env.WAVV_OIDC_CLIENT_ID ?? "",
  wavvOidcClientSecret: process.env.WAVV_OIDC_CLIENT_SECRET ?? "",
  wavvOidcRedirectUri: process.env.WAVV_OIDC_REDIRECT_URI ?? "https://success.wavv.com/api/oauth/callback",
};
