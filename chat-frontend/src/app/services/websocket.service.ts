import { Injectable } from '@angular/core';
import { Client } from '@stomp/stompjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: Client;
  // Stream for AI replies that components can subscribe to
  public aiReply$: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor() {
    this.stompClient = new Client({
      brokerURL: 'ws://localhost:8085/ws', // Backend WebSocket endpoint
      debug: (str) => {
        console.log(new Date(), str);
      },
      reconnectDelay: 5000, // Reconnect every 5 seconds if connection is lost
      onConnect: (frame) => {
        console.log('Connected to WebSocket server: ', frame);
        // Subscribe to user-specific queue for AI replies
        this.stompClient.subscribe('/user/queue/reply', (message) => {
          this.aiReply$.next(JSON.parse(message.body));
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
    });
  }

  /**
   * Connects the STOMP client to the backend WebSocket server.
   * Call this from your main component's ngOnInit.
   */
  public connect(): void {
    if (!this.stompClient.active) {
      this.stompClient.activate();
    }
  }

  /**
   * Disconnects the STOMP client from the backend WebSocket server.
   */
  public disconnect(): void {
    if (this.stompClient.active) {
      this.stompClient.deactivate();
    }
  }

  /**
   * Sends a message to the AI endpoint on the backend.
   * @param message The user's message object.
   */
  public sendAiMessage(message: any): void {
    if (!this.stompClient.active) {
      console.error('Cannot send message, STOMP client is not connected.');
      return;
    }
    this.stompClient.publish({
      destination: '/app/chat.ai', // Must match @MessageMapping on backend
      body: JSON.stringify(message)
    });
  }
}