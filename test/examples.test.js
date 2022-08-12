'use strict';

const { spawn } = require('child_process');
const path = require('path');
const should = require('should');
const fs = require('fs');

describe.skip('jayson/examples', () => {

  const examplesPath = __dirname + '/../examples';
  const dirs = fs.readdirSync(examplesPath);

  const tests = dirs.map(dir => fs.readdirSync(path.join(examplesPath, dir)).map(name => {
    if (name !== 'server.js' && name !== 'client.js') return;
    const type = path.basename(name);
    return {
      test: dir,
      path: path.join(examplesPath, dir, name),
      type,
    };
  }).filter(v => v)).reduce((tests, list) => {
    if (!list || list.length < 2) return tests;
    const { test } = list[0];
    const server = list.find(o => o.type === 'server.js');
    const client = list.find(o => o.type === 'client.js');
    return tests.concat([{name: test, server, client}]);
  }, []);

  for (const test of tests) {
    const { name, client, server } = test;
    it(`should successfully run the example ${name}`, function (done) {
      this.timeout(5000);
      let serverExitCode, clientExitCode;

      const serverProc = spawn('node', [server.path], {timeout: 2000});

      serverProc.stderr.pipe(process.stderr);
      serverProc.stdout.pipe(process.stdout);

      serverProc.once('exit', code => {
        serverExitCode = code;
      });

      const clientProc = spawn('node', [client.path], {timeout: 2000});

      clientProc.stderr.pipe(process.stderr);
      clientProc.stdout.pipe(process.stdout);

      clientProc.once('exit', code => {
        clientExitCode = code;
      });

      const poller = setInterval(() => {
        if (typeof serverExitCode !== 'undefined' && typeof clientExitCode !== 'undefined') {
          should(clientExitCode).eql(0);
          // should(serverExitCode).eql(0);
          clearInterval(poller);
          done();
        }
      }, 200);
    });
  }

});
