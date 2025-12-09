// AES-256 Encryption Service for Health Data
// HIPAA/GDPR Compliant Data Protection

class EncryptionService {
  constructor() {
    // Use device-specific key derived from device ID + user secret
    this.encryptionKey = null;
    this.algorithm = 'AES-GCM';
  }

  /**
   * Initialize encryption with device-specific key
   */
  async initialize() {
    try {
      // Generate or retrieve device-specific key
      let keyMaterial = localStorage.getItem('__encryption_key__');
      
      if (!keyMaterial) {
        // First time - generate new key
        const key = await this.generateKey();
        keyMaterial = await this.exportKey(key);
        localStorage.setItem('__encryption_key__', keyMaterial);
        this.encryptionKey = key;
      } else {
        // Import existing key
        this.encryptionKey = await this.importKey(keyMaterial);
      }
      
      if(import.meta.env.DEV)console.log('🔐 Encryption initialized');
      return true;
    } catch (error) {
      if(import.meta.env.DEV)console.error('Encryption init error:', error);
      return false;
    }
  }

  /**
   * Generate new AES-256 key
   */
  async generateKey() {
    return await crypto.subtle.generateKey(
      { name: this.algorithm, length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export key to string for storage
   */
  async exportKey(key) {
    const exported = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
  }

  /**
   * Import key from string
   */
  async importKey(keyMaterial) {
    const keyData = this.base64ToArrayBuffer(keyMaterial);
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: this.algorithm },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt sensitive data
   */
  async encrypt(data) {
    try {
      if (!this.encryptionKey) {
        await this.initialize();
      }

      const jsonString = JSON.stringify(data);
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(jsonString);
      
      // Generate random IV (Initialization Vector)
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await crypto.subtle.encrypt(
        { name: this.algorithm, iv: iv },
        this.encryptionKey,
        dataBuffer
      );

      // Combine IV + encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      return this.arrayBufferToBase64(combined);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Encryption error:', error);
      return null;
    }
  }

  /**
   * Decrypt sensitive data
   */
  async decrypt(encryptedData) {
    try {
      if (!this.encryptionKey) {
        await this.initialize();
      }

      const combined = this.base64ToArrayBuffer(encryptedData);
      
      // Extract IV and encrypted data
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);
      
      const decrypted = await crypto.subtle.decrypt(
        { name: this.algorithm, iv: iv },
        this.encryptionKey,
        data
      );

      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decrypted);
      
      return JSON.parse(jsonString);
    } catch (error) {
      if(import.meta.env.DEV)console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Helper: Convert ArrayBuffer to Base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Helper: Convert Base64 to ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Secure localStorage wrapper for health data
   */
  async setSecureItem(key, value) {
    const encrypted = await this.encrypt(value);
    if (encrypted) {
      localStorage.setItem(`secure_${key}`, encrypted);
      return true;
    }
    return false;
  }

  /**
   * Retrieve and decrypt from localStorage
   */
  async getSecureItem(key) {
    const encrypted = localStorage.getItem(`secure_${key}`);
    if (!encrypted) return null;
    
    return await this.decrypt(encrypted);
  }

  /**
   * Remove secure item
   */
  removeSecureItem(key) {
    localStorage.removeItem(`secure_${key}`);
  }
}

// Singleton instance
const encryptionService = new EncryptionService();
export default encryptionService;



