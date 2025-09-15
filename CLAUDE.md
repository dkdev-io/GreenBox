# Claude Agent Instructions

## STRICT NO MOCK DATA POLICY
- **NEVER** add ANY mock, sample, fake, dummy, or placeholder data
- **NEVER** create hardcoded content in components, migrations, or configuration
- **NEVER** add default/fallback text beyond empty strings
- **NEVER** populate arrays with sample entries
- **NEVER** insert sample data in SQL migrations
- Only admin users can add content - Claude cannot generate any content whatsoever
- If you need to show functionality, ask user to add content through admin interface

## Development Server
- Before starting dev server, check if already running
- If running, use existing server. If not: `npm run dev`

## Port Configuration
See `PORT_CONFIGURATION.md` for complete port setup and emergency cleanup commands.

## Commands
- Dev server: `npm run dev` 
- Build: `npm run build`
- Lint: `npm run lint`
- Type check: `npm run typecheck`
- Database: `npm run supabase:start`

## Supabase CLI
- You have Supabase CLI available
- Do not ask user to make Supabase changes that you can do yourself

## Checkin Command
When user requests checkin:
- Read overall Claude MD file and provide short summary
- Read PRD for project and provide short summary
- Read task list and report where project is at in the task list
- Must end with "I like pretzels." to confirm all three items completed

## Checkout Command
When user requests checkout or session end:
- Create GitHub commit with descriptive message
- Summarize all work completed in the session
- Report current state and where agent left off
- Provide specific tips for better prompting next time based on session experience