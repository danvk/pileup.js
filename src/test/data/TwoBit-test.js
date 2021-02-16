/* @flow */
'use strict';

import {expect, assert} from 'chai';

import TwoBit from '../../main/data/TwoBit';
import RemoteFile from '../../main/RemoteFile';

describe('TwoBit', function() {
  function getTestTwoBit () {
    // See test/data/README.md for provenance
    return new TwoBit(new RemoteFile('/test-data/test.2bit'));
  }

  it('should have the right contigs', function(): any {
    var twoBit = getTestTwoBit();
    return twoBit.getContigList()
      .then(contigList => {
        var contigs = contigList.map(c => c.contig);
        expect(contigs).to.deep.equal(['chr1', 'chr17', 'chr22']);
      });
  });

  it('should extract unknowns', function(): any {
    // This test mirrors dalliance's (chr22:19178140-19178170)
    var twoBit = getTestTwoBit();
    return twoBit.getFeaturesInRange('chr22', 0, 30)
      .then(basePairs => {
        expect(basePairs).to.equal('NTCACAGATCACCATACCATNTNNNGNNCNA');
      });
  });

  it('should reject invalid contigs', function(): any {
    var twoBit = getTestTwoBit();
    return twoBit.getFeaturesInRange('chrZ', 12, 34)
      .then(() => { assert.fail('Should have thrown'); })
      .catch(err => {
        expect(err).to.match(/Invalid contig/);
      });
  });

  it('should add chr', function(): any {
    var twoBit = getTestTwoBit();
    return twoBit.getFeaturesInRange('22', 0, 4) // 22, not chr22
      .then(basePairs => {
        expect(basePairs).to.equal('NTCAC');
      });
  });

  it('should parse huge headers', function(): any {
    var twoBit = new TwoBit(new RemoteFile('/test-data/susScr3-head.2bit'));
    // shouldn't throw an exception
    return twoBit.header.then(header => {
      expect(header.sequenceCount).to.equal(4583);
    });
  });

  // TODO: masked regions
});
