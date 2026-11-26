import semver from 'semver';

const versions = ['1.4.9', '1.5.0', '2.0.0', '0.4.9', '0.5.0'];
for (const range of ['^1.4.2', '~1.4.2', '^0.4.2']) {
  console.log(range, '→', versions.filter((v) => semver.satisfies(v, range)));
}
