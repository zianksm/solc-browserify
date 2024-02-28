import Dexie from "dexie";

const STATIC_DB_NAME = "__internal_contract_db";

export class ContractDB {
  private static instance: ContractDB;
  private db: Dexie;

  private constructor() {
    this.db = new Dexie(STATIC_DB_NAME);
    this.db.version(1).stores({ contracts: "path" });
  }

  public static getInstance(): ContractDB {
    if (!ContractDB.instance) {
      ContractDB.instance = new ContractDB();
    }
    return ContractDB.instance;
  }

  public async storeContract(path: string, contract: string): Promise<void> {
    const contractsTable = this.db.table("contracts");
    await contractsTable.put({ path, contract });
  }

  public async retrieveContract(path: string): Promise<string> {
    const contractsTable = this.db.table("contracts");
    const contract = await contractsTable.get(path);
    return contract ? contract.contract : null;
  }

  public async deleteContract(path: string): Promise<void> {
    const contractsTable = this.db.table("contracts");
    await contractsTable.delete(path);
  }
}
