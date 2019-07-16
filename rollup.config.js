/* @flow strict */

import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

const pkg = require('./package.json')

export default {
  input: 'src/combobox-nav.js',
  output: [
    {
      file: pkg['module'],
      format: 'es'
    },
    {
      file: pkg['main'],
      format: 'umd',
      name: 'comboboxNav',
      exports: 'named'
    }
  ],
  plugins: [
    resolve(),
    babel({
      presets: ['github']
    })
  ]
}
