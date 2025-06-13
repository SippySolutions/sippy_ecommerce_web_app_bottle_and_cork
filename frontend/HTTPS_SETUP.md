# HTTPS Setup for Accept.js Payment Processing

## Issue
Authorize.Net Accept.js requires HTTPS for payment processing, even in development.

## Quick Solution: Development Bypass Mode
If you're experiencing SSL/HTTPS errors, you can use HTTP development mode with payment simulation:

```bash
npm run dev:http
```

This will:
- Run the server on HTTP (http://localhost:3003)
- Automatically enable development bypass mode
- Simulate payment processing for testing
- Show a blue "Development Mode" banner in the payment form

## Production HTTPS Solutions

### Option 1: Use HTTPS Development Server
```bash
npm run dev:https
```
- Browser will show security warning
- Click "Advanced" → "Proceed to localhost"
- Accept.js will work normally

### Option 2: Manual HTTPS with mkcert (Recommended for frequent development)
1. Install mkcert: https://github.com/FiloSottile/mkcert
2. Create trusted certificates:
   ```bash
   mkcert -install
   mkcert localhost 127.0.0.1 ::1
   ```
3. Update vite.config.js to use the certificates
4. Restart server with `npm run dev`

## Testing Payment Processing

### Development Mode (HTTP)
- Forms work normally but payments are simulated
- Check browser console for mock payment tokens
- Good for UI/UX testing

### HTTPS Mode  
- Full Accept.js integration
- Real payment token generation
- Use for integration testing

## Troubleshooting

### SSL Version/Cipher Mismatch Error
- Use `npm run dev:http` for immediate testing
- Clear browser cache and try HTTPS again
- Consider using mkcert for trusted certificates

### Accept.js Not Loading
- Check browser network tab for blocked requests
- Ensure environment variables are set in .env file
- Verify HTTPS is properly configured
