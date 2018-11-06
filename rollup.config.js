/* @flow */

import babel from 'rollup-plugin-babel'

const pkg = require('./package.json')

export default {
  input: 'combobox-nav.js',
  output: [
    {
      file: pkg['module'],
      format: 'es'
    },
    {
      file: pkg['main'],
      format: 'umd',
      name: 'comboboxNav'
    }
  ],
  plugins: [
    babel({
      presets: ['es2015-rollup', 'flow']
    })
  ]
}
