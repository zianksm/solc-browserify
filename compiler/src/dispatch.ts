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

      export type Input = {
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

      export type CompilerOutput = {};
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
