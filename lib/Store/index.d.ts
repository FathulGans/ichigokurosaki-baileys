/** In-memory store, dari @levvsync/baileys (LevviSync, MIT). Butuh paket "@adiwajshing/keyed-db". */
export declare const makeInMemoryStore: (config: {
    socket?: any;
    chatKey?: any;
    labelAssociationKey?: any;
    logger?: any;
    [key: string]: any;
}) => {
    chats: any;
    contacts: { [jid: string]: any };
    messages: { [jid: string]: any };
    groupMetadata: { [jid: string]: any };
    state: any;
    presences: any;
    labels: any;
    labelAssociations: any;
    bind: (ev: any) => void;
    loadMessages: (jid: string, count: number, cursor?: any) => Promise<any[]>;
    loadMessage: (jid: string, id: string) => Promise<any>;
    mostRecentMessage: (jid: string) => Promise<any>;
    fetchImageUrl: (jid: string, sock: any) => Promise<string | undefined>;
    fetchGroupMetadata: (jid: string, sock: any) => Promise<any>;
    toJSON: () => any;
    fromJSON: (json: any) => void;
    writeToFile: (path: string) => void;
    readFromFile: (path: string) => void;
    [key: string]: any;
};
export declare const waChatKey: (pin: boolean) => { key: (c: any) => string; compare: (k1: string, k2: string) => number };
export declare const waMessageID: (m: any) => string;
export declare const waLabelAssociationKey: { key: (la: any) => string; compare: (k1: string, k2: string) => number };
