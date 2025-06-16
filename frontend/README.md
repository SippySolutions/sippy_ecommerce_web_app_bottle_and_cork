# Universal Liquors Frontend

Modern React e-commerce frontend built with Vite, Tailwind CSS, and Framer Motion.

## 🚀 Live Demo
[Universal Liquors](https://your-vercel-url.vercel.app)

## 🛠️ Tech Stack
- **React 19** - Modern React with latest features
- **Vite 6** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and interactions
- **Axios** - HTTP client for API calls
- **React Router** - Client-side routing
- **React Toastify** - Toast notifications

## 📋 Features
- 🛒 Full e-commerce functionality
- 💳 Secure payment processing (Authorize.Net)
- 👤 User authentication and profiles
- 🎨 Dynamic CMS content management
- 📱 Fully responsive design
- 🎯 Age verification system
- ❤️ Wishlist functionality
- 🚚 Checkout and order management
- 🏷️ Promotional banner system

## 🔧 Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file:
```env
VITE_API_BASE_URL=your-backend-url
VITE_MODE=production
VITE_AUTHORIZE_NET_PUBLIC_KEY=your-authorize-net-key
VITE_AUTHORIZE_NET_API_LOGIN_ID=your-login-id
```

### Development Server
```bash
npm run dev        # HTTP (port 3003)
npm run dev:https  # HTTPS (port 3003)
```

### Build for Production
```bash
npm run build
```

## 🚀 Deployment on Vercel

### Automatic Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment
```bash
npm install -g vercel
vercel --prod
```

### Environment Variables in Vercel
Set these in your Vercel dashboard:
- `VITE_API_BASE_URL`
- `VITE_MODE`
- `VITE_AUTHORIZE_NET_PUBLIC_KEY` 
- `VITE_AUTHORIZE_NET_API_LOGIN_ID`

## 📁 Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── Context/            # React Context providers
├── services/           # API services
├── utils/              # Utility functions
├── assets/             # Static assets
└── Data/               # Default/fallback data
```

## 🔒 Security
- No sensitive data logging in production
- Environment variables properly configured
- HTTPS enabled
- Input validation and sanitization

## 📱 Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License
Private - Universal Liquors
