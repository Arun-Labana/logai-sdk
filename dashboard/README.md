# LogAI Web Dashboard

A modern React dashboard for LogAI - the LLM-powered log analyzer and auto-fix engine.

## Features

- 📊 **Application Management** - Register and manage multiple Java applications
- 🔍 **Error Clusters** - View grouped errors with severity indicators
- 🤖 **AI Analysis** - Get AI-powered explanations and root cause analysis
- 🔧 **Patch Generation** - Generate and download code fixes
- 📈 **Scan History** - Track analysis runs over time
- 🌙 **Dark Theme** - Beautiful dark UI optimized for developers

## Quick Start

### Prerequisites

1. A [Supabase](https://supabase.com) account (free tier is sufficient)
2. Your Supabase project set up with the LogAI schema (see `../supabase/setup.md`)
3. Node.js 18 or higher

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your Supabase credentials
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Production Build

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Netlify

1. Push your code to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables in site settings

### GitHub Pages

```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

### OpenAI API Key

The OpenAI API key is stored securely in Supabase and configured through the Settings page in the dashboard. It's never stored in environment variables or client-side code.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Supabase JS** - Database client
- **Lucide React** - Icons
- **date-fns** - Date formatting

## Project Structure

```
dashboard/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── AppSelector.tsx
│   │   ├── ClusterList.tsx
│   │   ├── AnalysisCard.tsx
│   │   ├── PatchViewer.tsx
│   │   └── ScanProgress.tsx
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx
│   │   ├── AppDetail.tsx
│   │   ├── Scan.tsx
│   │   ├── ClusterDetail.tsx
│   │   └── Settings.tsx
│   ├── lib/
│   │   └── supabase.ts  # Supabase client and API functions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Usage

### 1. Register an Application

1. Go to Dashboard or Settings
2. Click "Add Application"
3. Enter a name and description
4. Copy the generated App ID and API Key

### 2. Configure Java Application

Use the App ID in your Java application's Logback configuration:

```xml
<appender name="LOGAI" class="com.logai.remote.RemoteLogAppender">
    <supabaseUrl>${SUPABASE_URL}</supabaseUrl>
    <supabaseKey>${SUPABASE_KEY}</supabaseKey>
    <appId>YOUR_APP_ID</appId>
</appender>
```

### 3. Run a Scan

1. Select your application
2. Click "Run Scan"
3. Choose time range
4. View discovered error clusters

### 4. Analyze Errors

1. Click on an error cluster
2. Click "Analyze with AI"
3. View explanation, root cause, and recommendations
4. Generate and download patches

## Customization

### Theme

Edit `tailwind.config.js` to customize the color scheme:

```js
colors: {
  'logai': {
    'accent': '#00d4ff',  // Change accent color
    // ...
  }
}
```

### Fonts

Edit `index.html` to use different fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=YourFont&display=swap" rel="stylesheet">
```

## License

MIT License

