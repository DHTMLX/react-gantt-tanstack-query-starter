import { useMemo, useRef, useCallback } from 'react';
import ReactGantt, { type ReactGanttProps, type Link, type ReactGanttRef, type SerializedTask } from '@dhtmlx/trial-react-gantt';
import '@dhtmlx/trial-react-gantt/dist/react-gantt.css';

import Toolbar from './Toolbar';
import { fetchData, createTask, updateTask, deleteTask, createLink, updateLink, deleteLink } from '../api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type Snapshot, useGanttStore } from '../store';
import { type ZoomLevel } from '../seed/Seed';

export default function DemoTanstackQuery() {
  const ganttRef = useRef<ReactGanttRef>(null);
  const queryClient = useQueryClient();
  const {
    data: fetchedData,
    isLoading,
    isError,
    error,
  } = useQuery<{ tasks: SerializedTask[]; links: Link[] }>({ queryKey: ['data'], queryFn: fetchData });
  const { tasks, links } = fetchedData || { tasks: [], links: [] };
  const { undo, redo, setZoom, config, recordHistory, past, future } = useGanttStore();

  const makeSnapshot = useCallback((): Snapshot => ({
    tasks: structuredClone(tasks),
    links: structuredClone(links),
    config: structuredClone(config),
  }), [tasks, links, config]);

  const onError = useCallback((err: Error) => {
    console.error('Mutation failed:', err.message);
  }, []);

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onMutate: () => { recordHistory(makeSnapshot()); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data'] }),
    onError,
  });

  const updateTaskMutation = useMutation({
    mutationFn: updateTask,
    onMutate: () => { recordHistory(makeSnapshot()); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data'] }),
    onError,
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: () => { recordHistory(makeSnapshot()); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data'] }),
    onError,
  });

  const createLinkMutation = useMutation({
    mutationFn: createLink,
    onMutate: () => { recordHistory(makeSnapshot()); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data'] }),
    onError,
  });

  const updateLinkMutation = useMutation({
    mutationFn: updateLink,
    onMutate: () => { recordHistory(makeSnapshot()); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data'] }),
    onError,
  });

  const deleteLinkMutation = useMutation({
    mutationFn: deleteLink,
    onMutate: () => { recordHistory(makeSnapshot()); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data'] }),
    onError,
  });

  const templates: ReactGanttProps['templates'] = useMemo(
    () => ({
      format_date: (d) => d.toISOString(),
      parse_date: (s) => new Date(s),
    }),
    [],
  );

  const data: ReactGanttProps['data'] = useMemo(
    () => ({
      save: (entity, action, payload, id) => {
        if (entity === 'task') {
          const task = payload as SerializedTask;
          if (action === 'create') return createTaskMutation.mutate(task);
          else if (action === 'update') updateTaskMutation.mutate(task);
          else if (action === 'delete') deleteTaskMutation.mutate(id);
        } else if (entity === 'link') {
          const link = payload as Link;
          if (action === 'create') return createLinkMutation.mutate(link);
          else if (action === 'update') updateLinkMutation.mutate(link);
          else if (action === 'delete') deleteLinkMutation.mutate(id);
        }
      },
    }),
    [
      createTaskMutation,
      updateTaskMutation,
      deleteTaskMutation,
      createLinkMutation,
      updateLinkMutation,
      deleteLinkMutation,
    ],
  );

  const handleUndo = () => {
    const snapshot = undo(makeSnapshot());
    if (snapshot) {
      queryClient.setQueryData(['data'], snapshot);
    }
  };

  const handleRedo = () => {
    const snapshot = redo(makeSnapshot());
    if (snapshot) {
      queryClient.setQueryData(['data'], snapshot);
    }
  };

  const handleZoom = (level: ZoomLevel) => {
    recordHistory(makeSnapshot());
    setZoom(level);
  };

  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading project data...</div>;
  }

  if (isError) {
    return <div style={{ padding: '20px', color: 'red' }}>Failed to load data: {error?.message}</div>;
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '10px' }}>
      <Toolbar
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        currentZoom={config.zoom.current}
        onZoom={handleZoom}
      />
      <ReactGantt ref={ganttRef} tasks={tasks} links={links} config={config} templates={templates} data={data} />
    </div>
  );
}
