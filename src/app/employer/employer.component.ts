import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EmployerService } from '../employer.service';
import { Employe } from '../models/Employe ';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import autoTable from 'jspdf-autotable';
import { RapportService } from '../rapport.service';

declare var $: any;
@Component({
  selector: 'app-employer',
  standalone: true,
  imports: [ RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive,NgxPaginationModule],

  templateUrl: './employer.component.html',
  styleUrl: './employer.component.css'
})
export class EmployerComponent implements OnInit {
  page: number = 1;
  itemsPerPage = 5;
  searchText: string = ''; // Stocke la recherche
  departements: string[] = [
    'Marketing',
    'Développement/Technologie',
    'Support Client',
    'Conformité/Légal',
    'Data Analysis/Analyse de données',
    'Création de Contenu',
    'Ventes',
    'Finance et Comptabilité',
    'Gestion de Projet'
  ];

  logout() {
    localStorage.removeItem('User');
    Swal.fire(
      'Succès!',
      'Vous êtes déconnecté avec succès!',
      'success'
    ).then(() => {
      this.router.navigate(['/login']);
    });
  }
  employes: Employe[] = [];

  constructor(private router: Router,private employerService: EmployerService,private rapportService: RapportService) {
    const today = new Date(); // Date actuelle
    this.currentMonth = today.getMonth() + 1; // Mois actuel (1-12)
    this.currentYear = today.getFullYear(); // Année actuelle
  }
  userRole: string = '';

  ngOnInit(): void {
    const user = localStorage.getItem('User');
    if (user) {
      this.userRole = JSON.parse(user).role;
    }
    this.loadEmployes();
    console.log('Employés chargés:', this.filteredEmploye); // Log des employés
  
    // Calculez le taux de présence pour chaque employé
    this.filteredEmploye.forEach(emp => {
      console.log("Traitement de l'employé:", emp.nom); // Log de l'employé en cours
      this.rapportService.getStatistiquesParEmploye(emp.id, this.currentMonth, this.currentYear).subscribe(
        (stats) => {
          emp.presencePercentage = this.calculerTauxPresence(stats);
          console.log("Résultat pour", emp.nom, ":", emp.presencePercentage); // Log du taux de présence
        },
        (error) => {
          console.error('Erreur lors de la récupération des statistiques', error);
          emp.presencePercentage = 0; // Valeur par défaut en cas d'erreur
        }
      );
    });
  }


  deleteEmployer(employer: any) {
    alert('Employé supprimé : ' + employer.nom + ' ' + employer.prenom);
  }


  reloadPage(route: string) {
    this.router.navigateByUrl(route).then(() => {
      window.location.reload();
    });
  }

  loadEmployes(): void {
    this.employerService.getAllEmployes().subscribe(
      (data) => {
        this.employes = data;
        //console.log(this.employes        
      },
      (error) => {
        console.error('Erreur lors du chargement des employes :', error);
      }
    );
    
  }



  deleteEmplyer(employer: any): void {
    console.log('Employer ID to delete:', employer.id);
  
    Swal.fire({
      title: 'Are you sure you want to delete this employer?',
      text: 'This action is irreversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Suppression de la chambre
        this.employerService.deleteEmployer(employer.id).subscribe(
          (response) => {
            // Affichage d'un message de succès après suppression
            Swal.fire(
              'Deleted!',
              `The Employer ${employer.id} has been successfully deleted.`,
              'success'
            ).then(() => {
              this.loadEmployes();
            });
          },
          (error) => {
            // Gestion des erreurs
            console.error('Error while deleting the employer:', error);
            Swal.fire(
              'Error!',
              'An error occurred while deleting the employer.',
              'error'
            );
          }
        );
      }
    });
  }
  
  
  employe: Employe = {
      id: 0,  // Remplis l'objet employe avec les propriétés attendues
      matricule: '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      dateNaissance: '',
      dateEmbauche: '',
      genre: '',
      departement: '',
      cin: '',
      adresse: '',
      photoProfil: '',
      presencePercentage: 0
    }
  
  
    selectEmploye(employe: Employe) {
      // Affecter les informations du horaire sélectionné à l'objet horaire
      this.employe = { ...employe };
      console.log('employe sélectionné pour modification :', this.employe);
    }
  
  
    onSubmit(): void {
      console.log('onSubmit appelé');
  
          const confirmationText = `Are you sure you want to update this Employer?`;
      
          Swal.fire({
            title: confirmationText,
            text: "This action will be applied immediately.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, Update`,
            cancelButtonText: 'Cancel',
          }).then((result) => {
            if (result.isConfirmed) {
              if (this.employe.id) {
                // Si l'ID existe, c'est une mise à jour
                this.employerService.updateEmployer(this.employe).subscribe(
                  (response) => {
                    Swal.fire(
                      'Updates!',
                      `The Employer ${this.employe.id} has been successfully updated.`,
                      'success'
                    ).then(() => {
                      this.loadEmployes();
                      
                    });
                  },
                  (error) => {
                    // Stocker l'état de l'alerte d'erreur dans localStorage
                    console.log("Erreur lors de modification de Employer")
                  }
                );
              } 
            }
          });
        }




 // Méthode pour filtrer les anomalies
 get filteredEmploye() {
  if (!this.searchText.trim()) {
    return this.employes;
  }
  return this.employes.filter(employe => 
    employe.matricule.toLowerCase().includes(this.searchText.toLowerCase()) ||
    employe.nom.toLowerCase().includes(this.searchText.toLowerCase()) ||
    employe.prenom.toLowerCase().includes(this.searchText.toLowerCase()) ||
    employe.cin.toLowerCase().includes(this.searchText.toLowerCase()) ||
    employe.departement.toLowerCase().includes(this.searchText.toLowerCase()) ||
    employe.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
    employe.telephone.toLowerCase().includes(this.searchText.toLowerCase())
  );
}

        // ✅ Exporter en Excel
exportToExcel() {
  const worksheet = XLSX.utils.json_to_sheet(this.filteredEmploye.map(a => ({
    ID: a.id,
    Matricule: a.matricule,
    Nom: a.nom,
    Prénom: a.prenom,
    CIN: a.cin,
    Departemant: a.departement,
    Email: a.email,
    Telephone: a.telephone
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Employes');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  saveAs(data, 'Employes.xlsx');
}


exportToPDF() {
  const doc = new jsPDF();

  // 🏷️ Ajouter un titre avec mise en page
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);  // Taille réduite pour le titre
  doc.setTextColor(40, 40, 40);
  doc.text("Rapport des Employes", 14, 15);

  // 🕒 Ajouter la date et l’heure d’export
  const date = new Date();
  const dateString = date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Généré le : ${dateString}`, 14, 22);

  // 🎨 Style du tableau avec autoTable
  autoTable(doc, {
    startY: 28, // Position du tableau après le titre
    head: [["Matricule", "Nom", "Prénom", "CIN", "Département", "Email", "Téléphone"]],
    body: this.filteredEmploye.map(a => [
      a.matricule || '', a.nom || '', a.prenom || '', a.cin || '', a.departement || '', a.email || '', a.telephone || ''
    ]),
    theme: "striped", // 🌈 Alterne les couleurs des lignes
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    headStyles: {
      fillColor: [44, 62, 80], // 🎨 Bleu foncé pour l’en-tête
      textColor: [255, 255, 255], // 🏳️ Texte blanc
      fontStyle: "bold"
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240] // 🎨 Gris clair pour lisibilité
    },
    columnStyles: {
      0: { cellWidth: 20 }, // Matricule
      1: { cellWidth: 25 }, // Nom
      2: { cellWidth: 25 }, // Prénom
      3: { cellWidth: 20 }, // CIN
      4: { cellWidth: 35 }, // Département
      5: { cellWidth: 35 }, // Email
      6: { cellWidth: 30 }  // Téléphone
    }
  });

  // 📌 Ajouter un pied de page
  const pageCount = doc.internal.pages.length;  // Utilisation de `doc.internal.pages.length` pour obtenir le nombre de pages
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Page ${i} / ${pageCount}`, 180, 285);
  }

  // 💾 Sauvegarde du PDF
  doc.save("Rapport_Employes.pdf");
}




currentMonth: number; // Mois actuel
currentYear: number; // Année actuelle
// Méthode pour calculer le taux de présence
calculerTauxPresence(stats: any): number {
  const joursTravailles = stats.heures_travaillees / 8; // Exemple : 8 heures par jour
  const joursOuvrables = this.getJoursOuvrables(this.currentMonth, this.currentYear); // Jours ouvrables du mois
  const tauxPresence = (joursTravailles / joursOuvrables) * 100;
  return Math.round(tauxPresence * 100) / 100; // Arrondir à 2 décimales
}

// Méthode pour obtenir le nombre de jours ouvrables dans un mois
getJoursOuvrables(month: number, year: number): number {
  const joursFeries: string | string[] = []; // Liste des jours fériés (à adapter)
  let joursOuvrables = 0;

  const date = new Date(year, month - 1, 1); // Mois en JavaScript commence à 0
  while (date.getMonth() === month - 1) {
    const dayOfWeek = date.getDay(); // Jour de la semaine (0 = dimanche, 6 = samedi)
    const isFerie = joursFeries.includes(date.toISOString().split('T')[0]); // Vérifie si c'est un jour férié

    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isFerie) {
      joursOuvrables++;
    }
    date.setDate(date.getDate() + 1); // Jour suivant
  }

  return joursOuvrables;
}

// Méthode pour déterminer la classe du badge
getBadgeClass(presencePercentage: number | undefined): string {
  const percentage = presencePercentage ?? 0;
  if (percentage < 50) {
    return 'bg-danger';
  } else if (percentage >= 50 && percentage < 75) {
    return 'bg-warning';
  } else {
    return 'bg-success';
  }
}

// Méthode pour déterminer la classe de la barre de progression
getProgressBarClass(presencePercentage: number | undefined): string {
  const percentage = presencePercentage ?? 0;
  if (percentage < 50) {
    return 'progress-bar-danger';
  } else if (percentage >= 50 && percentage < 75) {
    return 'bg-warning';
  } else {
    return 'bg-success';
  }
}

}
