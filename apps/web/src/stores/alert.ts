import { action, observable } from "mobx";

export enum AlertType {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
}

export interface Alert {
  message: string;
  type: AlertType;
}

export class AlertStore {
  @observable protected accessor queue: Alert[] = [];

  @action.bound
  public showSuccess(message: string) {
    this.showAlert({ message, type: AlertType.SUCCESS });
  }

  @action.bound
  public showError(message: string) {
    this.showAlert({ message, type: AlertType.ERROR });
  }

  @action.bound
  public showWarning(message: string) {
    this.showAlert({ message, type: AlertType.WARNING });
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
