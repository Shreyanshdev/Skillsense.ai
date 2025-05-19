# SkillSense.AI

A web-based AI-driven career and skill evaluation platform for students, built with Next.js, TypeScript, and Tailwind CSS. SkillSense.AI helps users assess their current skills, generate personalized learning goals, receive resume feedback, and visualize career paths, all powered by intelligent AI recommendations.

## Table of Contents

1. [Features](#features)
2. [Demo](#demo)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Installation](#installation)
6. [Environment Variables](#environment-variables)
7. [Usage](#usage)
8. [Contributing](#contributing)
9. [License](#license)

## Features

* **AI Questionnaire & Scoring**: 15+ tailored questions based on selected career roles to evaluate user proficiency.
* **Personalized Learning Goals**: AI generates realistic daily goals and a progress tracker with streaks, similar to LeetCode.
* **Voice Input/Output (Optional)**: Users can answer questions via voice and receive audio feedback.
* **User Progress Dashboard**: Monitor progress, streaks, and revision summaries at the end of each day.
* **AI-Based Resume Feedback**: Analyze uploaded resumes for ATS optimization, readability, and keyword suggestions.
* **Interview Preparation Tool**: Practice common interview questions with AI-driven feedback on responses.
* **Job/Internship Matching & Gamification**: Match users to opportunities and earn badges for completing learning milestones.
* **AI-Powered Career Path Visualization**: Interactive timeline of potential career milestones and next steps.
* **Community Forum**: Ask questions, discuss topics, and share experiences with peers.
* **Skill Gap & Soft Skill Analysis**: Identify missing technical and soft skills and receive suggestions to bridge gaps.

## Demo

Insert screenshots or GIFs showcasing the landing page, dashboard, and AI interactions.

## Tech Stack

* **Frontend**: Next.js, React, TypeScript, Tailwind CSS
* **State Management**: \[Your choice, e.g., Zustand or Redux]
* **API & AI**: OpenAI API, REST/GraphQL endpoints
* **Authentication**: NextAuth.js (or custom JWT, Firebase Auth)
* **Database**: PostgreSQL / MongoDB
* **Deployment**: Vercel / Netlify

## Project Structure

```bash
├── public/              # Static assets (images, fonts)
├── src/
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Next.js pages and API routes
│   │   ├── api/         # Serverless functions
│   │   └── _app.tsx     # App wrapper
│   ├── services/        # API clients and AI utilities
│   ├── store/           # State management setup
│   ├── styles/          # Global CSS / Tailwind config
│   └── utils/           # Helper functions
├── .env.example         # Sample environment variables
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # NPM scripts & dependencies
```

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/<username>/skillsense.ai.git
   cd skillsense.ai
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   * Copy `.env.example` to `.env.local`
   * Fill in your keys (e.g., OpenAI API key, database URL)

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

```dotenv
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_connection_string
NEXTAUTH_SECRET=some_random_secret
```

## Usage

* **Register / Login**: Securely sign up or log in to access personalized features.
* **Select Role**: Choose a career role to tailor AI questions and goals.
* **Answer Questions**: Complete the AI-driven assessment (voice or text).
* **Track Progress**: View your dashboard for streaks, badges, and goal summaries.
* **Upload Resume**: Get instant feedback to optimize for ATS and readability.
* **Practice Interviews**: Use the interview tool to rehearse and improve responses.
* **Join Community**: Participate in discussions, ask questions, and share resources.

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m "Add YourFeature"`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request.

Please follow the existing code style and include relevant tests.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
