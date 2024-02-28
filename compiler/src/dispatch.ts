import { SupportedVersion } from "./constant";

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
   * at https://docs.soliditylang.org/en/latest/using-the-compiler.html#compiler-api.
   *
   * this library only support inputs that uses Solidity languange as inputs. and currently only support compiling 1 contract with import callbacks
   * or with supplied contract via the db worker.
   */
  export namespace Interface {
    export namespace Input {
      export type Solidity = "Solidity";
      export const Solidity = "Solidity";

      export type SupportedLanguages = Solidity;

      export type SourceKey = {
        /**
         * Optional: keccak256 hash of the source file
         * It is used to verify the retrieved content if imported via URLs.
         */
        keccak256?: string;
        /**
         * The actual source code
         */
        content: string;
      };

      export type Optimizer = {
        /**
         * Enable the bytecode optimizer.
         */
        enabled: boolean;
        /**
         * Optimize for how many times you intend to run the code.
         * Lower values will optimize more for initial deployment cost, higher values will optimize more for high-frequency usage.
         */
        runs: number;
      };

      export type CompilerInput = {
        language: SupportedLanguages;
        sources: {
          contract: SourceKey;
        };

        settings?: {
          optimizer?: Optimizer;
        };
        outputSelection: object;
      };

      export const DEFAULT_OUTPUT_SELECTION = {
        "*": {
          "*": ["*"],
          "": ["*"],
        },
      } as const;
    }

    export namespace Output {
      export type JSONError = "JSONError";
      export const JSONError = "JSONError";

      export type IOError = "IOError";
      export const IOError = "IOError";

      export type ParserError = "ParserError";
      export const ParserError = "ParserError";

      export type DocstringParsingError = "DocstringParsingError";
      export const DocstringParsingError = "DocstringParsingError";

      export type SyntaxError = "SyntaxError";
      export const SyntaxError = "SyntaxError";

      export type DeclarationError = "DeclarationError";
      export const DeclarationError = "DeclarationError";

      export type TypeError = "TypeError";
      export const TypeError = "TypeError";

      export type UnimplementedFeatureError = "UnimplementedFeatureError";
      export const UnimplementedFeatureError = "UnimplementedFeatureError";

      export type InternalCompilerError = "InternalCompilerError";
      export const InternalCompilerError = "InternalCompilerError";

      export type Exception = "Exception";
      export const Exception = "Exception";

      export type CompilerError = "CompilerError";
      export const CompilerError = "CompilerError";

      export type FatalError = "FatalError";
      export const FatalError = "FatalError";

      export type YulExecption = "YulExecption";
      export const YulExecption = "YulExecption";

      export type Warning = "Warning";
      export const Warning = "Warning";

      export type Info = "Info";
      export const Info = "Info";
      export type ErrorType =
        | JSONError
        | IOError
        | ParserError
        | DocstringParsingError
        | SyntaxError
        | DeclarationError
        | TypeError
        | UnimplementedFeatureError
        | InternalCompilerError
        | Exception
        | CompilerError
        | FatalError
        | YulExecption
        | Warning
        | Info;

      export type secondarySourceLocationsError = {
        file: string;
        start: number;
        end: number;
        message: string;
      };

      export type Error = {
        /**
         * Error location within the source file
         */
        sourceLocation?: {
          file: string;
          start: number;
          end: number;
        };

        /**
         * Further locations (e.g. places of conflicting declarations)
         */
        secondarySourceLocations?: secondarySourceLocationsError[];

        type: ErrorType;

        component: string;
        severity: "error" | "warning" | "info";
        errorCode?: string;
        message: string;
        formattedMessage?: string;
      };

      export type ContractOutput = {
        /** This contains the contract-level outputs. It can be limited/filtered by the outputSelection settings. */
        contracts?: {
          [sourceFile: string]: {
            /** If the language used has no contract names, this field should equal to an empty string. */
            [contractName: string]: ContractDetails;
          };
        };
      };

      export type ContractDetails = {
        /** The Ethereum Contract ABI. If empty, it is represented as an empty array. See https://docs.soliditylang.org/en/develop/abi-spec.html */
        abi: any[];
        /** See the Metadata Output documentation (serialised JSON string) */
        metadata: string;
        /** User documentation (natspec) */
        userdoc: Record<string, unknown>;
        /** Developer documentation (natspec) */
        devdoc: Record<string, unknown>;
        /** Intermediate representation before optimization (string) */
        ir: string;
        /** AST of intermediate representation before optimization */
        irAst: Record<string, unknown>;
        /** Intermediate representation after optimization (string) */
        irOptimized: string;
        /** AST of intermediate representation after optimization */
        irOptimizedAst: Record<string, unknown>;
        /** See the Storage Layout documentation. */
        storageLayout: {
          storage: any[];
          types: Record<string, unknown>;
        };
        /** EVM-related outputs */
        evm: EvmOutput;
      };

      export type EvmOutput = {
        /** Assembly (string) */
        assembly: string;
        /** Old-style assembly (object) */
        legacyAssembly: Record<string, unknown>;
        /** Bytecode and related details. */
        bytecode: BytecodeOutput;
        /** The same layout as above. */
        deployedBytecode: DeployedBytecodeOutput;
        /** The list of function hashes */
        methodIdentifiers: {
          [methodName: string]: string;
        };
        /** Function gas estimates */
        gasEstimates: GasEstimates;
      };

      export type BytecodeOutput = {
        /** Debugging data at the level of functions. */
        functionDebugData: {
          /** Now follows a set of functions including compiler-internal and user-defined function. The set does not have to be complete. */
          [functionName: string]: FunctionDebugData;
        };
        /** The bytecode as a hex string. */
        object: string;
        /** Opcodes list (string) */
        opcodes: string;
        /** The source mapping as a string. See the source mapping definition. */
        sourceMap: string;
        /** Array of sources generated by the compiler. Currently only contains a single Yul file. */
        generatedSources: GeneratedSource[];
        /** If given, this is an unlinked object. */
        linkReferences: {
          [libraryFile: string]: {
            /** Byte offsets into the bytecode. Linking replaces the 20 bytes located there. */
            [libraryName: string]: LinkReference[];
          };
        };
      };

      export type FunctionDebugData = {
        /** Internal name of the function */
        name?: string;
        /** Byte offset into the bytecode where the function starts (optional) */
        entryPoint?: number;
        /** AST ID of the function definition or null for compiler-internal functions (optional) */
        id?: number;
        /** Number of EVM stack slots for the function parameters (optional) */
        parameterSlots?: number;
        /** Number of EVM stack slots for the return values (optional) */
        returnSlots?: number;
      };

      export type GeneratedSource = {
        /** Yul AST */
        ast: Record<string, unknown>;
        /** Source file in its text form (may contain comments) */
        contents: string;
        /** Source file ID, used for source references, same "namespace" as the Solidity source files */
        id: number;
        language: string;
        name: string;
      };

      export type LinkReference = {
        start: number;
        length: number;
      };

      export type DeployedBytecodeOutput = {
        /** If given, this is an unlinked object. */
        linkReferences?: {
          [libraryFile: string]: {
            /** Byte offsets into the bytecode. Linking replaces the 20 bytes located there. */
            [libraryName: string]: LinkReference[];
          };
        };
        /** There are two references to the immutable with AST ID 3, both 32 bytes long. One is at bytecode offset 42, the other at bytecode offset 80. */
        immutableReferences: {
          [astId: string]: ImmutableReference[];
        };
      };

      export type ImmutableReference = {
        start: number;
        length: number;
      };

      export type GasEstimates = {
        creation: {
          codeDepositCost: string;
          executionCost: string;
          totalCost: string;
        };
        external: {
          [methodName: string]: string;
        };
        internal: {
          [methodName: string]: string;
        };
      };

      export type CompilerOutput = {
        errors?: Error[];
        sources?: {
          [key: string]: {
            id: number;
            ast: any;
          };
        };
      } & ContractOutput;
    }
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
      version: SupportedVersion;
      compilerInput: Compiler.Interface.Input.CompilerInput;
      importCallback?: CallbackFunctionFragment;
    };
    export type CompileDispatch = DispatchMessageWithPayload<
      Compile,
      CompilePayload
    >;

    export type Init = "init";
    export const Init = "init";
    export type InitPayload = {
      version: SupportedVersion;
    };
    export type InitDispatch = DispatchMessageWithPayload<Init, InitPayload>;

    export type Ready = "ready";
    export const Ready = "ready";
    export type ReadyPayload = {
      version: SupportedVersion;
      status: boolean;
    };
    export type ReadyDispatch = DispatchMessageWithPayload<Ready, ReadyPayload>;

    export type Out = "out";
    export const Out = "out";
    export type OutPayload = {
      version: SupportedVersion;
      output: Compiler.Interface.Output.CompilerOutput;
    };
    export type OutDispatch = DispatchMessageWithPayload<Out, OutPayload>;

    export type CompilerDispatchMessage =
      | CompileDispatch
      | InitDispatch
      | ReadyDispatch
      | OutDispatch;
  }
}
