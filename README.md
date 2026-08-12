# DHTMLX React Gantt TanStack Query and Zustand Demo

This project demonstrates how to integrate the DHTMLX React Gantt component with TanStack Query for server state management and Zustand for local state management in a React application.

The setup uses React 19+ and Vite, with full TypeScript support.

**Related tutorial**:
[https://docs.dhtmlx.com/gantt/integrations/react/state/tanstack-query/](https://docs.dhtmlx.com/gantt/integrations/react/state/tanstack-query/)

## What is DHTMLX React Gantt TanStack Query and Zustand Demo

This is the second project in a three-part React Gantt state-management series. It shows how to move from purely in-memory state (Zustand only) to server-backed state where TanStack Query owns all task and link data.
 
DHTMLX React Gantt is a commercial Gantt chart component for React that handles project visualization, drag-and-drop scheduling, and dependency links. This demo wires it to a small Express server using TanStack Query's `useQuery` for fetching and `useMutation` hooks for every CRUD operation. A Zustand store handles only local UI state: zoom configuration and an undo/redo history stack of snapshots.
 
The included Express backend uses a local JSON file as storage — enough to demonstrate a working REST API without setting up a database. In a real application, you replace it with any persistence layer; the client-side integration stays the same.
 
## When to Use
 
- You need to connect DHTMLX React Gantt to a REST backend and want a reference for routing Gantt mutations through TanStack Query.
- You want snapshot-based undo/redo that restores directly into the TanStack Query cache via `queryClient.setQueryData`, with no server round-trip.
- You are building a project management UI with zoom levels (day, month, year) controlled from a Material-UI toolbar.
- You want to understand the separation of concerns between TanStack Query (server data) and Zustand (UI state) in a Gantt context.
- You are progressing through the state-management series and have already reviewed the Zustand-only starter.

## Quick Start
 
```bash
git clone https://github.com/DHTMLX/react-gantt-tanstack-query-starter
cd react-gantt-tanstack-query-starter
npm install
```
 
Start the Express backend in one terminal:
 
```bash
npm run start:server
```
 
Start the Vite dev server in another terminal:
 
```bash
npm run dev
```
 
Open `http://localhost:5173`. The Gantt chart loads tasks and links from the backend; every change is persisted to the server automatically.
 
## Architecture
 
```
src/
├── components/
│   ├── GanttComponent.tsx   # Main component — useQuery, useMutation, data.save wiring
│   └── Toolbar.tsx          # Material-UI toolbar — zoom and undo/redo buttons
├── seed/
│   ├── data.json            # Initial tasks and links served by the backend
│   └── Seed.ts              # Zoom level configuration for Zustand
├── api.ts                   # fetch-based functions called by TanStack Query mutations
├── store.ts                 # Zustand store — undo/redo history and zoom config
├── server.ts                # Express REST backend (JSON file storage)
├── App.tsx
├── main.tsx
└── index.css
```
 
Data flows in one direction: the Express server is the source of truth, TanStack Query caches it on the client, and DHTMLX React Gantt renders from that cache. User interactions call `data.save`, which dispatches to the appropriate mutation, which invalidates the cache on success. Undo/redo bypasses the server entirely by restoring snapshots directly into the cache.
 
## Key Patterns
 
- **`data.save` as the mutation bridge** — the Gantt's `data.save` callback receives every user action (`create`, `update`, `delete` for tasks and links) and routes it to the corresponding `useMutation` hook. No direct Gantt event handlers are needed.
- **Cache invalidation on success** — every mutation calls `queryClient.invalidateQueries({ queryKey: ['data'] })` in `onSuccess`, which triggers a background refetch so the UI always reflects the server state.
- **Snapshot-based undo/redo without a server round-trip** — `handleUndo` writes a previous snapshot into the TanStack Query cache with `queryClient.setQueryData`. The Gantt re-renders instantly; no API call is made.
- **Zustand owns only local state** — tasks and links never enter the Zustand store. Zustand holds zoom configuration and the past/future snapshot stacks only, keeping the store decoupled from TanStack Query.
- **Pre-mutation snapshots** — every `useMutation` hook records a `structuredClone` of the current tasks, links, and config in its `onMutate` callback, before the API call fires.

## Code Examples
 
### Wiring `data.save` to TanStack Query mutations
 
The `data` prop passed to `<ReactGantt>` routes every Gantt edit to the right mutation:
 
```tsx
const data: ReactGanttProps['data'] = useMemo(
 () => ({
   save: (entity, action, payload, id) => {
     if (entity === 'task') {
       if (action === 'create') return createTaskMutation.mutate(payload as SerializedTask);
       else if (action === 'update') updateTaskMutation.mutate(payload as SerializedTask);
       else if (action === 'delete') deleteTaskMutation.mutate(id);
     } else if (entity === 'link') {
       if (action === 'create') return createLinkMutation.mutate(payload as Link);
       else if (action === 'update') updateLinkMutation.mutate(payload as Link);
       else if (action === 'delete') deleteLinkMutation.mutate(id);
     }
   },
 }),
 [/* mutation references */]
);
```
 
This is the only place the Gantt's output connects to TanStack Query. The component stays declarative; the mutations handle all API calls.
 
### Undo by writing a snapshot into the TanStack Query cache
 
```tsx
const handleUndo = () => {
 const snapshot = undo(makeSnapshot());
 if (snapshot) {
   queryClient.setQueryData(['data'], snapshot);
 }
};
```
 
`undo` pops the previous snapshot from Zustand's `past` stack and returns it. `setQueryData` writes it into the cache immediately, causing React Gantt to re-render with the restored tasks and links — no server request needed.
 
### Mutation with pre-mutation snapshot recording
 
```tsx
const createTaskMutation = useMutation({
 mutationFn: createTask,
 onMutate: () => {
   recordHistory(makeSnapshot());
 },
 onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data'] }),
 onError: (err) => console.error('Mutation failed:', err.message),
});
```
 
`onMutate` runs synchronously before the API call, so the undo stack always captures the state that existed just before the change.
 
## Features
 
| Feature | Details |
|---|---|
| TanStack Query data fetching | `useQuery` with the `['data']` key loads all tasks and links from the backend on mount |
| Six `useMutation` hooks | Separate hooks for create/update/delete on both tasks and links |
| Cache invalidation | Every mutation invalidates `['data']` on success, triggering a background refetch |
| Snapshot-based undo/redo | Pre-mutation snapshots stored in Zustand; restored into TanStack Query cache via `setQueryData` |
| Zoom levels | Day, month, and year zoom stored in Zustand and passed to the Gantt `config` prop |
| Material-UI toolbar | Undo, redo, and zoom buttons with active state indicators |
| Express REST backend | Seven endpoints (GET `/data`, POST/PUT/DELETE `/tasks`, POST/PUT/DELETE `/links`) |
| TypeScript throughout | Full type coverage with types from `@dhtmlx/trial-react-gantt` |
| React 19 + Vite | Modern build setup with hot module replacement |
 
## Production Notes
 
This demo is a starting point, not a production-ready application. Before deploying:
 
- **Replace the JSON file backend.** `src/server.ts` writes to a temp file on disk. Use a real database (PostgreSQL, MongoDB, or a cloud API) and update the endpoints in `src/api.ts`. The client-side TanStack Query integration requires no changes.
- **Add authentication.** The Express server has no auth. Protect your routes before exposing them to the internet.
- **Consider optimistic updates.** The current implementation waits for the server response before refetching. For faster perceived performance, use TanStack Query's `onMutate` optimistic update pattern in addition to the snapshot recording already present.
- **Limit history size.** The Zustand store caps undo history at 50 snapshots (`maxHistory: 50`). Each snapshot is a deep clone of all tasks and links; adjust this limit based on your data size.

## Related Resources
 
- [TanStack Query integration tutorial](https://docs.dhtmlx.com/gantt/integrations/react/state/tanstack-query/) — step-by-step walkthrough that this repo implements
- [DHTMLX React Gantt documentation](https://docs.dhtmlx.com/gantt/integrations/react/overview/)
- [DHTMLX Gantt product page](https://dhtmlx.com/docs/products/dhtmlxGantt-for-React/)
- [DHTMLX Gantt full documentation](https://docs.dhtmlx.com/gantt/)
- [DHTMLX Forum](https://forum.dhtmlx.com/c/gantt/15)

**Related demos in this series:**
 - [react-gantt-zustand-starter](https://github.com/dhtmlx/react-gantt-zustand-starter) — step 1: local in-memory state with Zustand only
 - [react-gantt-tanstack-supabase-starter](https://github.com/dhtmlx/react-gantt-tanstack-supabase-starter) — step 3: real-time multi-user sync over PostgreSQL

## License

The source code in this repository is released under the **MIT License**.
 
**Commercial License**
Required for proprietary or commercial applications. Includes access to PRO features, dedicated technical support, and long-term maintenance.
[Learn more →](https://dhtmlx.com/docs/products/dhtmlxGantt-for-React/#licensing)
 
**Try before you buy**
A free evaluation of DHTMLX React Gantt is available — no credit card required.
[Start your evaluation →](https://dhtmlx.com/docs/products/dhtmlxGantt-for-React/download.shtml)
