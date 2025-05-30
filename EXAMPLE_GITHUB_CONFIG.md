# Example: Setting Up GitHub Projects Integration

## Quick Example Setup

### 1. Edit Configuration

In `client/src/lib/github-config.ts`:

```typescript
export const GITHUB_CONFIG: GitHubConfig = {
	owner: "omidrezakeshtkar", // Your GitHub username
	repo: "my-portfolio-projects", // Your projects repository
	projectsPath: "projects", // Folder containing MDX files
	branch: "main", // Git branch
	enableLocalFallback: true, // Enable local fallback
};
```

### 2. Create Repository Structure

Create a repository `my-portfolio-projects` with this structure:

```
my-portfolio-projects/
├── projects/
│   ├── neural-portfolio.mdx
│   ├── ai-assistant.mdx
│   └── mobile-app.mdx
└── README.md
```

### 3. Example MDX File

`projects/neural-portfolio.mdx`:

````mdx
---
title: "Neural Portfolio Website"
description: "A cyberpunk-themed portfolio with React and Framer Motion"
image: "/projects/neural-portfolio.jpg"
demoUrl: "https://myportfolio.dev"
githubUrl: "https://github.com/omidrezakeshtkar/neural-portfolio"
technologies: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"]
status: "completed"
featured: true
startDate: "2024-01-01"
endDate: "2024-01-30"
category: "Web Development"
tags: ["Frontend", "React", "Portfolio"]
---

# Neural Portfolio Website

A cutting-edge portfolio website built with modern technologies...

## Features

- 3D animations with React Three Fiber
- Cyberpunk-themed design
- Responsive layout
- Performance optimized

## Technical Implementation

```typescript
const Portfolio = () => {
	return <CyberpunkExperience />;
};
```
````

## Results

- 95+ Lighthouse score
- Featured in design showcases

```

### 4. Test the Integration

1. Commit and push your MDX files to GitHub
2. Update the configuration in your portfolio
3. Reload your portfolio - it should now load projects from GitHub!

## What You Get

- ✅ **Dynamic Content**: Update projects by editing GitHub files
- ✅ **Automatic Fallback**: If GitHub is unavailable, uses local data
- ✅ **Visual Indicators**: See clearly whether data comes from GitHub or local
- ✅ **Refresh Button**: Manually refresh GitHub data when needed
- ✅ **Caching**: Reduces API calls with intelligent caching
- ✅ **Error Handling**: Graceful handling of network issues

## Need Help?

Check the full setup guide in `GITHUB_PROJECTS_SETUP.md` for detailed instructions and troubleshooting tips.
```
