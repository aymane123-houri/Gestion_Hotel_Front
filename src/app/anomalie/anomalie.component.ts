import { Component, OnInit } from '@angular/core';
import { Anomalie } from '../models/Anomalie';
import { AnomalieService } from '../anomalie.service';
import Swal from 'sweetalert2';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { NgxPaginationModule } from 'ngx-pagination';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-anomalie',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive,NgxPaginationModule],
  templateUrl: './anomalie.component.html',
  styleUrl: './anomalie.component.css'
})
export class AnomalieComponent implements OnInit { 
  page: number = 1;
  itemsPerPage = 5;
  searchText: string = ''; // Stocke la recherche
    anomalies: Anomalie[] = [];
  
    constructor(private router: Router,private anomalieService: AnomalieService) {}
    userRole: string = '';
    ngOnInit(): void {
      const user = localStorage.getItem('User');
      if (user) {
        this.userRole = JSON.parse(user).role;
      }
      this.loadAnomalies();
    }
  
    loadAnomalies(): void {
      this.anomalieService.getAllAnomalies().subscribe(data => {
        this.anomalies = data;
      }, error => {
        console.error("Erreur lors du chargement des anomalies", error);
      });
    }
  
  // Méthode pour valider une anomalie
  validerAnomalie(id?: string) {
    // Appeler le service pour mettre à jour l'anomalie
    this.anomalieService.validerAnomalie(id).subscribe(
      (response) => {
        // Mettre à jour le statut localement après validation
        const anomalie = this.anomalies.find(a => a.id === id);
        if (anomalie) {
          anomalie.statut = 'Validée'; // Mettre à jour le statut
        }
      },
      (error) => {
        console.error('Erreur lors de la validation de l\'anomalie', error);
      }
    );
  }
    
  deleteAnomalie(anomalie: any): void {
    console.log('Horaire ID to delete:', anomalie.id);
  
    Swal.fire({
      title: 'Are you sure you want to delete this anomaly?',
      text: 'This action is irreversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Suppression de la chambre
        this.anomalieService.deleteAnomalie(anomalie.id).subscribe(
          (response) => {
            // Affichage d'un message de succès après suppression
            Swal.fire(
              'Deleted!',
              `The anomaly ${anomalie.id} has been successfully deleted.`,
              'success'
            ).then(() => {
              this.loadAnomalies();
            });
          },
          (error) => {
            // Gestion des erreurs
            console.error('Error while deleting the anomaly:', error);
            Swal.fire(
              'Error!',
              'An error occurred while deleting the anomaly.',
              'error'
            );
          }
        );
      }
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

    reloadPage(route: string) {
      this.router.navigateByUrl(route).then(() => {
        window.location.reload(); // Recharge la page
      });
    }




genererRapportPDF(): void {
  const doc = new jsPDF();
  
  doc.text("Rapport des Anomalies", 10, 10);

  const rows = this.anomalies.map(anomalie => [
    anomalie.id,
    anomalie.empoloyer_id,
    anomalie.type,
    anomalie.description,
    anomalie.statut
  ]);

  (doc as any).autoTable({
    head: [['ID', 'Employé', 'Type', 'Description', 'Statut']],
    body: rows,
  });

  doc.save("rapport_anomalies.pdf");
}



 // Méthode pour filtrer les anomalies
 get filteredAnomalies() {
  if (!this.searchText.trim()) {
    return this.anomalies;
  }
  return this.anomalies.filter(anomalie => 
    anomalie.employe.nom.toLowerCase().includes(this.searchText.toLowerCase()) ||
    anomalie.employe.prenom.toLowerCase().includes(this.searchText.toLowerCase()) ||
    anomalie.statut.toLowerCase().includes(this.searchText.toLowerCase()) ||
    anomalie.type.toLowerCase().includes(this.searchText.toLowerCase()) ||
    anomalie.description.toLowerCase().includes(this.searchText.toLowerCase())
  );
}


// ✅ Exporter en Excel
exportToExcel() {
  const worksheet = XLSX.utils.json_to_sheet(this.filteredAnomalies.map(a => ({
    ID: a.id,
    Nom: a.employe.nom,
    Prénom: a.employe.prenom,
    Date: a.dateValidation,
    Statut: a.statut,
    Type: a.type,
    Description: a.description
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Anomalies');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  saveAs(data, 'Anomalies.xlsx');
}


exportToPDF() {
  const doc = new jsPDF();

  // 🏷️ Ajouter un titre avec mise en page
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text("Rapport des Anomalies", 14, 15);

  // 🕒 Ajouter la date et l’heure d’export
  const date = new Date();
  const dateString = date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Généré le : ${dateString}`, 14, 22);

  // 🎨 Style du tableau avec autoTable
  autoTable(doc, {
    startY: 28, // Position du tableau après le titre
    head: [["Nom", "Prénom", "Date", "Statut", "Type", "Description"]],
    body: this.filteredAnomalies.map(a => [
       a.employe.nom || '', a.employe.prenom || '', a.dateValidation || '', a.statut || '', a.type || '', a.description || ''
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
      1: { cellWidth: 30 }, // Nom
      2: { cellWidth: 30 }, // Prénom
      3: { cellWidth: 25 }, // Date
      4: { cellWidth: 30 }, // Statut
      5: { cellWidth: 25 }, // Type
      6: { cellWidth: 70 }  // Description
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
  doc.save("Rapport_Anomalies.pdf");
}


}
