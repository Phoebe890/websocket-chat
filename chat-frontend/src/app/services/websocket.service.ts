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
      // The factory function tells the STOMP client how to create the underlying WebSocket connection.
      // We use SockJS for its robustness and fallback capabilities.
      // Make sure this port matches your backend's port (e.g., 8085 or 8080).
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

        // This is the crucial subscription for private, user-specific replies.
        // The STOMP client transparently handles the session ID, so we just need
        // to subscribe to the generic path defined in the backend's @SendToUser.
        this.stompClient.subscribe('/user/queue/reply', (message: any) => {
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