import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageArea') private messageArea!: ElementRef; // For auto-scrolling

  public messages: any[] = [];
  public messageContent: string = '';
  public isWaitingForAI: boolean = false;
  private aiReplySubscription: Subscription | undefined;

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit(): void {
    this.webSocketService.connect();
    // Subscribe to AI reply stream
    this.aiReplySubscription = this.webSocketService.aiReply$.subscribe((message) => {
      if (message) {
        this.isWaitingForAI = false;
        this.messages.push(message);
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.aiReplySubscription?.unsubscribe();
    this.webSocketService.disconnect();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  sendMessage(): void {
    if (this.messageContent.trim() && !this.isWaitingForAI) {
      const userMessage = {
        sender: 'User',
        content: this.messageContent,
        type: 'CHAT'
      };
      this.messages.push(userMessage);
      this.isWaitingForAI = true;
      this.webSocketService.sendAiMessage(userMessage);
      this.messageContent = '';
    }
  }

  private scrollToBottom(): void {
    try {
      this.messageArea.nativeElement.scrollTop = this.messageArea.nativeElement.scrollHeight;
    } catch (err) {
      // Ignore errors if element is not ready
    }
  }
}