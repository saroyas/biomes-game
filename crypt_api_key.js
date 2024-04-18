// console.log(require('crypto').randomBytes(32).toString('hex'));
// 3e19d8a961bebc6c619045faa943181605cef9d973fb3a3177ee833acc4a0b25

const crypto = require('crypto');

function encrypt(key, secret) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secret, 'hex'), iv);
  let encrypted = cipher.update(key);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

const secretKey = '3e19d8a961bebc6c619045faa943181605cef9d973fb3a3177ee833acc4a0b25';  // Should be 32 bytes hex string
const apiKey = 'SECRET';

console.log(encrypt(apiKey, secretKey));
