import type { GanttConfig } from '@dhtmlx/trial-react-gantt';

export type ZoomLevel = 'day' | 'month' | 'year';

export const defaultZoomLevels: NonNullable<GanttConfig['zoom']> = {
  current: 'day',
  levels: [
    {
      name: 'day',
      scale_height: 27,
      min_column_width: 80,
      scales: [{ unit: 'day', step: 1, format: '%d %M' }],
    },
    {
      name: 'month',
      scale_height: 50,
      min_column_width: 120,
      scales: [
        { unit: 'month', format: '%F, %Y' },
        { unit: 'week', format: 'Week #%W' },
      ],
    },
    {
      name: 'year',
      scale_height: 50,
      min_column_width: 30,
      scales: [{ unit: 'year', step: 1, format: '%Y' }],
    },
  ],
};
