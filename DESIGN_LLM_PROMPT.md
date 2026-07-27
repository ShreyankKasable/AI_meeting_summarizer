# MeetAI Design LLM Prompt

Use this prompt with a design-focused LLM to generate a proper high-fidelity UI direction for this project.

```text
You are an expert Product Designer, UI/UX Designer, SaaS Design System Architect, and Senior Frontend Designer.

I have an existing application called MeetAI, an AI Meeting Summarizer.

The product lets users:
- Create and host meetings
- Record meeting audio
- View a live transcript while recording
- Process meetings into transcript, summary, action items, and AI chat
- Ask questions about a meeting
- Export meeting notes to Notion
- Share processed meetings with participants using secure links
- Configure AI providers and integrations in settings

Your task is to design a production-grade SaaS UI for this application.

The final design should look like a polished real startup product, not a student project.

Design quality target:
- Linear
- Vercel
- Notion
- OpenAI
- Stripe
- Clerk
- Supabase
- Cursor
- Perplexity

Important:
Do not design only a generic landing page.
Design the actual product UI screens in depth.

Do not change the product functionality.
Keep all existing app behavior and flows intact.
Only redesign the visual experience, UX structure, layout, hierarchy, and components.

The app has these main areas:

1. Public Landing Page
2. Login Page
3. Register Page
4. Join Meeting Page
5. Host Dashboard
6. New Meeting Modal
7. Live Recording Screen
8. Meeting Detail Screen
9. Transcript Pane
10. AI Chat Panel
11. Summary Panel
12. Action Items Panel
13. Share Meeting Screen
14. Participant Shared Meeting View
15. Settings Page
16. AI Providers Settings
17. Integrations Settings
18. Notifications Placeholder
19. Invalid / Expired Link Screen

Overall Product Personality:
- Calm
- Intelligent
- Trustworthy
- Minimal
- Premium
- Focused
- Productivity-first
- Built for professional teams

Avoid:
- Generic startup gradients everywhere
- Overly playful visuals
- Too many nested cards
- Huge marketing-style dashboard sections
- Purple-blue SaaS cliche palette
- Low-contrast gray text
- Random decorative blobs
- Excessive glassmorphism
- Oversized whitespace that makes the product feel empty
- Dense UI that feels old or enterprise-heavy

Use a modern SaaS visual system:
- Neutral background palette
- One confident accent color
- Subtle secondary colors for status
- Excellent typography hierarchy
- 8px spacing rhythm
- 8-12px radius for most UI
- Soft shadows only for elevated surfaces
- Clear focus states
- Clean borders
- Responsive layouts
- Subtle motion

Preferred Design Direction:
Create a modern productivity SaaS interface with a light neutral base, refined surfaces, high-quality cards, clear hierarchy, and an elegant accent color. The app should feel focused and credible, closer to Linear / Vercel / OpenAI than to a generic marketing template.

Do not make the UI too decorative.
The product content should be the hero.

Screen Requirements:

Landing Page:
Design a polished public landing page before authentication.

Include:
- Sticky responsive navbar
- Logo
- Features
- Pricing placeholder
- About
- Contact
- Sign In
- Register / Get Started CTA
- Hero section with product-first messaging
- Product UI mockup or screenshot-style preview
- Features section
- Benefits section
- How it works section
- Testimonial placeholder
- FAQ section
- Footer

Hero headline should be simple and product-specific.
Example direction:
"MeetAI"

Supporting copy should explain the value:
"Record meetings, generate summaries, track action items, and share searchable AI-powered notes."

The hero visual should look like the actual app interface:
- Transcript panel
- AI summary card
- Action items
- Recording waveform
- Meeting metadata

Authentication:
Design login/register/join screens using a modern split layout.

Include:
- Left side form
- Right side product visual / illustration / app preview
- Logo
- Clean form card
- Email/password fields
- Password visibility toggle
- Social login placeholders
- Clear validation messages
- CTA button
- Link between login/register/join modes

Dashboard:
Design a professional SaaS dashboard.

Include:
- Sidebar navigation
- Logo and workspace label
- User profile menu
- Dashboard header
- Search input
- New Meeting button
- Stats cards:
  - Total meetings
  - Processed meetings
  - Open action items
  - Participants
- Meeting cards or table
- Empty state for no meetings
- Loading skeletons
- Responsive mobile layout

Dashboard should feel like an operational workspace, not a marketing page.

Live Recording Screen:
Design a focused recording experience.

Include:
- Live recording badge
- Meeting title
- Large timer
- Audio waveform visualization
- Live transcript panel
- Stop recording button
- Disabled pause/marker controls if not implemented
- Processing state with progress indicator

The recording screen should feel calm, focused, and high-confidence.

Meeting Detail Screen:
This is the core product screen.

Design a split workspace:
- Main transcript area on the left
- AI/chat/summary/actions side panel on the right

Header:
- Meeting title
- Date
- Export to Notion button
- Share button
- Meeting stats

Transcript Pane:
- Search transcript
- Translate dropdown
- Download transcript button
- Speaker turns with avatars
- Timestamps
- Rename speaker affordance for host
- Empty state
- Translating skeleton state
- Audio scrubber at bottom

AI Chat Panel:
- Empty state prompting user to ask about meeting
- Message bubbles for user and AI
- AI avatar
- Thinking/loading state
- Textarea input
- Send button
- Keyboard-friendly layout

Summary Panel:
- Readable formatted summary
- Empty state when summary is unavailable

Action Items Panel:
- Action cards
- Checkbox completion
- Priority badges
- Assignee
- Due date
- Empty state

Share Meeting Screen:
Design a secure sharing workflow.

Include:
- Meeting share header
- Generated share link box
- Copy button with copied state
- Expiration dropdown
- Revoke/regenerate token button
- Email button
- View meeting button
- Security explanation side panel
- Loading state while share link is created

Participant Shared View:
Design a read-only external meeting view.

Include:
- Sticky lightweight top nav
- MeetAI logo
- Shared access badge
- Meeting title/date
- Transcript
- AI chat
- Summary
- Action items read-only
- Loading skeleton
- Invalid token handling

Settings:
Design a professional settings area.

Include:
- Settings page header
- Side/tab navigation
- AI Providers
- Integrations
- Notifications placeholder
- Saving status
- Last saved state
- Provider cards

AI Provider Cards:
Each provider should show:
- Provider name
- Connected/not configured badge
- API key input
- Model input where relevant
- Save-on-blur UX
- Clear helper text

Providers:
- Deepgram
- AssemblyAI
- Hugging Face
- OpenAI
- Anthropic
- Euron

Integrations:
- Notion integration card
- Connected state
- API key input

Notifications:
Design as a placeholder, but make it look intentional.
Show disabled toggles for future notification preferences.

Invalid Link Screen:
Design a polished error state.

Include:
- MeetAI logo
- Clear expired/invalid access message
- Home button
- Contact support button
- Manual token input
- Validate token button
- Error validation state

Component System:
Create a reusable component design system.

Include:
- Buttons:
  - Primary
  - Secondary
  - Ghost
  - Danger
  - Disabled
  - Loading
- Inputs:
  - Default
  - Focus
  - Error
  - Password
  - With icon
- Badges:
  - Neutral
  - Success
  - Warning
  - Danger
  - Info
- Cards
- Modals
- Tabs
- Sidebar navigation
- Top nav
- Search fields
- Dropdowns
- Skeleton loaders
- Empty states
- Alerts
- Toast-like feedback
- Audio scrubber
- Transcript speaker turn
- Chat message bubble
- Action item card

Accessibility:
Ensure:
- Strong contrast
- Visible focus states
- Keyboard navigable controls
- Accessible labels for icon buttons
- Proper form labels
- No text overlap
- Responsive mobile layouts

Responsive Design:
Provide layouts for:
- Desktop 1440px
- Laptop 1024px
- Tablet 768px
- Mobile 390px

Desktop should feel spacious but productive.
Mobile should prioritize clarity and avoid horizontal overflow.

Motion:
Use subtle animation only:
- Fade in
- Slide up
- Button hover lift
- Modal entrance
- Skeleton shimmer
- Recording pulse
- Loading spinner

Avoid excessive animation.

Output Requirements:
Please provide:

1. Overall design direction
2. Color palette with hex values
3. Typography system
4. Spacing/radius/shadow tokens
5. Component design specs
6. Screen-by-screen layout specs
7. Responsive behavior
8. Empty/loading/error states
9. Interaction details
10. Implementation notes for frontend engineers

If generating visual mockups, create high-fidelity SaaS screens for:
- Landing page
- Login
- Dashboard
- Recording screen
- Meeting detail screen
- Share screen
- Settings page
- Participant shared view

The final design should feel like a real production SaaS app ready for launch.

Important correction:
Do not overuse generic hero gradients or decorative UI.
The app itself should look premium.
Focus most effort on the dashboard, meeting detail view, transcript/chat/actions panels, and recording screen.
```
