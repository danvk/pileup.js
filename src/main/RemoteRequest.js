/**
 * RemoteRequest is used to for http requests on a remote server which can be
 * fetched in chunks, e.g. using a Range request.
 * @flow
 */
'use strict';

import Q from 'q';

type Chunk = {
  start: number;
  stop: number;
  buffer: Object; // TODO: more efficient data store
}

class RemoteRequest {
  url: string;
  chunks: Array<Chunk>;  // regions from server that have already been loaded.
  numNetworkRequests: number;  // track this for debugging/testing

  constructor(url: string, key: string) {
    this.url = url;
    this.chunks = [];
    this.key = key;
    this.numNetworkRequests = 0;
  }

  get(contig: string, start: number, stop: number): Q.Promise<Object> {
    var length = stop - start;
    if (length <= 0) {
      return Q.reject(`Requested <0 interval (${length}) from ${this.url}`);
    }

    // First check the cache.
    var buf = this.getFromCache(start, stop);
    if (buf) {
      return Q.when(buf);
    }

    // Need to fetch from the network.
    return this.getFromNetwork(contig, start, stop);
  }

  getFromCache(start: number, stop: number): Object {
    for (var i = 0; i < this.chunks.length; i++) {
      var chunk = this.chunks[i];
      if (chunk.start <= start && chunk.stop >= stop) {
        return chunk.buffer;
      }
    }
    return null;
  }

    /**
     * Request must be of form "url/contig?start=start&end=stop&key=fileKey"
    */
  getFromNetwork(contig: string, start: number, stop: number): Q.Promise<Object> {
    var length = stop - start;
    if (length > 50000000) {
      throw `Monster request: Won't fetch ${length} bytes from ${this.url}`;
    }
    var xhr = new XMLHttpRequest();
    var endpoint = this.getEndpointFromContig(contig, start, stop);
    xhr.open('GET', endpoint);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');

    return this.promiseXHR(xhr).then(json => {
      // extract response from promise
      var buffer = json[0];

      var newChunk = { start, stop, buffer};
      this.chunks.push(newChunk);
      return buffer;
    });
  }

  getEndpointFromContig(contig: string, start: number, stop: number): string {
    return this.url + "/" + contig + "?start=" + start + "&end=" + stop + "&key=" + this.key;
  }

  // Wrapper to convert XHRs to Promises.
  // The promised values are the response (e.g. an ArrayBuffer) and the Event.
  promiseXHR(xhr: XMLHttpRequest): Q.Promise<[any, Event]> {
    var url = this.url;
    var deferred = Q.defer();
    xhr.addEventListener('load', function(e) {
      if (this.status >= 400) {
        deferred.reject(`Request for ${url} failed with status: ${this.status} ${this.statusText}`);
      } else {
        deferred.resolve([this.response, e]);
      }
    });
    xhr.addEventListener('error', function(e) {
      deferred.reject(`Request for ${url} failed with status: ${this.status} ${this.statusText}`);
    });
    this.numNetworkRequests++;
    xhr.send();
    return deferred.promise;
  }

  clearCache() {
    this.chunks = [];
  }
}

module.exports = RemoteRequest;
