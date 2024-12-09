/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { nanoid } from "nanoid";
import { storage } from "./storage";
import { TAny } from "../types/common";

declare global {
  interface Window {
    puter?: Puter;
  }
}

const isSignedIn = () => {
  return window.puter?.auth?.isSignedIn();
};

const withTimeout =
  (fn: Function, name: string) =>
  async (...args: TAny) => {
    const startTime = Date.now();
    const timeoutId = setTimeout(async () => {
      // Log timeout error with Sentry
      const error = new Error("API call timeout");
      try {
        const req = await fetch("https://api.puter.com/version");
        const version = await req.json();

        window.Sentry?.captureException(error, {
          extra: {
            function: name,
            arguments: args,
            elapsedTime: Date.now() - startTime,
            user: await window.puter?.auth?.getUser(),
            version,
            size: JSON.stringify(args).length,
          },
        });
      } catch (e: TAny) {
        window.Sentry?.captureException(
          new Error("Failed to log error to Sentry: " + e.message)
        );
      }
    }, 15000);

    try {
      const result = await fn(...args);
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

const writeFile = withTimeout(async function writeFile(
  fileName: string,
  data: string | File | Blob
) {
  if (isSignedIn()) {
    await window.puter?.fs.write(fileName, data, {
      createMissingParents: true,
    });
  } else {
    await storage.setItem(fileName, data);
  }
}, "writeFile");

const readFile = withTimeout(async function readFile(fileName: string) {
  if (isSignedIn()) {
    return await window.puter?.fs.read(fileName);
  }
  return await storage.getItem(fileName);
}, "readFile");

const deleteFile = withTimeout(async function deleteFile(fileName: string) {
  if (isSignedIn()) {
    return await window.puter?.fs.delete(fileName);
  }
  return await storage.removeItem(fileName);
}, "deleteFile");

const readKv = withTimeout(async function readKv(key: string) {
  if (isSignedIn()) {
    return await window.puter?.kv.get(key);
  } else {
    return await storage.getItem(key);
  }
}, "readKv");

const writeKv = withTimeout(async function writeKv(
  key: string,
  value: string | number | boolean
) {
  if (isSignedIn()) {
    return await window.puter?.kv.set(key, value);
  } else {
    return await storage.setItem(key, value);
  }
}, "writeKv");

export async function backupFromLocalToCloud() {
  const localDesigns = (await storage.getItem("designs-list")) || [];
  for (const design of localDesigns) {
    const storeJSON = await storage.getItem(`designs/${design.id}.json`);
    const preview = await storage.getItem(`designs/${design.id}.jpg`);
    await writeFile(`designs/${design.id}.json`, storeJSON);
    await writeFile(`designs/${design.id}.jpg`, preview);
  }
  const cloudDesigns =
    ((await window.puter?.kv.get("designs-list")) as TAny[]) || [];
  cloudDesigns.push(...localDesigns);
  await window.puter?.kv.set("designs-list", cloudDesigns);
  await storage.removeItem("designs-list");
  for (const design of localDesigns) {
    await storage.removeItem(`designs/${design.id}.json`);
    await storage.removeItem(`designs/${design.id}.jpg`);
  }
  return cloudDesigns.length;
}

// TODO: Update object type to match the actual object
export async function listDesigns(): Promise<{ id: string; name: string }[]> {
  return (await readKv("designs-list")) || [];
}

// TODO: Update object type to match the actual object
export async function deleteDesign({ id }: { id: string }) {
  const list = await listDesigns();
  const newList = list.filter((design) => design.id !== id);
  await writeKv("designs-list", newList);
  await deleteFile(`designs/${id}.json`);
  await deleteFile(`designs/${id}.jpg`);
}

// TODO: Update object type to match the actual object
export async function loadById({ id }: { id: string }) {
  let storeJSON = await readFile(`designs/${id}.json`);
  const list = await listDesigns();
  const design = list.find((design) => design.id === id);
  // if it is blob, convert to JSON
  if (storeJSON instanceof Blob) {
    storeJSON = JSON.parse(await storeJSON.text());
  } else if (typeof storeJSON === "string") {
    storeJSON = JSON.parse(storeJSON);
  }

  return { storeJSON, name: design?.name };
}

// TODO: Update object type to match the actual object
export async function saveDesign({
  storeJSON,
  preview,
  name,
  id,
}: {
  storeJSON: TAny;
  preview: string | Blob;
  name: string;
  id?: string;
}) {
  console.log("saving");
  if (!id) {
    id = nanoid(10);
  }

  const previewPath = `designs/${id}.jpg`;
  const storePath = `designs/${id}.json`;

  await writeFile(previewPath, preview);
  console.log("preview saved");
  await writeFile(storePath, JSON.stringify(storeJSON));

  const list = await listDesigns();
  const existing = list.find((design) => design.id === id);
  if (existing) {
    existing.name = name;
  } else {
    list.push({ id, name });
  }

  await writeKv("designs-list", list);
  return { id, status: "saved" };
}

// TODO: Update object type to match the actual object
export const getPreview = async ({ id }: { id: string }) => {
  const preview = await readFile(`designs/${id}.jpg`);
  return URL.createObjectURL(preview);
};

// TODO: Update object type to match the actual object
const batchCall = (asyncFunction: Function) => {
  let cachedPromise: TAny | null = null;
  return async (...args: TAny) => {
    if (!cachedPromise) {
      cachedPromise = asyncFunction(...args).catch((error: TAny) => {
        // Reset cachedPromise on error to allow retry
        cachedPromise = null;
        throw error;
      });
    }
    return cachedPromise;
  };
};

// TODO: Update object type to match the actual object
let subDomainCache: TAny | null = null;
const getPublicSubDomain = batchCall(async () => {
  if (subDomainCache) {
    return subDomainCache;
  }
  // fist we need to validate domain
  const sites = await window.puter?.hosting.list();
  const user = await window.puter?.auth?.getUser();
  const prefix = user?.username + "-pltn-pld";
  let subdomain = prefix;
  const existingDomain = sites?.find(
    (site) => site.subdomain.indexOf(prefix) >= 0
  );

  if (existingDomain) {
    subDomainCache = existingDomain.subdomain;
    return existingDomain.subdomain;
  }
  let attempt = 1;
  while (attempt < 10) {
    const postfix = attempt > 1 ? `-${attempt}` : "";
    subdomain = `${prefix}${postfix}`;
    try {
      await window.puter?.fs.mkdir("uploads", { createMissingParents: true });
      await window.puter?.hosting.create(subdomain, "uploads");
      break;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error: TAny) {
      attempt++;
      continue;
    }
  }
  if (attempt >= 10) {
    throw new Error("Failed to create subdomain");
  }
  subDomainCache = subdomain;
  return subdomain;
});

// TODO: Update object type to match the actual object
export const listAssets = async (): Promise<TAny[]> => {
  const list = (await readKv("assets-list")) || [];
  for (const asset of list) {
    asset.src = await getAssetSrc({ id: asset.id });
    asset.preview = await getAssetPreviewSrc({ id: asset.id });
  }
  return list;
};

// TODO: Update object type to match the actual object
export const getAssetSrc = async ({ id }: { id: string }) => {
  if (window.puter?.auth?.isSignedIn()) {
    const subdomain = await getPublicSubDomain();
    return `https://${subdomain}.puter.site/${id}`;
  } else {
    const file = await readFile(`uploads/${id}`);
    return URL.createObjectURL(file);
  }
};

// TODO: Update object type to match the actual object
export const getAssetPreviewSrc = async ({ id }: { id: string }) => {
  if (window.puter?.auth?.isSignedIn()) {
    const subdomain = await getPublicSubDomain();
    return `https://${subdomain}.puter.site/${id}-preview`;
  } else {
    const file = await readFile(`uploads/${id}-preview`);
    console.log("file", file);
    return URL.createObjectURL(file);
  }
};

// TODO: Update object type to match the actual object
export const uploadAsset = async ({
  file,
  preview,
  type,
}: {
  file: string | File | Blob;
  preview: string | File | Blob;
  type: TAny;
}) => {
  const list = await listAssets();
  const id = nanoid(10);
  await writeFile(`uploads/${id}`, file);
  await writeFile(`uploads/${id}-preview`, preview);
  list.push({ id, type });
  await writeKv("assets-list", list);

  const src = await getAssetSrc({ id });
  const previewSrc = await getAssetPreviewSrc({ id });
  return { id, src, preview: previewSrc };
};

// TODO: Update object type to match the actual object
export const deleteAsset = async ({ id }: { id: string }) => {
  const list = await listAssets();
  const newList = list.filter((asset) => asset.id !== id);
  await writeKv("assets-list", newList);
};
