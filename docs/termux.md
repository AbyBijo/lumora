# Running Lumora on Termux (Android)

Lumora is a Next.js + Prisma app. On Termux there is one critical gotcha:

> **Prisma's query engine does not run on native Termux.** Prisma ships
> prebuilt engine binaries compiled for Linux **glibc**, but Termux uses
> Android's **bionic** libc, so the `.so` engine fails to load
> (`dlopen failed` — see prisma/prisma#24848). SQLite itself is fine; the
> Prisma layer is not.

The clean, no-root solution is to run Lumora inside a **proot-distro Debian**
environment — a full Linux userspace that runs unprivileged on any Android
device. Inside it, everything (Node, Prisma, SQLite, npm) works exactly like on
a desktop. This is the **recommended path** below.

---

## TL;DR

```bash
# In Termux:
pkg update -y && pkg upgrade -y
pkg install proot-distro -y
proot-distro install --architecture aarch64 debian
proot-distro login debian

# Inside Debian:
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs git
git clone <your-lumora-repo> lumora && cd lumora   # or copy the folder (see below)
npm install
cp .env.example .env.local && cp .env.example .env
npx prisma migrate dev
npm run dev -- -H 0.0.0.0
```

Then open **http://localhost:3000** in the phone's browser and register an
account — the app starts empty.

---

## Step-by-step

### 1. Install Termux properly

Use the **F-Droid** build or the **GitHub releases** build. The Play Store
version is unmaintained and breaks APIs.

- F-Droid: <https://f-droid.org/packages/com.termux/>
- GitHub: <https://github.com/termux/termux-app/releases>

After installing, allow storage if you want to copy files in:
`termux-setup-storage` (grants access to `~/storage/…`).

### 2. Install proot-distro and Debian

```bash
pkg update -y && pkg upgrade -y
pkg install proot-distro -y
proot-distro install --architecture aarch64 debian
proot-distro login debian
```

> `--architecture aarch64` forces the 64-bit rootfs on modern phones. If
> you're already inside a login and want to exit, type `exit`.

### 3. Inside Debian: Node.js + git

```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git
node -v   # should print v20.x or newer (Next.js 14 needs >= 18.17)
```

### 4. Get the Lumora code

Option A — clone your repo:

```bash
cd ~
git clone <your-lumora-repo-url> lumora
cd lumora
```

Option B — copy the folder you already have (e.g., from this workspace).
From **Termux** (not inside Debian), the Debian rootfs lives at:

```bash
ls ~/.local/share/proot-distro/installed-rootfs/debian/root/
```

So you can copy files from Termux directly:

```bash
# in Termux
cp -r ~/storage/downloads/lumora ~/.local/share/proot-distro/installed-rootfs/debian/root/
proot-distro login debian
cd ~/lumora
```

> Note: the workspace's `node_modules` and `.next` don't travel well across
> architectures/libcs — run `rm -rf node_modules .next` first, then reinstall
> inside Debian.

### 5. Install and configure

```bash
cd lumora
npm install
cp .env.example .env.local
cp .env.example .env
npx prisma migrate dev  # creates prisma/dev.db from committed migrations
```

### 6. Run

```bash
npm run dev -- -H 0.0.0.0
```

- `-H 0.0.0.0` lets other devices on your Wi-Fi reach the app.
- For a production build instead: `npm run build && npm start` (see
  "Troubleshooting" for memory limits on phones).

---

## Accessing the app

| Where | URL |
| --- | --- |
| Same phone (recommended) | <http://localhost:3000> |
| Another device on the same Wi-Fi | <http://<phone-ip>:3000> |

Find your phone's IP in Termux with:

```bash
ip -4 addr show 2>/dev/null | grep inet
# or: ifconfig
```

## Keeping the server alive

Android aggressively dozes background apps. To keep Lumora running:

```bash
# in Termux (outside Debian), before logging in:
termux-wake-lock

# run the server detached so it survives the terminal closing:
tmux new -d -s lumora 'npm run dev -- -H 0.0.0.0'
# reattach later with: tmux attach -t lumora
```

Also disable battery optimization for Termux in Android settings
(Settings → Apps → Termux → Battery → Unrestricted).

---

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `dlopen failed: ... libquery_engine-...so.node` / `Invalid or corrupted library` | You are on **native Termux**, not the proot. Re-run everything inside `proot-distro login debian`. This is a known Prisma limitation, not a Lumora bug. |
| `schema-engine...: syntax error` when running `npx prisma db push` | Same cause — native Termux. Use the Debian environment. |
| `Killed` / out-of-memory during `npm run build` | Phones have little RAM. Use `npm run dev` for daily use; if you must build: `NODE_OPTIONS=--max-old-space-size=2048 npm run build`. |
| `Error: listen EADDRINUSE :::3000` | Something else is on 3000. Run `npm run dev -- -H 0.0.0.0 -p 3001`. |
| `Cannot find module './src/engine/parse'` in scripts | You ran a script from outside `lumora/`. `cd lumora` first.
| App slow on first load | `next dev` compiles routes on demand; subsequent loads are fast. |
| Want a real DB instead of SQLite | The schema is Postgres-ready — see `docs/adr/0002-db.md`. Inside Debian you can run PostgreSQL directly. |

## Advanced: native Termux without proot (experimental)

Termux has an official **glibc repository** that lets glibc-linked binaries run
on native Termux via `glibc-runner`. In principle this can run Prisma's
engines, but it is fiddly (engine paths, openssl variants) and not officially
supported. If you want to try:

```bash
pkg install glibc glibc-runner   # after adding the glibc repo, see
                                 # https://github.com/termux/termux-packages/wiki/glibc
```

The proot-distro route is far simpler and is the recommended setup.
