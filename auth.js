import dotenv from 'dotenv';
dotenv.config();

const AUTH_PASSWORD = process.env.AUTH_PASSWORD || 'ourjourney2025';

// Simple password-based authentication middleware
export function authMiddleware(req, res, next) {
  // Skip auth in development mode if no password is set
  if (process.env.NODE_ENV === 'development' && !process.env.AUTH_PASSWORD) {
    return next();
  }

  // Allow OPTIONS requests for CORS
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Check for password in various places
  const password = 
    req.headers['x-auth-password'] || 
    req.query.password || 
    req.body?.password;

  // Check for session token (for future enhancement)
  const token = req.headers['authorization']?.replace('Bearer ', '');

  // Validate password
  if (password === AUTH_PASSWORD || token === AUTH_PASSWORD) {
    // Remove password from request body if present
    if (req.body?.password) {
      delete req.body.password;
    }
    return next();
  }

  // No valid authentication
  return res.status(401).json({ 
    error: 'Authentication required',
    message: 'Please provide the shared password'
  });
}

// Login endpoint handler
export function handleLogin(req, res) {
  const { password } = req.body;

  if (password === AUTH_PASSWORD) {
    // In a production app, you'd generate a proper session token here
    // For simplicity, we're just returning the password as a token
    res.json({ 
      success: true,
      token: AUTH_PASSWORD,
      message: 'Login successful'
    });
  } else {
    res.status(401).json({ 
      success: false,
      error: 'Invalid password'
    });
  }
}

// Optional: Check if auth is required
export function isAuthRequired() {
  return process.env.NODE_ENV === 'production' || !!process.env.AUTH_PASSWORD;
}