// In-memory store, dari @levvsync/baileys 0.0.3 (LevviSync, MIT), dikonversi ke ESM.
export class ObjectRepository {
    constructor(entities = {}) {
        this.entityMap = new Map(Object.entries(entities));
    }
    findById(id) {
        return this.entityMap.get(id);
    }
    findAll() {
        return Array.from(this.entityMap.values());
    }
    upsertById(id, entity) {
        return this.entityMap.set(id, { ...entity });
    }
    deleteById(id) {
        return this.entityMap.delete(id);
    }
    count() {
        return this.entityMap.size;
    }
    toJSON() {
        return this.findAll();
    }
}
