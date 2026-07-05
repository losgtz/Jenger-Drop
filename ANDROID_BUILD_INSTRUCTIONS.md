# Jenger Drop Android Build Instructions for Cursor

Cursor, please execute the following steps to wrap our Next.js App Router project into a native Android application using Capacitor. 

Do not ask me to do this manually. Please run the terminal commands and edit the configuration files yourself.

### Step 1: Install Dependencies
Run the following commands in the terminal to install Capacitor:
1. `npm install @capacitor/core`
2. `npm install -D @capacitor/cli`
3. `npm install @capacitor/android`

### Step 2: Initialize Capacitor
Run `npx cap init` programmatically or create a `capacitor.config.ts` file manually at the root of the project with the following exact config:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jengerluxurious.drop',
  appName: 'Jenger Drop',
  webDir: 'out',
  bundledWebRuntime: false
};

export default config;
```

### Step 3: Configure Next.js for Static Export
Modify `next.config.ts` to include `output: "export"`.
*Note: Because we are using Next.js App Router with an API route (`/api/checkout` and `/api/telegram-request`), a static export (`out`) will normally fail because API routes require a Node.js server. Please convert our API routes to Server Actions, or advise on using a dynamic Capacitor setup if a pure static export breaks the Stripe/Telegram backend.*

### Step 4: Add Android Platform
Once the config is created, run the following terminal commands:
1. `npm run build`
2. `npx cap add android`
3. `npx cap sync android`

If you encounter any build errors regarding the Next.js `export` conflicting with our API routes, halt and let me know the best workaround for Capacitor.
