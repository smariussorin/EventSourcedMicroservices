## Introduction

This is a sample implementation of Microservices CQRS / Eventsourcing Infrastructure in Node.js using:
http://cqrs.js.org/

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

### get it up and running
        
1.  Run start.bat
2.  Direct your browser to 

        http://localhost:3000
