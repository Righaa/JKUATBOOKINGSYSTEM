import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl("/hub/notifications", {
    accessTokenFactory: () => localStorage.getItem("token"),
  })
  .withAutomaticReconnect()
  .build();

export default connection;
