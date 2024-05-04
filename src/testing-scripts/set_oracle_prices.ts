import { config } from '../utils/env_config.js';
import { AddressBook } from '../utils/address-book.js';
import { OracleContract } from '../external/oracle.js';
import { Address } from '@stellar/stellar-sdk';
import { invokeSorobanOperation, TxParams, signWithKeypair } from '../utils/tx.js';

async function set_oracle_prices(addressBook: AddressBook) {
  const txParams: TxParams = {
    account: await config.rpc.getAccount(config.admin.publicKey()),
    txBuilderOptions: {
      fee: '10000',
      timebounds: {
        minTime: 0,
        maxTime: 0,
      },
      networkPassphrase: config.passphrase,
    },
    signerFunction: async (txXdr: string) => {
      return signWithKeypair(txXdr, config.passphrase, config.admin);
    },
  };
  // Initialize Contracts
  const oracle = new OracleContract(addressBook.getContractId('oraclemock'));
  await invokeSorobanOperation(
    oracle.setData(
      Address.fromString(config.admin.publicKey()),
      {
        tag: 'Other',
        values: ['USD'],
      },
      [
        {
          tag: 'Stellar',
          values: [Address.fromString(addressBook.getContractId('USDC'))],
        },
        {
          tag: 'Stellar',
          values: [Address.fromString(addressBook.getContractId('XLM'))],
        },
        {
          tag: 'Stellar',
          values: [Address.fromString(addressBook.getContractId('wETH'))],
        },
        {
          tag: 'Stellar',
          values: [Address.fromString(addressBook.getContractId('wBTC'))],
        },
        {
          tag: 'Stellar',
          values: [Address.fromString(addressBook.getContractId('BLND'))],
        },
      ],
      7,
      300
    ),
    () => undefined,
    txParams
  );

  await invokeSorobanOperation(
    oracle.setPriceStable([
      BigInt(1e7),
      BigInt(0.15e7),
      BigInt(2000e7),
      BigInt(36000e7),
      BigInt(100_0000),
    ]),
    () => undefined,
    txParams
  );
}

const network = process.argv[2];
const addressBook = AddressBook.loadFromFile(network);
await set_oracle_prices(addressBook);
