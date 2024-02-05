import { ContractDB } from "./db";
import { Database } from "./dispatch";
let db: ContractDB;

// temporary solution, might be slow on large contract lists
// call compile => load all known source from shared db worker => call compiler input with initial source file and all known source in contract db
self.onconnect = (_) => {
  db = ContractDB.getInstance();
};

self.onmessage = async (e: MessageEvent<Database.DatabaseDispatchMesage>) => {
  const { data } = e;
  data;
  switch (data.action) {
    case Database.Store: {
      const { path, contract } = data;
      db.storeContract(path, contract);
      break;
    }
    case Database.Retrieve: {
      const { path } = data;
      const contract = await db.retrieveContract(path);
      self.postMessage(contract);
      break;
    }
    case Database.Delete: {
      const { path } = data;
      db.deleteContract(path);
      break;
    }
  }
};
