import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- Import CommonModule
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { WebSocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-chat',
  standalone: true, // <-- This marks it as a standalone component
  imports: [
    CommonModule, // <-- Required for *ngFor, *ngIf, etc.
    FormsModule   // <-- Required for [(ngModel)]
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  public messages: any[] = [];
  public messageContent: string = '';
  public username: string = '';

  // The constructor and methods are identical to the previous guide
  constructor(private webSocketService: WebSocketService) {}

  ngOnInit(): void {
    this.username = window.prompt('Please enter your name:', 'User') || 'Anonymous';
    this.webSocketService.connect();

    this.webSocketService.message$.subscribe((message) => {
      if (message) {
        this.messages.push(message);
      }
    });

    const joinMessage = {
      sender: this.username,
      type: 'JOIN'
    };
    setTimeout(() => this.webSocketService.sendJoinMessage(joinMessage), 1000);
  }

  public sendMessage(): void {
    if (this.messageContent.trim()) {
      const chatMessage = {
        sender: this.username,
        content: this.messageContent,
        type: 'CHAT'
      };
      this.webSocketService.sendMessage(chatMessage);
      this.messageContent = '';
    }
  }
}