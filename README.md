# DHTMLX React Gantt TanStack Query and Zustand Demo

This project demonstrates how to integrate the DHTMLX React Gantt component with TanStack Query for server state management and Zustand for local state management in a React application.

The setup uses React 19+ and Vite, with full TypeScript support.

**Related tutorial**:
[https://docs.dhtmlx.com/gantt/integrations/react/state/tanstack-query/](https://docs.dhtmlx.com/gantt/integrations/react/state/tanstack-query/)

## Features:

- Powerful Gantt chart UI for project planning and task management.

- Server-side data fetching and mutations using TanStack Query with automatic cache invalidation.

- Local state management with Zustand for undo/redo history and Gantt configuration.

- React component driven approach with props controlling Gantt configuration.

- REST API integration with Express backend for CRUD operations on tasks and links.

- Support for zoom levels (day, month, year), undo/redo operations, and drag-and-drop functionality.

- Interactive toolbar with Material-UI components for enhanced user experience.

- Strong TypeScript support for type-safe usage.

## Project Structure:

```
src/
├── components/
│   ├── GanttComponent.tsx   # Main Gantt chart component with TanStack Query and Zustand integration
│   └── Toolbar.tsx          # Material-UI toolbar with zoom and undo/redo controls
├── seed/
│   ├── data.json            # Initial data (tasks, links) for TanStack Query
│   └── Seed.ts              # Initial data (zoom levels) for Zustand store
├── api.ts                   # API functions for TanStack Query
├── store.ts                 # Zustand store for undo/redo and config
├── server.ts                # Express backend API
├── App.tsx
├── main.tsx
└── index.css
```

## How it works

**Data fetching** uses a single TanStack Query with the `['data']` query key. The query loads all tasks and links from the Express backend via `api.ts`.

**Mutations** (create, update, delete for both tasks and links) are handled through `useMutation` hooks. Each mutation records an undo snapshot before executing, then invalidates the `['data']` query on success so the UI stays in sync with the server.

**Undo/redo** is managed by a Zustand store that maintains past and future snapshot stacks. Undo and redo restore snapshots directly into the TanStack Query cache via `queryClient.setQueryData`.

**Zoom levels** are stored in Zustand and passed to the Gantt component via the `config` prop. Changing the zoom level also records a history snapshot.

### How to install using npm/yarn

Install dependencies:

```
npm install
```

or

```
yarn
```

### Run the demo on the local server and explore it

Start the backend server (in one terminal):

```
npm run start:server
```

or

```
yarn start:server
```

Start the frontend development server (in another terminal):

```
npm run dev
```

or

```
yarn dev
```

## Related demos

This starter is the second step in a three-part React Gantt state-management series:

1. [react-gantt-zustand-starter](https://github.com/dhtmlx/react-gantt-zustand-starter) — local in-memory state with Zustand
2. **react-gantt-tanstack-query-starter** — server-backed state with a JSON file backend (this repo)
3. [react-gantt-tanstack-supabase-starter](https://github.com/dhtmlx/react-gantt-tanstack-supabase-starter) — real-time multi-user sync over PostgreSQL

## License

Source code in this repo is released under the **MIT License**.

**DHTMLX React Gantt** is a commercial library - use under a valid [DHTMLX license](https://dhtmlx.com/docs/products/licenses.shtml) or evaluation agreement.

## Useful links

[DHTMLX React Gantt product page](https://dhtmlx.com/docs/products/dhtmlxGantt-for-React/)

[DHTMLX Gantt product page](https://dhtmlx.com/docs/products/dhtmlxGantt/)

[Documentation](https://docs.dhtmlx.com/gantt/)

[React Gantt Documentation](https://docs.dhtmlx.com/gantt/web__react.html)

[Blog](https://dhtmlx.com/blog/)

[Forum](https://forum.dhtmlx.com/)
