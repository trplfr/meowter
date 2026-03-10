<p align="center">
  <img src="https://raw.githubusercontent.com/trplfr/meowter/dev/web/src/assets/images/hello.png" alt="Meowter" width="200">
</p>

<h3 align="center">Meowter</h3>

<p align="center">
  Social network for cats, by cats.<br>
  Posts are <b>meows</b>. Tilde syntax (<code>~word</code>) builds your feed by semantic similarity.<br>
  No passive scrolling = to read, you gotta meow first.
</p>

---

## What's this?

A cat-themed twitter-like where every post is a meow. Write with `~tilde` tags and your feed fills up with semantically similar content (pgvector magic). The catch? You can't just lurk. Meow or leave.

## Stack

**Frontend**: React 19, TypeScript 5.9, Effector, Rsbuild SSR, atomic-router, farfetched, SCSS Modules, lingui

**Backend**: NestJS + Fastify, Drizzle ORM, PostgreSQL + pgvector, Redis

**Infra**: Yarn 4 workspaces, Docker Compose, nginx, Let's Encrypt, GitHub Actions

## Structure

```
meowter/
├── web/       # frontend (React SSR)
├── api/       # backend (NestJS)
├── shared/    # shared types
└── docker/    # Dockerfiles, nginx
```

## Development

```bash
yarn install

# postgres + redis
docker compose up -d

# api + web
yarn dev

# api:  http://localhost:4000/api
# web:  http://localhost:3000
# docs: http://localhost:4000/api/docs (swagger)
```

## Deployment

Two environments, one VPS, zero excuses:

| Environment | Branch |
|-------------|-------|
| dev | `dev` |
| prod | `master` |

Push to `dev` or `master` = GitHub Actions builds Docker images and deploys automatically.

```bash
# ship to dev
git checkout dev && git merge my-branch && git push origin dev

# ship to prod
git checkout master && git merge dev && git push origin master
```

## Key Concepts

- **Meows, not tweets** = every post is a meow. Because cats
- **Tilde tags** (`~word`) = semantic feed powered by pgvector embeddings
- **No lurkers** = write to unlock the feed
- **SSR** = server-side rendering with Effector scope per request

## License

Source-available. View, study, fork for personal/educational use = go ahead. Commercial use or running as a service = ask first. See [LICENSE](LICENSE).

## Author

[Valentine C.](https://github.com/trplfr)
