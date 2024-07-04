import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Answer {
  text: string;
  next: string;
}

interface Node {
  type: string;
  text: string;
  answers?: Answer[];
  next?: string;
  options?: { [key: string]: string };
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
export class ChatbotComponent implements OnInit {
  decisionTree!: DecisionTree;
  currentNode!: Node;
  conversation: any[] = [];
  userInput: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<DecisionTree>('assets/decision-tree.json').subscribe(data => {
      this.decisionTree = data;
      this.currentNode = this.decisionTree.nodes[this.decisionTree.startNode];
      this.addMessage('bot', this.currentNode.text);
    });
  }

  addMessage(speaker: string, text: string) {
    this.conversation.push({ speaker, text });
  }

  selectAnswer(answer: Answer) {
    this.addMessage('user', answer.text);
    this.currentNode = this.decisionTree.nodes[answer.next];
    this.addMessage('bot', this.currentNode.text);
  }

  submitInput() {
    this.addMessage('user', this.userInput);
    if (this.currentNode.next) {
      this.currentNode = this.decisionTree.nodes[this.currentNode.next];
      this.addMessage('bot', this.currentNode.text);
    }
    this.userInput = '';
  }

  getOptions() {
    return Object.entries(this.currentNode.options || {}).map(([key, text]) => ({ key, text }));
  }
}
