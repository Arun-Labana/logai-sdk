# LogAI - LLM-Powered Java Log Analyzer & Auto-Fix Engine

LogAI is an intelligent log analysis tool that automatically identifies error patterns, explains root causes using AI, and generates code fixes for Java applications.

## Features

- **Smart Error Clustering** - Groups similar errors by stack trace fingerprinting and message similarity
- **Code-Aware Debugging** - Extracts source code context around error locations
- **AI-Powered Analysis** - Uses OpenAI GPT-4 to explain errors and suggest fixes
- **Automatic Patch Generation** - Creates unified diff patches for identified bugs
- **Zero-Latency Impact** - Runs offline, separate from your application
- **Beautiful Reports** - Generates HTML, Markdown, and JSON reports

## Quick Start

### 1. Build the Project

```bash
cd logai
mvn clean package -DskipTests
```

### 2. Configure OpenAI API Key

```bash
export OPENAI_API_KEY='your-api-key-here'
```

Or create a config file:
```bash
mkdir -p ~/.logai
cat > ~/.logai/config.yaml << EOF
openai:
  api_key: \${OPENAI_API_KEY}
  model: gpt-4o
database:
  path: ./logai.db
source:
  paths:
    - ./src/main/java
EOF
```

### 3. Add LogAI SDK to Your Application

Add the dependency to your `pom.xml`:
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
    <appender-ref ref="CONSOLE"/>
    <appender-ref ref="LOGAI"/>
</root>
```

### 4. Analyze Logs

```bash
# Scan recent logs
java -jar logai-cli/target/logai.jar scan --last 1h

# Scan with AI analysis
java -jar logai-cli/target/logai.jar scan --last 1h --analyze

# View error clusters
java -jar logai-cli/target/logai.jar clusters

# Inspect a specific cluster
java -jar logai-cli/target/logai.jar clusters ERR-12345678

# Generate a fix
java -jar logai-cli/target/logai.jar fix --generate ERR-12345678

# Apply a patch (dry run)
java -jar logai-cli/target/logai.jar fix --apply logai-fixes/MyClass_ERR-12345678.diff --dry-run

# Generate a report
java -jar logai-cli/target/logai.jar report --format html -o report.html
```

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

### `logai config`
Manage configuration.

```
Options:
  --list, -l       List all config values
  --set, -s        Set a config value
  --init           Initialize config with defaults
```

## Architecture

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
│   (scan)        │     │  Clusterer      │     │   (GPT-4)       │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┘
                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Code Context   │────▶│   Insight       │────▶│   Patch         │
│  Extractor      │     │   Generator     │     │   Generator     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Modules

| Module | Description |
|--------|-------------|
| `logai-core` | Domain models, stack trace parser, error clusterer |
| `logai-sdk` | Logback appender, log enricher, SQLite storage |
| `logai-llm` | OpenAI client, prompt builder, insight generator |
| `logai-cli` | Picocli commands for the CLI |
| `logai-report` | HTML, Markdown, JSON report generators |

## How Error Clustering Works

LogAI groups similar errors using multiple strategies:

1. **Stack Trace Fingerprinting** - Hash of top 5 non-framework stack frames
2. **Message Similarity** - Levenshtein distance after normalizing variables
3. **Location Matching** - Same file + line + method

This ensures errors like "User 12345 not found" and "User 67890 not found" are grouped together.

## Example Output

```
╔══════════════════════════════════════════════════════════════╗
║                    LogAI Error Scanner                        ║
╚══════════════════════════════════════════════════════════════╝

📊 Scanning logs from 2024-01-15T09:00:00Z to 2024-01-15T10:00:00Z
📁 Database: logai.db

🔍 Found 156 error entries

📦 Grouped into 12 unique error clusters

┌──────────────────────────────────────────────────────────────┐
│ Top Error Clusters                                           │
├──────────────────────────────────────────────────────────────┤
│ 🔴 ERR-A1B2C3D4 │  89 occurrences │ NullPointerException     │
│   └─ Location: OrderService.processOrder:23                  │
├──────────────────────────────────────────────────────────────┤
│ 🟠 ERR-E5F6G7H8 │  34 occurrences │ IllegalStateException    │
│   └─ Location: PaymentService.charge:89                      │
└──────────────────────────────────────────────────────────────┘
```

## Requirements

- Java 17+
- Maven 3.8+
- OpenAI API key (for AI analysis features)

## License

MIT License

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

