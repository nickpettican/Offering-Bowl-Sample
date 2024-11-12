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
- **Database**: MongoDB
- **File Storage**: AWS S3 or Firebase Storage
- **Containerization**: Docker
- **Deployment**: DigitalOcean or AWS ECS
- **CI/CD**: GitHub Actions

---

## Getting Started

### Prerequisites

Ensure the following are installed on your system:

- Node.js (tls/jot or v22.11.0+)
- npm
- Docker
- Git
- MongoDb (optional)

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

4. **Run the Development Environment**:

    Use Docker Compose to start both the back-end and database services:

    ```bash
    docker compose up --build
    ```

5. **Access the Application**:

    * Backend: http://localhost:SERVER_PORT
    * Frontend: http://localhost:CLIENT_PORT

## Scripts

### Server (Back-End)

Run these commands from the `server/` directory:

* **Start Development Server**:

    ```bash
    npm run start
    ```

* **Lint Code**:

    ```bash
    npm run eslint
    ```

* **Run Tests**:

    ```bash
    npm test
    ```

* **Build for Production**:

    ```bash
    npm run build
    ```

### Client (Front-End)

Run these commands from the `client/` directory:

* **Start Development Server**:

    ```bash
    npm run serve
    ```

* **Lint Code**:

    ```bash
    npm run lint
    ```

* **Build for Production**:

    ```bash
    npm run build
    ```

## Docker

### Build and Run Locally

1. Build the Docker images:

    ```bash
    docker compose build
    ```

2. Start the containers:

    ```bash
    docker compose up
    ```

3. Stop the containers:

    ```bash
    docker compose down
    ```

## Deployment

### Using GitHub Actions

On each push to the `main` branch:

1. Code is tested and linted.

2. Docker images are built and pushed to the container registry.

## Contributing

We welcome contributions to this non-profit project!

Please commit any pull requests against the `main` branch. Contribution Guidelines will be set up soon.

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please contact:

* [nickpettican](https://github.com/nickpettican)

* [offering-bowl](https://github.com/nickpettican/offering-bowl)