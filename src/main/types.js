/**
 * Common types used in many modules.
 *
 * Flow makes it difficult for a module to export both symbols and types. This
 * module serves as a dumping ground for types which we'd really like to export
 * from other modules.
 *
 * @flow
 */
'use strict';

// Public API

import type * as React from 'react';

export type Track = {
  viz: Object;  // for now, a React class
  data: Object;  // This is a DataSource object
  name?: string;
  cssClass?: string;
}

export type VisualizedTrack = {
  visualization: React.Component;
  source: Object;  // data source
  track: Track;  // for css class and options
}


// BAM/BAI parsing

import type * as VirtualOffset from './VirtualOffset';

export type Chunk = {
  chunk_beg: VirtualOffset;
  chunk_end: VirtualOffset;
}

// src/utils.js
export type InflatedBlock = {
  offset: number;
  compressedLength: number;
  buffer: ArrayBuffer;
}
