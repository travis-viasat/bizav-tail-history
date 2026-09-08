/***
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 * The information in this software is subject to change without notice and
 * should not be construed as a commitment by Viasat, Inc.
 *
 * Viasat Proprietary
 * The Proprietary Information provided herein is proprietary to Viasat and
 * must be protected from further distribution and use. Disclosure to others,
 * use or copying without express written authorization of Viasat, is strictly
 * prohibited.
 *
 * Description: CustomChartSection — drag-to-reorder sortable list of custom chart strips.
 * Uses dnd-kit DndContext + SortableContext. Drag listeners are placed ONLY on a dedicated
 * DragHandleIconButton — never on the ChartStrip container — to preserve Highcharts zoom.
 */
import React, {useMemo} from 'react';
import {Box, Skeleton} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import {styled} from '@mui/material/styles';
import {Button, Text} from '@viasat/beam-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import type {DragEndEvent} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import type Highcharts from 'highcharts/highstock';
import type {ConnectivityEvent} from '../../components/ChartStrip/ChartStrip.types';
import useTailHistoryStore from './tailHistoryStore';
import type {ChartDefinition} from './tailHistoryStore';
import {METRIC_CATALOG} from '../../catalog/metricCatalog';
import {useCustomChartMock} from './charts/CustomChart/useCustomChartMock';
import ChartStrip from '../../components/ChartStrip/ChartStrip';

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface CustomChartSectionProps {
  registerChart: (id: string, chart: Highcharts.Chart) => void;
  unregisterChart: (id: string) => void;
  makeSetExtremesHandler: (chartId: string) => (e: Highcharts.AxisSetExtremesEventObject) => void;
  eventMarkers?: ConnectivityEvent[];
}

interface SortableItemProps {
  chart: ChartDefinition;
  registerChart: (id: string, chart: Highcharts.Chart) => void;
  unregisterChart: (id: string) => void;
  makeSetExtremesHandler: (chartId: string) => (e: Highcharts.AxisSetExtremesEventObject) => void;
  eventMarkers?: ConnectivityEvent[];
}

// ─── Styled Components ──────────────────────────────────────────────────────────

const StripHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  padding: '4px 8px'
});

const DragHandleButton = styled(Button)({
  cursor: 'grab',
  '&:active': {
    cursor: 'grabbing'
  }
});

const StripTitle = styled(Text)({
  flex: 1
});

const RemoveButton = styled(Button)({
  padding: '4px'
});

// ─── SortableCustomChartStrip (internal) ────────────────────────────────────────

function SortableCustomChartStrip({
  chart,
  registerChart,
  unregisterChart,
  makeSetExtremesHandler,
  eventMarkers
}: SortableItemProps) {
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: chart.id});

  // CSS transform for visual repositioning during drag — does NOT cause re-mount
  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined
  };

  const removeCustomChart = useTailHistoryStore(state => state.removeCustomChart);

  // Build title from metric labels — first label + "and N more" if multiple
  const metricLabels = chart.metricIds.map(
    id => METRIC_CATALOG.find(m => m.key === id)?.label ?? id
  );
  const title =
    metricLabels.length <= 2
      ? metricLabels.join(', ')
      : `${metricLabels[0]} + ${metricLabels.length - 1} more`;

  const {series, isLoading} = useCustomChartMock(chart.metricIds, chart.chartType);
  const onSetExtremes = useMemo(
    () => makeSetExtremesHandler(chart.id),
    [makeSetExtremesHandler, chart.id]
  );

  return (
    <div ref={setNodeRef} style={dragStyle}>
      <StripHeader>
        {/* Drag handle — listeners ONLY here, NOT on ChartStrip container (prevents zoom breakage) */}
        <DragHandleButton appearance="neutral" kind="bare" iconOnly aria-label="drag handle" size="sm" {...attributes} {...listeners}>
          <DragIndicatorIcon fontSize="small" />
        </DragHandleButton>
        <StripTitle kind="label-md" bold>{title}</StripTitle>
        <RemoveButton
          appearance="neutral"
          kind="bare"
          iconOnly
          aria-label="remove chart"
          size="sm"
          onClick={() => removeCustomChart(chart.id)}
        >
          <CloseIcon fontSize="small" />
        </RemoveButton>
      </StripHeader>
      {isLoading ? (
        <Skeleton variant="rectangular" height={200} />
      ) : (
        <ChartStrip
          chartId={chart.id}
          title={title}
          series={series}
          registerChart={registerChart}
          unregisterChart={unregisterChart}
          onSetExtremes={onSetExtremes}
          height={200}
          eventMarkers={eventMarkers}
        />
      )}
    </div>
  );
}

// ─── CustomChartSection (exported) ─────────────────────────────────────────────

export const CustomChartSection: React.FC<CustomChartSectionProps> = ({
  registerChart,
  unregisterChart,
  makeSetExtremesHandler,
  eventMarkers
}) => {
  const customCharts = useTailHistoryStore(state => state.customCharts);
  const reorderCustomCharts = useTailHistoryStore(state => state.reorderCustomCharts);

  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const {active, over} = event;
    if (!over || active.id === over.id) return;
    const oldIndex = customCharts.findIndex(c => c.id === active.id);
    const newIndex = customCharts.findIndex(c => c.id === over.id);
    // CRITICAL: reorderCustomCharts called ONLY in onDragEnd — never during drag
    reorderCustomCharts(arrayMove(customCharts, oldIndex, newIndex));
  }

  if (customCharts.length === 0) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={customCharts.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {customCharts.map(chart => (
          <SortableCustomChartStrip
            key={chart.id}
            chart={chart}
            registerChart={registerChart}
            unregisterChart={unregisterChart}
            makeSetExtremesHandler={makeSetExtremesHandler}
            eventMarkers={eventMarkers}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default CustomChartSection;
