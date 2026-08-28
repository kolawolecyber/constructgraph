ConstructGraph

ConstructGraph is a construction project intelligence dashboard that models relationships between projects, tasks, materials, and suppliers as a connected graph.

The application is designed to help project teams understand how construction activities and supply-chain dependencies are connected, identify downstream task impacts, and inspect individual entities and their relationships.



Overview

Construction projects contain many interconnected dependencies. A delay in one task can affect subsequent activities, while problems with a supplier or material can affect multiple construction tasks.

ConstructGraph represents these relationships as a graph and provides focused views for:

- Project overview
- Construction task dependencies
- Supplier and material relationships
- Task impact analysis
- Supplier impact analysis
- Interactive graph exploration
- Individual graph-node inspection

The goal is to make project dependencies easier to understand and support faster project-impact analysis.



Key Features

Project Overview

Provides a high-level view of a construction project, including:

- Project name
- Description
- Location
- Project status
- Construction phases
- Number of tasks per phase

Interactive Graph Explorer

The Graph Explorer visualizes project entities and their relationships using an interactive node-based interface.

Graph entities include:

- Tasks
- Materials
- Suppliers

Users can:

- Navigate the graph
- Zoom and pan
- View relationships between entities
- Select individual nodes
- Inspect node properties
- Inspect connected relationships

Task Impact Analysis

ConstructGraph can analyze the potential downstream impact of a task.

The analysis identifies:

- The selected task
- Affected downstream tasks
- Task status
- Task priority
- Dependency depth

This helps users understand how a disruption to one activity may propagate through the project.

Supplier Impact Analysis

Supplier analysis provides visibility into supplier-related dependencies.

The system can identify:

- Supplier information
- Supplier reliability score
- Materials associated with the supplier
- Construction tasks affected by those materials
- Dependency depth

Graph Node Inspector

Selecting a graph node opens an inspector showing:

- Entity type
- Entity name
- Available properties
- Number of relationships
- Relationship direction
- Connected entity information



Technology Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Lucide React
- React Flow / "@xyflow/react"

Backend

- Next.js App Router API routes
- TypeScript
- Zod
- Application/use-case layer
- Repository pattern

Data Layer

The application uses a graph-oriented project repository to retrieve project, task, supplier, material, and relationship data.

Database and graph persistence are isolated behind the repository layer so that application logic does not depend directly on the API route implementation.



Architecture

ConstructGraph follows a layered architecture:

┌─────────────────────────────────────┐
│             UI Layer                │
│                                     │
│ Dashboard / Graph / Impact Panels   │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│          API / Route Layer          │
│                                     │
│ Request validation + HTTP responses │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│        Application Layer            │
│                                     │
│ Project / Graph / Impact Use Cases  │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│          Domain Layer               │
│                                     │
│ Types + Repository Contracts        │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│        Data / Repository Layer      │
│                                     │
│ Graph and project data access       │
└─────────────────────────────────────┘

This separation keeps business logic independent from HTTP handlers and makes the system easier to extend and test.

---

Project Structure

constructgraph/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── health/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   └── suppliers/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── application/
│   │   ├── impact/
│   │   │   ├── get-task-impact.ts
│   │   │   └── get-supplier-impact.ts
│   │   │
│   │   └── projects/
│   │       ├── get-graph-node-details.ts
│   │       ├── get-project-graph.ts
│   │       ├── get-project-overview.ts
│   │       ├── get-project-suppliers.ts
│   │       ├── get-project-tasks.ts
│   │       └── project-repository.ts
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   ├── graph/
│   │   ├── impact/
│   │   └── layout/
│   │
│   ├── domain/
│   │   └── project/
│   │       ├── repositories/
│   │       └── types/
│   │
│   ├── lib/
│   │   └── api/
│   │
│   └── types/
│       └── constructgraph.ts
│
├── scripts/
│   ├── cognodb.ts
│   ├── seed.ts
│   └── setup-db.ts
│
├── package.json
└── README.md



API

The application exposes project and impact-analysis endpoints through the Next.js App Router.

Health

GET /api/health

Checks application availability.

Project Overview

GET /api/projects/{projectId}

Returns the overview information for a project.

Project Graph

GET /api/projects/{projectId}/graph

Returns graph nodes and relationships for a project.

Graph Node Details

GET /api/projects/{projectId}/graph/nodes/{nodeId}

Returns detailed information about a graph node and its relationships.

Project Tasks

GET /api/projects/{projectId}/tasks

Returns tasks associated with a project.

Project Suppliers

GET /api/projects/{projectId}/suppliers

Returns suppliers associated with a project.

Task Impact

GET /api/tasks/{taskId}

Returns the downstream impact associated with a task.

Supplier Impact

GET /api/suppliers/{supplierId}

Returns the project impact associated with a supplier.



Input Validation

API route parameters are validated before they are passed to application logic.

Identifiers are constrained using Zod validation to prevent malformed input from reaching the repository layer.

The application follows the principle that client-side validation is for user experience, while server-side validation is responsible for enforcing API boundaries.



Security Considerations

Security is treated as an architectural concern rather than only a frontend concern.

Current implementation principles include:

- Server-side validation of route parameters
- Strict identifier formats
- Separation between API routes and application logic
- Repository abstraction for data access
- Generic error messages returned to clients
- Avoidance of exposing internal exception details through API responses
- Encapsulation of data-access operations behind repository interfaces
- Use of environment variables for sensitive configuration
- Parameterized database/graph queries at the data-access layer

The frontend is treated as an untrusted client. Business rules and sensitive operations should therefore remain enforced on the server.



Error Handling

API routes return appropriate HTTP status codes for common conditions.

Examples include:

Situation| Status
Invalid identifier| "400"
Resource not found| "404"
Successful request| "200"
Server/data-layer failure| "503"

Internal errors are not returned directly to clients. This prevents implementation details and potentially sensitive information from being exposed through API responses.



Running the Project

1. Install dependencies

npm install

2. Configure environment variables

Create a local environment file:

.env.local

Add the environment variables required by the configured data layer.

Do not commit secrets or credentials to source control.



3. Prepare the database

The project includes database setup and seed scripts under:

scripts/

The available scripts include:

setup-db.ts
seed.ts
cognodb.ts

Run the appropriate setup/seed commands defined in "package.json" for the configured environment.

---

4. Start the development server

npm run dev

Open:

http://localhost:3000



Production Build

Before deployment, verify the production build:

npm run build

Then start the production server:

npm start

A successful production build confirms that the application compiles correctly for deployment.

---

Example Project

The dashboard currently uses a seeded construction project for demonstration and evaluation.

The example project demonstrates relationships between:

Supplier
    │
    ▼
Material
    │
    ▼
Task
    │
    ▼
Dependent Task

This allows the impact-analysis functionality to demonstrate how changes or disruptions can propagate through connected construction activities.



Design Decisions

Why a Graph?

Traditional project tables can describe individual records well, but construction projects also contain complex relationships.

A graph makes relationships explicit:

Supplier ──supplies──> Material
Material ──required by──> Task
Task ──depends on──> Task

This structure makes dependency traversal and impact analysis more natural.

Why a Repository Layer?

The repository abstraction keeps data-access concerns separate from application/business logic.

Use cases depend on repository contracts rather than directly depending on a specific database implementation.

This makes the system easier to:

- Test
- Maintain
- Extend
- Change data providers
- Keep business logic independent from infrastructure

Why Separate Use Cases?

Operations such as project overview, graph retrieval, task impact, supplier impact, and node inspection have different responsibilities.

Keeping them as separate application use cases prevents API routes from becoming large containers for business logic.



Current Limitations

This version is focused on demonstrating the core project-intelligence workflow.

Potential future improvements include:

- User authentication and role-based authorization
- Project creation and editing
- Real-time project updates
- More advanced dependency analysis
- Historical project-impact tracking
- Risk scoring
- Schedule and cost integration
- More graph relationship types
- Automated testing and CI/CD
- Pagination for larger datasets
- Advanced graph filtering and search
- Audit logging

---

Future Direction

ConstructGraph can be extended into a broader construction project intelligence platform.

Potential future capabilities include:

Project Data
     │
     ├── Schedule
     ├── Cost
     ├── Tasks
     ├── Materials
     ├── Suppliers
     └── Risks
            │
            ▼
      Dependency Graph
            │
            ▼
    Impact & Risk Analysis
            │
            ▼
      Project Decisions

The architecture is intentionally structured to support these extensions without requiring the frontend to contain core business logic.



Development Principles

ConstructGraph is developed around the following principles:

1. Keep business logic on the server.
2. Validate external input at the API boundary.
3. Keep data access behind repository abstractions.
4. Return safe and predictable API errors.
5. Treat the frontend as untrusted.
6. Keep the domain model independent from infrastructure.
7. Prefer small, focused application use cases.
8. Avoid exposing sensitive implementation details.
9. Keep the interface responsive across desktop and mobile.
10. Prioritize maintainability and security alongside functionality.



Status

Project status: Functional prototype / technical assessment implementation.

The current implementation demonstrates the core ConstructGraph concept through project overview, graph visualization, node inspection, task impact analysis, and supplier impact analysis.



License

This project was created as a technical project/assessment implementation.