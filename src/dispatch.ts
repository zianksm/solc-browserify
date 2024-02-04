export type DispatchMessage<Actions> = {
  action: Actions;
};

export type DispatchMessageWithPayload<Actions, Payloads> =
  DispatchMessage<Actions> & Payloads;

export namespace Database {
  export type Store = "store";
  export const Store = "store";
  export type StorePayload = {
    path: string;
    contract: string;
  };
  export type StoreDispatch = DispatchMessageWithPayload<Store, StorePayload>;

  export type Retrieve = "retrieve";
  export const Retrieve = "retrieve";
  export type RetrievePayload = {
    path: string;
  };
  export type RetrieveDispatch = DispatchMessageWithPayload<
    Retrieve,
    RetrievePayload
  >;

  export type Delete = "delete";
  export const Delete = "delete";
  export type DeletePayload = {
    path: string;
  };
  export type DeleteDispatch = DispatchMessageWithPayload<
    Delete,
    DeletePayload
  >;

  export type DatabaseDispatchMesage =
    | DeleteDispatch
    | RetrieveDispatch
    | StoreDispatch;
}

export namespace Compiler {
  /**
   * all interface are referenced from official compiler docs
   * at https://docs.soliditylang.org/en/latest/using-the-compiler.html#compiler-api
   */
  export namespace Interface {
    export type Solidity = "Solidity";
    export const Solidity = "Solidity";
    export type Yul = "Yul";
    export const Yul = "Yul";

    /**
     * experimental
     */
    export type SolidityAst = "SolidityAst";
    /**
     * experimental
     */
    export const SolidityAst = "SolidityAst";

    /**
     * experimental
     */
    export type EVMAssembly = "EVMAssembly";
    /**
     * experimental
     */
    export const EVMAssembly = "EVMAssembly";

    export type SupportedLanguages = Solidity | Yul | SolidityAst | EVMAssembly;
  }

  export type CallbackFunctionFragment = {
    name: string;
    args: string;
    body: string;
  };

  export type CallbackResult =
    | {
        contents: string;
      }
    | {
        error: string;
      };

  export type ImportCallback = (path: string) => CallbackResult;

  export namespace Dispatchable {
    export type Compile = "compile";
    export const Compile = "compile";
    export type CompilePayload = {
      compilerInput: any;
      importCallback?: CallbackFunctionFragment;
    };
    export type CompileDispatch = DispatchMessageWithPayload<
      Compile,
      CompilePayload
    >;

    export type Init = "init";
    export const Init = "init";
    export type InitPayload = {
      // version: Version;
    };
    export type InitDispatch = DispatchMessageWithPayload<Init, InitPayload>;

    export type Ready = "ready";
    export const Ready = "ready";
    export type ReadyPayload = {
      status: boolean;
    };
    export type ReadyDispatch = DispatchMessageWithPayload<Ready, ReadyPayload>;

    export type Out = "out";
    export const Out = "out";
    export type OutPayload = {
      output: any;
    };
    export type OutDispatch = DispatchMessageWithPayload<Out, OutPayload>;
  }

  export namespace DispatchResult {}
}
