# Chat Application

This is a full-stack chat application built as a monorepo, leveraging modern web technologies to deliver a real-time messaging experience. The project is structured with a powerful Fastify backend and a responsive React frontend, managed by Nx.

## Features

**Backend (API)**:

- **CQRS Pattern**: Strict separation of Commands for mutations and Queries for read-only operations, handled by `CommandBus` and `QueryBus`.
- **Event-Driven Architecture**: Uses `RedisEventBus` for publishing and subscribing to domain events for side effects.
- **Database**: PostgreSQL with Drizzle ORM for type-safe database access and migrations.
- **Real-time Communication**: Integrated with Socket.IO for real-time messaging.
- **Dependency Injection**: Awilix for managing handler and service lifecycles.
- **Input Validation**: Zod schemas for type-safety and runtime guarantees.
- **Object Storage**: Minio for S3-compatible object storage (e.g., file uploads).
- **Fastify Framework**: High-performance HTTP server with type-safe routes and plugins.

**Frontend (Web)**:

- **ReactJS**: Modern UI development with hooks and composition.
- **shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS, prioritizing accessibility and user experience.
- **TypeScript**: Strict typing for components, props, and state management.
- **Tailwind CSS**: Utility-first styling with shadcn design tokens.
- **Real-time UI**: Connects to the backend via Socket.IO for live updates.

## Technology Stack

- **Monorepo Tool**: Nx
- **Package Manager**: pnpm
- **Backend**: Node.js, Fastify, TypeScript
- **Database**: PostgreSQL, Drizzle ORM
- **Real-time**: Socket.IO, Redis
- **Frontend**: React, TypeScript, shadcn/ui, Tailwind CSS
- **Dependency Injection**: Awilix
- **Validation**: Zod

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone the Repository

```bash
git clone <repository_url>
cd chat
```

### 2. Install Dependencies

This project uses pnpm for package management. Install the dependencies for all projects in the monorepo:

```bash
pnpm install
```

### 3. Environment Variables

Copy the example environment file and update it with your local settings. You'll find an example in `.devcontainer/.env.example`.

```bash
cp .devcontainer/.env.example .env
# Open .env and fill in your database credentials and other necessary environment variables.
```

### 4. Database Setup

The project uses PostgreSQL with Drizzle ORM. You can spin up a PostgreSQL instance using Docker Compose.

**Start Docker Services (PostgreSQL, Redis, Minio etc.):**

```bash
docker compose -f .devcontainer/docker-compose.yaml up -d
```

This command will start the database and other services in the background. Once the services are up, run Drizzle push for the API to set up the database schema:

```bash
pnpm -F api drizzle:push
```

### 5. Running the Application

#### Development Mode

To run both the API and Web applications in development mode with hot-reloading:

```bash
pnpm nx run-many --target=serve --all --parallel
```

This will start the API server (typically on `http://localhost:3000`) and the web application (typically on `http://localhost:4200`).

#### Production Build and Docker Deployment

To build the applications and deploy them using Docker Compose:

```bash
pnpm docker:deploy
```

To bring down the Docker services:

```bash
pnpm docker:down
```

### 6. Linting and Formatting

This project uses ESLint for linting and Prettier for code formatting. Husky and lint-staged are configured to automatically format and lint your code before commits.

```bash
pnpm lint-staged
```

### 7. Testing

To run tests for all applications:

```bash
pnpm nx run-many --target=test --all
```

To run tests for a specific application (e.g., API):

```bash
pnpm nx test api
```

## Project Structure

The monorepo is organized into the following main directories:

- `apps/api`: The Fastify backend application.
- `apps/web`: The React frontend application.
- `packages/shared`: Shared utilities, types, and components used across applications.
- `docker`: Docker-related configurations and Dockerfiles for deployment.
- `.devcontainer`: Development container configurations for VS Code.

## Contributing

Contributions are welcome! Please ensure you follow the existing code style and conventions. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the [ISC License](LICENSE).
