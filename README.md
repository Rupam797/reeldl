# ReelDL — Instagram Reel Downloader

![Java 21](https://img.shields.io/badge/Java-21-orange) ![Spring Boot 3](https://img.shields.io/badge/Spring%20Boot-3.4-brightgreen) ![Next.js 14](https://img.shields.io/badge/Next.js-14-black) ![Redis](https://img.shields.io/badge/Redis-7-red) ![Docker](https://img.shields.io/badge/Docker-Compose-blue) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

A fast, free, and privacy-respecting Instagram Reel &amp; video downloader. Paste a public Instagram link and get the MP4 — no login required, no watermark, no app to install.

---

## Architecture

```
┌─────────────┐       ┌──────────────┐       ┌───────────────┐
│             │       │              │       │               │
│   Browser   │──────▶│    Nginx     │──────▶│   Frontend    │
│             │       │    :80       │       │   Next.js 14  │
│             │       │              │─┐     │   :3000       │
└─────────────┘       └──────────────┘ │     └───────────────┘
                                       │
                                       │     ┌───────────────┐       ┌───────────┐
                                       └────▶│   Backend     │──────▶│   Redis   │
                                             │  Spring Boot  │       │   :6379   │
                                             │   :8080       │       └───────────┘
                                             │               │
                                             │   yt-dlp ◀────│ (extracts video metadata)
                                             └───────────────┘
```

**Request flow:**

1. User pastes an Instagram reel/post URL in the browser.
2. Nginx routes `/api/*` to the **Spring Boot backend** and everything else to the **Next.js frontend**.
3. Backend validates the URL, checks **Redis** cache, and — on a miss — invokes **yt-dlp** to extract metadata.
4. The frontend shows a preview card (thumbnail, title, duration).
5. When the user clicks *Download MP4*, the backend streams the video from Instagram's CDN directly to the browser — no file is ever saved on disk.

---

## Features

- **No login required** — works with public reels and posts
- **No watermark** — downloads the original HD video
- **Stream-through download** — video is proxied from Instagram's CDN, never stored on the server
- **Redis caching** — extraction results cached for 30 min to reduce yt-dlp calls
- **Per-IP rate limiting** — Bucket4j-based, Cloudflare-aware (`CF-Connecting-IP`, `X-Forwarded-For`)
- **SEO-optimized** — SSR/SSG pages, JSON-LD, sitemap, robots.txt, OpenGraph tags
- **Mobile-first** — responsive, fast, accessible
- **Ad-ready** — dedicated `<AdSlot />` components with fixed heights to prevent layout shift
- **Secure** — strict URL allowlist (no SSRF), process argument list (no injection), security headers, no stack traces exposed
- **Self-updating** — daily scheduled `yt-dlp -U` to keep the extractor current
- **One-command deploy** — `docker compose up --build`

---

## Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Frontend   | Next.js 14, TypeScript, Tailwind CSS      |
| Backend    | Java 21, Spring Boot 3.4, Maven           |
| Extraction | yt-dlp (invoked via ProcessBuilder)       |
| Cache      | Redis 7 (TTL 30 min, allkeys-lru)         |
| Rate Limit | Bucket4j 8.x                              |
| Proxy      | Nginx (gzip, security headers, streaming) |
| Infra      | Docker Compose                            |

---

## Quick Start (Local Development)

### Prerequisites

- Java 21 (e.g., Eclipse Temurin)
- Node.js 20+
- Redis (running on localhost:6379)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases) installed and on your `PATH`

### Backend

```bash
cd backend
# If yt-dlp is not at /usr/local/bin/yt-dlp, override the path:
export YTDLP_PATH=$(which yt-dlp)
export REDIS_HOST=localhost
mvn spring-boot:run
```

The API is available at `http://localhost:8080`.

### Frontend

```bash
cd frontend
npm install
# Point API calls to the local backend during dev
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

The site is available at `http://localhost:3000`.

---

## Docker Deployment

```bash
# 1. Clone the repo
git clone https://github.com/your-user/reel-downloader.git
cd reel-downloader

# 2. Create your .env
cp .env.example .env
# Edit .env as needed (defaults work out of the box)

# 3. Build & start
docker compose up --build -d

# 4. Check logs
docker compose logs -f

# 5. Open http://localhost
```

To stop: `docker compose down`
To rebuild after code changes: `docker compose up --build -d`

---

## VPS Deployment Guide (Ubuntu 22.04)

### 1. Install Docker

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
# Log out and back in, then verify:
docker --version
```

### 2. Clone & Configure

```bash
git clone https://github.com/your-user/reel-downloader.git
cd reel-downloader
cp .env.example .env
```

Edit `.env`:

```env
PORT=80
ALLOWED_ORIGINS=https://yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. Launch

```bash
docker compose up --build -d
```

### 5. Domain + Cloudflare

1. In your domain registrar, set nameservers to Cloudflare.
2. In Cloudflare DNS, add an **A** record pointing to your server's IP (orange-cloud **proxied**).
3. In **SSL/TLS → Overview**, set mode to **Full**.
4. Under **SSL/TLS → Edge Certificates**, enable **Always Use HTTPS**.
5. (Optional) Under **Speed → Optimization**, enable Auto Minify and Brotli.

Cloudflare terminates TLS and forwards HTTP to your nginx on port 80. No certbot needed.

### 6. Monitoring

```bash
docker compose logs -f          # all services
docker compose logs -f backend  # backend only
docker compose ps               # health status
```

Services are configured with `restart: unless-stopped`, so they survive host reboots.

---

## Updating yt-dlp

### Automatic

The backend runs a scheduled job every day at **3:00 AM** that executes `yt-dlp -U` inside the container and logs the result. No manual action needed.

### Manual

```bash
docker compose exec backend yt-dlp -U
```

### Full Rebuild

If the in-place update fails (e.g., a major Python change):

```bash
docker compose build --no-cache backend
docker compose up -d backend
```

---

## Swapping yt-dlp for a Paid Scraping API

The extraction logic is behind the `ExtractorService` interface:

```java
public interface ExtractorService {
    ExtractionResponse extract(String url);
}
```

The default implementation (`YtDlpExtractorService`) shells out to yt-dlp. To use a paid API (e.g., ScrapingBee, Bright Data, or a custom endpoint):

1. **Create a new implementation:**

```java
@Service
@ConditionalOnProperty(name = "app.extractor", havingValue = "api")
public class ApiScrapingExtractorService implements ExtractorService {

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String apiUrl;

    public ApiScrapingExtractorService(
            RestTemplate restTemplate,
            @Value("${app.scraping-api.key}") String apiKey,
            @Value("${app.scraping-api.url}") String apiUrl) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
    }

    @Override
    public ExtractionResponse extract(String url) {
        // Call your paid API, parse the response,
        // and return an ExtractionResponse record.
    }
}
```

2. **Add a condition to the existing service:**

```java
@Service
@ConditionalOnProperty(name = "app.extractor", havingValue = "ytdlp", matchIfMissing = true)
public class YtDlpExtractorService implements ExtractorService { ... }
```

3. **Set the property:**

```yaml
# application.yml or environment variable
app:
  extractor: api          # "ytdlp" (default) or "api"
  scraping-api:
    url: https://api.example.com/extract
    key: ${SCRAPING_API_KEY}
```

No other code changes required — the controller and cache layer are decoupled from the extraction implementation.

---

## Ad Network Integration Guide

The frontend includes `<AdSlot />` components at three positions on every page: **top**, **inline** (between content sections), and **bottom**. Each renders a placeholder `<div>` with a fixed height to prevent layout shift.

### Supported Networks

| Network       | Dashboard                              | Min Traffic |
| ------------- | -------------------------------------- | ----------- |
| Adsterra      | https://adsterra.com                   | None        |
| Monetag       | https://monetag.com                    | None        |
| PropellerAds  | https://propellerads.com               | None        |
| Google AdSense| https://adsense.google.com             | Moderate    |

### Integration Steps

1. **Sign up** with your chosen ad network and get approved.
2. **Create ad units** — choose banner sizes that match the slot heights:
   - Top / Bottom: 728×90 (leaderboard) or 320×50 (mobile banner)
   - Inline: 300×250 (medium rectangle) or 336×280
3. **Open `src/components/AdSlot.tsx`** and paste the ad network's `<script>` tag inside the slot's `<div>`.
4. For **Adsterra / Monetag**: paste their anti-adblock script in `src/app/layout.tsx` inside `<head>`.

### Best Practices

- ⚠️ **Never place ads directly adjacent to the Download button** — this violates most ad network policies and frustrates users.
- Use `loading="lazy"` on ad iframes below the fold.
- Test on mobile — ensure ads don't overlap content.
- Start with 2–3 ads per page; more can hurt SEO and user experience.

---

## Configuration Reference

| Variable              | Default          | Description                                    |
| --------------------- | ---------------- | ---------------------------------------------- |
| `PORT`                | `80`             | Host port for nginx                            |
| `NEXT_PUBLIC_API_URL` | *(empty)*        | API base URL for frontend (leave empty in Docker) |
| `NEXT_PUBLIC_SITE_URL`| `http://localhost` | Canonical site URL for SEO                   |
| `ALLOWED_ORIGINS`     | `*`              | CORS allowed origins (comma-separated)         |
| `REDIS_HOST`          | `redis`          | Redis hostname                                 |
| `REDIS_PORT`          | `6379`           | Redis port                                     |
| `YTDLP_PATH`         | `/usr/local/bin/yt-dlp` | Path to yt-dlp binary                  |
| `EXTRACTION_TIMEOUT`  | `20`             | yt-dlp timeout in seconds                      |
| `CACHE_TTL_MINUTES`   | `30`             | Redis cache TTL in minutes                     |
| `MAX_VIDEO_SIZE`      | `104857600`      | Max video stream size in bytes (100 MB)        |
| `RATE_LIMIT_EXTRACT`  | `10`             | Max extract requests / min / IP                |
| `RATE_LIMIT_DOWNLOAD` | `5`              | Max download requests / min / IP               |

---

## API Reference

### `POST /api/extract`

Extract metadata from an Instagram reel or post.

**Request:**

```json
{ "url": "https://www.instagram.com/reel/ABC123/" }
```

**Response (200):**

```json
{
  "title": "Funny cat video",
  "thumbnail": "https://scontent.cdninstagram.com/...",
  "duration": "0:30",
  "videoUrl": "https://scontent.cdninstagram.com/...",
  "uploader": "catpage",
  "sourceUrl": "https://www.instagram.com/reel/ABC123/"
}
```

**Errors:** 400 (invalid URL), 404 (private/unavailable), 429 (rate limited), 502 (yt-dlp failure), 504 (timeout).

---

### `GET /api/download?url=<encoded>&filename=<optional>`

Stream the video file to the browser as an attachment.

**Headers returned:**

```
Content-Type: video/mp4
Content-Disposition: attachment; filename="reel_1699228800.mp4"
```

**Errors:** Same as `/api/extract`, plus 413 (video too large).

---

### `GET /api/health`

Health check endpoint.

**Response:**

```json
{ "status": "ok", "ytdlpVersion": "2024.11.04" }
```

---

## Security

- **No SSRF** — URL allowlist (host must be exactly `instagram.com` or `www.instagram.com`; prevents `instagram.com.evil.com`)
- **No command injection** — yt-dlp invoked with `ProcessBuilder` argument list, never string concatenation
- **Rate limiting** — Bucket4j per-IP, with Cloudflare IP detection
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- **No disk storage** — videos streamed through memory, extraction results cached in Redis only
- **No user data** — no accounts, no tracking, no analytics
- **No stack traces** — all errors wrapped in clean JSON responses
- **Non-root containers** — both backend and frontend Docker images run as unprivileged users
- **Timeouts everywhere** — yt-dlp (20s), HTTP connections (60s), download streaming (120s)

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

**Disclaimer:** This tool is intended for downloading content you own or have permission to use. Respect content creators' rights and Instagram's Terms of Service.

