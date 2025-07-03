import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client;
  // A "stream" that components can subscribe to for AI replies.
  // BehaviorSubject ensures new subscribers get the last emitted value.
  public aiReply$: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor() {
    this.stompClient = new Client({
      // The URL of the WebSocket endpoint on the backend.
      webSocketFactory: () => new SockJS('http://localhost:8085/ws'),

      // Optional: Logs STOMP frames to the console for easy debugging.
      debug: (str) => {
        console.log(new Date(), str);
      },

      // If the connection is lost, it will attempt to reconnect every 5 seconds.
      reconnectDelay: 5000,

      // This function is called upon a successful connection to the server.
      onConnect: (frame) => {
        console.log('Connected to WebSocket server: ' + frame);


        this.stompClient.subscribe('/user/queue/reply', (message: any) => {
            console.log('<<< RECEIVED AI REPLY FROM SERVER:', message.body);
          // When a message arrives, parse it and push it into our aiReply$ stream.
          this.aiReply$.next(JSON.parse(message.body));
        });
      },

      // This function is called if the STOMP broker returns an error frame.
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });
  }

  /**
   * Activates the STOMP client, initiating the connection.
   */
  public connect(): void {
    this.stompClient.activate();
  }

  /**
   * Deactivates the STOMP client, cleanly closing the connection.
   */
  public disconnect(): void {
    this.stompClient.deactivate();
  }

  /**
   * Sends a message to the AI-specific endpoint on the backend.
   * @param message The user's message object.
   */
  public sendAiMessage(message: any): void {
    this.stompClient.publish({
      destination: '/app/chat.ai', // Must match the @MessageMapping on the backend.
      body: JSON.stringify(message)
    });
  }
}