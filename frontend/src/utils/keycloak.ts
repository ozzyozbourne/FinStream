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
    // Don't restore token from localStorage in constructor
    // Let Keycloak handle token validation during init
  }

  async init(): Promise<boolean> {
    if (this.isInitialized) {
      // If already initialized, check if we have a valid token
      const hasValidToken = !!this.keycloak.token || !!localStorage.getItem('kc_token');
      return this.keycloak.authenticated && hasValidToken;
    }
    
    this.isInitialized = true;
    
    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false,
      });
      
      // Only store token if authentication was successful
      if (authenticated && this.keycloak.token) {
        localStorage.setItem('kc_token', this.keycloak.token);
        console.log(this.keycloak.token)
        console.log(this.keycloak.idToken)
    
        console.log('✅ Token stored successfully');
      } else {
        // Clear any stale tokens if not authenticated
        localStorage.removeItem('kc_token');
        console.log('❌ Authentication failed, clearing tokens');
      }

      console.log('🔐 Keycloak init result:', authenticated);
      console.log('🎫 Token exists:', !!this.keycloak.token);
      
      return authenticated;
    } catch (error) {
      console.error('❌ Keycloak initialization failed:', error);
      this.isInitialized = false;
      // Clear tokens on initialization failure
      localStorage.removeItem('kc_token');
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
      localStorage.removeItem('kc_refreshToken');
      
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