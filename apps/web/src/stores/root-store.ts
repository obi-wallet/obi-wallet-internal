import { EducationStore } from "./education-store";

export class RootStore {
  educationStore: EducationStore;

  constructor() {
    this.educationStore = new EducationStore();
  }
}
