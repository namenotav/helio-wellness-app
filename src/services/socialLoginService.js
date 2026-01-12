// Social Login Service - Google & Apple OAuth
// Provides seamless sign-in with social accounts

import { Capacitor } from '@capacitor/core';

class SocialLoginService {
  constructor() {
    this.providers = {
      google: {
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        scopes: ['profile', 'email']
      },
      apple: {
        clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'YOUR_APPLE_CLIENT_ID',
        scopes: ['name', 'email']
      }
    };
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    try {
      console.log('🔐 Initiating Google Sign-In...');

      if (Capacitor.getPlatform() === 'web') {
        return await this.googleWebSignIn();
      } else {
        return await this.googleNativeSignIn();
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      throw new Error('Google sign-in failed: ' + error.message);
    }
  }

  /**
   * Google sign-in for web
   */
  async googleWebSignIn() {
    // Load Google Identity Services
    if (!window.google) {
      await this.loadGoogleScript();
    }

    return new Promise((resolve, reject) => {
      window.google.accounts.id.initialize({
        client_id: this.providers.google.clientId,
        callback: (response) => {
          try {
            const credential = this.parseGoogleJWT(response.credential);
            resolve({
              provider: 'google',
              id: credential.sub,
              email: credential.email,
              name: credential.name,
              picture: credential.picture,
              token: response.credential
            });
          } catch (error) {
            reject(error);
          }
        }
      });

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          reject(new Error('Google Sign-In prompt not displayed'));
        } else if (notification.isSkippedMoment()) {
          reject(new Error('User cancelled Google Sign-In'));
        }
      });
    });
  }

  /**
   * Google sign-in for native (Android/iOS)
   */
  async googleNativeSignIn() {
    // For native apps, use Capacitor Google Auth plugin
    // npm install @codetrix-studio/capacitor-google-auth
    
    try {
      // Import dynamically
      const { GoogleAuth } = await import('@codetrix-studio/capacitor-google-auth');
      
      await GoogleAuth.initialize({
        clientId: this.providers.google.clientId,
        scopes: this.providers.google.scopes
      });

      const result = await GoogleAuth.signIn();

      return {
        provider: 'google',
        id: result.id,
        email: result.email,
        name: result.name,
        picture: result.imageUrl,
        token: result.authentication.accessToken
      };
    } catch (error) {
      // Fallback to web auth if plugin not available
      console.warn('Native Google Auth not available, using web auth');
      return await this.googleWebSignIn();
    }
  }

  /**
   * Sign in with Apple
   */
  async signInWithApple() {
    try {
      console.log('🍎 Initiating Apple Sign-In...');

      if (Capacitor.getPlatform() === 'ios') {
        return await this.appleNativeSignIn();
      } else {
        return await this.appleWebSignIn();
      }
    } catch (error) {
      console.error('❌ Apple sign-in error:', error);
      throw new Error('Apple sign-in failed: ' + error.message);
    }
  }

  /**
   * Apple sign-in for web
   */
  async appleWebSignIn() {
    // Load Apple Sign-In script
    if (!window.AppleID) {
      await this.loadAppleScript();
    }

    return new Promise((resolve, reject) => {
      window.AppleID.auth.init({
        clientId: this.providers.apple.clientId,
        scope: this.providers.apple.scopes.join(' '),
        redirectURI: window.location.origin,
        usePopup: true
      });

      window.AppleID.auth.signIn()
        .then((response) => {
          const { authorization, user } = response;
          
          resolve({
            provider: 'apple',
            id: user?.email || authorization.id_token,
            email: user?.email || null,
            name: user ? `${user.name.firstName} ${user.name.lastName}` : null,
            picture: null,
            token: authorization.id_token
          });
        })
        .catch(reject);
    });
  }

  /**
   * Apple sign-in for iOS
   */
  async appleNativeSignIn() {
    // For iOS, use Capacitor Sign in with Apple plugin
    // npm install @capacitor-community/apple-sign-in
    
    try {
      const { SignInWithApple } = await import('@capacitor-community/apple-sign-in');
      
      const result = await SignInWithApple.authorize({
        clientId: this.providers.apple.clientId,
        redirectURI: 'https://your-app.com/auth/apple',
        scopes: 'email name',
        state: Math.random().toString(36).substring(7)
      });

      return {
        provider: 'apple',
        id: result.response.user,
        email: result.response.email,
        name: result.response.givenName ? 
          `${result.response.givenName} ${result.response.familyName}` : null,
        picture: null,
        token: result.response.identityToken
      };
    } catch (error) {
      console.warn('Native Apple Auth not available, using web auth');
      return await this.appleWebSignIn();
    }
  }

  /**
   * Parse Google JWT token
   */
  parseGoogleJWT(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  /**
   * Load Google Identity Services script
   */
  loadGoogleScript() {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-identity-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Load Apple Sign-In script
   */
  loadAppleScript() {
    return new Promise((resolve, reject) => {
      if (document.getElementById('apple-signin-script')) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = 'apple-signin-script';
      script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Sign out from social provider
   */
  async signOut(provider) {
    try {
      if (provider === 'google') {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.disableAutoSelect();
        }
      } else if (provider === 'apple') {
        // Apple doesn't provide sign-out API
        // Just clear local session
      }

      localStorage.removeItem('social_login_provider');
      localStorage.removeItem('social_login_token');
      
      console.log(`✅ Signed out from ${provider}`);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Save social login session
   */
  saveSocialSession(userData) {
    try {
      localStorage.setItem('social_login_provider', userData.provider);
      localStorage.setItem('social_login_token', userData.token);
      localStorage.setItem('social_login_data', JSON.stringify(userData));
      
      console.log(`✅ Social login session saved (${userData.provider})`);
    } catch (error) {
      console.error('Failed to save social session:', error);
    }
  }

  /**
   * Get saved social session
   */
  getSocialSession() {
    try {
      const provider = localStorage.getItem('social_login_provider');
      const token = localStorage.getItem('social_login_token');
      const data = localStorage.getItem('social_login_data');

      if (provider && token && data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error('Failed to get social session:', error);
      return null;
    }
  }

  /**
   * Check if user is signed in via social
   */
  isSocialSignedIn() {
    return !!this.getSocialSession();
  }
}

const socialLoginService = new SocialLoginService();
export default socialLoginService;
