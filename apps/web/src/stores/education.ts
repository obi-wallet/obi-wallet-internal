import { makeAutoObservable } from "mobx";

export interface EducationTopic {
  id: string;
  source?: "info-icon" | "router";
  context?: Record<string, unknown>;
}

export class EducationStore {
  currentTopic: EducationTopic | null = null;
  drawerOpen = false;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentTopic(topic: EducationTopic | null) {
    this.currentTopic = topic;
    if (topic?.source === "info-icon") {
      this.drawerOpen = true;
    }
  }

  // Helper method to quickly set topic by ID
  setTopicById(id: string, source?: "info-icon" | "router") {
    this.setCurrentTopic({ id, ...(source ? { source } : {}) });
  }

  setDrawerOpen(open: boolean) {
    this.drawerOpen = open;
  }

  clearTopic() {
    this.currentTopic = null;
    this.drawerOpen = false;
  }
}
