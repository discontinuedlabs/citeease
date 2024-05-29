import Dexie from "dexie";

const db = new Dexie("CiteEaseDB");
db.version(2).stores({
    items: "++id, name, value",
});

export default db;
