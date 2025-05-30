# GitHub Projects Integration Setup

This guide explains how to configure your portfolio to read projects from a GitHub repository instead of local files.

## 🚀 Quick Setup

### 1. Configure GitHub Repository

Edit `client/src/lib/github-config.ts`:

```typescript
export const GITHUB_CONFIG: GitHubConfig = {
	owner: "your-github-username", // Your GitHub username
	repo: "your-portfolio-repo", // Repository name containing projects
	projectsPath: "client/src/projects", // Path to projects folder in repo
	branch: "main", // Branch to read from (optional)
	enableLocalFallback: true, // Enable/disable local project fallback (optional)
};
```

### 2. Create Projects Repository

Create a new GitHub repository or use an existing one with a `projects` folder containing `.mdx` files:

```
your-projects-repo/
├── projects/
│   ├── neural-portfolio.mdx
│   ├── ai-code-assistant.mdx
│   ├── blockchain-dapp.mdx
│   └── mobile-app.mdx
└── README.md
```

### 3. MDX File Format

Each project should be an `.mdx` file with frontmatter:

````mdx
---
title: "Project Title"
description: "Brief project description"
image: "/projects/project-image.jpg"
demoUrl: "https://demo.example.com"
githubUrl: "https://github.com/username/project"
technologies: ["React", "TypeScript", "Node.js"]
status: "completed"
featured: true
startDate: "2024-01-01"
endDate: "2024-02-01"
category: "Web Development"
tags: ["Frontend", "React", "Web Development"]
---

# Project Title

Your project content goes here in Markdown format...

## Features

- Feature 1
- Feature 2

## Technical Details

```typescript
// Code examples work too
const example = "Hello World";
```
````

## Results

Project outcomes and achievements...

````

## 📋 Configuration Options

### GitHub Config Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `owner` | string | ✅ | GitHub username or organization |
| `repo` | string | ✅ | Repository name containing projects |
| `projectsPath` | string | ✅ | Folder path within the repo (e.g., "projects", "content/projects") |
| `branch` | string | ❌ | Git branch to read from (default: "main") |
| `enableLocalFallback` | boolean | ❌ | Whether to fall back to local project data when GitHub fails |

### Frontmatter Properties

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `title` | string | ✅ | filename | Project title |
| `description` | string | ✅ | "" | Brief description |
| `image` | string | ❌ | "/projects/default.jpg" | Project image path |
| `demoUrl` | string | ❌ | undefined | Live demo URL |
| `githubUrl` | string | ❌ | undefined | Source code URL |
| `technologies` | string[] | ❌ | [] | Technology stack |
| `status` | string | ❌ | "planned" | "completed", "in-progress", "planned" |
| `featured` | boolean | ❌ | false | Show in featured section |
| `startDate` | string | ❌ | current date | Start date (YYYY-MM-DD) |
| `endDate` | string | ❌ | undefined | End date (YYYY-MM-DD) |
| `category` | string | ❌ | "Other" | Project category |
| `tags` | string[] | ❌ | [] | Project tags |

## 🔄 How It Works

1. **GitHub First**: If configured, the app attempts to fetch projects from GitHub API
2. **Local Fallback**: If GitHub fails or is not configured, falls back to local project data
3. **Caching**: GitHub responses are cached for 5 minutes to reduce API calls
4. **Real-time**: Users can refresh GitHub data with the refresh button

## 🛠 Advanced Configuration

### Custom Repository Structure

If your projects are in a different structure:

```typescript
// For projects in content/portfolio/
export const GITHUB_CONFIG: GitHubConfig = {
  owner: "username",
  repo: "my-website",
  projectsPath: "content/portfolio",
  branch: "main",
};
```

### Different File Extensions

The system supports both `.mdx` and `.md` files automatically.

### Private Repositories

For private repositories, you'll need to:

1. Generate a GitHub Personal Access Token
2. Add it to your environment variables
3. Modify the API calls to include authentication

```typescript
// In github-api.ts (for private repos)
const headers = {
	Authorization: `token ${process.env.GITHUB_TOKEN}`,
};
```

## 🚨 Error Handling

The system includes comprehensive error handling:

- **404 Repository Not Found**: Falls back to local data
- **Network Errors**: Shows retry option
- **Invalid Frontmatter**: Logs warnings, uses defaults
- **Rate Limiting**: Cached responses reduce API calls

## 🧪 Testing Your Setup

1. **Check Configuration**: Ensure `GITHUB_CONFIG` is properly set
2. **Verify Repository**: Make sure the repo and path exist
3. **Test MDX Files**: Validate frontmatter syntax
4. **Monitor Console**: Check browser console for any errors

## 📝 Example Repository

Here's an example of a properly structured projects repository:

```
my-portfolio-projects/
├── projects/
│   ├── web-app.mdx
│   ├── mobile-app.mdx
│   ├── ai-project.mdx
│   └── blockchain-dapp.mdx
├── images/
│   ├── web-app-screenshot.png
│   ├── mobile-app-demo.gif
│   └── ai-project-banner.jpg
└── README.md
```

## 🔍 Debugging

### Common Issues

1. **"Project Not Found"**: Check repository URL and path
2. **"Connection Failed"**: Verify internet connection and GitHub status
3. **"Frontmatter Parse Error"**: Validate YAML syntax
4. **"Empty Projects"**: Ensure MDX files have proper frontmatter

### Debug Mode

Enable detailed logging by opening browser console to see:

- GitHub API requests
- Parsing results
- Cache status
- Fallback behavior

## 🎯 Benefits

- **Dynamic Content**: Update projects without rebuilding
- **Version Control**: Track project changes through Git
- **Collaboration**: Team members can contribute projects
- **Backup**: Projects stored safely in GitHub
- **Flexibility**: Easy to migrate or backup content

## 🔄 Migration Guide

### From Local to GitHub

1. Create GitHub repository
2. Move MDX files to repository
3. Update `github-config.ts`
4. Test the integration
5. Clean up local files (optional)

### Hybrid Approach

You can use both local and GitHub projects:

- Configure GitHub for main projects
- Keep sample/demo projects locally
- System will merge both sources

## Basic Configuration

### Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `owner` | string | ✅ | - | Your GitHub username or organization |
| `repo` | string | ✅ | - | Repository name containing your projects |
| `projectsPath` | string | ✅ | - | Path to projects folder in your repository |
| `branch` | string | ❌ | "main" | Git branch to read projects from |
| `enableLocalFallback` | boolean | ❌ | true | Whether to fall back to local project data when GitHub fails |

### Local Fallback Control

The `enableLocalFallback` option gives you manual control over the fallback behavior:

- **`true` (default)**: When GitHub is unavailable or fails, the system will automatically fall back to local project data
- **`false`**: Disables local fallback completely - only GitHub data will be used, showing error states when GitHub is unavailable

This is useful when you want to:
- Force users to see only live GitHub data
- Prevent showing outdated local fallback data
- Debug GitHub integration issues without fallback interference

Example scenarios:
```typescript
// Scenario 1: Always show GitHub data, no fallback
export const GITHUB_CONFIG: GitHubConfig = {
	owner: "john-doe",
	repo: "my-projects",
	projectsPath: "projects",
	enableLocalFallback: false, // No fallback - GitHub only
};

// Scenario 2: GitHub with local fallback (recommended)
export const GITHUB_CONFIG: GitHubConfig = {
	owner: "john-doe",
	repo: "my-projects",
	projectsPath: "projects",
	enableLocalFallback: true, // Fallback enabled for reliability
};
```

## Quick Start

1. **Fork/Create Repository**: Create a GitHub repository to store your projects
2. **Add Project Files**: Upload your `.mdx` project files to the repository
3. **Configure**: Update the configuration in `github-config.ts`
4. **Test**: The system will automatically fetch from GitHub with local fallback
````
