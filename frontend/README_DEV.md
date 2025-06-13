# Frontend Development Setup

## SSL/HTTPS Issues with Accept.js?

If you're experiencing SSL errors when trying to run the development server with HTTPS, use this quick solution:

```bash
# Use HTTP development mode with payment simulation
npm run dev:http
```

This will:
- Start the server on http://localhost:3003
- Enable development bypass mode for payments
- Allow you to test the checkout flow without HTTPS

## Available Scripts

- `npm run dev` - Development server with HTTPS (may show SSL warnings)
- `npm run dev:http` - Development server with HTTP + payment bypass
- `npm run dev:https` - Force HTTPS mode
- `npm run build` - Build for production

## Payment Testing

The payment form will automatically detect if you're running in HTTP development mode and show a blue "Development Mode" banner. Payments will be simulated but you can test the full checkout flow.

For production testing with real Accept.js, use the HTTPS mode and accept the browser security warning.

## Environment Variables

Make sure your `.env` file has:
```
VITE_AUTHORIZE_NET_PUBLIC_KEY=your_public_key
VITE_AUTHORIZE_NET_API_LOGIN_ID=your_api_login_id
```
