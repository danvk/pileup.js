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

describe('KaryogramTrack', function() {
  var testDiv= document.getElementById('testdiv');
  if (!testDiv) throw new Error("Failed to match: testdiv");

  function ready(): boolean {
      return testDiv.querySelector('#karyogram') !== null &&
          testDiv.querySelector('#karyogram') !== undefined;
  }

  describe('KaryogramTrack', function() {
    var json;

    beforeEach(() => {
      testDiv.style.width = '800px';
      dataCanvas.RecordingContext.recordAll();
    });

    afterEach(() => {
      // dataCanvas.RecordingContext.reset();
      // // avoid pollution between tests.
      // testDiv.innerHTML = '';
    });

    before(function(): any {
      return new RemoteFile('/test-data/basic-chromosomes.json').getAllString().then(data => {
        json = data;
      });
    });

    it('should render karyogram with json', function(): any {
      var p = pileup.create(testDiv, {
        range: {contig: 'chr17', start: 7500000, stop: 7500500},
        tracks: [
          {
            viz: pileup.viz.genome(),
            data: pileup.formats.twoBit({
              url: '/test-data/test.2bit'
            }),
            isReference: true
          },
          {
            viz: pileup.viz.karyogram(),
            data: pileup.formats.karyogramJson('[{"bands":[{"start":0,"end":248956422,"name":"1","value":"1"}],"name":"chr1"},{"bands":[{"start":0,"end":242193529,"name":"2","value":"2"}],"name":"chr2"},{"bands":[{"start":0,"end":198295559,"name":"3","value":"3"}],"name":"chr3"},{"bands":[{"start":0,"end":190214555,"name":"4","value":"4"}],"name":"chr4"},{"bands":[{"start":0,"end":181538259,"name":"5","value":"5"}],"name":"chr5"},{"bands":[{"start":0,"end":170805979,"name":"6","value":"6"}],"name":"chr6"},{"bands":[{"start":0,"end":159345973,"name":"7","value":"7"}],"name":"chr7"},{"bands":[{"start":0,"end":145138636,"name":"8","value":"8"}],"name":"chr8"},{"bands":[{"start":0,"end":138394717,"name":"9","value":"9"}],"name":"chr9"},{"bands":[{"start":0,"end":133797422,"name":"10","value":"10"}],"name":"chr10"},{"bands":[{"start":0,"end":135086622,"name":"11","value":"11"}],"name":"chr11"},{"bands":[{"start":0,"end":133275309,"name":"12","value":"12"}],"name":"chr12"},{"bands":[{"start":0,"end":114364328,"name":"13","value":"13"}],"name":"chr13"},{"bands":[{"start":0,"end":107043718,"name":"14","value":"14"}],"name":"chr14"},{"bands":[{"start":0,"end":101991189,"name":"q26.15","value":"15"}],"name":"chr15"},{"bands":[{"start":0,"end":90338345,"name":"16","value":"16"}],"name":"chr16"},{"bands":[{"start":0,"end":83257441,"name":"17","value":"17"}],"name":"chr17"},{"bands":[{"start":0,"end":80373285,"name":"18","value":"18"}],"name":"chr18"},{"bands":[{"start":0,"end":58617616,"name":"19","value":"19"}],"name":"chr19"},{"bands":[{"start":0,"end":64444167,"name":"20","value":"20"}],"name":"chr20"},{"bands":[{"start":0,"end":46709983,"name":"21","value":"21"}],"name":"chr21"},{"bands":[{"start":0,"end":50818468,"name":"22","value":"22"}],"name":"chr22"},{"bands":[{"start":0,"end":156040895,"name":"X","value":"X"}],"name":"chrX"},{"bands":[{"start":0,"end":57227415,"name":"Y","value":"Y"}],"name":"chrY"}]'),
            name: 'Karyogram'
          }
        ]
      });

      return waitFor(ready, 2000)
        .then(() => {
          console.log("here");

          // TODO: check. testDiv.querySelector('#karyogram') contains 24 .chromosome classes


          // p.destroy();
        });
    });
  });
});
