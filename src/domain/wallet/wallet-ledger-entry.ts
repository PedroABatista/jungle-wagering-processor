import { Money } from '../money/money';

export enum LedgerDirection {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export class WalletLedgerEntry {
  private constructor(
    public readonly id: string,
    public readonly walletId: string,
    public readonly transactionId: string,
    public readonly direction: LedgerDirection,
    public readonly money: Money,
    public readonly balanceBefore: Money,
    public readonly balanceAfter: Money,
    public readonly createdAt: Date,
  ) {}

  static create(params: CreateLedgerParams): WalletLedgerEntry {
    const isCredit = params.direction === LedgerDirection.CREDIT;
    
    const expectedAfter = isCredit 
      ? params.balanceBefore.add(params.money) 
      : params.balanceBefore.subtract(params.money);

    if (!expectedAfter.equals(params.balanceAfter)) {
      throw new Error('Ledger entry calculation mismatch');
    }

    return new WalletLedgerEntry(
      params.id, params.walletId, params.transactionId, params.direction,
      params.money, params.balanceBefore, params.balanceAfter, new Date()
    );
  }
}

interface CreateLedgerParams {
  id: string;
  walletId: string;
  transactionId: string;
  direction: LedgerDirection;
  money: Money;
  balanceBefore: Money;
  balanceAfter: Money;
}