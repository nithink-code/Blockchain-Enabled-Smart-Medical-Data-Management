declare module 'react-plotly.js' {
  import * as React from 'react';
  import * as Plotly from 'plotly.js';

  interface PlotParams {
    data: Plotly.Data[];
    layout: Partial<Plotly.Layout>;
    frames?: Plotly.Frame[];
    config?: Partial<Plotly.Config>;
    onInitialized?: (figure: Readonly<Plotly.Figure>, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: Readonly<Plotly.Figure>, graphDiv: HTMLElement) => void;
    onPurge?: (figure: Readonly<Plotly.Figure>, graphDiv: HTMLElement) => void;
    onError?: (err: Error) => void;
    onRelayout?: (event: Readonly<Plotly.PlotRelayoutEvent>) => void;
    onRedraw?: () => void;
    onRestyle?: (event: Readonly<Plotly.PlotRestyleEvent>) => void;
    onSelected?: (event: Readonly<Plotly.PlotSelectionEvent>) => void;
    onSelecting?: (event: Readonly<Plotly.PlotSelectionEvent>) => void;
    onHover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onUnhover?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onClick?: (event: Readonly<Plotly.PlotMouseEvent>) => void;
    onAnimated?: () => void;
    onAnimatingFrame?: (event: Readonly<Plotly.FrameAnimationEvent>) => void;
    onAnimationInterrupted?: () => void;
    onLegendClick?: (event: Readonly<Plotly.LegendClickEvent>) => boolean;
    onLegendDoubleClick?: (event: Readonly<Plotly.LegendClickEvent>) => boolean;
    onSliderChange?: (event: Readonly<Plotly.SliderChangeEvent>) => void;
    onSliderStart?: (event: Readonly<Plotly.SliderStartEvent>) => void;
    onSliderEnd?: (event: Readonly<Plotly.SliderEndEvent>) => void;
    useResizeHandler?: boolean;
    debug?: boolean;
    style?: React.CSSProperties;
    className?: string;
    divId?: string;
  }

  class Plot extends React.Component<PlotParams> {}
  export default Plot;
}
