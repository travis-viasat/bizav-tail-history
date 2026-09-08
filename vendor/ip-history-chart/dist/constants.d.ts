/**
 * IP address role type
 */
export type IpRole = 'Transmit' | 'Receive' | 'TPA';
/**
 * Role color mappings (MUI default colors)
 */
export declare const ROLE_COLORS: Record<IpRole, string>;
/**
 * List of valid IP roles
 */
export declare const ROLES: IpRole[];
/**
 * Default chart height in pixels
 */
export declare const CHART_HEIGHT = 200;
/**
 * Default chart theme
 */
export declare const DEFAULT_THEME = "light";
/**
 * Base Highcharts configuration for x-range chart
 */
export declare const CHART_CONFIG: {
    readonly chart: {
        readonly type: "xrange";
        readonly marginLeft: 120;
        readonly spacingRight: 20;
        readonly spacingBottom: 5;
        readonly zooming: {
            readonly type: "x";
            readonly resetButton: {
                readonly theme: {
                    readonly display: "none";
                };
            };
        };
    };
    readonly title: {
        readonly text: undefined;
    };
    readonly credits: {
        readonly enabled: false;
    };
    readonly legend: {
        readonly enabled: false;
    };
    readonly xAxis: {
        readonly type: "datetime";
    };
    readonly yAxis: {
        readonly categories: IpRole[];
        readonly title: {
            readonly text: undefined;
        };
    };
    readonly plotOptions: {
        readonly xrange: {
            readonly dataLabels: {
                readonly enabled: false;
            };
            readonly enableMouseTracking: true;
        };
    };
    readonly tooltip: {
        readonly useHTML: true;
        readonly outside: true;
        readonly style: {
            readonly whiteSpace: "nowrap";
        };
    };
};
//# sourceMappingURL=constants.d.ts.map