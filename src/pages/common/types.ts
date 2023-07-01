export type RuntimeMessage =
  | {
      action: 'storage-get';
      data: { key: string | string[] };
    }
  | {
      action: 'storage-set';
      data: {
        key: string;
        value: string;
      };
    }
  | {
      action: 'storage-remove';
      data: { key: string | string[] };
    };

export namespace User {
  export type LoginReqModel = {
    state: string;
  };

  export type Info = {
    id: number;
    userName: string;
    credit: {
      resetTime: number;
      remaining: number;
      total: number;
    };
  };
}
