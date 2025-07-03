import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WebSocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule], // Import necessary modules for a standalone component
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  // A reference to the message container div in the template for auto-scrolling.
  @ViewChild('messageArea') private messageArea!: ElementRef;

  public messages: any[] = [];
  public messageContent: string = '';
  public isWaitingForAI: boolean = false;
  private aiReplySubscription: Subscription | undefined;

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit(): void {
    this.webSocketService.connect();

    // Subscribe to the AI reply stream from the service.
    // This is the reactive part: this code runs whenever a new AI message arrives.
    this.aiReplySubscription = this.webSocketService.aiReply$.subscribe((message) => {
      if (message) {
        this.isWaitingForAI = false; // AI has finished "typing"
        this.messages.push(message); // Add the AI's reply to the screen
      }
    });
  }

  ngOnDestroy(): void {
    // It's a best practice to unsubscribe to prevent memory leaks when the component is removed.
    this.aiReplySubscription?.unsubscribe();
    this.webSocketService.disconnect();
  }

  ngAfterViewChecked(): void {
    // This lifecycle hook runs after every view check. We use it to auto-scroll.
    this.scrollToBottom();
  }

  sendMessage(): void {
    // Check if there is content and if we are not already waiting for a reply.
    if (this.messageContent.trim() && !this.isWaitingForAI) {
      const userMessage = {
        sender: 'User',
        content: this.messageContent,
        type: 'CHAT'
      };

      // For a great UX, add the user's message to the UI immediately.
      this.messages.push(userMessage);

      // Set a flag to show a "typing" indicator and disable the send button.
      this.isWaitingForAI = true;

      // Call the service to send the message to the backend.
      this.webSocketService.sendAiMessage(userMessage);

      // Clear the input field for the next message.
      this.messageContent = '';
    }
  }

  private scrollToBottom(): void {
    try {
      // This scrolls the message container to the bottom to always show the latest message.
      this.messageArea.nativeElement.scrollTop = this.messageArea.nativeElement.scrollHeight;
    } catch (err) {
      // Handle potential errors if the element isn't ready.
    }
  }
}