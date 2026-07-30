# Event-Sourced Microservices

A sample implementation of a **microservices architecture with CQRS and Event Sourcing** in Node.js, built on the [cqrs.js.org](http://cqrs.js.org/) libraries (`cqrs-domain`, `cqrs-eventdenormalizer`, `cqrs-saga`, `viewmodel`).

The system is an e-commerce style demo (categories, products, orders) split into six independent Node processes. They never call each other directly — all communication happens through a central **Redis pub/sub message bus** carrying two kinds of messages:

- **Commands** express intent to change state (`createCategory`, `deleteProduct`, `changeStatusOrder`, …) and are validated against JSON schemas.
- **Events** are immutable facts about what happened (`categoryCreated`, `productDeleted`, …), appended to a per-service **MongoDB event store** — the source of truth from which all state is derived.

Read and write sides are fully separated (CQRS): writes go through aggregates in the domain services, while the web host denormalizes events into a MongoDB **read model** that serves the REST API and pushes live updates to the browser over Socket.IO. **Sagas** provide cross-service consistency by reacting to events with new commands — for example, deleting a category automatically issues a `deleteProduct` command for every product in it.

### Architecture

Solid arrows carry **commands**, dashed arrows carry **events**.

```mermaid
flowchart LR
    Web["Web App Host<br/>(Express + Socket.IO, :3000)"]
    Bus(["Message Bus<br/>(Redis pub/sub)"])

    subgraph Core["Core Microservices"]
        Category["Category"]
        Product["Product"]
        Order["Order"]
    end

    subgraph Sagas["Saga Services"]
        SagaCategory["Saga Category"]
        SagaProduct["Saga Product"]
    end

    Web -->|commands| Bus
    Bus -.->|events| Web

    Bus -->|commands| Category
    Category -.->|events| Bus

    Bus -->|commands| Product
    Product -.->|events| Bus

    Bus -->|commands| Order
    Order -.->|events| Bus

    Bus -.->|events| SagaCategory
    SagaCategory -->|commands| Bus

    Bus -.->|events| SagaProduct
    SagaProduct -->|commands| Bus
```

### Services

| Process | Role |
| --- | --- |
| `web-host` | Express + Socket.IO front end (AngularJS SPA). Forwards browser commands to the bus, denormalizes events into the read model, exposes `/api/*` read endpoints, and streams events back to connected browsers. |
| `microservice-category` | Domain service owning the **Category** aggregate and its event store. |
| `microservice-product` | Domain service owning the **Product** aggregate and its event store. |
| `microservice-order` | Domain service owning the **Order** aggregate and its event store. |
| `microservice-saga-category` | Reacts to category events: cascades a category deletion into `deleteProduct` commands for every product in that category. |
| `microservice-saga-product` | Reacts to product events: cascades a product deletion into `deleteOrder` commands for every order containing that product. |

### Prerequisites

- Node.js
- MongoDB running on `localhost:27017` (event stores, read model, logs)
- Redis running on `localhost:6379` (message bus, revision guards)

Install dependencies with `npm install` in the repository root and in `web-host/` (plus `bower install` in `web-host/` for the frontend).

### get it up and running
        
1.  Run start.bat
2.  Direct your browser to 

        http://localhost:3000
