import { randomBytes } from 'crypto';

export async function generateContextId() {
  return await new Promise<string>((resolve, reject) => {
    randomBytes(128, (error, buffer) => {
      if (error) return reject(error);

      resolve(buffer.toString('base64url'));
    });
  });
}
