import { AbstractKVStore } from "@obi-wallet/headless-ui";
import { action, flow, makeObservable, observable, toJS } from "mobx";

import { toGenerator } from "./helpers/to-generator";

export interface App {
  label: string;
  url: string;
  icon: string | null;
}

const knownApps: App[] = [];

export class AppsStore {
  protected readonly kvStore: AbstractKVStore;

  public favorites: App[] = [];

  constructor({ kvStore }: { kvStore: AbstractKVStore }) {
    this.kvStore = kvStore;
    makeObservable<AppsStore, "kvStore" | "save" | "init">(this, {
      kvStore: false,
      save: false,
      getKnownApps: false,
      hasFavorite: false,
      favorites: observable,
      init: flow,
      addFavorite: action,
      removeFavoriteByUrl: action,
    });
    this.init();
  }

  protected *init() {
    const favorites = yield* toGenerator(
      this.kvStore.get<App[] | undefined>("favorites")
    );
    this.favorites = favorites ?? knownApps;
  }

  protected async save() {
    const data = toJS(this.favorites);
    await this.kvStore.set("favorites", data);
  }

  public getKnownApps() {
    return knownApps;
  }

  public hasFavorite(url: string) {
    return this.favorites.find((app) => app.url === url) !== undefined;
  }

  public addFavorite(app: App) {
    if (!this.hasFavorite(app.url)) {
      this.favorites = [...this.favorites, app];
      void this.save();
    }
  }

  public removeFavoriteByUrl(url: string) {
    this.favorites = this.favorites.filter((app) => app.url !== url);
    void this.save();
  }
}
