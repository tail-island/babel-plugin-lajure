import pluginTester from 'babel-plugin-tester';
import plugin from '../src';

pluginTester({
  plugin: plugin,
  tests: [
    {
      code:   'const x = tCall([1, 2, 3]);',
      output: 'import * as _L from "lajure";\nconst x = _L.call([1, 2, 3]);'
    },
    {
      code:   'import L from "lajure";\nconst x = tCall([1, 2, 3]);',
      output: 'import L from "lajure";\nconst x = L.call([1, 2, 3]);'
    },
    {
      code:   'import { call } from "lajure";\nconst x = tCall([1, 2, 3]);',
      output: 'import { call } from "lajure";\nconst x = call([1, 2, 3]);'
    },
    {
      code:   'const L = require("lajure");\nconst x = tCall([1, 2, 3]);',
      output: 'const L = require("lajure");\nconst x = L.call([1, 2, 3]);'
    },
    {
      code:   'const { call } = require("lajure");\nconst x = tCall([1, 2, 3]);',
      output: 'const { call } = require("lajure");\nconst x = call([1, 2, 3]);'
    },
    {
      code:   'import { filter, map } from "lajure";\nconst x = tCall([1, 2, 3], filter(x => x % 2 == 0), map(x => x * 2));',
      output: 'import * as _L from "lajure";\nimport { filter, map } from "lajure";\nconst x = _L.call([1, 2, 3], _x => filter(x => x % 2 == 0, _x), _x => map(x => x * 2, _x));'
    },
    {
      code:   'import { map } from "lajure";\ntCall([[1, 2, 3], [4, 5, 6]], map(xs => tCall(xs, filter(x => x % 2 == 0), map(x => x * 2))));',
      output: 'import * as _L from "lajure";\nimport { map } from "lajure";\n_L.call([[1, 2, 3], [4, 5, 6]], _x => map(xs => _L.call(xs, _x2 => filter(x => x % 2 == 0, _x2), _x2 => map(x => x * 2, _x2)), _x));'
    },
    {
      code:   'import { multiple, dec } from "lajure";\ntCall(1, multiple(2), x => dec(x, 3));',
      output: 'import * as _L from "lajure";\nimport { multiple, dec } from "lajure";\n_L.call(1, _x => multiple(2, _x), _x => (x => dec(x, 3))(_x));'
    },
    {
      code:   'import { multiple, dec } from "lajure";\ntCall(1, multiple(2), dec(_, 3));',
      output: 'import * as _L from "lajure";\nimport { multiple, dec } from "lajure";\n_L.call(1, _x => multiple(2, _x), _x => dec(_x, 3));'
    },
    {
      code:   'import { filter, first } from "lajure";\ntCall([1, 2, 3], filter(x => x % 2 == 0), first);',
      output: 'import * as _L from "lajure";\nimport { filter, first } from "lajure";\n_L.call([1, 2, 3], _x => filter(x => x % 2 == 0, _x), _x => first(_x));'
    },
    {
      code:   'import { filter, first } from "lajure";\ntCall([1, 2, 3], filter(x => x % 2 == 0), first());',
      output: 'import * as _L from "lajure";\nimport { filter, first } from "lajure";\n_L.call([1, 2, 3], _x => filter(x => x % 2 == 0, _x), _x => first(_x));'
    }
  ]
});
