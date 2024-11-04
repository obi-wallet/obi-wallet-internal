import { AlertType } from "@/alert/type";
import { action, observable } from "mobx";

export interface Alert {
  message: string;
  type: AlertType;
}

export class AlertStore {
  @observable protected accessor queue: Alert[] = [];

  @action.bound
  public showSuccess(message: string) {
    this.showAlert({ message, type: AlertType.Success });
  }

  @action.bound
  public showError(message: string) {
    this.showAlert({ message, type: AlertType.Error });
  }

  @action.bound
  public showWarning(message: string) {
    this.showAlert({ message, type: AlertType.Warning });
  }

  @action.bound
  protected showAlert(alert: Alert) {
    this.queue.push(alert);
  }

  @action.bound
  public closeAlert() {
    this.queue.shift();
  }

  public get currentAlert() {
    return this.queue[0] ?? null;
  }
}
