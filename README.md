# 🛡️ CommandGuard

> **Never run a dangerous command again.**

CommandGuard is an AI-powered terminal safety layer that intercepts risky commands before they execute. It leverages **GitHub Copilot CLI** to explain what a command does and suggests safer alternatives.

## 🚀 Features

- **Real-time Interception**: Hooks into your shell (`bash`, `zsh`) to catch commands on the fly.
- **AI Analysis**: Uses GitHub Copilot to understand the *intent* of a command, not just regex matching.
- **Risk Assessment**: Classifies commands by severity.
- **Educational**: Explains *why* a command is flagged and teaches safer habits.
- **Cross-Platform**: Works on macOS, Linux, and Windows (via PowerShell or WSL).

## 📦 Installation

Prerequisites:
- Node.js (v16+)
- GitHub CLI (`gh`) with Copilot extension installed (`gh extension install github/gh-copilot`)

### From Source

```bash
git clone https://github.com/Aryakoste/commandguard.git
cd commandguard
npm install
npm run build
npm link
commandguard setup
```

### Install via npm (Public Registry)

```bash
npm install -g commandguard
commandguard setup
```

### Install via GitHub

```bash
npm install -g github:Aryakoste/commandguard
commandguard setup
```

### Install from Source (For development)

## 🛠️ Usage

Once installed and set up, CommandGuard runs automatically in your terminal.

1.  **Type a command.**
    ```bash
    rm -rf /
    ```
2.  **CommandGuard intercepts.**
    It checks if the command matches known dangerous patterns.
3.  **AI Analysis.**
    If flagged, it asks GitHub Copilot for a detailed explanation and risk assessment.
4.  **Decision Time.**
    You get a beautiful prompt:
    - 🚫 **Abort**: Stop the command.
    - ✅ **Proceed**: Run it anyway (if you really mean it).
    - 💡 **Alternative**: Run a suggested safer command.

## ⚙️ Configuration

You can customize CommandGuard's sensitivity and rules.

```bash
commandguard config
```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
