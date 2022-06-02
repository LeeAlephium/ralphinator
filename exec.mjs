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

const reportError = e => {
  if (e instanceof Response) {
    console.log(`Error: ${e.error.detail}`);
  } else {
    console.log(e);
  }
}

const makeCallsFromContract = ({ initWith, calls }) => contract => {
  calls.forEach(({ name, args }) => {
    contract
      .test(client, name, {
        initialFields: initWith,
        testArgs: args,
        existingContracts: []
      })
      .then(r => console.log(r))
      .catch(reportError)
  })
}

contracts.forEach(({ path, initWith, calls }) => {
  Contract
    .from(client, path)
    .then(makeCallsFromContract({ initWith, calls }))
    .catch(reportError);
})
