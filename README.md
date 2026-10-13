<div align="center">
  <img src="public/favicon-96x96.png" alt="Neel Shingavi Logo" width="80"/>
  <h1>Neel Shingavi — Developer Portfolio</h1>
  
  <p>
    <strong>A high-performance, immersive portfolio showcasing production backend systems, AI analytics platforms, and client-ready applications.</strong>
  </p>
  
  <p>
    <a href="https://neelshingavi.in"><img src="https://img.shields.io/badge/Website-neelshingavi.in-bff205?style=flat-square&logo=vercel&logoColor=black" alt="Website" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black" alt="React 19" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Bundler-Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" /></a>
    <a href="https://greensock.com/gsap/"><img src="https://img.shields.io/badge/Animation-GSAP-88CE02?style=flat-square&logo=greensock&logoColor=white" alt="GSAP" /></a>
  </p>
</div>

---

## 🌌 Overview

This repository houses the source code for my personal developer portfolio. Engineered not just as a resume, but as a testament to my technical capabilities, it leverages **React 19**, **Vite**, and **custom WebGL/GSAP animations** to deliver a performant, cinematic browsing experience.

The architecture emphasizes fluid user experiences (60fps animations), robust core web vitals, and strict security headers, reflecting my approach to shipping production-ready systems.

## ✨ Core Features & Architecture

* **Cinematic Micro-Interactions:** Custom cursor physics, magnetic buttons, and scroll-linked timeline reveals powered by **GSAP** and **Framer Motion**.
* **Immersive WebGL Environments:** Real-time hardware-accelerated background animations using **Three.js**, dynamically adapting to the user's scroll state and motion preferences.
* **Privacy-First Analytics:** Custom, cookie-less event tracking integrated with **Google Analytics 4 (GA4)**. Captures nuanced user intent (e.g., CTA clicks, section dwell time, resume downloads) via an asynchronous event queue.
* **Serverless Contact Pipeline:** Secure, client-side form processing integrated with **Web3Forms**, complete with robust client-side validation and responsive loading states.
* **Responsive Fluid Typography:** Leveraging CSS `clamp()` and relative units to ensure perfect typographic scaling from 320px mobile displays to 4K ultra-wide monitors.

## ⚡ Performance Engineering

Performance was treated as a first-class citizen during development:

- **LCP Optimization:** Critical path CSS is inlined, and hero assets are preloaded via `vite-plugin-pwa` and manual resource hints.
- **Automated Image Pipelines:** Custom Node.js scripts using **Sharp** automate the generation of WebP/AVIF formats and responsive srcsets, reducing payload size by ~70%.
- **Zero Layout Shift:** Strict aspect ratios and skeleton states ensure a **Cumulative Layout Shift (CLS) of 0.00**.
- **Prefetching & Code Splitting:** React `lazy()` and `Suspense` are used to defer heavy animation libraries (like Three.js) until the main thread is idle or they enter the viewport.

## 🛠️ Technology Stack

| Domain | Technologies |
| :--- | :--- |
| **Core Framework** | React 19, JavaScript (ES Modules), Vite |
| **Animation & Motion** | GSAP (ScrollTrigger, SplitText), Framer Motion, Three.js |
| **Styling & Theming** | Pure CSS3 (Custom Properties, Flexbox/Grid, CSS Modules) |
| **Build & Tooling** | Sharp (Image Processing), ESLint |
| **Infrastructure** | Vercel (Hosting), Google Analytics 4, Web3Forms |

## 📦 Project Structure

```text
Portfolio/
├── public/                 # Static assets, manifests, and robots.txt
├── scripts/                # Build-time optimization scripts (e.g., sharp image compressor, OG generators)
├── src/
│   ├── components/         # Reusable, atomic React UI components (ProjectCard, Preloader, etc.)
│   ├── data/               # Centralized content schema (projects, timeline, skills)
│   ├── hooks/              # Custom React hooks (useTilt, useMagnetic, useSmoothScroll, etc.)
│   ├── utils/              # Helper utilities (Analytics wrapper, contact logic)
│   ├── App.jsx             # Core application layout and orchestration
│   ├── main.jsx            # Application entry point and context providers
│   └── styles.css          # Global stylesheet containing design tokens and layout primitives
├── eslint.config.js        # Strict linting rules
├── vercel.json             # Security headers (CSP, HSTS) and Vercel routing
└── vite.config.js          # Vite compilation, aliasing, and plugin config
```

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/neelshingavi/Portfolio-Website.git
   cd Portfolio-Website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file at the repository root:
   ```env
   # Required: Web3Forms Access Key for contact routing
   VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_key_here

   # Optional: GA4 Measurement ID for analytics
   VITE_GA_MEASUREMENT_ID=your_ga_measurement_id_here
   ```

4. **Launch Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 🔨 Build & Operations

### Production Compilation
```bash
npm run build
```
Creates a highly optimized, minified bundle in the `dist/` directory, ready for static hosting.

### Image Processing Pipeline
```bash
npm run optimize-images
```
Executes the custom Sharp pipeline to parse `public/raw-assets/`, generating compressed, next-gen image formats.

## 🔒 Security & Deployment

The application is configured for edge deployment on **Vercel**. The `vercel.json` dictates strict security protocols:
* **Content Security Policy (CSP):** Rigorous whitelisting of executable scripts and frame ancestors to mitigate XSS vulnerabilities.
* **HTTP Strict Transport Security (HSTS):** Enforces TLS connections.
* **Cache-Control Strategies:** Immutable caching for hashed static assets to maximize repeat-visit performance.

---

<div align="center">
  <p>Designed and engineered by <strong>Neel Shingavi</strong>.</p>
  <a href="https://www.linkedin.com/in/neel-shingavi/">LinkedIn</a> • 
  <a href="https://github.com/neelshingavi">GitHub</a>
</div>
