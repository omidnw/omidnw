# GitHub Integration Setup Guide

Complete guide for integrating your portfolio with GitHub repositories to dynamically load projects and blog posts.

## 🚀 Quick Setup

### 1. Enable GitHub Integration

Edit `client/src/lib/github-config.ts`:

```typescript
export const GITHUB_CONFIG: GitHubConfig = {
	owner: "your-github-username", // Your GitHub username or organization
	repo: "your-portfolio-repo", // Repository name containing content
	projectsPath: "client/src/projects", // Path to projects folder in repo
	blogsPath: "client/src/blogs", // Path to blogs folder in repo
	branch: "main", // Branch to read from (default: "main")
	enableLocalFallback: true, // Enable/disable local fallback
};

// Enable GitHub integration
export const USE_GITHUB_INTEGRATION = true; // Set to true to enable
```

### 2. Repository Structure

Create or configure your GitHub repository with this structure:

```
your-portfolio-repo/
├── client/src/projects/          # Project MDX files
│   ├── neural-portfolio.mdx
│   ├── ai-assistant.mdx
│   ├── blockchain-dapp.mdx
│   └── mobile-app.mdx
├── client/src/blogs/             # Blog post MDX files
│   ├── react-performance.mdx
│   ├── cyberpunk-design.mdx
│   └── typescript-tips.mdx
├── public/images/                # Static assets
│   ├── projects/
│   └── blogs/
└── README.md
```

### 3. Content Format

#### Project MDX Format

`client/src/projects/neural-portfolio.mdx`:

````mdx
---
title: "Neural Portfolio Website"
description: "A cyberpunk-themed portfolio with React and Framer Motion"
image: "/projects/neural-portfolio.jpg"
demoUrl: "https://myportfolio.dev"
githubUrl: "https://github.com/username/neural-portfolio"
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
- Responsive mobile-first layout
- Performance optimized

## Technical Implementation

```typescript
const Portfolio = () => {
	return <CyberpunkExperience />;
};
```

## Results

- 95+ Lighthouse score
- Featured in design showcases
````

#### Blog Post MDX Format

`client/src/blogs/react-performance.mdx`:

````mdx
---
title: "React Performance Optimization Techniques"
excerpt: "Learn advanced techniques to optimize React applications for better performance"
author: "Your Name"
date: "2024-01-15"
readTime: "8 min"
tags: ["React", "Performance", "JavaScript", "Web Development"]
featured: true
---

# React Performance Optimization Techniques

Performance is crucial for modern web applications...

## Key Techniques

1. **Memoization**: Use React.memo and useMemo wisely
2. **Code Splitting**: Implement lazy loading for components
3. **Bundle Optimization**: Reduce bundle size

## Code Examples

```javascript
const OptimizedComponent = React.memo(({ data }) => {
	return <div>{data}</div>;
});
```
````

## 📋 Configuration Reference

### GitHub Config Properties

| Property              | Type    | Required | Default | Description                                           |
| --------------------- | ------- | -------- | ------- | ----------------------------------------------------- |
| `owner`               | string  | ✅       | -       | GitHub username or organization                       |
| `repo`                | string  | ✅       | -       | Repository name containing your content               |
| `projectsPath`        | string  | ✅       | -       | Path to projects folder (e.g., "client/src/projects") |
| `blogsPath`           | string  | ✅       | -       | Path to blogs folder (e.g., "client/src/blogs")       |
| `branch`              | string  | ❌       | "main"  | Git branch to read from                               |
| `enableLocalFallback` | boolean | ❌       | true    | Fall back to local files when GitHub fails            |

### Project Frontmatter Properties

| Property       | Type     | Required | Default                 | Description                           |
| -------------- | -------- | -------- | ----------------------- | ------------------------------------- |
| `title`        | string   | ✅       | filename                | Project title                         |
| `description`  | string   | ✅       | ""                      | Brief description                     |
| `image`        | string   | ❌       | "/projects/default.jpg" | Project image path                    |
| `demoUrl`      | string   | ❌       | undefined               | Live demo URL                         |
| `githubUrl`    | string   | ❌       | undefined               | Source code URL                       |
| `technologies` | string[] | ❌       | []                      | Technology stack                      |
| `status`       | string   | ❌       | "planned"               | "completed", "in-progress", "planned" |
| `featured`     | boolean  | ❌       | false                   | Show in featured section              |
| `startDate`    | string   | ❌       | current date            | Start date (YYYY-MM-DD)               |
| `endDate`      | string   | ❌       | undefined               | End date (YYYY-MM-DD)                 |
| `category`     | string   | ❌       | "Other"                 | Project category                      |
| `tags`         | string[] | ❌       | []                      | Project tags                          |

### Blog Post Frontmatter Properties

| Property   | Type     | Required | Default      | Description                   |
| ---------- | -------- | -------- | ------------ | ----------------------------- |
| `title`    | string   | ✅       | filename     | Blog post title               |
| `excerpt`  | string   | ✅       | ""           | Brief description/summary     |
| `author`   | string   | ❌       | "Anonymous"  | Author name                   |
| `date`     | string   | ❌       | current date | Publication date (YYYY-MM-DD) |
| `readTime` | string   | ❌       | "5 min"      | Estimated read time           |
| `tags`     | string[] | ❌       | []           | Blog post tags                |
| `featured` | boolean  | ❌       | false        | Show in featured section      |

## 🔄 How Integration Works

### Data Flow

1. **GitHub First**: Attempts to fetch content from GitHub API when enabled
2. **Intelligent Caching**: Responses cached for 5 minutes to reduce API calls
3. **Local Fallback**: Falls back to local content when GitHub fails (if enabled)
4. **Real-time Updates**: Manual refresh capability with cache clearing

### Visual Indicators

- **GitHub Icon**: Green when content loaded from GitHub
- **Local Icon**: Blue when using local fallback data
- **Refresh Button**: Available when GitHub integration is active
- **Status Messages**: Clear indication of data source

## 🛠 Advanced Configuration

### Custom Repository Structure

For different folder structures:

```typescript
// For projects in content/portfolio/
export const GITHUB_CONFIG: GitHubConfig = {
	owner: "username",
	repo: "my-website",
	projectsPath: "content/portfolio",
	blogsPath: "content/articles",
	branch: "main",
};

// For root-level folders
export const GITHUB_CONFIG: GitHubConfig = {
	owner: "username",
	repo: "portfolio-content",
	projectsPath: "projects",
	blogsPath: "blogs",
	branch: "main",
};
```

### Fallback Control

Control local fallback behavior:

```typescript
// GitHub only - no fallback
export const GITHUB_CONFIG: GitHubConfig = {
	owner: "username",
	repo: "portfolio-content",
	projectsPath: "projects",
	blogsPath: "blogs",
	enableLocalFallback: false, // Forces GitHub-only
};

// With fallback (recommended)
export const GITHUB_CONFIG: GitHubConfig = {
	owner: "username",
	repo: "portfolio-content",
	projectsPath: "projects",
	blogsPath: "blogs",
	enableLocalFallback: true, // Graceful fallback
};
```

### Private Repositories

For private repositories, add authentication:

```typescript
// In github-api.ts, modify fetch headers
const headers = {
	Authorization: `token ${process.env.VITE_GITHUB_TOKEN}`,
	Accept: "application/vnd.github.v3+json",
};
```

Add to your `.env` file:

```bash
VITE_GITHUB_TOKEN=your_personal_access_token
```

## 🧪 Testing Your Setup

### Verification Checklist

- [ ] **Configuration**: Verify `GITHUB_CONFIG` settings
- [ ] **Repository**: Ensure repo and paths exist and are accessible
- [ ] **MDX Files**: Validate frontmatter syntax and content
- [ ] **Images**: Check image paths and availability
- [ ] **Network**: Test with DevTools network tab
- [ ] **Console**: Monitor for errors or warnings

### Debug Mode

Open browser console to see detailed logging:

- GitHub API requests and responses
- Cache hits and misses
- Frontmatter parsing results
- Fallback behavior triggers
- Error details and stack traces

## 🚨 Error Handling & Troubleshooting

### Common Issues

**"Repository Not Found"**

- Verify repository URL and accessibility
- Check if repository is public or authentication is configured
- Ensure branch name is correct

**"Path Not Found"**

- Verify `projectsPath` and `blogsPath` exist in repository
- Check folder structure and spelling
- Ensure files have `.mdx` or `.md` extensions

**"Parse Error"**

- Validate YAML frontmatter syntax
- Check for unescaped special characters
- Ensure proper indentation in frontmatter

**"Network Failed"**

- Check internet connection
- Verify GitHub API status
- Check for rate limiting (60 requests/hour for unauthenticated)

### Rate Limiting

- **Public repos**: 60 requests/hour per IP
- **Authenticated**: 5000 requests/hour
- **Caching**: Reduces API calls significantly
- **Fallback**: Prevents total failure

## 🎯 Migration Strategies

### From Local to GitHub

1. **Create Repository**: Set up GitHub repo with proper structure
2. **Move Content**: Copy MDX files maintaining folder structure
3. **Update Config**: Enable GitHub integration
4. **Test Integration**: Verify content loads correctly
5. **Clean Local**: Optionally remove local files

### Hybrid Approach

Use both local and GitHub content:

```typescript
// Configure for primary content in GitHub
export const GITHUB_CONFIG: GitHubConfig = {
	owner: "username",
	repo: "main-content",
	projectsPath: "projects",
	blogsPath: "blogs",
	enableLocalFallback: true, // Keep local as backup
};
```

Benefits:

- **Primary content** managed in GitHub
- **Sample/demo content** kept locally
- **Automatic merging** of both sources
- **Backup strategy** built-in

## ✨ Benefits

### Dynamic Content Management

- **No Rebuilds**: Update content without redeploying
- **Version Control**: Track all changes through Git
- **Collaboration**: Team members can contribute easily
- **Backup**: Content safely stored in GitHub

### Development Workflow

- **Edit Anywhere**: Use GitHub web editor or local tools
- **Preview**: See changes reflected immediately
- **History**: Full change history and rollback capability
- **Branching**: Test content changes in feature branches

### Performance

- **Intelligent Caching**: Reduces API calls and improves speed
- **Graceful Fallbacks**: Never breaks user experience
- **Lazy Loading**: Content loaded as needed
- **Optimized Parsing**: Efficient frontmatter processing

## 🔮 Advanced Features

### Content Validation

The system automatically:

- Validates frontmatter syntax
- Provides default values for missing properties
- Logs warnings for malformed content
- Gracefully handles parsing errors

### Smart Caching

- **Time-based**: 5-minute cache duration
- **Content-aware**: SHA-based cache keys
- **Manual control**: Refresh button for immediate updates
- **Selective clearing**: Clear specific content types

### Multi-format Support

- **MDX**: Full React component support
- **Markdown**: Standard markdown files
- **Mixed**: Both formats in same repository

---

## 📚 Example Implementation

See the working implementation in this portfolio:

- **Configuration**: `client/src/lib/github-config.ts`
- **API Integration**: `client/src/lib/github-api.ts`
- **Projects Usage**: `client/src/pages/Projects.tsx`
- **Blog Usage**: `client/src/pages/Blog.tsx`
- **Error Handling**: Built into all components

**Status**: ✅ **Production Ready** - Battle-tested GitHub integration with comprehensive error handling and fallback strategies.
