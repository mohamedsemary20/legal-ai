# Remix of Smart Legal Aide

Build a fully RTL (right-to-left) Arabic web app called "المساعد القانوني الذكي" — an AI legal assistant specialized in Egyptian law. Use React + Tailwind CSS with dir="rtl" and lang="ar", and the IBM Plex Sans Arabic font from Google Fonts.

DESIGN DIRECTION — premium, not generic AI-app look:

Avoid the typical "AI SaaS template" aesthetic (flat cards, generic blue/purple gradients, default rounded-2xl everywhere, cookie-cutter sidebar). Instead aim for a refined legal/editorial feel — think a boutique law firm's digital product, not a chatbot demo. Specifically:

- Primary palette: deep soft green (#2D6A4F, #40916C) with warm neutral backgrounds (#FAF9F6), plus one unexpected accent (e.g. a muted gold/bronze #B08D57) used sparingly for premium touches (icons, dividers, active states).

- Typography: IBM Plex Sans Arabic for UI text, but give headings real hierarchy and weight contrast (not just bold vs regular) so the product feels considered, not templated.

- Subtle textures/details: soft shadows (not harsh card borders), fine hairline dividers, gentle micro-interactions on hover/focus, smooth transitions (200–300ms ease).

- Rounded corners: consistent but not excessive (rounded-xl on major surfaces, tighter radius on small elements like chips/buttons).

- No dark mode needed.

- Overall goal: it should NOT look like every other AI chat clone — give it its own visual identity that feels trustworthy, calm, and premium, like a legal product a paying client would respect.

LAYOUT — 3 columns on desktop, collapsible on mobile:

1. Sidebar (right side):

   - App logo/name at top

   - "محادثة جديدة" (New Chat) button

   - "إنشاء عقد" (Generate Contract) button

   - List of saved conversations: title + short preview + relative date, active conversation highlighted

2. Chat panel (center, main area):

   - Header with app icon and title

   - Empty state: friendly hero section with a scales-of-justice illustration/icon, welcome text in Arabic, and 3–4 suggested question cards (e.g. "ما حقوقي كمستأجر؟", "كيف أُنشئ عقد عمل؟")

   - Message list: user messages in green bubbles aligned right, AI responses in white cards aligned left with full markdown rendering (headings, bold, numbered lists, tables)

   - Typing indicator (animated dots) while waiting

   - Input area at bottom: textarea with send button, plus a paperclip button to attach a document

   - Attached document shown as a dismissible chip above the input (file name + size)

   - Disclaimer line under input: "هذه معلومات قانونية عامة وليست مشورة قانونية رسمية ⚖️"

3. History panel (left side): compact vertical timeline of recent conversations grouped by day (اليوم / أمس / أقدم)

CONTRACT GENERATOR MODAL:

Modal dialog titled "إنشاء عقد قانوني" with:

- Contract type selector as 3 visual cards: عقد إيجار 🏠، عقد عمل 💼، اتفاقية سرية 🔒

- Dynamic form fields per type: party names (الطرف الأول/الثاني), property address, rent amount, duration, job title, salary, purpose — depending on selected type

- A "ملاحظات إضافية" (Additional Notes) textarea field, available for all contract types, positioned near the bottom of the form before submit — with placeholder text like "أضف أي شروط أو بنود خاصة تريد إضافتها للعقد (اختياري)". This field's content should be mocked as being sent to the AI so it can inject extra custom clauses into the generated contract. Show it clearly as an optional, distinct section (e.g. labeled with a small note icon) so users understand it's their chance to customize the contract beyond the standard fields.

- "إنشاء العقد" submit button with loading spinner, and a download button after generation

TOAST NOTIFICATIONS:

Small floating toasts top-center for errors/success (e.g., file too large, invalid type) in Arabic.

RESPONSIVE:

On mobile, sidebar becomes a slide-in drawer with hamburger button; history panel hidden. All inputs and buttons have proper hover/focus/disabled states.

DATA:

Use mock data for conversations and fake async responses for now — real API to be connected later.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7f4faac6-3be2-42b9-af3e-5f0083952de4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
