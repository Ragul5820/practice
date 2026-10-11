import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'database.json');

// In-memory cache to avoid reading from disk on every operation
let dbCache: any = null;
let cacheTimestamp = 0;
const CACHE_TTL = 2000; // 2 seconds - short enough to stay fresh, long enough to batch reads

// Ensure database file exists
function ensureDatabase() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
        const initialData = {
            users: [],
            courses: [],
            assessments: [],
            submissions: [],
            enrollments: [],
            progress: []
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
        dbCache = initialData;
        cacheTimestamp = Date.now();
    }
}

// Read database (with in-memory caching)
export function readDB() {
    ensureDatabase();
    const now = Date.now();
    if (dbCache && (now - cacheTimestamp) < CACHE_TTL) {
        return dbCache;
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    dbCache = JSON.parse(data);
    cacheTimestamp = now;
    return dbCache;
}

// Write database (and update cache)
export function writeDB(data: any) {
    ensureDatabase();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    dbCache = data;
    cacheTimestamp = Date.now();
}

// Generic CRUD operations
export const db = {
    // Get all records from a collection
    getAll: (collection: string) => {
        const data = readDB();
        return data[collection] || [];
    },

    // Get a single record by ID
    getById: (collection: string, id: string) => {
        const data = readDB();
        return data[collection]?.find((item: any) => item.id === id);
    },

    // Find records matching criteria
    find: (collection: string, criteria: any) => {
        const data = readDB();
        const records = data[collection] || [];
        return records.filter((item: any) => {
            return Object.keys(criteria).every(key => item[key] === criteria[key]);
        });
    },

    // Create a new record
    create: (collection: string, record: any) => {
        const data = readDB();
        if (!data[collection]) {
            data[collection] = [];
        }
        const newRecord = {
            ...record,
            id: record.id || generateId(),
            createdAt: new Date().toISOString()
        };
        data[collection].push(newRecord);
        writeDB(data);
        return newRecord;
    },

    // Update a record
    update: (collection: string, id: string, updates: any) => {
        const data = readDB();
        const index = data[collection]?.findIndex((item: any) => item.id === id);
        if (index !== -1) {
            data[collection][index] = {
                ...data[collection][index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            writeDB(data);
            return data[collection][index];
        }
        return null;
    },

    // Delete a record
    delete: (collection: string, id: string) => {
        const data = readDB();
        const index = data[collection]?.findIndex((item: any) => item.id === id);
        if (index !== -1) {
            const deleted = data[collection].splice(index, 1);
            writeDB(data);
            return deleted[0];
        }
        return null;
    }
};

// Aliases for API routes
export const getCollection = async (collection: string) => db.getAll(collection);
export const addToCollection = async (collection: string, record: any) => db.create(collection, record);

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
