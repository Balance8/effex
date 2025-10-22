# Expo App

This is the Expo React Native app with NativeWind v5 (Tailwind CSS v4) for styling.

## Features

- **Expo SDK 54** - Latest Expo framework
- **React Native 0.81** - Latest React Native
- **React 19** - Latest React
- **Expo Router** - File-based routing
- **NativeWind v5** - Tailwind CSS v4 for React Native
- **TypeScript** - Full type safety
- **Effect-TS** - Functional programming with Effect

## Getting Started

### Prerequisites

- Node.js 20+
- iOS Simulator (for iOS development)
- Android Studio (for Android development)
- Expo Go app (for quick testing)

### Development

Start the Expo development server:

```bash
{{packageManager}} run dev:expo
```

Or from the expo directory:

```bash
cd apps/expo
{{packageManager}} run dev
```

### Running on Devices

#### iOS Simulator

```bash
{{packageManager}} run dev:ios
```

#### Android Emulator

```bash
{{packageManager}} run dev:android
```

#### Physical Device

Scan the QR code with the Expo Go app (iOS) or Camera app (Android).

## Styling with NativeWind v5

This app uses NativeWind v5, which brings Tailwind CSS v4 to React Native. You can use Tailwind classes directly in your components:

```tsx
<View className="bg-background p-4">
  <Text className="text-foreground text-xl font-bold">
    Hello World
  </Text>
</View>
```

The theme is shared with the web app via `@workspace/tailwind-config/theme`.

## Project Structure

```
apps/expo/
├── src/
│   ├── app/              # Expo Router pages
│   │   ├── _layout.tsx   # Root layout
│   │   └── index.tsx     # Home page
│   ├── utils/            # Utility functions
│   └── styles.css        # Global styles with NativeWind
├── assets/               # Images and other assets
├── app.config.ts         # Expo configuration
├── metro.config.js       # Metro bundler config with NativeWind
└── package.json
```

## Building for Production

### EAS Build

This project is configured for EAS Build. To build for production:

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Configure your project:

```bash
eas build:configure
```

3. Build for iOS:

```bash
eas build --platform ios
```

4. Build for Android:

```bash
eas build --platform android
```

See [EAS Build documentation](https://docs.expo.dev/build/introduction/) for more details.

