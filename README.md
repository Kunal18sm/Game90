# Gome

Multiplayer 3D city game with a React + Vite frontend and an Express + Socket.IO backend.

## Structure

- `client/`: frontend source, Vite config, static assets, and frontend build output
- `server/`: API, Socket.IO server, MongoDB model, and backend env
- `package.json`: root scripts for client and server commands

## Run

Frontend:

```powershell
npm run dev:client
```

Backend:

```powershell
npm run dev:server
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API and Socket.IO: `http://localhost:8080`

## Environment

Client variables go in `client/.env`:

- `VITE_API_URL`
- `VITE_SOCKET_URL`

Server variables go in `server/.env`:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`

Examples for both are included as `.env.example`.

## Notes

- If backend shows `EADDRINUSE`, that port is already occupied by another process.
- Root frontend scripts use Vite `--configLoader runner` so the config works on this machine where the default bundle loader was failing with `spawn EPERM`.
