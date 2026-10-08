# Writing and publishing articles

The public blog reads top-level `.md` and `.mdx` files from `omidnw/omidnw`, branch `master`, directory `client/src/blogs`. Both themes use the GitHub API. If GitHub fails, the configured local fallback is used.

## Create an article

1. Copy `examples/example.mdx` into this directory with a unique filename, such as `my-article.mdx`.
2. Replace the title, excerpt, author, date (`YYYY-MM-DD`), read time, tags, and body. Keep tags on one line using the sample's array format.
3. Keep `draft: true` while writing. Drafts and `published: false` articles are excluded from the archive and detail routes.
4. To publish, change to `draft: false`, commit, and push to `master`. The filename becomes the URL: `/blog/my-article`.

GitHub content is cached for five minutes. A successful empty archive does not restore local articles. GitHub outages may use the local snapshot bundled with the site.

`examples/` is a writing guide only: it is not imported, fetched as a public article, or listed in the sitemap. This README is documentation, not an article.

Removing a published article requires deleting its file from GitHub as well. Local changes alone do not modify GitHub or the live site.

The three removed starter article filenames (`getting-started-with-react.mdx`, `typescript-best-practices.mdx`, `building-cyberpunk-ui.mdx`) are retired and excluded from remote loading so an older GitHub snapshot cannot bring them back. Use a new filename for future articles.
