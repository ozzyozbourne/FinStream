import Keycloak from 'keycloak-js';

class KeycloakService {
  private keycloak: Keycloak.KeycloakInstance;
  private isInitialized = false;
  constructor() {
    this.keycloak = new Keycloak({
      url: "http://localhost:8080",
      realm: "Finstream_External",
      clientId: "my_client",
    });
    const token = localStorage.getItem('kc_token');
    if (token) this.keycloak.token = token;
  }

  async init(): Promise<boolean> {
    if (this.isInitialized) {
      return this.keycloak.authenticated || false;
    }
    this.isInitialized = true;
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
        checkLoginIframe: false,
      });
      // Store tokens in localStorage to persist across refresh
      if (this.keycloak.token) 
      localStorage.setItem('kc_token', this.keycloak.token);
      console.log(this.keycloak.idToken)
      console.log(this.keycloak.refreshToken)
      console.log(this.keycloak.token)

      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      this.isInitialized = false;
      return false;
    }
  }

  login(): void {
    this.keycloak.login({ redirectUri: window.location.origin + '/profile' });
  }

  logout(): void {
    try {
      // Clear localStorage FIRST
      localStorage.removeItem('kc_token');
      localStorage.removeItem('kc_refreshToken')
      // Reset the internal state BEFORE redirect
      this.isInitialized = false;
      this.keycloak.authenticated = false;
      this.keycloak.token = undefined;
      this.keycloak.refreshToken = undefined;
      this.keycloak.idToken = undefined;
      
      // Then redirect to Keycloak logout
      this.keycloak.logout({ 
        redirectUri: window.location.origin 
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: just reload the page
      window.location.reload();
    }
  }

  getToken(): string | undefined {
    return this.keycloak.token || localStorage.getItem('kc_token') || undefined;
  }

  getUserName(): string {
    const tokenParsed = this.keycloak.tokenParsed;
    return tokenParsed?.name || tokenParsed?.preferred_username || 'User';
  }

  isAuthenticated(): boolean {
    // Only check keycloak.authenticated if we have a token
    const hasToken = !!this.keycloak.token || !!localStorage.getItem('kc_token');
    return this.keycloak.authenticated && hasToken;
  }
  isAuthenticatedSync(): boolean {
    // Check without triggering initialization
    const hasToken = !!localStorage.getItem('kc_token');
    return hasToken && this.keycloak.authenticated;
  }
}

export const keycloakService = new KeycloakService();
