import fs from 'fs';
import { CliqueClient, Contract } from '@alephium/sdk';

const [paramsJson] = process.argv.slice(2)
const {
  config: {
    cliqueUrl: baseUrl
  },
  contracts
} = JSON.parse(fs.readFileSync(paramsJson, 'utf-8'));

const client = new CliqueClient({ baseUrl });

try {
  await client.init(false);
} catch(e) {
  console.log(e);
  process.exit(1);
}

const reportError = filename => e => {
  if (e instanceof Response) {
    console.log(`Error: ${filename}: ${e.error.detail}`);
  } else {
    console.log(e);
  }
}

const makeCallsFromContract = ({ path, initWith, calls }) => contract => {
  console.log(contract);
  calls.forEach(({ name, args }) => {
    contract
      .test(client, name, {
        initialFields: initWith,
        testArgs: args,
        existingContracts: []
      })
      .then(r => console.log(r))
      .catch(reportError(path))
  })
}

contracts.forEach(({ path, initWith, calls }) => {
  Contract
    .from(client, 'tmp.' + path)
    .then(makeCallsFromContract({ initWith, calls }))
    .catch(reportError(path));
})
