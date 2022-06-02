# Usage

`npm install`

`npm exec params.json`

`params.json` format is simple:

```json
{
  "config": {
    "cliqueUrl": "https://testnet-wallet.alephium.org"
  },
  "contracts": [ // list of contracts to execute
    {
      "path": "test.ral", // filename of contract
      "initWith": [],     // what to init the contract with
      "calls": [          // function calls to make
        {
          "name": "id",   // name of the function
          "args": [1]     // its arguments
        }
      ]
    }
  ]
}

```

Note `contracts[].path` expects just a filename. `@alephium/sdk` looks in a
sibling directory called `contracts/` then for the file. I'm hoping
this changes sooner than later but it's just something to keep in mind.
