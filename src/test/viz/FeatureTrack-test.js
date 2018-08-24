/**
 * This tests whether feature information is being shown/drawn correctly
 * in the track.
 *
 * @flow
 */
'use strict';

import {expect} from 'chai';

import _ from 'underscore';
import RemoteFile from '../../main/RemoteFile';
import pileup from '../../main/pileup';
import dataCanvas from 'data-canvas';
import {waitFor} from '../async';

import {yForRow} from '../../main/viz/pileuputils';

import ReactTestUtils from 'react-addons-test-utils';

describe('FeatureTrack', function() {
  var testDiv = document.getElementById('testdiv');
  if (!testDiv) throw new Error("Failed to match: testdiv");
  
  var json;

  beforeEach(() => {
    testDiv.style.width = '800px';
    dataCanvas.RecordingContext.recordAll();
  });

  afterEach(() => {
    dataCanvas.RecordingContext.reset();
    // avoid pollution between tests.
    testDiv.innerHTML = '';
  });

  before(function (): any {
    return new RemoteFile('/test-data/features.ga4gh.chr1.120000-125000.json').getAllString().then(data => {
      json = data;
    });
  });

  var drawnObjects = dataCanvas.RecordingContext.drawnObjects;

  function ready(): boolean {
    return testDiv.querySelector('canvas') != null &&
       drawnObjects(testDiv, '.features').length > 0;
  }

  it('should render features with json', function() {
    var featureClickedData = null;
    var featureClicked = function (data) {
      featureClickedData = data;
    };

    var p = pileup.create(testDiv, {
      range: {contig: 'chr1', start: 130000, stop: 135000},
      tracks: [
        {
          viz: pileup.viz.genome(),
          data: pileup.formats.twoBit({
            url: '/test-data/test.2bit'
          }),
          isReference: true
        },
        {
          viz: pileup.viz.features(),
          data: pileup.formats.featureJson(json),
          options: {onFeatureClicked: featureClicked},  
        }
      ]
    });


    waitFor(ready, 2000)
      .then(() => {
        var features = drawnObjects(testDiv, '.features');
        // there can be duplicates in the case where features are
        // overlapping  more than one section of the canvas
        features =  _.uniq(features, false, function(x) {
            return x.position.start();
        });

        expect(features).to.have.length(4);
        expect(features.map(f => f.position.start())).to.deep.equal(
            [89295, 92230, 110953, 120725]);

        var height = yForRow(4) * window.devicePixelRatio; // should be 4 rows
        features = testDiv.querySelector('.features');
        expect(features).to.not.be.null;
        if (features != null) {
          expect(features.style.height).to.equal(`${height}px`);
        }

        // check clicking on feature TODO
        var canvasList =  testDiv.getElementsByTagName('canvas');
        var canvas = canvasList[1]; 
        expect(featureClickedData).to.be.null;
        ReactTestUtils.Simulate.click(canvas,{nativeEvent: {offsetX: 430, offsetY: 50 * window.devicePixelRatio}});
        expect(featureClickedData).to.not.be.null;

        p.destroy();
      });
  });

  it('should render features with bigBed file', function() {
    var featureClickedData = null;
    var featureClicked = function (data) {
      featureClickedData = data;
    };

    var p = pileup.create(testDiv, {
      range: {contig: 'chr17', start: 10000, stop: 16500},
      tracks: [
        {
          viz: pileup.viz.genome(),
          data: pileup.formats.twoBit({
            url: '/test-data/test.2bit'
          }),
          isReference: true
        },
        {
          viz: pileup.viz.features(),
          data: pileup.formats.bigBed({
            url: '/test-data/chr17.22.10000-21000.bb',
          }),
          options: {onFeatureClicked: featureClicked},  
          name: 'Features'
        }
      ]
    });


    waitFor(ready, 2000)
      .then(() => {
        var features = drawnObjects(testDiv, '.features');
        // there can be duplicates in the case where features are
        // overlapping  more than one section of the canvas
        features =  _.uniq(features, false, function(x) {
            return x.position.start();
        });

        expect(features).to.have.length(5);
        expect(features.map(f => f.position.start())).to.deep.equal(
            [10000, 10150, 10400, 16000, 16180]);

        // canvas height should be height of features that are overlapping
        var height = yForRow(2) * window.devicePixelRatio; // should be 2 rows

        features = testDiv.querySelector('.features');
        expect(features).to.not.be.null;
        if (features != null) {
          expect(features.style.height).to.equal(`${height}px`);
        }
        // check clicking on feature in row 0
        var canvasList =  testDiv.getElementsByTagName('canvas');
        var canvas = canvasList[1]; 
        expect(featureClickedData).to.be.null;
        ReactTestUtils.Simulate.click(canvas,{nativeEvent: {offsetX: 0, offsetY: 10}});
        expect(featureClickedData).to.not.be.null;

        // check clicking on feature in row 1
        featureClickedData = null;
        ReactTestUtils.Simulate.click(canvas,{nativeEvent: {offsetX: 55, offsetY: 10}});
        expect(featureClickedData).to.not.be.null;

        p.destroy();

      });
  });

  it('should not exceed parent height limits', function() {

    var p = pileup.create(testDiv, {
      range: {contig: 'chr22', start: 20000, stop: 21000},
      tracks: [
        {
          viz: pileup.viz.genome(),
          data: pileup.formats.twoBit({
            url: '/test-data/test.2bit'
          }),
          isReference: true
        },
        {
          viz: pileup.viz.features(),
          data: pileup.formats.bigBed({
            url: '/test-data/chr17.22.10000-21000.bb',
          }),
          name: 'Features'
        }
      ]
    });

    waitFor(ready, 2000)
      .then(() => {
        var features = drawnObjects(testDiv, '.features');
        // there can be duplicates in the case where features are
        // overlapping  more than one section of the canvas
        features =  _.uniq(features, false, function(x) {
            return x.position.start();
        });

        expect(features).to.have.length(10);

        // canvas height should be maxed out
        var expectedHeight = 150 * window.devicePixelRatio;
        features = testDiv.querySelector('.features');
        expect(features).to.not.be.null;
        if (features != null) {
          expect(features.style.height).to.equal(`${expectedHeight}px`);
        }
        p.destroy();

      });
  });

});
