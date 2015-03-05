/**
 * The "glue" between TwoBit.js and GenomeTrack.js.
 *
 * GenomeTrack is pure view code -- it renders data which is already in-memory
 * in the browser.
 *
 * TwoBit is purely for data parsing and fetching. It only knows how to return
 * promises for various genome features.
 *
 * This code acts as a bridge between the two. It maintains a local version of
 * the data, fetching remote data and informing the view when it becomes
 * available.
 *
 * @flow
 */
'use strict';

// import type * as TwoBit from './TwoBit';

var Events = require('backbone').Events,
    _ = require('underscore');

// Factor by which to over-request data from the network.
// If a range of 100bp is shown and this is 2.0, then 300 base pairs will be
// requested over the network (100 * 2.0 too much)
var EXPANSION_FACTOR = 2.0;


var createTwoBitDataSource = function(remoteSource: TwoBit) {
  // Local cache of genomic data.
  var contigList = [];
  var basePairs = {};  // contig -> locus -> letter
  function getBasePair(contig: string, position: number) {
    return basePairs[contig] && basePairs[contig][position];
  }
  function setBasePair(contig: string, position: number, letter: string) {
    if (!basePairs[contig]) basePairs[contig] = {};
    basePairs[contig][position] = letter;
  }

  function fetch(range: GenomeRange) {
    return remoteSource.getFeaturesInRange(range.contig, range.start, range.stop)
        .then(letters => {
          for (var i = 0; i < letters.length; i++) {
            setBasePair(range.contig, range.start + i, letters[i]);
          }
        });
  }

  function getRange(range: GenomeRange) {
    if (!range) return null;
    return _.range(range.start, range.stop)
        .map(x => getBasePair(range.contig, x))
        .join('');
  }

  var o = {
    rangeChanged: function(newRange: GenomeRange) {
      // Range has changed! Fetch new data.
      // TODO: only fetch it if it isn't cached already.
      fetch(newRange)
          .then(() => o.trigger('newdata', newRange))
          .done();
    },
    needContigs: () => {
      remoteSource.getContigList().then(c => {
        contigList = c;
        o.trigger('contigs', contigList);
      }).done();
    },
    getRange: getRange,
    contigList: () => contigList
  };
  _.extend(o, Events);  // Make this an event emitter

  return o;
};

module.exports = createTwoBitDataSource;
