# Offering Bowl

Offering Bowl is a platform designed to connect Buddhist monastics with patrons who can sponsor them through one-time or recurring donations. Inspired by platforms like Patreon, Offering Bowl focuses exclusively on the unique needs of monastics, providing a space for updates, messages, and sponsorship opportunities.

---

## Features

- **Monastics' Profiles**: Monastics can share updates, post images, and manage their sponsorships.
- **Sponsorships**: Patrons can provide one-time or recurring support.
- **Secure Donations**: Integrates with Stripe for secure transactions.
- **Private Messaging**: Communication between patrons and monastics.
- **Media Storage**: Support for images and videos uploaded by monastics.

---

## Tech Stack

- **Backend**: Node.js with Express.js (TypeScript)
- **Frontend**: Vue.js (TypeScript)
- **Database**: AWS DynamoDb
- **Authentication**: Firebase
- **File Storage**: AWS S3 and Firebase Storage
- **Containerization**: Docker
- **Deployment**: AWS EC2 and CloudFront
- **CI/CD**: GitHub Actions

---

## Getting Started

### Prerequisites

Ensure the following are installed on our system:

- Node.js (tls/jot or v22.11.0 or higher)
- npm (v10.9.0 or higher)
- Docker (version 27.3.1 or higher)
- Git

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/nickpettican/offering-bowl.git
   cd offering-bowl
   ```

2. **Install Dependencies**:

    **Server**:

    ```bash
    cd server
    npm install
    ```

    **Client**:

    ```bash
    cd ../client
    npm install
    ```

3. **Set Up Environment Variables**:

    Create a `.env` file in the root directory and populate it based on the `.env.example`.

    Bear in mind that for `docker compose` we use `.env`.

4. **Run the Development Environment**:

    Use Docker Compose to start the client, back-end and database services together:

    ```bash
    npm run dev
    ```

    or

    ```bash
    docker compose --env-file .env up --build
    ```

    Otherwise see the **scripts** section for more information.

5. **Access the Application**:

    * Backend: http://localhost:SERVER_PORT
    * Frontend: http://localhost:CLIENT_PORT

### Git Hooks

This project uses [husky](https://typicode.github.io/husky/) for Git hooks to ensure code quality before commits. After cloning the repository and installing dependencies, you'll need to initialize husky:

```bash
# Install dependencies first
npm ci

# Initialize husky
npx husky install
```

> **Note**: If you don't initialize husky, Git hooks won't run and you may commit code that doesn't meet the project's quality standards.

### Database set-up

For development we use the Docker image `amazon/dynamodb-local:2.5.3`.

If we run `docker compose` it will automatically be set up (see Docker section bellow).

In dev, however, to create the tables in the database for now we have to use `services/db-initialiser`. See the README there for more information.

For the AWS credentials we can add any dummy values. For region I recommend `eu-south-2` and a simple ID and secret like `LOCAL`.

---

## Table Definitions

Table definitions match the production tables defined in the CDK infrastructure. Any changes to table structures should be made in both:

- `infra/lib/constructs/database.ts` (for production)
- `services/db-initialiser/dynamodb.ts` (for development)

---

## Scripts

### Server (Back-End)

Run these commands from the `server/` directory:

* **Start Development Server**:

    Dev:

    ```bash
    npm run start
    ```

* **Quality Control**:

    This will execute tests, eslint, ts type checking and prettier.

    ```bash
    npm run qc
    ```

    We can also run each QC step separately (see scripts in `server/package.json`).

* **Build**:

    Dev:

    ```bash
    npm run build
    ```

### Client (Front-End)

Run these commands from the `client/` directory:

* **Compile and Hot-Reload for Development**:

    Dev:

    ```bash
    npm run dev
    ```

* **Type-Check, Compile and Minify for Production**:

    ```bash
    npm run build
    ```

* **Run Unit Tests with [Vitest](https://vitest.dev/)**:

    ```bash
    npm run test:unit
    ```

* **Run End-to-End Tests**:

    See `client/README.md` for more information.

---

## Docker

For detailed information about `docker compose` [read the docs](https://docs.docker.com/reference/cli/docker/compose/).

If using `docker compose` bear in mind that each service communicates with each other not via `localhost` but by the name of the respective container. For instance **ob-server** will find **dynamodb** under `http://dynamodb:PORT`.

Use `.env` for this (see the `compose.yml` file).

### Docker compose env vars

An important consideration is that of the environment variables.

| Path     | Name       | Purpose                                          | Considerations                                                   |
|----------|------------|--------------------------------------------------|------------------------------------------------------------------|
| .        | .env       | for building all apps on docker compose          | used by docker compose by default unless --env-file is specified |
| .        | .env.local | for running services locally                     | can be used by docker compose with --env-file         |
| server/  | .env       | for running the app in docker compose            | used by running ob-server container in docker compose            |
| server/  | .env.local | for running the app locally                      | used by default by node (see server/src/_config/env.vars.ts)                                         |
| server/  | .env.test  | for running tests, **absolutely necessary**      | |
| client/  | .env       | for running the app in docker compose (OPTIONAL) | used by running ob-client container in docker compose            |
| client/  | .env.local | for running the app locally (OPTIONAL)           | used by default by vite                                          |

If environment variables are passed by `--env-file` to `docker compose`, and these variables are mapped into a container using `environment:`, **they will override any variables** in `service/.env` even if they are passed to the container via `env_file:`.

### Build and Run Locally

Without adding the `--env-file` option the `.env` file in the parent directory will be used for the environment building the containers and the variables here can be passed to the container through `environment:` in `compose.yml`.

Here we specified `--env-file .env` to make it exclusive for `docker compose`. However, this is optional.

1. Build the Docker images:

    ```bash
    docker compose --env-file .env build --no-cache
    ```

2. Start the containers:

    ```bash
    docker compose --env-file .env up --build
    ```

3. Stop the containers:

    ```bash
    docker compose down
    ```

---

## Deployment

### Using GitHub Actions

On each push and pull-request to the `main` branch:

1. Code is tested and linted.

2. Docker images are built and pushed to the container registry.

The workflow is set up to only build the respective application if there are changes, otherwise these steps are skipped.

---

## Contributing

We welcome contributions to this non-profit project!

Please commit any pull requests against the `main` branch. Contribution Guidelines will be set up soon.

---

## License

This project is licensed under the Apache 2.0 License.

---

## Contact

For questions or support, please contact:

* [nickpettican](https://github.com/nickpettican)

* [offering-bowl](https://github.com/nickpettican/offering-bowl)