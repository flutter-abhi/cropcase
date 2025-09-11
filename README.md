# cropcase
Next.js-based web app where users can create and share crop portfolios (cases). OpenAI suggests seasonal crops (from a predefined crop list), and users allocate land percentages to build their own profitable cases. Built with Next.js App Router, Zustand, Prisma, Supabase, and OpenAI API.
# 🌱 CropCase

CropCase is a **Next.js project** that helps farmers and users create and share crop "cases".  
Using **OpenAI API**, the system suggests profitable seasonal crops (from a predefined crop list).  
Users can then allocate land percentages to build their case and share it with others.  

---

## ✨ Features
- 🔑 **Authentication & Sessions** (NextAuth + Supabase)
- 🌗 **Dark/Light Mode** (Theme toggle)
- 🌱 **Crop Suggestions** with OpenAI API (restricted to predefined crop list)
- 📊 **Case Builder** – Allocate land % across multiple crops
- 🌍 **All Cases Page** – View your cases + others’ shared cases
- ⚡ **State Management** – Zustand + React Context
- 🗄️ **Database** – Prisma ORM + Supabase SQL
- 🖥️ **Fullstack in Next.js** – API routes under `/app/api`

---

## 🏗️ Tech Stack
- [Next.js 14 (App Router)](https://nextjs.org/docs)
- [React](https://react.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/) + [React Context](https://react.dev/reference/react/useContext)
- [Prisma](https://www.prisma.io/)
- [Supabase](https://supabase.com/) (Postgres DB + Auth)
- [NextAuth.js](https://next-auth.js.org/) for authentication
- [TailwindCSS](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [OpenAI API](https://platform.openai.com/) for crop suggestions



