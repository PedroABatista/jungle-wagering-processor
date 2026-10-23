import { Money } from '../money/money';

export class Wallet {
  private constructor(
    public readonly id: string,
    public readonly playerId: string,
    public readonly currency: string,
    private _balance: Money,
    private _version: number,
    public readonly createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static open(id: string, playerId: string, initialBalance: Money): Wallet {
    if (initialBalance.isNegative()) {
      throw new Error('Initial balance cannot be negative');
    }

    const now = new Date();
    return new Wallet(id, playerId, initialBalance.currency, initialBalance, 1, now, now);
  }

  static rehydrate(state: WalletState): Wallet {
    return new Wallet(
      state.id, 
      state.playerId, 
      state.currency,
      Money.from({ amount: state.balance, currency: state.currency }),
      state.version, 
      state.createdAt, 
      state.updatedAt
    );
  }

  get balance(): Money { return this._balance; }
  get version(): number { return this._version; }
  get updatedAt(): Date { return this._updatedAt; }

  debit(amount: Money): void {
    if (this._balance.isLessThan(amount)) {
      throw new Error('Insufficient balance');
    }
    
    this._balance = this._balance.subtract(amount);
    this._version++;
    this._updatedAt = new Date();
  }

  credit(amount: Money): void {
    this._balance = this._balance.add(amount);
    this._version++;
    this._updatedAt = new Date();
  }
}

export interface WalletState {
  id: string;
  playerId: string;
  currency: string;
  balance: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}