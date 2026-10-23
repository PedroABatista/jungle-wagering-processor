import { Money } from '../money/money';

export enum WagerKind {
  BET = 'BET',
  WIN = 'WIN',
  LOSS = 'LOSS',
}

export enum WagerStatus {
  PENDING = 'PENDING',
  PROCESSED = 'PROCESSED',
  REJECTED = 'REJECTED',
}

export class WagerTransaction {
  private constructor(
    public readonly id: string,
    public readonly providerId: string,
    public readonly externalId: string,
    public readonly idempotencyKey: string,
    public readonly walletId: string,
    public readonly kind: WagerKind,
    public readonly money: Money,
    private _status: WagerStatus,
    private _failureReason?: string,
  ) {}

  static create(params: CreateWagerParams): WagerTransaction {
    return new WagerTransaction(
      params.id,
      params.providerId,
      params.externalId,
      `${params.providerId}:${params.externalId}`,
      params.walletId,
      params.kind,
      params.money,
      WagerStatus.PENDING,
    );
  }

  static rehydrate(state: any): WagerTransaction {
    return new WagerTransaction(
      state.id,
      state.providerId,
      state.externalId,
      state.idempotencyKey,
      state.walletId,
      state.kind,
      Money.from({ amount: state.amount, currency: state.currency }),
      state.status,
      state.failureReason,
    );
  }

  get status(): WagerStatus { return this._status; }
  get failureReason(): string | undefined { return this._failureReason; }

  markProcessed(): void {
    this.ensurePending();
    this._status = WagerStatus.PROCESSED;
  }

  reject(reason: string): void {
    this.ensurePending();
    this._status = WagerStatus.REJECTED;
    this._failureReason = reason;
  }

  private ensurePending(): void {
    if (this._status !== WagerStatus.PENDING) {
      throw new Error(`Cannot transition transaction from status ${this._status}`);
    }
  }
}

interface CreateWagerParams {
  id: string;
  providerId: string;
  externalId: string;
  walletId: string;
  kind: WagerKind;
  money: Money;
}