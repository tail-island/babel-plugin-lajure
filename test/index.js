import pluginTester from 'babel-plugin-tester';
import plugin from '../src';

pluginTester({
  plugin: plugin,
  tests: [
    {
      code:   'const x = tCall([1, 2, 3]);',
      output: 'import * as _F from "folivora";\nconst x = _F.call([1, 2, 3]);'
    },
    {
      code:   'import F from "folivora";\nconst x = tCall([1, 2, 3]);',
      output: 'import F from "folivora";\nconst x = F.call([1, 2, 3]);'
    },
    {
      code:   'import { call } from "folivora";\nconst x = tCall([1, 2, 3]);',
      output: 'import { call } from "folivora";\nconst x = call([1, 2, 3]);'
    },
    {
      code:   'const F = require("folivora");\nconst x = tCall([1, 2, 3]);',
      output: 'const F = require("folivora");\nconst x = F.call([1, 2, 3]);'
    },
    {
      code:   'const { call } = require("folivora");\nconst x = tCall([1, 2, 3]);',
      output: 'const { call } = require("folivora");\nconst x = call([1, 2, 3]);'
    },
    {
      code:   'import { filter, map } from "folivora";\nconst x = tCall([1, 2, 3], filter(x => x % 2 == 0), map(x => x * 2));',
      output: 'import * as _F from "folivora";\nimport { filter, map } from "folivora";\nconst x = _F.call([1, 2, 3], _x => filter(x => x % 2 == 0, _x), _x => map(x => x * 2, _x));'
    },
    {
      code:   'import { map } from "folivora";\ntCall([[1, 2, 3], [4, 5, 6]], map(xs => tCall(xs, filter(x => x % 2 == 0), map(x => x * 2))));',
      output: 'import * as _F from "folivora";\nimport { map } from "folivora";\n_F.call([[1, 2, 3], [4, 5, 6]], _x => map(xs => _F.call(xs, _x2 => filter(x => x % 2 == 0, _x2), _x2 => map(x => x * 2, _x2)), _x));'
    },
    {
      code:   'import { multiple, dec } from "folivora";\ntCall(1, multiple(2), x => dec(x, 3));',
      output: 'import * as _F from "folivora";\nimport { multiple, dec } from "folivora";\n_F.call(1, _x => multiple(2, _x), _x => (x => dec(x, 3))(_x));'
    },
    {
      code:   'import { multiple, dec } from "folivora";\ntCall(1, multiple(2), dec(_, 3));',
      output: 'import * as _F from "folivora";\nimport { multiple, dec } from "folivora";\n_F.call(1, _x => multiple(2, _x), _x => dec(_x, 3));'
    },
    {
      code:   'import { filter, first } from "folivora";\ntCall([1, 2, 3], filter(x => x % 2 == 0), first);',
      output: 'import * as _F from "folivora";\nimport { filter, first } from "folivora";\n_F.call([1, 2, 3], _x => filter(x => x % 2 == 0, _x), _x => first(_x));'
    },
    {
      code:   'import { filter, first } from "folivora";\ntCall([1, 2, 3], filter(x => x % 2 == 0), first());',
      output: 'import * as _F from "folivora";\nimport { filter, first } from "folivora";\n_F.call([1, 2, 3], _x => filter(x => x % 2 == 0, _x), _x => first(_x));'
    }
  ]
});
