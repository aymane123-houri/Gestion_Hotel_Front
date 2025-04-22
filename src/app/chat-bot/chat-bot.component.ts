import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { ChatbotService } from '../chatbot.service';
import Swal from 'sweetalert2';

interface QueryType {
  value: string;
  label: string;
  icon: string;
}

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
  type?: string;
  timestamp?: Date;
}
@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [ReactiveFormsModule,RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive,NgxPaginationModule],
  templateUrl: './chat-bot.component.html',
  styleUrl: './chat-bot.component.css'
})
export class ChatBotComponent {
// Dans chat-bot.component.ts
/*getTypeLabel(typeValue: string): string {
  const type = this.queryTypes.find(t => t.value === typeValue);
  return type ? type.label : typeValue;
}
  message = '';
  queryType = 'ANOMALIE';
  messages: {text: string, sender: 'user'|'bot', type?: string}[] = [];
  queryTypes = [
    {value: 'ANOMALIE', label: 'Anomalie'},
    {value: 'POINTAGE', label: 'Pointage'},
    {value: 'RAPPORT', label: 'Rapport'},
    {value: 'HORAIRE', label: 'Horaire'},
    {value: 'EMPLOYE', label: 'Employé'}
  ];

  constructor(private chatbotService: ChatbotService) {}

  sendMessage() {
    if (!this.message.trim()) return;
  
    this.messages.push({
      text: this.message,
      sender: 'user',
      type: this.queryType
    });
  
    const currentMessage = this.message;
    this.message = '';
  
    this.chatbotService.sendMessage(currentMessage, this.queryType).subscribe({
      next: (response: any) => {
        this.messages.push({
          text: response.response,
          sender: 'bot'
        });
      },
      error: (err) => {
        console.error('API Error:', err);
        this.messages.push({
          text: 'Erreur lors de la communication avec le serveur',
          sender: 'bot'
        });
      }
    });
  }
*/

userRole: string = '';
ngOnInit() {
  const user = localStorage.getItem('User');
  if (user) {
    this.userRole = JSON.parse(user).role;
  }
}
logout() {
  // Supprimer les informations de l'utilisateur du localStorage
  localStorage.removeItem('User');

  // Affichage d'un message de succès
  Swal.fire(
    'Succès!',
    'Vous êtes déconnecté avec succès!',
    'success'
  ).then(() => {
    // Rediriger l'utilisateur vers la page de connexion
    this.router.navigate(['/login']);
  });

}

reloadPage(route: string) {
  this.router.navigateByUrl(route).then(() => {
    window.location.reload(); // Recharge la page
    //this.loadEmploye();
  });
}

message = '';
queryType = 'ANOMALIE';
messages: ChatMessage[] = [];

queryTypes: QueryType[] = [
  { value: 'ANOMALIE', label: 'Anomalie', icon: 'fas fa-exclamation-triangle' },
  { value: 'POINTAGE', label: 'Pointage', icon: 'fas fa-clock' },
  { value: 'Rapport_Quotidien', label: 'Rapport de jour', icon: 'fas fa-file-alt' },
  { value: 'HORAIRE', label: 'Horaire', icon: 'fas fa-calendar-alt' },
  { value: 'Employe', label: 'Employé', icon: 'fas fa-user-tie' },
  { value: 'RAPPORT_MENSUEL', label: 'Rapport de mois', icon: 'fas fa-user-tie' }
];

quickActions = [
  { text: 'Signaler une anomalie de pointage', icon: 'fas fa-exclamation-circle' },
  { text: 'Consulter mes heures cette semaine', icon: 'fas fa-calendar-week' },
  { text: 'Générer mon rapport mensuel', icon: 'fas fa-file-export' }
];

constructor(private chatbotService: ChatbotService,private router: Router) {}

getTypeLabel(typeValue: string): string {
  const type = this.queryTypes.find(t => t.value === typeValue);
  return type ? type.label : typeValue;
}

getTypeIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'ANOMALIE': 'fas fa-exclamation-circle',
    'POINTAGE': 'fas fa-clock',
    'Rapport_Quotidien': 'fas fa-file-alt',
    'HORAIRE': 'fas fa-calendar-alt',
    'Employe': 'fas fa-user-tie',
    'default': 'fas fa-question-circle'
  };
  return iconMap[type] || iconMap['default'];
}

sendMessage() {
  if (!this.message.trim()) return;

  this.messages.push({
    text: this.message,
    sender: 'user',
    type: this.queryType,
    timestamp: new Date()
  });

  const currentMessage = this.message;
  this.message = '';

  this.chatbotService.sendMessage(currentMessage, this.queryType).subscribe({
    next: (response: any) => {
      this.messages.push({
        text: response.response,
        sender: 'bot',
        timestamp: new Date()
      });
    },
    error: (err) => {
      console.error('API Error:', err);
      this.messages.push({
        text: 'Erreur lors de la communication avec le serveur',
        sender: 'bot',
        type: 'error',
        timestamp: new Date()
      });
    }
  });
}

setQuickQuestion(question: string): void {
  this.message = question;
  
  // Détermine automatiquement le type de requête basé sur le contenu
  const matchedType = this.queryTypes.find(type => 
    question.toLowerCase().includes(type.label.toLowerCase())
  );
  
  this.queryType = matchedType ? matchedType.value : 'ANOMALIE';
  this.sendMessage();
}


formatMessageText(text: string): string {
  return text.replace(/\n/g, '<br>');
}

}












