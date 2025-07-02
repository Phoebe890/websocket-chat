import { Injectable } from '@angular/core';
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  public message$: BehaviorSubject<any> = new BehaviorSubject(null);

  public connect(): void {
  this.stompClient = new Stomp.Client({
    webSocketFactory: () => new SockJS('http://localhost:8085/ws'),
    debug: (str) => {
      console.log(new Date(), str);
    },
    reconnectDelay: 5000, // It will try to reconnect every 5 seconds
    onConnect: (frame) => {
      // This is the success callback
      console.log('Connected: ' + frame);
      this.stompClient.subscribe('/topic/public', (message: any) => {
        this.message$.next(JSON.parse(message.body));
      });
    },
    onStompError: (frame) => {
      // This is the error callback
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    },
  });

  this.stompClient.activate();
}

  public sendMessage(message: any): void {
  this.stompClient.publish({
    destination: '/app/chat.sendMessage',
    body: JSON.stringify(message)
  });
}

  public sendJoinMessage(message: any): void {
  this.stompClient.publish({
    destination: '/app/chat.addUser',
    body: JSON.stringify(message)
  });
}}