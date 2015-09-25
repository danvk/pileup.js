/**
 * Visualization of variants
 * @flow
 */
'use strict';

import type {VcfDataSource} from './VcfDataSource';
import type {Variant} from './vcf';

var React = require('./react-shim'),
    _ = require('underscore'),
    d3 = require('d3'),
    d3utils = require('./d3utils'),
    types = require('./react-types'),
    ContigInterval = require('./ContigInterval'),
    canvasUtils = require('./canvas-utils'),
    dataCanvas = require('./data-canvas'),
    style = require('./style');


var VariantTrack = React.createClass({
  displayName: 'variants',
  propTypes: {
    range: types.GenomeRange.isRequired,
    source: React.PropTypes.object.isRequired,
    onRangeChange: React.PropTypes.func.isRequired
  },
  render: function(): any {
    return <canvas onClick={this.handleClick} />;
  },
  getVariantSource(): VcfDataSource {
    return this.props.source;
  },
  componentDidMount: function() {
    this.updateVisualization();

    this.getVariantSource().on('newdata', () => {
      this.updateVisualization();
    });
  },
  getScale: function() {
    return d3utils.getTrackScale(this.props.range, this.props.width);
  },
  componentDidUpdate: function(prevProps: any, prevState: any) {
    // Check a whitelist of properties which could change the visualization.
    // TODO: this is imprecise; it would be better to deep check reads.
    var newProps = this.props;
    if (!_.isEqual(newProps.range, prevProps.range) ||
       prevState != this.state) {
      this.updateVisualization();
    }
  },

  updateVisualization: function() {
    var canvas = this.getDOMNode(),
        width = this.props.width,
        height = this.props.height;

    // Hold off until height & width are known.
    if (width === 0) return;

    d3.select(canvas).attr({width, height});
    var ctx = canvasUtils.getContext(canvas);
    var dtx = dataCanvas.getDataContext(ctx);
    this.renderScene(dtx);
  },

  renderScene(ctx: DataCanvasRenderingContext2D) {
    var range = this.props.range,
        interval = new ContigInterval(range.contig, range.start, range.stop),
        variants = this.getVariantSource().getFeaturesInRange(interval),
        scale = this.getScale(),
        pxPerLetter = scale(1) - scale(0),
        height = this.props.height,
        y = height - style.VARIANT_HEIGHT - 1;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.reset();
    ctx.save();

    ctx.fillStyle = style.VARIANT_FILL;
    ctx.strokeStyle = style.VARIANT_STROKE;
    variants.forEach(variant => {
      ctx.pushObject(variant);
      var x = scale(variant.position);
      ctx.fillRect(x, y, pxPerLetter, style.VARIANT_HEIGHT);
      ctx.strokeRect(x, y, pxPerLetter, style.VARIANT_HEIGHT);
      ctx.popObject();
    });

    ctx.restore();
  },

  handleClick(reactEvent: any) {
    var ev = reactEvent.nativeEvent,
        x = ev.offsetX,
        y = ev.offsetY;
    var ctx = canvasUtils.getContext(this.getDOMNode());
    var trackingCtx = new dataCanvas.ClickTrackingContext(ctx, x, y);
    this.renderScene(trackingCtx);
    var variant = trackingCtx.hit && trackingCtx.hit[0];
    if (variant) {
      alert(JSON.stringify(variant));
    }
  }
});

module.exports = VariantTrack;
