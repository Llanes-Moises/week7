# FindIt — Campus Lost & Found

FindIt is a responsive campus lost-and-found web application. Students can browse reports, search listings, filter by category and Lost/Found status, and create, edit, or delete their own reports.

## Features
- Responsive blue-and-white dashboard
- Search by item name, description, category, and location
- Category and Lost/Found filters
- Report lost or found items
- Edit and delete reports created during the session
- Mark sample listings as returned
- Local browser persistence using `localStorage`
- Docker image using a multi-stage build

## Technologies
- React
- Vite
- Lucide React
- CSS
- Docker + Nginx

## Run locally
Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (usually `http://localhost:5173`).

## Production build
```bash
npm run build
npm run preview
```

## Docker
```bash
docker build -t findit-campus .
docker run --name findit-campus -p 8080:80 -d findit-campus
```

Open `http://localhost:8080`. To stop the container:

```bash
docker stop findit-campus
docker rm findit-campus
```

## CI/CD and deployment
Add a GitHub Actions workflow to install dependencies, run `npm run build`, build the Docker image, and deploy to a chosen hosting provider. Configure provider credentials as GitHub repository Actions secrets. Record the real workflow run and live URL here after deployment.

- GitHub repository: TODO
- Live application URL: TODO

## Important limitations
This starter version stores new/edited reports in the current browser's localStorage. It does not yet include a shared backend, authentication, real messaging, or a database. For a production group project, add a Node.js/Express API and a persistent database so reports are shared across users. The sample listings and images are demonstration data.
