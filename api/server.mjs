import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// In Vercel, the includeFiles are placed in the function's directory
// We need to find the server module relative to the function
const serverPaths = [
  // When includeFiles copies dist folder structure
  resolve(__dirname, 'dist/deveolp-network/server/server.mjs'),
  // Fallback: relative to api folder in local development
  resolve(__dirname, '../dist/deveolp-network/server/server.mjs'),
];

let handler = null;

async function getHandler() {
  if (!handler) {
    let lastError;

    for (const serverPath of serverPaths) {
      try {
        const serverModule = await import(serverPath);
        handler = serverModule.reqHandler;
        console.log('Successfully loaded Angular SSR server from:', serverPath);
        return handler;
      } catch (error) {
        lastError = error;
        console.log('Failed to load from:', serverPath, error.message);
      }
    }

    throw lastError || new Error('Could not find Angular SSR server module');
  }
  return handler;
}

export default async function vercelHandler(req, res) {
  try {
    const reqHandler = await getHandler();
    return await reqHandler(req, res);
  } catch (error) {
    console.error('Angular SSR Handler Error:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/html');
    res.end(`
      <!DOCTYPE html>
      <html>
        <head><title>Error</title></head>
        <body>
          <h1>Server Error</h1>
          <p>An error occurred while processing your request.</p>
          ${process.env.NODE_ENV !== 'production' ? `<pre>${error.stack}</pre>` : ''}
        </body>
      </html>
    `);
  }
}
