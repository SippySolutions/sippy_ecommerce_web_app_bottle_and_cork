# 📱 Mobile App Resources

This directory contains all the resources needed for your mobile app:

## 📂 Directory Structure
```
resources/
├── icon.png                    # 1024x1024 app icon (source)
├── splash.png                  # 2732x2732 splash screen (source)
├── android/
│   ├── icon/                   # Android app icons (generated)
│   └── splash/                 # Android splash screens (generated)
└── ios/
    ├── icon/                   # iOS app icons (generated)
    └── splash/                 # iOS splash screens (generated)
```

## 🎨 Icon Requirements

### Source Icon (icon.png)
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Background**: Should include background (not transparent)
- **Safe Area**: Keep important content within 860x860 center area
- **Quality**: High resolution, crisp edges

### Source Splash (splash.png)
- **Size**: 2732x2732 pixels
- **Format**: PNG
- **Background**: Solid color recommended
- **Content**: Logo/branding centered
- **Safe Area**: Keep content within 1200x1200 center area

## 🔧 Generating Resources

After placing your source files, run:

```bash
# Install Capacitor resources plugin
npm install -g @capacitor/assets

# Generate all platform-specific resources
npx @capacitor/assets generate --iconBackgroundColor '#ffffff' --iconBackgroundColorDark '#000000' --splashBackgroundColor '#ffffff' --splashBackgroundColorDark '#000000'
```

## 📋 Platform Specific Notes

### Android
- Adaptive icons supported
- Multiple densities generated automatically
- Splash screen with proper aspect ratios

### iOS
- All required icon sizes generated
- Launch images for all device sizes
- Support for dark mode variants

## 🎯 Best Practices

1. **High Quality Source**: Always start with high-resolution source files
2. **Simple Design**: Icons should be recognizable at small sizes
3. **Brand Consistency**: Use your brand colors and style
4. **Testing**: Test on real devices for best results
5. **Accessibility**: Ensure good contrast ratios

## 🚀 Next Steps

1. Replace the default `icon.png` and `splash.png` with your designs
2. Run the resource generation command
3. Test on devices to verify appearance
4. Update app store listings with the same assets
