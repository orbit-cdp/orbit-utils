import { PoolContract, SetReserveArgs } from '@blend-capital/blend-sdk';
import { TxParams, invokeSorobanOperation } from '../tx.js';

export async function setupReserve(
  poolAddress: string,
  initReserveArgs: SetReserveArgs,
  txParams: TxParams
) {
  const pool = new PoolContract(poolAddress);
  console.log('queuing set reserves', initReserveArgs);
  await invokeSorobanOperation(
    pool.queueSetReserve(initReserveArgs),
    PoolContract.parsers.queueSetReserve,
    txParams
  );

  // @DEV Setting reserve can fail if the queue time not reached
  try {
    await invokeSorobanOperation(
      pool.setReserve(initReserveArgs.asset),
      PoolContract.parsers.setReserve,
      txParams
    );
    console.log(`Successfully set ${initReserveArgs.asset} reserve.\n`);
  } catch (e) {
    console.log('Reserve not set', e);
  }
}
