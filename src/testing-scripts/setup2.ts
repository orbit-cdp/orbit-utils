import { Address } from '@stellar/stellar-sdk';
//import { CometContract } from '../external/comet.js';
//import { tryDeployStellarAsset } from '../utils/stellar-asset.js';
import { AddressBook } from '../utils/address-book.js';
import {
  airdropAccount,
  bumpContractCode,
  bumpContractInstance,
  deployContract,
  installContract,
} from '../utils/contract.js';
import { config } from '../utils/env_config.js';
import { TxParams, invokeSorobanOperation, signWithKeypair } from '../utils/tx.js';

import { TreasuryFactoryContract, TreasuryInitMeta } from '../external/treasuryFactory.js';

export async function deployAndInitContracts(addressBook: AddressBook) {
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
      console.log(`passphrase: ${config.passphrase},sourceAcct: ${config.admin.publicKey}`);
      return signWithKeypair(txXdr, config.passphrase, config.admin);
    },
  };
  await airdropAccount(config.admin);

  console.log('Installing Orbit Contracts');
  await installContract('treasuryFactory', txParams);
  await bumpContractCode('treasuryFactory', txParams);
  await installContract('treasury', txParams);
  await bumpContractCode('treasury', txParams);
  await installContract('bridgeOracle', txParams);
  await bumpContractCode('bridgeOracle', txParams);

  console.log('Deploying and Initializing Orbit');
  const treasuryfactoryAddress = await deployContract(
    'treasuryFactory',
    'treasuryFactory',
    txParams
  );

  await bumpContractInstance('treasuryFactory', txParams);
  const treasuryFactory = new TreasuryFactoryContract(treasuryfactoryAddress);

  console.log(treasuryFactory);

  const treasuryInitMeta: TreasuryInitMeta = {
    treasury_hash: Buffer.from(addressBook.getWasmHash('treasury'), 'hex'),
    pool_factory: addressBook.getContractId('poolFactory'),
  };
  console.log(treasuryInitMeta);
  console.log(`\n\ninitializing treasury factory`);
  const invokecall = await invokeSorobanOperation(
    treasuryFactory.initialize(Address.fromString(config.admin.publicKey()), treasuryInitMeta),
    TreasuryFactoryContract.parsers.initialize,
    txParams
  );
  console.log(invokecall);

  await bumpContractInstance('treasuryFactory', txParams);
}

const network = process.argv[2];
const addressBook = AddressBook.loadFromFile(network);

await deployAndInitContracts(addressBook);
addressBook.writeToFile();
