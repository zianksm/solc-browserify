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
