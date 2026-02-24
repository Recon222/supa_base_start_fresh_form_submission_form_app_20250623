# agent-browser Windows Workaround

## The Problem

`agent-browser` (v0.12.0 and earlier) fails on Windows with:

```
Daemon failed to start (socket: C:\Users\<user>\.agent-browser\default.sock)
```

**Root cause**: Two known bugs in the Rust native binary on Windows:

1. **UNC path crash** ([#393](https://github.com/vercel-labs/agent-browser/issues/393)) -- Rust's `canonicalize()` prepends `\\?\` to paths on Windows, which crashes Node.js when it tries to resolve the daemon module.
2. **Unix socket hardcoding** ([#398](https://github.com/vercel-labs/agent-browser/issues/398)) -- The Rust binary looks for Unix domain sockets (`.sock` files) instead of using TCP on Windows. The Node.js daemon correctly uses TCP, but the Rust client doesn't read the `.port` file.

A fix PR exists ([#440](https://github.com/vercel-labs/agent-browser/pull/440)) but has not been released yet as of Feb 2026.

## The Workaround

Set `AGENT_BROWSER_HOME` to bypass the broken path canonicalization:

```bash
export AGENT_BROWSER_HOME="C:/Users/<your-username>/AppData/Roaming/npm/node_modules/agent-browser"
```

Replace `<your-username>` with your actual Windows username.

With this set, every `agent-browser` command works normally:

```bash
agent-browser open http://localhost:3000
agent-browser snapshot -i
agent-browser click @e2
agent-browser close
```

## Setup Steps (Fresh Machine)

### 1. Install agent-browser globally

```bash
npm install -g agent-browser
```

### 2. Install Chromium

```bash
agent-browser install
```

> **Note**: If `agent-browser install` also fails due to the daemon issue, install Chromium via Playwright directly from the agent-browser package directory:
>
> ```bash
> cd "C:/Users/<your-username>/AppData/Roaming/npm/node_modules/agent-browser"
> npx playwright install chromium
> ```

### 3. Set the environment variable

**Per-session (bash):**

```bash
export AGENT_BROWSER_HOME="C:/Users/<your-username>/AppData/Roaming/npm/node_modules/agent-browser"
```

**Permanent (PowerShell -- recommended):**

```powershell
[Environment]::SetEnvironmentVariable("AGENT_BROWSER_HOME", "$env:APPDATA\npm\node_modules\agent-browser", "User")
```

After setting it permanently, restart your terminal.

### 4. Verify it works

```bash
agent-browser open https://example.com
agent-browser snapshot -i
agent-browser close
```

## Usage with Claude Code

Add this to your project's `CLAUDE.md` so the AI agent uses the workaround automatically:

```markdown
## Browser Automation (agent-browser)

Every agent-browser command must include the env var:

    export AGENT_BROWSER_HOME="C:/Users/<your-username>/AppData/Roaming/npm/node_modules/agent-browser"
    agent-browser open http://localhost:3000
    agent-browser snapshot -i
    agent-browser close
```

## Core Workflow (snapshot-ref pattern)

```bash
# 1. Open a page
agent-browser open http://localhost:3000/upload.html

# 2. Get interactive elements with refs
agent-browser snapshot -i
# Output:
# - textbox "Occurrence Number *" [ref=e3]
# - combobox "Type of Offence *" [ref=e5]
# - button "Submit Request" [ref=e35]

# 3. Interact using refs
agent-browser fill @e3 "PR2024001234"
agent-browser select @e5 "Homicide"
agent-browser click @e35

# 4. Re-snapshot after page changes
agent-browser snapshot -i

# 5. Close when done
agent-browser close
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `Daemon failed to start (socket: ...)` | Set `AGENT_BROWSER_HOME` env var (see above) |
| `Executable doesn't exist at ...chromium-1208...` | Run `npx playwright install chromium` from the agent-browser package dir |
| Daemon won't stop | Delete `~/.agent-browser/default.pid` and `default.port`, then retry |
| Stale daemon after crash | `agent-browser close` or kill the node process manually |

## References

- [GitHub: vercel-labs/agent-browser](https://github.com/vercel-labs/agent-browser)
- [Issue #393: UNC path crash on Windows](https://github.com/vercel-labs/agent-browser/issues/393)
- [Issue #398: Unix sockets instead of TCP on Windows](https://github.com/vercel-labs/agent-browser/issues/398)
- [PR #440: Platform compatibility fix](https://github.com/vercel-labs/agent-browser/pull/440)
