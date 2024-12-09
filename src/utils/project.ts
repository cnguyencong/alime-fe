import * as mobx from "mobx";
import { createContext, useContext } from "react";
import { storage } from "./storage";

import * as api from "./api";
import { TAny } from "../types/common";

export const ProjectContext = createContext({});

export const useProject = () => useContext(ProjectContext);

const getFromStorage = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error(e);
    return null;
  }
};

const setToStorage = (key: string, value: TAny) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(e);
  }
};

class Project {
  id = "";
  name = "";
  user = {};
  store: TAny;
  saveTimeout: number | null = null;
  skipSaving = false;
  cloudEnabled = false;
  status = "saved"; // or 'has-changes' or 'saving' or 'loading'
  language = getFromStorage("polotno-language") || navigator.language || "en";
  designsLength = 0;

  constructor({ store }: { store: TAny }) {
    mobx.makeAutoObservable(this);
    this.store = store;

    store.on("change", () => {
      this.requestSave();
    });

    setInterval(() => {
      mobx.runInAction(() => {
        this.cloudEnabled = window.puter?.auth?.isSignedIn() || false;
      });
    }, 100);
  }

  setLanguage(lang: string) {
    this.language = lang;
    setToStorage("polotno-language", lang);
  }

  requestSave() {
    this.status = "has-changes";
    if (this.saveTimeout) {
      return;
    }
    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null;
      // skip autosave if no project opened
      this.save();
    }, 5000);
  }

  async firstLoad() {
    const deprecatedDesign = await storage.getItem("polotno-state");
    if (deprecatedDesign) {
      this.store.loadJSON(deprecatedDesign);
      await storage.removeItem("polotno-state");
      await this.save();
      return;
    }
    const lastDesignId = await storage.getItem("polotno-last-design-id");
    if (lastDesignId) {
      await this.loadById(lastDesignId);
    }
  }

  async loadById(id: string) {
    this.id = id;
    await storage.setItem("polotno-last-design-id", id);
    this.status = "loading";
    try {
      const { storeJSON, name } = await api.loadById({
        id,
      });
      if (storeJSON) {
        this.store.loadJSON(storeJSON);
      }
      this.name = name || "";
    } catch (e) {
      console.error(e);
      this.id = "";
      this.name = "Untitled Design";
      await storage.removeItem("polotno-last-design-id");
    }
    this.status = "saved";
  }

  updateUrlWithProjectId() {
    if (!this.id || this.id === "local") {
      window.history.replaceState({}, "", `/`);
      return;
    }
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    params.set("id", this.id);
    window.history.replaceState({}, "", `/design/${this.id}`);
  }

  async save() {
    this.status = "saving";
    const storeJSON = this.store.toJSON();
    const maxWidth = 200;
    const canvas = this.store.pages.length
      ? await this.store._toCanvas({
          pixelRatio: maxWidth / this.store.activePage?.computedWidth,
          pageId: this.store.activePage?.id,
          // two options for faster preview
          quickMode: true,
          _skipTimeout: true,
        })
      : // if there is no page, create a dummy canvas
        document.createElement("canvas");
    const blob: Blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.9);
    });
    try {
      const res = await api.saveDesign({
        storeJSON,
        preview: blob,
        id: this.id,
        name: this.name,
      });
      if (res.status === "saved") {
        this.id = res.id;
        await storage.setItem("polotno-last-design-id", res.id);
      }
    } catch (e) {
      console.error(e);
    }
    this.status = "saved";
  }

  async duplicate() {
    this.id = "";
    this.save();
  }

  async clear() {
    this.store.clear();
    this.store.addPage();
    await storage.removeItem("polotno-last-design-id");
  }

  async createNewDesign() {
    await this.clear();
    this.name = "Untitled Design";
    this.id = "";
    this.store.openSidePanel("photos");
    console.log("saving");
    await this.save();
    console.log("saving done");
  }

  async signIn() {
    await window.puter?.auth?.signIn();
    this.designsLength = await api.backupFromLocalToCloud();
  }
}

export const createProject = (args: { store: TAny }) => new Project(args);
export default createProject;
