import fs from 'fs';

import { Client as WalletConnectClient, CLIENT_EVENTS } from '@walletconnect/client'
import { NodeProvider, Contract, Script } from '@alephium/web3';
import AlephiumProvider from '@alephium/walletconnect-provider';

const log = m => () => console.log(m)

const [paramsJson] = process.argv.slice(2)
const {
  config: {
    cliqueUrl: baseUrl,
    chainGroup,
    networkId
  },
  code
} = JSON.parse(fs.readFileSync(paramsJson, 'utf-8'));

const clique = new NodeProvider(baseUrl);

const walletconnectConnect = (callbackConnected) =>
  WalletConnectClient.init({
    controller: false,
    projectId: '28dbf304b7002ca40792ae54b0758bea',
    relayUrl: 'wss://relay.walletconnect.com',
    metadata: {
      name: 'Ralphinator',
      description: 'Ralph compilation build tool',
      url: 'https://github.com/LeeAlephium/ralphinator',
      icons: []
    }
  }).then((wc) => {
    const provider = new AlephiumProvider.default({
      chainGroup,
      networkId,
      client: wc
    });

    wc.on(CLIENT_EVENTS.session.deleted, log('deleted'))
    wc.on(CLIENT_EVENTS.session.sync, log('synced'))
    wc.on(CLIENT_EVENTS.pairing.proposal, (proposal) => {
      const { uri } = proposal.signal.params;
      console.log(uri);
    })

    provider
      .connect()
      .then(callbackConnected(provider))
  });

const reportError = filename => e => {
  if (e instanceof Response) {
    console.log(`Error: ${filename}: ${e.error.detail}`);
  } else {
    console.log(e);
  }
}

const makeCallsFromContract = ({ provider, signerAddresses, path, initWith, calls }) => (contract) => {
  const bytecode = contract.buildByteCodeToDeploy(initWith);
  return provider
    .signDeployContractTx({
      signerAddress: signerAddresses[0].address,
      bytecode,
      initialAttoAlphAmount: '1000000000000000000',
      submitTx: true
    })
    .then((r) => console.log(r))
}

const executeScript = ({ provider, signerAddresses, path, initWith, calls }) => (contract) => {
  const bytecode = contract.buildByteCodeToDeploy(initWith);
  return provider
    .signExecuteScriptTx({
      signerAddress: signerAddresses[0].address,
      bytecode,
      initialAttoAlphAmount: '1000000000000000000',
      submitTx: true
    })
    .then((r) => console.log(r))
}

try {
  walletconnectConnect((provider) => (accounts) => {
    console.log(accounts)
    if (accounts.length == 0) return;

    const actions = code.reduce((acc, meta) =>
      acc.then(() => {
        const aux = { provider, signerAddresses: accounts, ...meta};
        return meta.type === "contract"
          ? Contract.fromSource(clique, 'tmp.' + aux.path).then(makeCallsFromContract(aux))
          : Script.fromSource(clique, 'tmp.' + aux.path).then(executeScript(aux));
      })
    , Promise.resolve())

    actions.then(() => process.exit(0));
  });
} catch (e) {
  console.log(e);
}
