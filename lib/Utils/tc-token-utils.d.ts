import type { SignalKeyStoreWithTransaction } from '../Types/index.js';
import type { BinaryNode } from '../WABinary/index.js';
type AuthStateLike = {
    keys: SignalKeyStoreWithTransaction;
};
type TcTokenParams = {
    jid: string;
    baseContent?: BinaryNode[];
    authState: AuthStateLike;
    maxAgeMs?: number;
};
export type TcTokenEntry = {
    token: Buffer;
    timestamp?: string;
};
export declare const DEFAULT_TC_TOKEN_MAX_AGE_MS: number;
export declare function isTcTokenExpired(entry: TcTokenEntry | null | undefined, maxAgeMs?: number): boolean;
export declare function storeTcToken({ authState, jid, token, timestamp }: {
    authState: AuthStateLike;
    jid: string;
    token: Buffer;
    timestamp?: string;
}): Promise<void>;
export declare function revokeTcToken(authState: AuthStateLike, jid: string): Promise<void>;
export declare function pruneExpiredTcTokens(authState: AuthStateLike, opts?: {
    maxAgeMs?: number;
    logger?: {
        debug: (...args: any[]) => void;
    };
}): Promise<string[]>;
export declare function buildTcTokenFromJid({ authState, jid, baseContent, maxAgeMs }: TcTokenParams): Promise<BinaryNode[] | undefined>;
export {};
//# sourceMappingURL=tc-token-utils.d.ts.map
