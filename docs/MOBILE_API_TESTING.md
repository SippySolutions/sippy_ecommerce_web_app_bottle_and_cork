# 📱 Mobile App Testing Guide with Render.com API

This guide helps you test your Universal Liquors mobile app with your Render.com API backend.

## 🔧 Quick Setup

### 1. **Configure Your API**
Your API is already configured for:
- **API URL**: `https://univeral-liquors-webapp-test.onrender.com/api`
- **Timeout**: 15 seconds (for Render.com cold starts)
- **Retry Logic**: 3 attempts with smart retry
- **Mobile Detection**: Automatic platform detection

### 2. **Environment Files**
- **`.env.production`**: Production configuration with your Render.com API
- **`.env.mobile`**: Mobile-specific settings
- **Use the correct environment**:
  ```bash
  # Development with your API
  npm run build:mobile-dev
  
  # Production build
  npm run build:mobile
  ```

## 🧪 Testing Process

### **Step 1: Build and Sync**
```bash
# Build for mobile with your API
npm run build:mobile

# Sync to platforms
npm run cap:sync
```

### **Step 2: Test on Android**
```bash
# Run with live reload
npm run android:dev

# Or open in Android Studio
npx cap open android
```

### **Step 3: Test on iOS** (macOS only)
```bash
# Run with live reload
npm run ios:dev

# Or open in Xcode
npx cap open ios
```

## 🌐 API Features in Mobile App

### **Render.com Cold Start Handling**
Your app automatically handles Render.com's cold starts:
- ✅ **Automatic Retry**: Up to 3 attempts
- ✅ **Smart Delays**: Waits for server warmup
- ✅ **User Feedback**: Shows warming up message
- ✅ **Graceful Fallback**: Handles failed requests

### **Network Status Detection**
- ✅ **Offline Detection**: Shows offline screen
- ✅ **Connection Quality**: Displays connection status
- ✅ **Auto-Reconnect**: Warms up API when back online

### **Mobile-Specific Features**
- ✅ **Request Headers**: Identifies mobile app requests
- ✅ **Platform Detection**: iOS/Android specific handling
- ✅ **Enhanced Timeouts**: Longer timeouts for mobile networks
- ✅ **Retry Logic**: Smart retry for network issues

## 🔍 Testing Scenarios

### **1. Test API Connection**
```javascript
// In browser console or app
import { warmupAPI } from './src/services/mobileApi.js';
await warmupAPI();
```

### **2. Test Cold Start Handling**
1. Wait 15+ minutes for your Render.com server to sleep
2. Open the mobile app
3. Should show "Getting Ready..." message
4. App should work normally after warmup

### **3. Test Offline/Online**
1. Turn off internet on device
2. Should show offline screen
3. Turn internet back on
4. Should automatically reconnect and warm up API

### **4. Test Network Quality**
Enable debug mode in `.env.mobile`:
```env
VITE_DEBUG_MODE=true
```
- Shows connection quality indicator
- Logs API requests in console

## 📊 API Monitoring

### **Request Headers**
Your mobile app sends these headers to help you identify mobile traffic:
```
User-Agent: UniversalLiquors-Mobile/1.0.0
X-Mobile-App: true
X-App-Platform: android|ios
```

### **Debug Information**
Enable debug logging:
```env
VITE_DEBUG_MODE=true
VITE_ENABLE_LOGS=true
VITE_LOG_LEVEL=debug
```

## 🚨 Troubleshooting

### **Common Issues**

**1. "API not responding"**
- Check if your Render.com service is running
- Wait for cold start (up to 30 seconds)
- Verify API URL is correct

**2. "Network Error"**
- Check device internet connection
- Try switching between WiFi and mobile data
- Restart the app

**3. "Authentication Failed"**
- Clear app data and re-login
- Check if tokens are being stored correctly
- Verify API authentication endpoints

**4. "App won't build"**
```bash
# Clean and rebuild
npm run mobile:clean
npm run cap:build
```

### **Debug Commands**

**Check API Connection**:
```bash
# Test API manually
curl https://univeral-liquors-webapp-test.onrender.com/api/health
```

**View Network Requests**:
- **Android**: Chrome DevTools (chrome://inspect)
- **iOS**: Safari Web Inspector (Safari → Develop)

**Check App Logs**:
- **Android**: `adb logcat`
- **iOS**: Xcode Console

## 📱 Device Testing

### **Android Testing**
1. **Enable Developer Options**:
   - Settings → About Phone → Tap Build Number 7 times
   - Settings → Developer Options → Enable USB Debugging

2. **Connect Device**:
   ```bash
   adb devices  # Should show your device
   npm run android:dev  # Run with live reload
   ```

3. **Test Features**:
   - Age verification
   - Product browsing
   - Shopping cart
   - Checkout process
   - Network connectivity

### **iOS Testing** (macOS only)
1. **Connect Device**:
   - Trust computer when prompted
   - Ensure device is registered in Apple Developer account

2. **Build and Run**:
   ```bash
   npm run ios:dev  # Run with live reload
   ```

3. **Test Features**:
   - Same as Android testing
   - Additional iOS-specific features

## 🔧 Performance Optimization

### **API Performance**
- **Render.com keeps your server warm** with regular requests
- **Request caching** for static data
- **Retry logic** handles network issues
- **Timeout optimization** for mobile networks

### **Mobile Performance**
- **Bundle optimization** for faster loading
- **Image lazy loading** to save bandwidth
- **Offline caching** for better UX
- **Background sync** when connection restored

## 📊 Production Checklist

Before deploying to app stores:

### **API Configuration**
- [ ] Verify production API URL
- [ ] Test with production data
- [ ] Confirm SSL certificate
- [ ] Check CORS settings
- [ ] Verify authentication flows

### **Mobile App**
- [ ] Test on real devices
- [ ] Verify age verification
- [ ] Test payment processing
- [ ] Check offline functionality
- [ ] Verify push notifications (if implemented)

### **Performance**
- [ ] Test cold start handling
- [ ] Verify network error handling
- [ ] Check memory usage
- [ ] Test on slow connections
- [ ] Verify battery usage

## 🎯 Next Steps

1. **Test thoroughly** on real devices
2. **Monitor API performance** during testing
3. **Optimize based on results**
4. **Prepare for store submission**
5. **Set up production monitoring**

## 📞 Support

**API Issues**:
- Check Render.com dashboard
- Monitor server logs
- Verify API endpoints

**Mobile App Issues**:
- Check device logs
- Use debug mode
- Test network connectivity
- Verify app permissions

---

Your Universal Liquors mobile app is now configured to work seamlessly with your Render.com API, handling cold starts and network issues gracefully! 🚀📱
