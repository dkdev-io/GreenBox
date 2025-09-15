# Green Box Project Port Configuration

## Standard Port: 3010

**All Green Box project scripts and configurations MUST use port 3010 for consistency.**

## Current Configuration:
- React Native Metro bundler: `localhost:3010` ✅
- Local invite redirect page: `localhost:3010` ✅
- Development server: `localhost:3010` ✅

## Files that will reference the port:
- `metro.config.js` - server port: 3010
- Local invite redirect HTML page
- Development and testing scripts
- React Native app configuration

## ⚠️ IMPORTANT: Before adding new scripts
When creating new test scripts, browser automation, or any configuration that needs to connect to the local app:

1. **Always use `http://localhost:3010`**
2. **Never hardcode ports 3000, 3001, 8081, or any other port**
3. **Check this file if unsure about the correct port**

## Commands to Prevent Agent Port Sprawl for Green Box
```bash
# Before starting Green Box dev server, kill existing ones from this directory
cd /Users/Danallovertheplace/greenbox
pkill -f "metro.*greenbox" || pkill -f "node.*greenbox" || true
npm run start

# Check for duplicate Green Box processes on port 3010
lsof -iTCP:3010 -sTCP:LISTEN -n -P

# Emergency cleanup: Kill all Green Box-related node processes
pkill -f "node.*greenbox" || pkill -f "/Users/Danallovertheplace/greenbox" || true
```

## Quick verification command:
```bash
grep -r "localhost:30[0-9][0-9]" . --exclude-dir=node_modules
```
This should ONLY return references to port 3010 for Green Box project.

## Port Conflicts to Avoid:
- Port 3000: Reserved for Storey project
- Port 5000: Used by ControlCenter
- Port 7000: Used by ControlCenter
- Port 8081: Default React Native Metro port (avoided for consistency)