# LogAI - LLM-Powered Java Log Analyzer & Auto-Fix Engine

LogAI is an intelligent log analysis tool that automatically identifies error patterns, explains root causes using AI, and generates code fixes for Java applications.

## Features

- **Smart Error Clustering** - Groups similar errors by stack trace fingerprinting and message similarity
- **Code-Aware Debugging** - Extracts source code context around error locations
- **AI-Powered Analysis** - Uses OpenAI GPT-4 to explain errors and suggest fixes
- **Automatic Patch Generation** - Creates unified diff patches for identified bugs
- **Web Dashboard** - Modern React-based UI for visual log analysis
- **Remote Logging** - Centralized log storage with Supabase (free tier)
- **Beautiful Reports** - Generates HTML, Markdown, and JSON reports

---

## Quick Start

### Option 1: Local CLI (Offline)

For local-only usage with SQLite storage:

#### 1. Build the Project

```bash
cd logai
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
mvn clean package -DskipTests
```

#### 2. Configure OpenAI API Key

```bash
export OPENAI_API_KEY='your-api-key-here'
```

#### 3. Add LogAI SDK to Your Application

```xml
<dependency>
    <groupId>com.logai</groupId>
    <artifactId>logai-sdk</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

Configure Logback (`src/main/resources/logback.xml`):
```xml
<appender name="LOGAI" class="com.logai.sdk.LogAIAppender">
    <dbPath>logai.db</dbPath>
    <threshold>WARN</threshold>
</appender>

<root level="INFO">
    <appender-ref ref="LOGAI"/>
</root>
```

#### 4. Analyze Logs with CLI

```bash
java -jar logai-cli/target/logai.jar scan --last 1h --analyze
java -jar logai-cli/target/logai.jar clusters
java -jar logai-cli/target/logai.jar fix --generate ERR-12345678
```

---

### Option 2: Web Dashboard (Remote)

For centralized logging with a web UI - **100% free infrastructure**.

#### 1. Set Up Supabase (5 minutes)

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the contents of `supabase/schema.sql`
4. Copy your Project URL and anon key from Settings → API

See `supabase/setup.md` for detailed instructions.

#### 2. Deploy the Dashboard

```bash
cd dashboard
npm install

# Create .env file
echo "VITE_SUPABASE_URL=https://your-project.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=your-anon-key" >> .env

# Run locally
npm run dev

# Or build for production
npm run build
# Deploy dist/ folder to Vercel, Netlify, or GitHub Pages (all free)
```

#### 3. Configure Remote Logging

Add the remote SDK to your Java application:

```xml
<dependency>
    <groupId>com.logai</groupId>
    <artifactId>logai-remote</artifactId>
    <version>1.0.0-SNAPSHOT</version>
</dependency>
```

Configure Logback for remote logging:
```xml
<appender name="LOGAI_REMOTE" class="com.logai.remote.RemoteLogAppender">
    <supabaseUrl>${SUPABASE_URL}</supabaseUrl>
    <supabaseKey>${SUPABASE_KEY}</supabaseKey>
    <appId>your-app-id-from-dashboard</appId>
    <threshold>WARN</threshold>
    <batchSize>50</batchSize>
    <flushIntervalMs>5000</flushIntervalMs>
</appender>

<root level="INFO">
    <appender-ref ref="LOGAI_REMOTE"/>
</root>
```

#### 4. Use the Dashboard

1. Open the dashboard in your browser
2. Go to Settings and enter your OpenAI API key
3. Add your application and copy the App ID
4. Start your Java app with the remote appender configured
5. Click "Run Scan" to analyze errors
6. View AI-generated explanations and fixes

---

## Web Dashboard Features

| Feature | Description |
|---------|-------------|
| **App Management** | Register multiple applications |
| **Error Clusters** | View grouped errors with severity badges |
| **AI Analysis** | Get explanations and root cause analysis |
| **Patch Generation** | Download unified diff patches |
| **Scan History** | Track analysis runs over time |
| **Real-time Updates** | See logs as they arrive |

---

## CLI Commands

### `logai scan`
Scan and analyze recent logs for errors.

```
Options:
  --last, -l       Time range to scan (e.g., 1h, 30m, 7d). Default: 1h
  --db, -d         Database path
  --analyze, -a    Analyze errors with LLM
  --limit, -n      Limit number of clusters to analyze
  --verbose, -v    Verbose output
```

### `logai clusters`
List and inspect error clusters.

```
Options:
  <cluster-id>     Cluster ID to inspect (optional)
  --limit, -n      Maximum clusters to show
  --last, -l       Time range
  --verbose, -v    Show stack traces
```

### `logai fix`
Generate and apply code fixes.

```
Options:
  --generate, -g   Generate a fix for a cluster
  --apply, -a      Apply a patch file
  --dry-run        Preview changes without applying
  --list, -l       List available patches
```

### `logai report`
Generate health reports.

```
Options:
  --format, -f     Report format: html, json, md (default: md)
  --output, -o     Output file path
  --last, -l       Time range
```

---

## Architecture

### Local Mode
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Your Java App  │────▶│   LogAI SDK     │────▶│  SQLite DB      │
│  (Logback)      │     │  (Appender)     │     │  (logai.db)     │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┘
                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   LogAI CLI     │────▶│  Error          │────▶│   OpenAI API    │
│                 │     │  Clusterer      │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Remote Mode
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Your Java App  │────▶│  LogAI Remote   │────▶│   Supabase      │
│  (Logback)      │     │  (HTTP Client)  │     │   PostgreSQL    │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┤
                        ▼                                ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Web Dashboard  │◀────│  Edge Functions │────▶│   OpenAI API    │
│  (React)        │     │  (Deno)         │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Modules

| Module | Description |
|--------|-------------|
| `logai-core` | Domain models, stack trace parser, error clusterer |
| `logai-sdk` | Logback appender, log enricher, SQLite storage |
| `logai-remote` | Remote logging to Supabase |
| `logai-llm` | OpenAI client, prompt builder, insight generator |
| `logai-cli` | Picocli commands for the CLI |
| `logai-report` | HTML, Markdown, JSON report generators |
| `dashboard` | React web dashboard |
| `supabase` | Database schema and Edge Functions |

---

## Cost Summary

All infrastructure is free except OpenAI API usage:

| Service | Free Tier | Cost |
|---------|-----------|------|
| Supabase DB | 500MB, 50K rows | Free |
| Supabase Edge Functions | 500K invocations/mo | Free |
| Vercel/Netlify | Hosting | Free |
| OpenAI API | Pay per use | ~$0.01-0.10/analysis |

---

## Requirements

- Java 17+
- Maven 3.8+
- Node.js 18+ (for dashboard)
- OpenAI API key (for AI analysis features)

---

## License

MIT License

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.
