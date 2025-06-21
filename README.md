# Gatepreportal

## Project Description

Gatepreportal is an online mock test platform designed to help students prepare for competitive exams such as GATE and JEE. The platform allows teachers to create and upload tests, assignments, and study materials, while students can take tests, view results, and track their progress. The application features user authentication, profile management, and a modern, responsive interface built with React and Vite.

### Key Features
- Student and teacher dashboards
- Test creation and management
- Assignment uploads and tracking
- Study material uploads
- Real-time test results and analytics
- User authentication and profile management
- Built with React, Vite, Supabase, and Tailwind CSS

## Project Structure

This repository contains the source code for the Gatepreportal application. The main frontend project is located in the `project/` subfolder.

```
Gatepreportal/
  project/
    src/
    index.html
    package.json
    ...
```

## Local Development

1. **Install dependencies:**
   ```sh
   cd project
   npm install
   ```
2. **Start the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

3. **Build for production:**
   ```sh
   npm run build
   ```
   The production build will be output to the `dist/` folder inside `project/`.

## Deployment on Vercel

Since the Vite project is inside the `project/` subfolder, you need to configure Vercel accordingly:

### Option 1: Set Root Directory (Recommended)
- In your Vercel dashboard, go to your project settings.
- Set the **Root Directory** to `project`.
- Set the **Build Command** to `npm run build`.
- Set the **Output Directory** to `dist`.

### Option 2: Custom Build Command
- If you cannot set the root directory, use these settings:
  - **Build Command:** `cd project && npm run build`
  - **Output Directory:** `project/dist`

## Troubleshooting
- If you see an error like `Could not resolve entry module "index.html"`, it means Vercel is not building from the correct directory. Double-check the settings above.
- Make sure your Node.js version is 18.x or 20.x for best compatibility with Vite 6.x.

## License

[Add your license here]