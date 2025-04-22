import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PointageService } from '../pointage.service';
import { Pointage } from '../models/Pointage';
import Swal from 'sweetalert2';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive,NgxPaginationModule],
  providers: [DatePipe],
  templateUrl: './pointage.component.html',
  styleUrl: './pointage.component.css'
})
export class PointageComponent {
  Status: string[] = [
    'ABSENCE',
    'RETARD',
    'PRESENT',
  ];
  page: number = 1;
  itemsPerPage = 5;
  searchText: string = ''; // Stocke la recherche

  pointages: Pointage[] = [];

  constructor(private router: Router,private pointageService: PointageService,private datePipe: DatePipe) {}

  reloadPage(route: string) {
    this.router.navigateByUrl(route).then(() => {
      window.location.reload();
    });
  }

  userRole: string = '';
  ngOnInit(): void {
    const user = localStorage.getItem('User');
    if (user) {
      this.userRole = JSON.parse(user).role;
    }
    this.loadPointages();
}





loadPointages(): void {
  this.pointageService.getAllPointage().subscribe(
    (data) => {
      this.pointages = data;
      //console.log(this.employes)
      
    },
    (error) => {
      console.error('Erreur lors du chargement des pointages :', error);
    }
  );
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
  pointage: Pointage = {
      id: 0,  // Remplis l'objet employe avec les propriétés attendues
      dateHeureEntree: '',
      dateHeureSortie: '',
      statut: '',
      employe: { 
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
        photoProfil: ''
      }
    }
  
 selectPointage(pointage: Pointage) {
      // Affecter les informations du horaire sélectionné à l'objet horaire
      this.pointage = { ...pointage };
      console.log('pointage sélectionné pour modification :', this.pointage);
    }
  
  
    onSubmit(): void {
      console.log('onSubmit appelé');
  
          const confirmationText = `Are you sure you want to update this Pointage?`;
      
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
              if (this.pointage.id) {
                // Si l'ID existe, c'est une mise à jour
                this.pointageService.updatePointage(this.pointage).subscribe(
                  (response) => {
                    Swal.fire(
                      'Updates!',
                      `The pointage ${this.pointage.id} has been successfully updated.`,
                      'success'
                    ).then(() => {
                      this.loadPointages();
                      
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


exportToExcel() {
  const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.pointages.map(pointage => ({
    ID: pointage.id,
    Employé: `${pointage.employe.nom} ${pointage.employe.prenom}`,
    Date: pointage.dateHeureEntree ? this.datePipe.transform(pointage.dateHeureEntree, 'yyyy-MM-dd') : '',
    HeureEntree: pointage.dateHeureEntree ? this.datePipe.transform(pointage.dateHeureEntree, 'HH:mm') : '',
    HeureSortie: pointage.dateHeureSortie ? this.datePipe.transform(pointage.dateHeureSortie, 'HH:mm') : 'Non enregistré',
    Statut: pointage.statut
  })));
  
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Pointages');
  XLSX.writeFile(wb, 'Pointages.xlsx');
}

exportToPDF() {
  const doc = new jsPDF();

  // Titre
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Rapport des Pointages', 14, 15);

  // Ajouter la date
  const date = new Date();
  const dateString = date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR");
  doc.setFontSize(10);
  doc.text(`Généré le : ${dateString}`, 14, 22);

  // Style du tableau avec autoTable
  autoTable(doc, {
    startY: 28,
    head: [["ID", "Employé", "Date", "Heure Entrée", "Heure Sortie", "Status"]],
    body: this.pointages.map(pointage => [
      pointage.id,
      `${pointage.employe.nom} ${pointage.employe.prenom}`,
      pointage.dateHeureEntree ? this.datePipe.transform(pointage.dateHeureEntree, 'yyyy-MM-dd') : '',
      pointage.dateHeureEntree ? this.datePipe.transform(pointage.dateHeureEntree, 'HH:mm') : '',
      pointage.dateHeureSortie ? this.datePipe.transform(pointage.dateHeureSortie, 'HH:mm') : 'Non enregistré',
      pointage.statut
    ]),
    theme: 'striped',
    styles: { fontSize: 10, cellPadding: 4 },
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [240, 240, 240] },
    columnStyles: {
      0: { cellWidth: 20 },  // ID
      1: { cellWidth: 35 },  // Employé
      2: { cellWidth: 25 },  // Date
      3: { cellWidth: 20 },  // Heure Entrée
      4: { cellWidth: 20 },  // Heure Sortie
      5: { cellWidth: 20 }   // Status
    }
  });

  // Footer
  const pageCount = doc.internal.pages.length;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Page ${i} / ${pageCount}`, 180, 285);
  }

  // Sauvegarder le PDF
  doc.save("Pointages.pdf");
}

get filteredPointages() {
  if (!this.searchText.trim()) {
    return this.pointages;
  }

  const searchTextLower = this.searchText.toLowerCase();

  return this.pointages.filter(pointage => {
    const nom = pointage.employe.nom.toLowerCase();
    const prenom = pointage.employe.prenom.toLowerCase();
    const statut = pointage.statut.toLowerCase();

    // Convertir les dates en chaînes pour les comparer
    const dateHeureEntree = pointage.dateHeureEntree ? pointage.dateHeureEntree.toString().toLowerCase() : '';
    const dateHeureSortie = pointage.dateHeureSortie ? pointage.dateHeureSortie.toString().toLowerCase() : '';

    return nom.includes(searchTextLower) ||
           prenom.includes(searchTextLower) ||
           dateHeureEntree.includes(searchTextLower) ||
           dateHeureSortie.includes(searchTextLower) ||
           statut.includes(searchTextLower);
  });
}



deletePointage(pointage: any): void {
  console.log('Horaire ID to delete:', pointage.id);

  Swal.fire({
    title: 'Are you sure you want to delete this horaire?',
    text: 'This action is irreversible!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete!',
  }).then((result) => {
    if (result.isConfirmed) {
      // Suppression de la chambre
      this.pointageService.deletePointage(pointage.id).subscribe(
        (response) => {
          // Affichage d'un message de succès après suppression
          Swal.fire(
            'Deleted!',
            `The score ${pointage.id} has been successfully deleted.`,
            'success'
          ).then(() => {
            this.loadPointages();
          });
        },
        (error) => {
          // Gestion des erreurs
          console.error('Error while deleting the score:', error);
          Swal.fire(
            'Error!',
            'An error occurred while deleting the score.',
            'error'
          );
        }
      );
    }
  });
}
}
