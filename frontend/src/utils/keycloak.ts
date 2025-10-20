import Keycloak from 'keycloak-js';

class KeycloakService {
  private keycloak: Keycloak.KeycloakInstance;
  private isInitialized = false;

  constructor() {
    this.keycloak = new Keycloak({
      url: "http://localhost:8080",
      realm: "Finstream-External",
      clientId: "myclient",
    });
  }

  async init(): Promise<boolean> {
    if (this.isInitialized) {
      return this.keycloak.authenticated || false;
    }

    try {
      const authenticated = await this.keycloak.init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      });
      this.isInitialized = true;
      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      return false;
    }
  }
  

  login(): void {
    this.keycloak.login({ redirectUri: window.location.origin + '/profile' });
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }

  getToken(): string | undefined {
    return this.keycloak.token;
  }

  getUserName(): string {
    const tokenParsed = this.keycloak.tokenParsed;
    return tokenParsed?.name || tokenParsed?.preferred_username || 'User';
  }

  isAuthenticated(): boolean {
    return this.keycloak.authenticated || false;
  }
  
}

export const keycloakService = new KeycloakService();
