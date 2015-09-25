/**
 * Central collection of styling settings.
 * Until we figure out a better story around canvas & CSS, they live here.
 *
 * @flow
 */

module.exports = {
  // Colors for individual base pairs
  BASE_COLORS: {
    'A': '#188712',
    'G': '#C45C16',
    'C': '#0600F9',
    'T': '#F70016',
    'U': '#F70016',
    'N': 'black'
  },

  // Styles for base pairs which are rendered as letters
  LOOSE_TEXT_STYLE: `24px 'Helvetica Neue', Helvetica, Arial, sans-serif`,
  TIGHT_TEXT_STYLE: `bold 12px 'Helvetica Neue', Helvetica, Arial, sans-serif`,

  // Gene track
  GENE_ARROW_SIZE:4,
  GENE_COLOR: 'blue',  // color of the gene line, exons, text, etc.
  GENE_COMPLEMENT_COLOR: 'white',  // a color visible on top of GENE_COLOR
  GENE_FONT: `'Helvetica Neue', Helvetica, Arial, sans-serif`,
  GENE_FONT_SIZE: 16,
  GENE_TEXT_PADDING: 5,  // space between bottom of coding exon & top of gene name

  // Pileup track
  ALIGNMENT_COLOR: '#c8c8c8',
  DELETE_COLOR: 'black',
  INSERT_COLOR: 'rgb(97, 0, 216)',

  // Coverage track
  COVERAGE_FONT_STYLE: `bold 9px 'Helvetica Neue', Helvetica, Arial, sans-serif`,
  COVERAGE_FONT_COLOR: 'black',
  COVERAGE_TICK_LENGTH: 5,
  COVERAGE_TEXT_PADDING: 3,  // space between axis ticks and text
  COVERAGE_TEXT_Y_OFFSET: 3,  // so that ticks and texts align better
  COVERAGE_BIN_COLOR: '#a0a0a0',
  COVERAGE_BIN_PADDING_CONSTANT: 0.01,  // 1% of bar width

};
