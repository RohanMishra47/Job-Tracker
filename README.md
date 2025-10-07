## 🧭 Personal Job Tracker (Actively Evolving)

A full-stack Job Tracking Dashboard that helps users organize and monitor their job applications efficiently — from application to offer.
Built with a focus on clarity, scalability, and developer experience.

## 🚀 Tech Stack

- **Frontend:** React, Tailwind CSS
- **Backend:**: Express.js, Node.js
- **Database:** MongoDB
- **Containerization:** Docker
- **Language:** TypeScript

🔗 **Live Link:** [View Project Here](https://job-tracker-2ub.pages.dev/register)

> **Note:** This project runs on a free/hobby backend. Initial requests may experience a short delay (cold start). Please wait a few seconds or refresh if needed.

## ✨ Key Features

- **CRUD System** — Create, update, delete, and view job applications seamlessly.
- **Authentication** — Secure login system (email/password; Google OAuth planned).
- **Kanban Dashboard** — Intuitive drag-and-drop interface for managing job stages.
- **Filtering, Sorting & Pagination** — Server-side operations for performance and scalability.
- **Deep Linking** — Syncs filter and sort state with URLs for reproducible views.
- **Error Handling & Validation** — Consistent and informative feedback across UI and backend.
- **Responsive Design** — Optimized for desktop, tablet, and mobile devices.

## 🧩 Architecture Highlights

- **Modular Express API** with clearly defined routes and middleware for scalability.
- **Separation of concerns** between data handling and UI rendering.
- **Backend-driven logic** — filtering, sorting, and pagination handled server-side to reduce client load.
- **State synchronization** between URL parameters and frontend store for shareable views.

## 🧠 Future Enhancements

- 🔑 **Google Sign-In** (OAuth 2.0) integration.
- 🤖 **AI Job Fit Score** — Uses AI to analyze job descriptions and resumes to suggest the best matches.
- 📊 **Analytics Dashboard** — Visual insights into job progress, response rates, and timelines.
- 💅 **UI/UX Polish** — Improved Kanban visuals and user flow refinements.

## 🤖 AI-Capable Development

This project reflects an **AI-augmented workflow** — not AI dependency.
AI tools like **GitHub Copilot** and **ChatGPT** were integrated to:

- Accelerate boilerplate generation and improve refactor quality.
- Debug complex TypeScript and API integration issues faster.
- Brainstorm architectural patterns and optimize component design.
- Maintain a balance between automation and active problem-solving.

💡 _The goal wasn’t to let AI build the project, but to enhance how I think, debug, and iterate._

## 🛠 Setup Instructions

1. Clone this repository:
   git clone https://github.com/RohanMishra47/Job-Tracker.git
2. Install dependencies:

```
cd client && pnpm install
cd server && pnpm install
```

3. Set up environment variables:

```
MONGO_URI=your_mongo_connection_string
PORT=5000
JWT_SECRET=your_secret_key
```

4. Run the development server:
   **server**: pnpm dev
   **client**: pnpm run dev

5. Access the app at **http://localhost:5173**

## 📦 Deployment

- Frontend and backend can be containerized using Docker for easy deployment.
- Compatible with cloud platforms such as Render, DigitalOcean, or Vercel.

## 💡 Lessons Learned

- The importance of **architectural** consistency between frontend and backend.
- How **server-side data operations** improve scalability.
- The value of **stateful URL design** for reproducible and shareable user experiences.
- Why **AI + developer intent** beats AI-only automation.

## 💬 Support & Contact

If you face any issues running the project or have suggestions for improvements, feel free to:

- Open an [issue](https://github.com/RohanMishra47/Job-Tracker/issues) on this repository, or
- Reach out to me on [LinkedIn](https://www.linkedin.com/in/rohan-mishra-6391bb372/) or [Twitter](https://x.com/RohanMishr19102)

I’ll be happy to help or discuss improvements!
