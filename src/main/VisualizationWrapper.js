/**
 * @flow
 */
'use strict';


import type {TwoBitSource} from './TwoBitDataSource';
import type {VizWithOptions} from './types';

var React = require('react'),
    ReactDOM = require('react-dom'),
    types = require('./react-types'),
    d3utils = require('./d3utils'),
    _ = require('underscore'),
    d3 = require('../lib/minid3');

export type VizProps = {
  width: number;
  height: number;
  range: GenomeRange;
  referenceSource: TwoBitSource;
  options: any;
};

type Props = {
  range: ?GenomeRange;
  visualization: VizWithOptions;
  onRangeChange: (newRange: GenomeRange) => void;
  referenceSource: TwoBitSource;
  source: any;
};

class VisualizationWrapper extends (React.Component : typeof ReactComponent) {
  props: Props;
  state: {width: number; height: number};
  hasDragBeenInitialized: boolean;

  constructor(props: Object) {
    super(props);
    this.hasDragBeenInitialized = false;
    this.state = {
      width: 0,
      height: 0
    };
  }

  updateSize(): any {
    var parentDiv = ReactDOM.findDOMNode(this).parentNode;
    this.setState({
      width: parentDiv.offsetWidth,
      height: parentDiv.offsetHeight
    });
  }

  componentDidMount(): any {
    window.addEventListener('resize', () => this.updateSize());
    this.updateSize();

    if (this.props.range && !this.hasDragBeenInitialized) this.addDragInterface();
  }

  componentDidUpdate(): any {
    if (this.props.range && !this.hasDragBeenInitialized) this.addDragInterface();
  }

  getScale(): any {
    return d3utils.getTrackScale(this.props.range, this.state.width);
  }

  addDragInterface(): any {
    this.hasDragBeenInitialized = true;
    var div = ReactDOM.findDOMNode(this);
    var originalRange, originalScale, dx=0;
    var dragstarted = () => {
      d3.event.sourceEvent.stopPropagation();
      dx = 0;
      originalRange = _.clone(this.props.range);
      originalScale = this.getScale();
    };
    var updateRange = () => {
      if (!originalScale) return;  // can never happen, but Flow don't know.
      if (!originalRange) return;  // can never happen, but Flow don't know.
      var newStart = originalScale.invert(-dx),
          intStart = Math.round(newStart),
          offsetPx = originalScale(newStart) - originalScale(intStart);

      var newRange = {
        contig: originalRange.contig,
        start: intStart,
        stop: intStart + (originalRange.stop - originalRange.start),
        offsetPx: offsetPx
      };
      this.props.onRangeChange(newRange);
    };
    var dragmove = () => {
      dx += d3.event.dx;  // these are integers, so no roundoff issues.
      updateRange();
    };
    function dragended() {
      updateRange();
    }

    var drag = d3.behavior.drag()
        .on('dragstart', dragstarted)
        .on('drag', dragmove)
        .on('dragend', dragended);

    d3.select(div).call(drag).on('click', this.handleClick.bind(this));
  }

  handleClick(): any {
    if (d3.event.defaultPrevented) {
      d3.event.stopPropagation();
    }
  }

  render(): any {
    const range = this.props.range;
    const component = this.props.visualization.component;
    if (!range) {
      return <EmptyTrack className={component.displayName} />;
    }

    var el = React.createElement(component, ({
      range: range,
      source: this.props.source,
      referenceSource: this.props.referenceSource,
      width: this.state.width,
      height: this.state.height,
      options: this.props.visualization.options
    } : VizProps));

    return <div className='drag-wrapper'>{el}</div>;
  }
}
VisualizationWrapper.displayName = 'VisualizationWrapper';

VisualizationWrapper.propTypes = {
  range: types.GenomeRange,
  onRangeChange: React.PropTypes.func.isRequired,
  source: React.PropTypes.object.isRequired,
  referenceSource: React.PropTypes.object.isRequired,
  visualization: React.PropTypes.object.isRequired,
};


class EmptyTrack extends (React.Component : typeof ReactComponent) {
  props: {className: string};
  render() {
    var className = this.props.className + ' empty';
    return <div className={className}></div>;
  }
}

module.exports = VisualizationWrapper;
