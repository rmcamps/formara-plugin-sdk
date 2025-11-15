/**
 * Utilidades de cifrado para credenciales
 */

import crypto from 'crypto';

const ENC_ALGO = 'aes-256-gcm';
const ENC_KEY = (process.env.CREDENTIALS_SECRET || 'dev-secret-32-bytes-placeholder')
  .padEnd(32, '0')
  .slice(0, 32);

/**
 * Cifra un objeto JSON usando AES-256-GCM
 */
export function encryptJSON(obj: any): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ENC_ALGO, Buffer.from(ENC_KEY), iv);
  const json = JSON.stringify(obj);
  const enc = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

/**
 * Descifra un string cifrado a objeto JSON
 */
export function decryptJSON(data: string): any {
  try {
    const buf = Buffer.from(data, 'base64');
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv(ENC_ALGO, Buffer.from(ENC_KEY), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
    return JSON.parse(dec);
  } catch {
    return null;
  }
}

/**
 * Genera un ID único
 */
export function generateUniqueId(): string {
  return 'id-' + Math.random().toString(36).substr(2, 16);
}

/**
 * Formatea una fecha a string ISO
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}


