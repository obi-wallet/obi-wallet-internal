import { makeAutoObservable } from "mobx";

export interface EducationTopic {
  id: string;
  context?: Record<string, unknown>;
}

export class EducationStore {
  currentTopic: EducationTopic | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setCurrentTopic(topic: EducationTopic | null) {
    this.currentTopic = topic;
  }

  // Helper method to quickly set topic by ID
  setTopicById(id: string, context?: Record<string, unknown>) {
    this.setCurrentTopic({ id, context });
  }

  clearTopic() {
    this.currentTopic = null;
  }
} 