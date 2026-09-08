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
 * Description: ChartTypePicker — shows chart types compatible with ALL selected metrics
 * (intersection of compatibleChartTypes arrays). If no types are compatible across
 * the selection, shows an informational message.
 */
import React from 'react';
import {Box} from '@mui/material';
import {styled} from '@mui/material/styles';
import {SegmentedControl, Text} from '@viasat/beam-react';
import type {MetricDefinition, ChartType} from '../../catalog/metricCatalog';

export interface ChartTypePickerProps {
  metrics: MetricDefinition[];
  selectedType: ChartType | null;
  onSelect: (type: ChartType) => void;
}

const PickerContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  padding: '8px 0'
});

const CHART_TYPE_LABELS: Record<ChartType, string> = {
  line: 'Line',
  area: 'Area',
  bar: 'Bar',
  scatter: 'Scatter'
};

const ALL_CHART_TYPES: ChartType[] = ['line', 'area', 'bar', 'scatter'];

function getCompatibleTypes(metrics: MetricDefinition[]): ChartType[] {
  if (metrics.length === 0) return [];
  return metrics.reduce<ChartType[]>(
    (intersection, metric) =>
      intersection.filter(t => metric.compatibleChartTypes.includes(t)),
    ALL_CHART_TYPES
  );
}

const ChartTypePicker: React.FC<ChartTypePickerProps> = ({metrics, selectedType, onSelect}) => {
  const compatibleTypes = getCompatibleTypes(metrics);

  const handleChange = (value: string) => {
    onSelect(value as ChartType);
  };

  if (compatibleTypes.length === 0) {
    return (
      <PickerContainer>
        <Text kind="detail-md" color="secondary">
          Chart Type
        </Text>
        <Text kind="detail-md" color="warning">
          No chart types are compatible with all selected metrics. Try a different combination.
        </Text>
      </PickerContainer>
    );
  }

  return (
    <PickerContainer>
      <Text kind="detail-md" color="secondary">
        Chart Type
      </Text>
      <SegmentedControl
        key={selectedType ?? 'none'}
        initialSelection={selectedType ?? undefined}
        onChange={handleChange}
        size="sm"
        fluid
      >
        <SegmentedControl.List>
          {compatibleTypes.map(type => (
            <SegmentedControl.Item key={type} value={type} aria-label={type}>
              {CHART_TYPE_LABELS[type]}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.List>
      </SegmentedControl>
    </PickerContainer>
  );
};

export default ChartTypePicker;
