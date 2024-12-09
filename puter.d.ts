/* eslint-disable @typescript-eslint/no-explicit-any */
interface PuterUser {
  uuid: string;
  username: string;
  email_confirmed: boolean;
}

interface PuterFSItem {
  id: string;
  uid: string;
  name: string;
  path: string;
  is_dir: boolean;
  parent_id: string;
  parent_uid: string;
  created: number;
  modified: number;
  accessed: number;
  size: number;
  writable: boolean;
}

interface PuterFSItemOptions {
  overwrite?: boolean;
  dedupeName?: boolean;
  createMissingParents?: boolean;
}

interface PuterSubdomain {
  uid: string;
  subdomain: string;
  root_dir: PuterFSItem;
}

type PuterKVValue = string | number | boolean | string[] | number[] | any[];

interface Puter {
  auth?: {
    signIn: () => Promise<boolean>;
    isSignedIn: () => boolean;
    getUser: () => Promise<PuterUser>;
  };

  fs: {
    write: (
      path: string,
      data: string | File | Blob,
      options?: PuterFSItemOptions
    ) => Promise<PuterFSItem>;
    read: (path: string) => Promise<Blob>;
    delete: (path: string, options?: PuterFSItemOptions) => Promise<void>;
    mkdir: (path: string, options?: PuterFSItemOptions) => Promise<PuterFSItem>;
  };

  kv: {
    get: (key: string) => Promise<PuterKVValue | null>;
    set: (key: string, value: PuterKVValue) => Promise<boolean>;
  };

  hosting: {
    create: (subdomain: string, path: string) => Promise<PuterSubdomain>;
    list: () => Promise<PuterSubdomain[]>;
  };
}
