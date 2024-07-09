import { Keypair, xdr } from 'soroban-client';
import { AddressBook } from '../utils/address-book.js';

import {
  createDeployOperation,
  createInstallOperation,
  invokeStellarOperation,
} from '../utils/contract.js';
import { Backstop } from '@blend-capital/blend-sdk';

export async function installBackstop(contracts: AddressBook, source: Keypair) {
  const operation = createInstallOperation('backstop', contracts);
  await invokeStellarOperation(operation, source);
}

export async function deployBackstop(contracts: AddressBook, source: Keypair) {
  const operation = createDeployOperation('backstop', 'backstop', contracts, source);
  await invokeStellarOperation(operation, source);
  return new BackstopContract(contracts.getContractId('backstop'), contracts);
}

export class BackstopContract {
  backstopOpBuilder: Backstop.BackstopOpBuilder;
  contracts: AddressBook;

  constructor(address: string, contracts: AddressBook) {
    this.backstopOpBuilder = new Backstop.BackstopOpBuilder(address);
    this.contracts = contracts;
  }

  public async initialize(source: Keypair) {
    const backstop_token = this.contracts.getContractId('backstopToken');
    const blnd_token = this.contracts.getContractId('BLND');
    const pool_factory = this.contracts.getContractId('poolFactory');
    const drop_list = new Map<string, bigint>();
    const xdr_op = this.backstopOpBuilder.initialize({
      backstop_token,
      blnd_token,
      pool_factory,
      drop_list,
    });
    const operation = xdr.Operation.fromXDR(xdr_op, 'base64');
    await invokeStellarOperation(operation, source);
  }

  public async deposit(from: string, pool_address: string, amount: bigint, source: Keypair) {
    const xdr_op = this.backstopOpBuilder.deposit({ from, pool_address, amount });
    const operation = xdr.Operation.fromXDR(xdr_op, 'base64');
    await invokeStellarOperation(operation, source);
  }

  public async queue_withdrawal(
    from: string,
    pool_address: string,
    amount: bigint,
    source: Keypair
  ) {
    const xdr_op = this.backstopOpBuilder.queue_withdrawal({ from, pool_address, amount });
    const operation = xdr.Operation.fromXDR(xdr_op, 'base64');
    await invokeStellarOperation(operation, source);
  }

  public async dequeue_withdrawal(
    from: string,
    pool_address: string,
    amount: bigint,
    source: Keypair
  ) {
    const xdr_op = this.backstopOpBuilder.dequeue_withdrawal({ from, pool_address, amount });
    const operation = xdr.Operation.fromXDR(xdr_op, 'base64');
    await invokeStellarOperation(operation, source);
  }

  public async withdraw(from: string, pool_address: string, amount: bigint, source: Keypair) {
    const xdr_op = this.backstopOpBuilder.withdraw({ from, pool_address, amount });
    const operation = xdr.Operation.fromXDR(xdr_op, 'base64');
    await invokeStellarOperation(operation, source);
  }

  public async balance(user: string, pool_address: string, source: Keypair) {
    const xdr_op = this.backstopOpBuilder.user_balance({ pool: pool_address, user });
    const operation = xdr.Operation.fromXDR(xdr_op, 'base64');
    await invokeStellarOperation(operation, source);
  }

  public async update_emission_cycle(source: Keypair) {
    const xdr_op = this.backstopOpBuilder.update_emission_cycle();
    const operation = xdr.Operation.fromXDR(xdr_op, 'base64');
    await invokeStellarOperation(operation, source);
  }

  public async add_reward(to_add: string, to_remove: string, source: Keypair) {
    const xdr_op = this.backstopOpBuilder.add_reward({ to_add, to_remove });
    const operation = xdr.Operation.fromXDR(xdr_op, 'base64');
    await invokeStellarOperation(operation, source);
  }

  public async claim(from: string, pool_addresses: string[], to: string, source: Keypair) {
    const xdr_op = this.backstopOpBuilder.claim({ from, pool_addresses, to });
    const operation = xdr.Operation.fromXDR(xdr_op, 'base64');
    await invokeStellarOperation(operation, source);
  }

  public async draw(pool_address: string, to: string, amount: bigint, source: Keypair) {
    const xdr_op = this.backstopOpBuilder.draw({ pool_address, to, amount });
    const operation = xdr.Operation.fromXDR(xdr_op, 'base64');
    await invokeStellarOperation(operation, source);
  }

  public async donate(pool_address: string, from: string, amount: bigint, source: Keypair) {
    const xdr_op = this.backstopOpBuilder.donate({ pool_address, from, amount });
    const operation = xdr.Operation.fromXDR(xdr_op, 'base64');
    await invokeStellarOperation(operation, source);
  }
}
