/**
 * Trusted Contact (TC) Token lifecycle utilities.
 *
 * A TC token is issued by a peer's server-side privacy layer (delivered via a
 * `<tokens>` / `<token type="trusted_contact">` node inside a `privacy_token`
 * notification) and is attached to outgoing stanzas (messages, presence
 * subscribes, profile updates) so the recipient's server can distinguish
 * "trusted" senders from cold outreach.
 *
 * Previously this module only implemented "attach if present" (buildTcTokenFromJid).
 * This revision adds the rest of the lifecycle:
 *   - issuance   -> storeTcToken()
 *   - revocation -> revokeTcToken()
 *   - expiration -> isTcTokenExpired() / buildTcTokenFromJid() now skips stale tokens
 *   - pruning    -> pruneExpiredTcTokens()
 *
 * NOTE ON EXPIRY: WhatsApp does not publish an official TC token TTL. We default
 * to 30 days (DEFAULT_TC_TOKEN_MAX_AGE_MS) as a conservative, configurable
 * assumption -- override via the `maxAgeMs` param if you observe different
 * server-side behaviour. Tokens are re-issued by the server on demand, so an
 * over-eager expiry only costs a redundant `getPrivacyTokens` round trip, not
 * correctness.
 */
export const DEFAULT_TC_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
/**
 * Tracks which JIDs currently have a stored TC token, so we can prune expired
 * entries without needing an enumeration-capable key store (most SignalKeyStore
 * implementations, e.g. useMultiFileAuthState, only support get-by-id).
 * Keyed by an in-memory Set per authState instance (WeakMap avoids leaking
 * across auth states / tests).
 */
const knownTcTokenJids = new WeakMap();
const getKnownJidSet = (authState) => {
    let set = knownTcTokenJids.get(authState);
    if (!set) {
        set = new Set();
        knownTcTokenJids.set(authState, set);
    }
    return set;
};
/**
 * Returns true if a stored TC token entry is older than maxAgeMs.
 * A missing/undefined timestamp is treated as expired (fail-closed: we'd
 * rather re-request a token than attach a possibly-stale one).
 */
export function isTcTokenExpired(entry, maxAgeMs = DEFAULT_TC_TOKEN_MAX_AGE_MS) {
    if (!entry) {
        return true;
    }
    const ts = Number(entry.timestamp);
    if (!ts || Number.isNaN(ts)) {
        return true;
    }
    // timestamps on the wire are unix seconds, like the rest of the protocol
    const ageMs = Date.now() - ts * 1000;
    return ageMs > maxAgeMs;
}
/**
 * Issuance: persist a TC token received from a peer, and track the jid so it
 * can later be pruned.
 */
export async function storeTcToken({ authState, jid, token, timestamp }) {
    await authState.keys.set({
        tctoken: { [jid]: { token, timestamp: timestamp ?? `${Math.floor(Date.now() / 1000)}` } }
    });
    getKnownJidSet(authState).add(jid);
}
/**
 * Revocation: drop a stored TC token for a jid, e.g. on an explicit
 * server-side revoke notification, a contact block/remove action, or manual
 * cleanup. Setting the value to `null` is the store's delete convention
 * (mirrors how sessions / pre-keys / app-state-sync-versions are removed
 * elsewhere in this library).
 */
export async function revokeTcToken(authState, jid) {
    await authState.keys.set({ tctoken: { [jid]: null } });
    getKnownJidSet(authState).delete(jid);
}
/**
 * Pruning: sweep all known TC token jids and revoke any that have expired.
 * Safe to call periodically (e.g. alongside session/auto-clear maintenance
 * timers) -- a jid with no stored token, or one already fresh, is a no-op.
 * Returns the list of jids that were pruned.
 */
export async function pruneExpiredTcTokens(authState, { maxAgeMs = DEFAULT_TC_TOKEN_MAX_AGE_MS, logger } = {}) {
    const jids = [...getKnownJidSet(authState)];
    if (!jids.length) {
        return [];
    }
    const pruned = [];
    const data = await authState.keys.get('tctoken', jids);
    for (const jid of jids) {
        const entry = data?.[jid];
        if (!entry) {
            // already gone from the store (e.g. deleted elsewhere) -- stop tracking it
            getKnownJidSet(authState).delete(jid);
            continue;
        }
        if (isTcTokenExpired(entry, maxAgeMs)) {
            await revokeTcToken(authState, jid);
            pruned.push(jid);
        }
    }
    if (pruned.length) {
        logger?.debug({ pruned }, 'pruned expired trusted contact tokens');
    }
    return pruned;
}
export async function buildTcTokenFromJid({ authState, jid, baseContent = [], maxAgeMs = DEFAULT_TC_TOKEN_MAX_AGE_MS }) {
    try {
        const tcTokenData = await authState.keys.get('tctoken', [jid]);
        const entry = tcTokenData?.[jid];
        const tcTokenBuffer = entry?.token;
        if (!tcTokenBuffer) {
            return baseContent.length > 0 ? baseContent : undefined;
        }
        if (isTcTokenExpired(entry, maxAgeMs)) {
            // don't attach a stale token; drop it so a fresh one gets requested/re-issued
            await revokeTcToken(authState, jid).catch(() => undefined);
            return baseContent.length > 0 ? baseContent : undefined;
        }
        baseContent.push({
            tag: 'tctoken',
            attrs: {},
            content: tcTokenBuffer
        });
        return baseContent;
    }
    catch (error) {
        return baseContent.length > 0 ? baseContent : undefined;
    }
}
//# sourceMappingURL=tc-token-utils.js.map
