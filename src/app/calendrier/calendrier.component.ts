import { Component, ViewChild } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular'
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Modules Angular Material
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'
import { Employe } from '../models/Employe ';
import { RapportService } from '../rapport.service';
import { Rapport } from '../models/Rapport';
import { EmployerService } from '../employer.service';
import Swal from 'sweetalert2';
import { AnomalieService } from '../anomalie.service';
import { CongeService } from '../conge.service';
@Component({
  selector: 'app-calendrier',
  standalone: true,
  imports: [FullCalendarModule,RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive,MatSelectModule,MatFormFieldModule,MatInputModule],
  templateUrl: './calendrier.component.html',
  styleUrl: './calendrier.component.css'
})
export class CalendrierComponent {

/*    reloadPage(route: string) {
      this.router.navigateByUrl(route).then(() => {
        window.location.reload();
      });
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

    
    selectedYear = new Date().getFullYear();
    selectedMonth = new Date().getMonth() + 1;
    selectedEmployeeId: number | null = null;
    employes: Employe[] = [];
  
    calendarOptions: CalendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      events: [],
    };
  
    constructor(private router: Router,private rapportService: RapportService,private employerService: EmployerService,private anomalieService : AnomalieService,private congeService :CongeService) {}
    userRole: string = '';
    ngOnInit() {
      const user = localStorage.getItem('User');
      if (user) {
        this.userRole = JSON.parse(user).role;
      }
      this.loadEmployes(); // Charger les employés
    }
  
    loadEmployes(): void {
      this.employerService.getAllEmployes().subscribe(
        (data) => {
          this.employes = data;
          //console.log(this.employes)
        },
        (error) => {
          console.error('Erreur lors du chargement des employes :', error);
        }
      );
    }
  

updateCalendar() {
  if (!this.selectedEmployeeId) return;

  let events: { title: string; date: string; color: string; tooltip: string }[] = [];

  // 1️⃣ Charger d'abord les rapports de présence (présent ou absent)
  this.rapportService.getRapportByEmploye(this.selectedEmployeeId, this.selectedYear, this.selectedMonth - 1)
    .subscribe((rapport: Rapport) => {
      if (rapport && rapport.details.length > 0) {
        rapport.details.forEach(detail => {
          const dayOfWeek = new Date(detail.jour).getDay(); // 0 = Dimanche, 6 = Samedi

          // Vérifier si le statutJour est 'Congé'
          if (detail.statutJour === 'Congé') {
            // Si c'est un congé, on ajoute l'événement avec une couleur jaune
            events.push({
              title: 'Congé',
              date: detail.jour,
              color: 'yellow',
              tooltip: `Congé ${detail.jour}`
            });
          } else if (dayOfWeek === 0 || dayOfWeek === 6) {
            // Si c'est un week-end
            events.push({
              title: 'Week-end',
              date: detail.jour,
              color: 'violet',
              tooltip: 'Jour de week-end'
            });
          } else {
            // Si ce n'est ni un congé ni un week-end, vérifier si l'employé est absent ou présent
            if (detail.absent) {
              events.push({
                title: 'Absent',
                date: detail.jour,
                color: 'red',
                tooltip: 'Absent'
              });
            } else {
              events.push({
                title: 'Présent',
                date: detail.jour,
                color: 'green',
                tooltip: 'Présent'
              });
            }
          }
        });
      }

      // 2️⃣ Charger les anomalies (Retards + Départs Anticipés)
      this.anomalieService.getRetardsByEmploye(this.selectedEmployeeId!, this.selectedYear, this.selectedMonth - 1)
        .subscribe((anomalies: any[]) => {
          anomalies.forEach(anomalie => {
            const match = anomalie.description.match(/(\d+) minutes?/);
            const anomalyMinutes = match ? match[1] : "Inconnu"; 
            const dateAnomalie = anomalie.dateValidation.split('T')[0];

            const presentEventExists = events.some(e => e.date === dateAnomalie && e.title === 'Présent');

            if (presentEventExists) {
              if (anomalie.type === "RETARD") {
                events.push({
                  title: `Retard (${anomalyMinutes} min)`,
                  date: dateAnomalie,
                  color: 'orange',
                  tooltip: `Présent mais retard de ${anomalyMinutes} min`
                });
              }
              if (anomalie.type === "Départ_anticipe") {
                events.push({
                  title: `Départ anticipé (${anomalyMinutes} min)`,
                  date: dateAnomalie,
                  color: 'blue',
                  tooltip: `Présent mais départ anticipé de ${anomalyMinutes} min`
                });
              }
            }
          });

          // ✅ Mettre à jour le calendrier avec tous les événements
          this.calendarOptions = { ...this.calendarOptions, events };
        });
    }, error => {
      console.error("Erreur lors du chargement des rapports :", error);
      this.calendarOptions = { ...this.calendarOptions, events: [] };
    });
}

*/


@ViewChild('calendar') calendarComponent: FullCalendarComponent | undefined;

  selectedYear = new Date().getFullYear();
  selectedMonth = new Date().getMonth() + 1;
  selectedEmployeeId: number | null = null;
  employes: Employe[] = [];
  userRole: string = '';

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: [],
    datesSet: (dateInfo) => {
      this.selectedYear = dateInfo.view.currentStart.getFullYear();
      this.selectedMonth = dateInfo.view.currentStart.getMonth() + 1;
      console.log('Navigation via flèches :', { year: this.selectedYear, month: this.selectedMonth });
      if (this.selectedEmployeeId) {
        this.updateCalendar();
      }
    },
  };

  constructor(
    private router: Router,
    private rapportService: RapportService,
    private employerService: EmployerService,
    private anomalieService: AnomalieService,
    private congeService: CongeService
  ) {}

  ngOnInit() {
    const user = localStorage.getItem('User');
    if (user) {
      this.userRole = JSON.parse(user).role;
    }
    this.loadEmployes();
  }

  loadEmployes(): void {
    this.employerService.getAllEmployes().subscribe(
      (data) => {
        this.employes = data;
        console.log('Employés chargés :', this.employes);
      },
      (error) => {
        console.error('Erreur lors du chargement des employés :', error);
      }
    );
  }

  reloadPage(route: string) {
    this.router.navigateByUrl(route).then(() => {
      window.location.reload();
    });
  }

  logout() {
    localStorage.removeItem('User');
    Swal.fire('Succès!', 'Vous êtes déconnecté avec succès!', 'success').then(() => {
      this.router.navigate(['/login']);
    });
  }

  searchCalendar() {
    if (!this.selectedEmployeeId) {
      Swal.fire('Erreur', 'Veuillez sélectionner un employé.', 'error');
      return;
    }
    if (!this.selectedYear || !this.selectedMonth) {
      Swal.fire('Erreur', 'Veuillez sélectionner une année et un mois.', 'error');
      return;
    }

    console.log('Recherche avec :', {
      employeeId: this.selectedEmployeeId,
      year: this.selectedYear,
      month: this.selectedMonth,
    });

    // Mettre à jour la vue du calendrier
    if (this.calendarComponent) {
      const calendarApi = this.calendarComponent.getApi();
      const targetDate = new Date(this.selectedYear, this.selectedMonth - 1, 1);
      console.log('Naviguer vers la date :', targetDate);
      calendarApi.gotoDate(targetDate);
      this.updateCalendar();
    } else {
      console.error('calendarComponent non défini');
    }
  }

  updateCalendar() {
    console.log('Mise à jour du calendrier avec :', {
      employeeId: this.selectedEmployeeId,
      year: this.selectedYear,
      month: this.selectedMonth,
    });

    let events: { title: string; date: string; color: string; tooltip: string }[] = [];

    // Charger les rapports de présence
    this.rapportService.getRapportByEmploye(this.selectedEmployeeId!, this.selectedYear, this.selectedMonth).subscribe(
      (rapport: Rapport) => {
        console.log('Rapport reçu :', rapport);
        if (rapport && rapport.details?.length > 0) {
          rapport.details.forEach((detail) => {
            const dayOfWeek = new Date(detail.jour).getDay();
            const date = new Date(detail.jour).toISOString().split('T')[0];

            if (detail.statutJour === 'Congé') {
              events.push({
                title: 'Congé',
                date: date,
                color: 'yellow',
                tooltip: `Congé ${date}`,
              });
            } else if (dayOfWeek === 0 || dayOfWeek === 6) {
              events.push({
                title: 'Week-end',
                date: date,
                color: 'violet',
                tooltip: 'Jour de week-end',
              });
            } else {
              if (detail.absent) {
                events.push({
                  title: 'Absent',
                  date: date,
                  color: 'red',
                  tooltip: 'Absent',
                });
              } else {
                events.push({
                  title: 'Présent',
                  date: date,
                  color: 'green',
                  tooltip: 'Présent',
                });
              }
            }
          });
        } else {
          console.warn('Aucun détail de rapport trouvé pour ce mois.');
        }

        // Charger les anomalies
        this.anomalieService.getRetardsByEmploye(this.selectedEmployeeId!, this.selectedYear, this.selectedMonth).subscribe(
          (anomalies: any[]) => {
            console.log('Anomalies reçues :', anomalies);
            anomalies.forEach((anomalie) => {
              const match = anomalie.description.match(/(\d+) minutes?/);
              const anomalyMinutes = match ? match[1] : 'Inconnu';
              const dateAnomalie = anomalie.dateValidation.split('T')[0];

              const presentEventExists = events.some((e) => e.date === dateAnomalie && e.title === 'Présent');

              if (presentEventExists) {
                if (anomalie.type === 'RETARD') {
                  events.push({
                    title: `Retard (${anomalyMinutes} min)`,
                    date: dateAnomalie,
                    color: 'orange',
                    tooltip: `Présent mais retard de ${anomalyMinutes} min`,
                  });
                }
                if (anomalie.type === 'Départ_anticipe') {
                  events.push({
                    title: `Départ anticipé (${anomalyMinutes} min)`,
                    date: dateAnomalie,
                    color: 'blue',
                    tooltip: `Présent mais départ anticipé de ${anomalyMinutes} min`,
                  });
                }
              }
            });

            // Mettre à jour les événements
            this.calendarOptions.events = events;
            console.log('Événements mis à jour :', events);

            // Forcer le re-rendu des événements
            if (this.calendarComponent) {
              const calendarApi = this.calendarComponent.getApi();
              calendarApi.refetchEvents();
              calendarApi.render();
            } else {
              console.error('calendarComponent non défini');
            }
          },
          (error) => {
            console.error('Erreur lors du chargement des anomalies :', error);
            this.calendarOptions.events = [];
          }
        );
      },
      (error) => {
        console.error('Erreur lors du chargement des rapports :', error);
        this.calendarOptions.events = [];
      }
    );
  }
}