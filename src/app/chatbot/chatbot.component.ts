import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CouchdbService } from '../couchdb.service'; // Import the service

interface Answer {
  text: string;
  next: string;
}

interface Node {
  type: string;
  text: string;
  answers?: Answer[];
  next?: string;
}

interface DecisionTree {
  startNode: string;
  nodes: { [key: string]: Node };
}

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  decisionTree: DecisionTree = { startNode: '', nodes: {} };
  currentNode: Node = { type: '', text: '' };
  conversation: { speaker: string; text: string }[] = [];
  userInput = '';
  errorMessage = '';
  isMinimized = true;
  leaveDetails: any = {};

  @ViewChild('chatContent') private chatContent!: ElementRef;

  constructor(private couchdbService: CouchdbService) {} // Inject the service

  ngOnInit(): void {
    this.couchdbService.getDecisionTree().subscribe(data => {
      this.decisionTree = data.data;
      this.currentNode = this.decisionTree.nodes[this.decisionTree.startNode];
      this.addMessage('bot', this.currentNode.text);
    });
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  addMessage(speaker: string, text: string): void {
    this.conversation.push({ speaker, text });
    this.scrollToBottom();
  }

  selectAnswer(answer: Answer): void {
    this.addMessage('user', answer.text);

    // Check for redirection conditions
    if (this.currentNode.text === "Welcome to our Ticket service!") {
      if (answer.text === 'Raise Ticket' || answer.text === 'Ticket Status') {
        window.open('https://e.chain.portal.url', '_blank');
      }
    } else if (this.currentNode.text === "Welcome to our Technical service!") {
      if (answer.text === 'Raise Support') {
        window.open('https://appTrack.portal.url', '_blank');
      }
    }

    this.currentNode = this.decisionTree.nodes[answer.next];
    this.processNode();
  }

  submitInput(): void {
    if (!this.userInput.trim()) {
      this.errorMessage = 'Please enter a value';
      return;
    }

    this.addMessage('user', this.userInput);
    this.errorMessage = '';
    this.leaveDetails[this.currentNode.text] = this.userInput; // Store user input in leaveDetails
    this.currentNode = this.decisionTree.nodes[this.currentNode.next || ''];
    this.processNode();
    this.userInput = '';
  }

  processNode(): void {
    if (!this.currentNode) {
      console.error('Invalid node configuration');
      return;
    }

    switch (this.currentNode.type) {
      case 'question':
        // Handle questions with answers
        break;
      case 'input':
        // Handle input nodes
        break;
      case 'statement':
        // Handle statement nodes
        break;
      default:
        console.error('Unknown node type');
        break;
    }

    // Replace placeholders in the text with values from leaveDetails
    const botMessage = this.replaceVariables(this.currentNode.text);
    this.addMessage('bot', botMessage);
  }

  replaceVariables(text: string): string {
    return text.replace(/\[\w+\]/g, match => this.leaveDetails[match.slice(1, -1)] || match);
  }

  toggleMinimize(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isMinimized = !this.isMinimized;
  }
  
  closeChat(event?: Event): void {
    const confirmClose = confirm("Are you sure you want to close the chat?");
    if (event) {
      event.stopPropagation();
    }
    this.isMinimized = !this.isMinimized;
  }

  private scrollToBottom(): void {
    try {
      this.chatContent.nativeElement.scrollTop = this.chatContent.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll to bottom failed:', err);
    }
  }
}
