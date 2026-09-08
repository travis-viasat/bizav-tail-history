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
 * Description: AddChartDrawer — right-anchored MUI Drawer for building custom multi-metric charts.
 * Supports selecting up to 7 metrics via checkboxes. ChartTypePicker shows only chart types
 * compatible with ALL selected metrics (intersection). Delegates chart creation to onAdd.
 */
import React, {useState, useEffect, useMemo} from 'react';
import {
  Drawer,
  Box,
  List,
  ListSubheader,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {styled} from '@mui/material/styles';
import {Button, Text, Chip, TextField, Checkbox} from '@viasat/beam-react';
import {METRIC_CATALOG, METRIC_CATALOG_BY_CATEGORY} from '../../catalog/metricCatalog';
import type {MetricDefinition, ChartType} from '../../catalog/metricCatalog';
import type {ChartDefinition} from '../../pages/tailHistory/tailHistoryStore';
import ChartTypePicker from './ChartTypePicker';

const MAX_METRICS = 7;

export interface AddChartDrawerProps {
  open: boolean;
  onClose: () => void;
  onAdd: (chart: Omit<ChartDefinition, 'id'>) => void;
  /**
   * Review / design-preview prop — pre-select these metrics when the drawer
   * first mounts. Useful for design-review routes that need the drawer to
   * open with a specific selection visible.  Values are metric keys from the
   * metric catalog; keys not found in the catalog are silently ignored.
   * This prop is intentionally prefixed with `_review` to signal it is for
   * review / preview use only and must NOT be set in production rendering
   * paths.
   */
  _reviewInitialMetrics?: string[];
}

const DrawerHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: '1px solid #e0e0e0'
});

const SearchArea = styled(Box)({
  padding: '8px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
});

const MetricList = styled(List)({
  flex: 1,
  overflowY: 'auto',
  padding: 0
});

const DrawerFooter = styled(Box)({
  padding: '12px 16px',
  borderTop: '1px solid #e0e0e0',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
});

const FooterButtons = styled(Box)({
  display: 'flex',
  gap: '8px',
  justifyContent: 'flex-end'
});

const DrawerContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: 400
});

const AddChartDrawer: React.FC<AddChartDrawerProps> = ({open, onClose, onAdd, _reviewInitialMetrics}) => {
  // Resolve initial metrics from catalog on mount — unknown keys are dropped.
  // useMemo with empty deps so this runs once and never changes reference.
  const initialMetrics = useMemo<MetricDefinition[]>(() => {
    if (!_reviewInitialMetrics || _reviewInitialMetrics.length === 0) return [];
    return _reviewInitialMetrics
      .map(key => METRIC_CATALOG.find(m => m.key === key))
      .filter((m): m is MetricDefinition => m !== undefined)
      .slice(0, MAX_METRICS);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally [] — initialise once from snapshot at mount

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMetrics, setSelectedMetrics] = useState<MetricDefinition[]>(initialMetrics);
  const [selectedChartType, setSelectedChartType] = useState<ChartType | null>(null);

  // Reset internal state when drawer closes (but preserve initial metrics on
  // the first open so _reviewInitialMetrics are visible right away)
  const hasOpenedRef = React.useRef(false);
  useEffect(() => {
    if (!open) {
      setSearchQuery('');
      // On subsequent closes reset fully; on initial close keep initial state
      // so a re-open shows the pre-selection again.
      setSelectedMetrics(hasOpenedRef.current ? [] : initialMetrics);
      setSelectedChartType(null);
    } else {
      hasOpenedRef.current = true;
    }
  }, [open, initialMetrics]);

  // Recompute compatible chart types when selection changes
  const compatibleTypes = useMemo(() => {
    if (selectedMetrics.length === 0) return [];
    const allTypes: ChartType[] = ['line', 'area', 'bar', 'scatter'];
    return selectedMetrics.reduce<ChartType[]>(
      (intersection, m) => intersection.filter(t => m.compatibleChartTypes.includes(t)),
      allTypes
    );
  }, [selectedMetrics]);

  // Auto-select first compatible type whenever the compatible set changes
  useEffect(() => {
    if (compatibleTypes.length > 0) {
      setSelectedChartType(prev =>
        compatibleTypes.includes(prev as ChartType) ? prev : compatibleTypes[0]
      );
    } else {
      setSelectedChartType(null);
    }
  }, [compatibleTypes]);

  const handleToggleMetric = (metric: MetricDefinition) => {
    setSelectedMetrics(prev => {
      const isSelected = prev.some(m => m.key === metric.key);
      if (isSelected) {
        return prev.filter(m => m.key !== metric.key);
      }
      if (prev.length >= MAX_METRICS) return prev; // cap at MAX_METRICS
      return [...prev, metric];
    });
  };

  const handleAdd = () => {
    if (selectedMetrics.length === 0 || !selectedChartType || compatibleTypes.length === 0) return;
    onAdd({metricIds: selectedMetrics.map(m => m.key), chartType: selectedChartType});
    onClose();
  };

  const canAdd =
    selectedMetrics.length > 0 && selectedChartType !== null && compatibleTypes.length > 0;

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{sx: {width: 400}}}>
      <DrawerContent>
        <DrawerHeader>
          <Text kind="heading-md">Add Chart</Text>
          <Button appearance="neutral" kind="bare" iconOnly onClick={onClose} aria-label="close drawer" size="sm">
            <CloseIcon />
          </Button>
        </DrawerHeader>

        <SearchArea>
          <TextField
            fluid
            placeholder="Search metrics..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            contentBefore={<SearchIcon fontSize="small" />}
          />
          <Text kind="detail-md" color="secondary">
            {selectedMetrics.length === 0
              ? `Select up to ${MAX_METRICS} metrics`
              : `${selectedMetrics.length} of ${MAX_METRICS} selected`}
          </Text>
          {selectedMetrics.length > 0 && (
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
              {selectedMetrics.map(m => (
                <Chip
                  key={m.key}
                  size="sm"
                  dismissible
                  onDismiss={() => handleToggleMetric(m)}
                >
                  {m.label}
                </Chip>
              ))}
            </Box>
          )}
        </SearchArea>

        <MetricList dense>
          {Object.entries(METRIC_CATALOG_BY_CATEGORY).map(([category, metrics]) => {
            const filtered = metrics.filter(m =>
              m.label.toLowerCase().includes(searchQuery.toLowerCase())
            );
            if (filtered.length === 0) return null;
            return (
              <React.Fragment key={category}>
                <ListSubheader disableSticky>{category}</ListSubheader>
                {filtered.map(metric => {
                  const isChecked = selectedMetrics.some(m => m.key === metric.key);
                  const isDisabled = !isChecked && selectedMetrics.length >= MAX_METRICS;
                  return (
                    <ListItem key={metric.key} disablePadding>
                      <ListItemButton
                        onClick={() => handleToggleMetric(metric)}
                        disabled={isDisabled}
                        dense
                      >
                        <ListItemIcon sx={{minWidth: 36}}>
                          <Checkbox
                            checked={isChecked}
                            aria-label={`select ${metric.label}`}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={metric.label}
                          secondary={metric.units ?? ''}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </React.Fragment>
            );
          })}
        </MetricList>

        <DrawerFooter>
          {selectedMetrics.length > 0 && (
            <ChartTypePicker
              metrics={selectedMetrics}
              selectedType={selectedChartType}
              onSelect={setSelectedChartType}
            />
          )}
          <FooterButtons>
            <Button appearance="neutral" kind="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              appearance="accent"
              kind="filled"
              disabled={!canAdd}
              onClick={handleAdd}
              aria-label="add chart"
            >
              Add Chart
            </Button>
          </FooterButtons>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AddChartDrawer;
