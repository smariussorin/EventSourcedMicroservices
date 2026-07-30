# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Sample implementation of a microservices architecture with CQRS and Event Sourcing in Node.js, built on the [cqrs.js.org](http://cqrs.js.org/) libraries. Six independent Node processes communicate exclusively through a Redis pub/sub message bus; state is persisted as events in MongoDB and denormalized into read models.

## Tech stack

- Node.js (legacy codebase, callback-style; `engines` says >=0.10) — plain JavaScript, no transpiler
- CQRS libraries: `cqrs-domain` >=2.1.2, `cqrs-eventdenormalizer` >=1.0.0, `cqrs-saga` >=1.6.21, `viewmodel` >=1.1.5
- Infrastructure: MongoDB (localhost:27017) for event stores / read models / logs, Redis (localhost:6379, password hardcoded in `msgbus.js` and `config/*.js`) for the message bus and revision guards
- Web: Express 4, Socket.IO 1.x, log4js 0.6 (console + MongoDB appender)
- Frontend (`web-host/public`): AngularJS ~1.4 SPA with Bootstrap 3, deps managed via Bower (`web-host/bower.json`)

## Commands

```bash
npm install                 # root deps (shared by all microservices)
cd web-host && npm install  # web-host has its own package.json (adds ejs, jquery, underscore)
cd web-host && bower install # frontend deps into web-host/bower_components
```

Run (requires MongoDB and Redis running locally first):

- Windows: `start.bat` (launches all six processes)
- Manually: `node <service>/server.js` for each of `microservice-category`, `microservice-product`, `microservice-order`, `microservice-saga-category`, `microservice-saga-product`, `web-host`
- App is served at http://localhost:3000

There is no build step, linter, or working test suite (root `package.json` has no scripts; `web-host`'s `npm test` invokes grunt but no Gruntfile exists).

## Architecture

Message flow (all messages travel over two Redis channels, `commands` and `events`, via the shared root module `msgbus.js`):

1. Browser sends a command over Socket.IO → `web-host/server.js` publishes it on the bus.
2. A domain microservice (`microservice-category|product|order`) handles the command with `cqrs-domain`, appends events to its own MongoDB event store (`domain-<name>` db), and publishes the resulting events on the bus.
3. `web-host` denormalizes events with `cqrs-eventdenormalizer` into the `readmodel` MongoDB db and pushes them to browsers via Socket.IO; REST read endpoints live in `web-host/app/routes/` (`/api/<aggregate>`).
4. Saga microservices (`microservice-saga-*`) maintain their own read models (`viewBuilders/`) and react to events by issuing new commands (e.g. `categoryDeleted` → `deleteProduct` for every product in that category). The saga is wired through the denormalizer's `defaultEventExtension`.

Shared root modules: `msgbus.js` (Redis pub/sub hub), `colors.js` (console colors), `config/` (event store, read-model repository, revision guard, and the command/event message shape used by every service — change `config/common-config.js` and all services are affected). Services require these by relative path (`../msgbus`), so directory layout matters.

Message envelope (defined in `config/common-config.js`): `{ id, command|event, aggregate: { name }, payload: { id, ... }, head: { revision }, meta }`. The aggregate id lives in `payload.id`.

## Conventions

- One file per command/event/saga, named after the message: commands are imperative camelCase (`createCategory.js`, `changeStatusOrder.js`); events are past tense (`categoryCreated.js`, `orderStatusChanged.js`).
- Each command has a JSON-schema validation file with the same basename (`createCategory.json`) next to it.
- Domain service layout: `microservice-<name>/lib/` contains `aggregate.js`, `businessRule.js`, and the command/event handlers; `server.js` is boilerplate wiring (logger, event store config, msgbus hookup) duplicated per service.
- Saga service layout: `microservice-saga-<name>/sagas/` for saga handlers, `viewBuilders/<collection>/collection.js` for local read models.
- New aggregates need: a new `microservice-<name>` (domain), viewBuilders + routes in `web-host/app/`, and optionally a saga service.
