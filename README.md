# Idea Saver - AI-Powered Voice Notes

**From Passing Thought to Finished Plan**

Idea Saver is a modern web application designed to be more than just a voice recorder. It's your personal AI assistant for capturing, structuring, and expanding on your best ideas. Record your thoughts, meetings, or spontaneous inspirations, and let our AI-powered tools turn them into titled, transcribed, and actionable notes.

## Core Features

- **🎙️ Instant Voice Capture:** High-quality audio recording directly in your browser. Your data is saved on your device for ultimate privacy.
- **✨ AI-Powered Transcription:** Using serverless Edge Functions, your audio is converted into accurate, readable text in seconds.
- **🧠 Smart Titling:** Our AI automatically analyzes the transcription and generates a concise, relevant title for each note, saving you the effort of naming them.
- **🔐 Secure Authentication:** Robust user management powered by Supabase Auth, including email/password and Google OAuth sign-in.
- **💰 Credit System & Gifting:** Users receive free credits upon signing up to use AI features. New credits can be added by redeeming gift codes.
- **☁️ Secure Cloud Sync (Pro Feature):** Securely back up your notes and transcriptions to the cloud and access them from any device, anytime.
- **🎨 Modern, Responsive UI:** A sleek, theme-aware interface built with Tailwind CSS and shadcn/ui, featuring smooth animations with Framer Motion.

---

## Technical Section

This project is a full-stack application built with Next.js and Supabase, showcasing a modern approach to web development with a focus on performance, developer experience, and scalability.

### Tech Stack

- **Framework:** [Next.js 13](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Backend & Database:** [Supabase](https://supabase.io/)
  - **Authentication:** Supabase Auth (Email/Password, Google OAuth)
  - **Database:** Supabase Postgres
  - **Serverless Functions:** Supabase Edge Functions (Deno) for transcription and AI titling.
- **Styling:**
  - [Tailwind CSS](https://tailwindcss.com/)
  - [shadcn/ui](https://ui.shadcn.com/) for the component library.
  - [Framer Motion](https://www.framer.com/motion/) for animations.
- **State Management:**
  - [Zustand](https://zustand-demo.pmnd.rs/) & [React Context API](https://react.dev/reference/react/useContext) for global state management (`useAuth`).
- **Form Handling:** [React Hook Form](https://react-hook-form.com/)
- **Linting & Formatting:** ESLint & Prettier

### Project Structure

The codebase is organized to maintain a clean separation of concerns, making it easy to navigate and scale.

```
/
├── app/                # Next.js 13 App Router pages (UI routes)
├── components/         # Reusable UI components (built with shadcn/ui)
├── src/
│   ├── components/     # Core application components (e.g., Header, RecordingControls)
│   ├── hooks/          # Custom React hooks (e.g., useAuth)
│   ├── lib/            # Utility functions, Supabase client, i18n config
│   └── store/          # Zustand global state store
└── supabase/
    ├── functions/      # Deno Edge Functions (transcribe-audio, generate-title)
    └── migrations/     # SQL database schema migrations
```

### Supabase Backend

The backend is fully managed by Supabase, leveraging its powerful suite of tools.

1.  **Database Schema:** The database schema is defined in the SQL files within `supabase/migrations`. The core tables are `profiles` (to store user data and credits) and potentially tables for notes and transcriptions (for cloud sync).
2.  **Row-Level Security (RLS):** RLS is enabled on all tables containing user data, ensuring that users can only access and modify their own information. Policies are written in SQL and are part of the database migrations.
3.  **Edge Functions:**
    -   `transcribe-audio`: This function takes an audio file, sends it to a third-party AI service (like Google's Speech-to-Text), and returns the transcription.
    -   `generate-title`: This function receives the transcription text, sends it to a generative AI model (like GPT), and returns a suitable title.
    -   `redeem-gift-code`: This function validates a gift code and, if valid, updates the user's credits in the `profiles` table.

---

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm or yarn
- [Supabase Account](https://supabase.com/dashboard) and [Supabase CLI](https://supabase.com/docs/guides/cli)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/idea-saver.git
    cd idea-saver
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    - Log in to the Supabase CLI: `supabase login`
    - Link your local repository to your Supabase project: `supabase link --project-ref <YOUR_PROJECT_ID>`
    - Push the database migrations: `supabase db push`
    - Deploy the Edge Functions: `supabase functions deploy`

4.  **Configure Environment Variables:**
    - Create a `.env.local` file in the root of the project by copying the `.env.example` file.
    - Get your API URL and `anon` key from your Supabase project's API settings.
    - Add these keys to your `.env.local` file:
      ```
      NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
      ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.
