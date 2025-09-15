import { Component, OnInit } from '@angular/core';
import { UselessTask } from '../models/UselessTask';
import { HttpClient } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-polling',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    FormsModule,
    CommonModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
  ],
  templateUrl: './polling.component.html',
  styleUrls: ['./polling.component.css'],
})
export class PollingComponent implements OnInit {
  apiUrl = 'https://localhost:7289/api/';
  title = 'labo.signalr.ng';
  tasks: UselessTask[] = [];
  taskname: string = '';

  private pollTimer?: any;



  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.updateTasks();
  }

  complete(id: number) {
    // TODO On invoke la méthode pour compléter une tâche sur le serveur (Contrôleur d'API)
    this.http.get<void>(`${this.apiUrl}UselessTasks/Complete/${id}`)
      .subscribe({
        next: () => {
          // recharge immédiat pour feedback instantané
          this.fetchOnce();
        }
      });
  }

   addtask() {
    // TODO On invoke la méthode pour ajouter une tâche sur le serveur (Contrôleur d'API)
    const text = (this.taskname || '').trim();
    if (!text) return;

    this.http.post<UselessTask>(`${this.apiUrl}UselessTasks/Add?taskText=${encodeURIComponent(text)}`, null)
      .subscribe({
        next: () => {
          this.taskname = '';
          // recharge immédiat pour voir la nouvelle tâche
          this.fetchOnce();
        }
      });

    console.log(this.tasks);
  }

   async updateTasks() {
    // TODO: Faire une première implémentation simple avec un appel au serveur pour obtenir la liste des tâches
    // TODO: UNE FOIS QUE VOUS AVEZ TESTER AVEC DEUX CLIENTS: Utiliser le polling pour mettre la liste de tasks à jour chaque seconde
    this.http.get<UselessTask[]>(`${this.apiUrl}UselessTasks/GetAll`)
      .subscribe({
        next: (items) => this.tasks = items,
        error: () => { /* on ignore les erreurs de polling pour ne pas spammer l'UI */ },
        complete: () => {
          // relance après 1 seconde (pattern de polling via setTimeout)
          this.pollTimer = setTimeout(() => this.updateTasks(), 1000);
        }
      });
  }
  
   private fetchOnce(): void {
    this.http.get<UselessTask[]>(`${this.apiUrl}UselessTasks/GetAll`)
      .subscribe(items => this.tasks = items);
  }

}
