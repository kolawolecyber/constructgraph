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




Why a Graph Database?

The interesting part of construction project data is not only the individual records, but how those records are connected.

For example:

Supplier
   │
   │ SUPPLIES
   ▼
Material
   │
   │ REQUIRED_FOR
   ▼
Task
   │
   │ DEPENDS_ON
   ▼
Dependent Task

Consider the question:

«"If a supplier becomes unavailable, which construction activities could eventually be affected?"»

Answering this requires traversing several relationships:

Supplier → Material → Task → Dependent Task

A relational database can represent these entities, but increasingly complex dependency analysis requires multiple joins and application-side relationship reconstruction.

A graph database makes these relationships first-class data and allows the application to traverse them directly.

ConstructGraph therefore uses CognoDB as the graph database layer, with openCypher queries accessed through the official Neo4j JavaScript driver.

The graph model is particularly useful for:

- Multi-hop dependency traversal
- Construction task impact analysis
- Supplier impact analysis
- Relationship exploration
- Finding connected project entities

---

Data Model

The core graph consists of four main node types.

Nodes

Project
Task
Material
Supplier

Relationships

Project  ──HAS_TASK──────> Task

Supplier ──SUPPLIES──────> Material

Material ──REQUIRED_FOR──> Task

Task     ──DEPENDS_ON────> Task

Graph Overview

                    ┌─────────────┐
                    │  Supplier   │
                    └──────┬──────┘
                           │
                       SUPPLIES
                           │
                           ▼
                    ┌─────────────┐
                    │  Material   │
                    └──────┬──────┘
                           │
                      REQUIRED_FOR
                           │
                           ▼
                    ┌─────────────┐
                    │    Task     │
                    └──────┬──────┘
                           │
                       DEPENDS_ON
                           │
                           ▼
                    ┌─────────────┐
                    │    Task     │
                    └─────────────┘

                    ┌─────────────┐
                    │   Project   │
                    └──────┬──────┘
                           │
                       HAS_TASK
                           │
                           ▼
                    ┌─────────────┐
                    │    Task     │
                    └─────────────┘

This model is intentionally small enough for the CognoDB free tier while still demonstrating meaningful graph traversal.

---

Multi-Hop Graph Queries

The application is designed around graph traversals rather than loading unrelated records and reconstructing relationships in the application layer.

Task Impact

A task may have downstream tasks that depend on it.

A multi-hop traversal can be represented as:

MATCH (start:Task {id: $taskId})-[:DEPENDS_ON*1..]->(affected:Task)
RETURN affected

This allows the application to identify tasks connected through one or more dependency levels.

Supplier Impact

Supplier impact requires traversing several different node types:

Supplier
   ↓
Material
   ↓
Task
   ↓
Dependent Task

Conceptually:

MATCH (s:Supplier {id: $supplierId})
      -[:SUPPLIES]->(m:Material)
      -[:REQUIRED_FOR]->(t:Task)
      -[:DEPENDS_ON*0..]->(affected:Task)
RETURN s, m, t, affected

This demonstrates a graph query that crosses multiple relationship types and multiple hops.

Queries are designed to use parameters rather than concatenating user-provided values into Cypher.




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

---

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

- CognoDB Cloud
- openCypher
- Bolt protocol
- Official Neo4j JavaScript driver

CognoDB is used as the graph database layer.

The database connection and graph queries are isolated behind the repository/data-access layer so that application use cases do not depend directly on HTTP routes or database connection details.




Architecture

ConstructGraph follows a layered architecture:

┌─────────────────────────────────────┐
│              UI Layer               │
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
│       Repository / Data Layer       │
│                                     │
│ Neo4j Driver → CognoDB              │
└─────────────────────────────────────┘

This separation keeps business logic independent from HTTP handlers and database infrastructure.

It also makes individual layers easier to test, maintain, and extend.

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

Returns overview information for a project.

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

---

Input Validation

API route parameters are validated before they are passed to application logic.

Zod is used to validate identifiers and prevent malformed input from reaching the repository layer.

The application follows the principle that:

«Client-side validation improves user experience, while server-side validation enforces API boundaries.»




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
- Environment variables for sensitive configuration
- Parameterized graph queries at the data-access layer

The frontend is treated as an untrusted client.

Business rules and sensitive operations therefore remain enforced on the server.

---

Error Handling

API routes return appropriate HTTP status codes for common conditions.

Situation| Status
Invalid identifier| "400"
Resource not found| "404"
Successful request| "200"
Server/data-layer failure| "503"

Internal errors are not returned directly to clients.

This prevents implementation details and potentially sensitive information from being exposed through API responses.




Running the Project

1. Clone the repository

git clone https://github.com/kolawolecyber/constructgraph.git
cd constructgraph

2. Install dependencies

npm install

3. Configure environment variables

Create a local environment file:

.env.local

Add the environment variables required by the configured CognoDB data layer.

Example:

COGNODB_URI=bolt+s://<instance-id>.databases.cognodb.cloud
COGNODB_USERNAME=cognodb
COGNODB_PASSWORD=<your-password>

«Use the exact environment variable names expected by the implementation.»

Never commit ".env.local", database passwords, or other credentials to source control.

4. Create a CognoDB instance

Create a free CognoDB Cloud instance:

https://console.cognodb.com/signup

Create a free "c0" instance and select a region.

CognoDB provides a Bolt connection URI and generated database password after provisioning.

Save the generated password securely because it is displayed only once.

5. Prepare the database

The repository includes database-related scripts under:

scripts/
├── cognodb.ts
├── setup-db.ts
└── seed.ts

These scripts are responsible for database connectivity, setup, and seed data.

Use the corresponding commands defined in "package.json" to initialize and seed the configured database.

6. Start the development server

npm run dev

Open:

http://localhost:3000

---

Production Build

Verify the production build with:

npm run build

Then start the production server:

npm start

A successful production build confirms that the application compiles correctly for deployment.




Seed Data

The repository includes realistic seed data representing a construction project and its connected entities.

The data demonstrates relationships between:

Project
   │
   └── HAS_TASK ──> Task
                       │
                       ├── DEPENDS_ON ──> Task
                       │
                       └── REQUIRED material relationships

Supplier
   │
   └── SUPPLIES ──> Material

The seed data is intentionally limited in size so the application can run comfortably within a small managed graph-database instance while still demonstrating meaningful graph traversal.




Design Decisions

Why Graph?

Construction projects contain relationships that are often more important than the individual records.

For example:

Supplier ──SUPPLIES──────> Material
Material ──REQUIRED_FOR──> Task
Task ──DEPENDS_ON───────> Task

A graph allows these connections to be traversed directly.

This makes questions such as:

- Which tasks depend on this task?
- Which tasks could be affected by this material?
- Which construction activities depend on a supplier?
- How far can the impact of a disruption propagate?

natural graph queries.

Why CognoDB?

CognoDB provides a managed graph database environment that supports openCypher over the Bolt protocol.

ConstructGraph uses the official Neo4j JavaScript driver to communicate with the database.

This allows the application to use a standard graph-database driver while keeping database infrastructure isolated behind the repository layer.

Why a Repository Layer?

The repository abstraction keeps data-access concerns separate from application/business logic.

Use cases depend on repository contracts rather than directly depending on database connection details.

This makes the system easier to:

- Test
- Maintain
- Extend
- Change data providers
- Keep business logic independent from infrastructure

Why Separate Use Cases?

Operations such as project overview, graph retrieval, task impact, supplier impact, and node inspection have different responsibilities.

Keeping them as separate application use cases prevents API routes from becoming large containers for business logic.




Example Impact Flow

A simplified supplier-impact analysis can be understood as:

Supplier
   │
   │ supplies
   ▼
Material
   │
   │ required for
   ▼
Task A
   │
   │ dependency
   ▼
Task B
   │
   │ dependency
   ▼
Task C

If the supplier becomes unavailable, the graph can be traversed to identify the construction activities that may be affected.

This is the core reasoning behind using a graph database for this application.




Current Limitations

This version focuses on demonstrating the core project-intelligence workflow.

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

                  Project Data
                       │
       ┌───────────────┼────────────────┐
       ▼               ▼                ▼
    Schedule          Cost            Tasks
       │               │                │
       └───────────────┼────────────────┘
                       │
              ┌────────▼────────┐
              │ Dependency Graph│
              └────────┬────────┘
                       │
                       ▼
              Impact & Risk Analysis
                       │
                       ▼
                Project Decisions

Additional entities such as risks, equipment, subcontractors, locations, schedules, and costs could be connected to the existing graph model.

The current architecture is intentionally structured so these capabilities can be added without moving core business logic into the frontend.




Development Principles

ConstructGraph is developed around the following principles:

1. Keep business logic on the server.
2. Validate external input at the API boundary.
3. Keep data access behind repository abstractions.
4. Use parameterized graph queries.
5. Return safe and predictable API errors.
6. Treat the frontend as untrusted.
7. Keep the domain model independent from infrastructure.
8. Prefer small, focused application use cases.
9. Avoid exposing sensitive implementation details.
10. Prioritize maintainability and security alongside functionality.




Status

Technical assessment implementation / functional prototype

The application demonstrates:

- Construction project overview
- Graph visualization
- Graph node inspection
- Task dependency analysis
- Supplier impact analysis
- Multi-hop graph traversal
- Layered application architecture
- Repository-based data access
- CognoDB-oriented graph persistence



Demo

Hosted demo:

«Add the deployed application URL here when available.»

Screen recording:

«Add the short screen-recording URL here when available.»

Screenshots:

«Add application screenshots here before submission.»


License

This project was created as a technical project/assessment implementation.