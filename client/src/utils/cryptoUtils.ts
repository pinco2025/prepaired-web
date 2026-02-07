/**
 * Obfuscation utilities for question/solution data.
 * Uses XOR cipher + Base64 encoding to hide data from casual inspection.
 * 
 * NOTE: This is obfuscation, not encryption. Determined users can reverse-engineer.
 * For true security, use server-side validation.
 */

// Key split across multiple parts to avoid easy string extraction
const K1 = 'pReP';
const K2 = 'aIrEd';
const K3 = '2026';
const K4 = 'sEcReT';
const OBFUSCATION_KEY = K1 + K2 + K3 + K4;

/**
 * XOR a string with the key
 */
function xorTransform(input: string, key: string): string {
    let result = '';
    for (let i = 0; i < input.length; i++) {
        result += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

/**
 * Encrypt JSON data (for use in build scripts)
 * @param jsonString - Raw JSON string
 * @returns Base64 encoded XOR'd string
 */
export function encryptData(jsonString: string): string {
    const xored = xorTransform(jsonString, OBFUSCATION_KEY);
    // Use btoa for browser, Buffer for Node
    if (typeof btoa !== 'undefined') {
        // Browser - need to handle unicode
        return btoa(unescape(encodeURIComponent(xored)));
    } else {
        return Buffer.from(xored, 'utf-8').toString('base64');
    }
}

/**
 * Decrypt encrypted data
 * @param encryptedString - Base64 encoded XOR'd string  
 * @returns Original JSON string
 */
export function decryptData(encryptedString: string): string {
    let decoded: string;
    if (typeof atob !== 'undefined') {
        // Browser - handle unicode
        decoded = decodeURIComponent(escape(atob(encryptedString)));
    } else {
        decoded = Buffer.from(encryptedString, 'base64').toString('utf-8');
    }
    return xorTransform(decoded, OBFUSCATION_KEY);
}

/**
 * Fetch and decrypt an encrypted JSON file
 * @param url - URL to the .enc file
 * @returns Parsed JSON object
 */
export async function fetchEncryptedJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }
    const encryptedText = await response.text();
    const decryptedJson = decryptData(encryptedText);
    return JSON.parse(decryptedJson) as T;
}

/**
 * Export key for use in Node.js encryption script
 * This is intentionally exposed - obfuscation assumes key is bundled
 */
export const getObfuscationKey = () => OBFUSCATION_KEY;
