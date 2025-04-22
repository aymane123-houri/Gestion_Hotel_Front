import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import Swal from 'sweetalert2';
import { Rapport } from '../models/Rapport';
import { RapportService } from '../rapport.service';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Details } from '../models/Details';
import autoTable from 'jspdf-autotable';
declare var $: any;
@Component({
  selector: 'app-rapport',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './rapport.component.html',
  styleUrl: './rapport.component.css'
})
export class RapportComponent {
selectRapport(_t119: Rapport) {
throw new Error('Method not implemented.');
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
  rapports: Rapport[] = [];

  constructor(private router: Router,private rapportService: RapportService) {}
  userRole: string = '';
  ngOnInit(): void {
    const user = localStorage.getItem('User');
    if (user) {
      this.userRole = JSON.parse(user).role;
    }
      this.loadRapport();
     
  }


  reloadPage(route: string) {
    this.router.navigateByUrl(route).then(() => {
      window.location.reload();
    });
  }




  ngAfterViewInit(): void {
    // Initialisation de DataTables après que les données soient chargées
    // Attends un court instant pour que les données soient affichées
  setTimeout(() => {
    this.initializeDataTable();
  }, 3000);
  }
  
  initializeDataTable(): void {
    $('#example1').DataTable({
      paging: true,  // Activer la pagination
      lengthChange: true,  // Permet à l'utilisateur de changer le nombre d'éléments par page
      pageLength: 3,  // Nombre d'éléments par page par défaut
      searching: true,  // Activer la fonctionnalité de recherche
      ordering: true,  // Activer le tri
      info: true,  // Afficher le texte d'information en bas de la table
      autoWidth: false,
      dom: '<"row"<"col-sm-6 text-start"f><"col-sm-6 text-end"B>>' +
           '<"row"<"col-sm-12"tr>>' +
           '<"row"<"col-sm-5 text-start"i><"col-sm-7 text-end"p>>',
      buttons: [
        { extend: 'copy', className: 'btn btn-dark' },
        { extend: 'csv', className: 'btn btn-dark' },
        { extend: 'excel', className: 'btn btn-dark' },
        { extend: 'pdf', className: 'btn btn-dark' },
        { extend: 'print', className: 'btn btn-dark' }
      ]
    });
  }
  
  reloadDataTable(): void {
    // Si DataTables est déjà initialisé, le réinitialiser
    if ($.fn.dataTable.isDataTable('#example1')) {
      $('#example1').DataTable().clear().destroy();
    }
    this.initializeDataTable();  // Réinitialiser DataTables
  }

  loadRapport(): void {
    this.rapportService.getAllRApports().subscribe(
      (data) => {
        this.rapports = data;
        //console.log(this.employes)
        
      },
      (error) => {
        console.error('Erreur lors du chargement des employes :', error);
      }
    );
  }



  deleteRapport(rapport: any): void {
    console.log('Horaire ID to delete:', rapport.id);
  
    Swal.fire({
      title: 'Are you sure you want to delete this rapport?',
      text: 'This action is irreversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Suppression de la chambre
        this.rapportService.deleteRapport(rapport.id).subscribe(
          (response) => {
            // Affichage d'un message de succès après suppression
            Swal.fire(
              'Deleted!',
              `The Employer ${rapport.id} has been successfully deleted.`,
              'success'
            ).then(() => {
              this.loadRapport();
            });
          },
          (error) => {
            // Gestion des erreurs
            console.error('Error while deleting the rapport:', error);
            Swal.fire(
              'Error!',
              'An error occurred while deleting the rapport.',
              'error'
            );
          }
        );
      }
    });
  }
  rapportSelectionne: any = null;

  voirDetails(rapport: any) {
    this.rapportSelectionne = rapport;
  }
  
  /*rapport: Employe = {
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
      address: '',
      photoProfil: ''
    }
  
  
    selectHoraire(employe: Employe) {
      // Affecter les informations du horaire sélectionné à l'objet horaire
      this.employe = { ...employe };
      console.log('horaire sélectionné pour modification :', this.employe);
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
        }*/


 



/*generatePdf(rapport: Rapport): void {
  const doc = new jsPDF();

  // ✅ Ajouter un titre stylisé
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('Rapport de Pointage', 70, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employé : ${rapport.employe.nom} ${rapport.employe.prenom}`, 20, 30);
  doc.text(`Période: ${rapport.periode}`, 20, 40);
  doc.text(`Heures Travaillées: ${rapport.heures_travaillees}`, 20, 50);
  doc.text(`Heures Supplémentaires: ${rapport.heures_supplementaires}`, 20, 60);
  doc.text(`Retards: ${rapport.retards}`, 20, 70);
  doc.text(`Absences: ${rapport.absences}`, 20, 80);

  // ✅ Ajouter un tableau structuré
  autoTable(doc, {
    startY: 90,
    head: [['Jour', 'Heures Travaillées', 'Heures Supplémentaires', 'Retard', 'Absence']],
    body: rapport.details.map(detail => [
      detail.jour,
      detail.heuresTravaillees,
      detail.heuresSupplementaires,
      detail.enRetard ? 'Oui' : 'Non',
      detail.absent ? 'Oui' : 'Non'
    ]),
    theme: 'grid', // Appliquer un style au tableau
    headStyles: { fillColor: [41, 128, 185] }, // Bleu pour l'en-tête
    styles: { fontSize: 10 },
    alternateRowStyles: { fillColor: [240, 240, 240] }, // Gris clair pour une meilleure lecture
  });

  // ✅ Enregistrer le PDF avec un nom dynamique
  doc.save(`Rapport_Employe_${rapport.employe_id}_${rapport.periode}.pdf`);
}*/

generatePdf(rapport: Rapport): void {
  const doc = new jsPDF();

  // 🎨 ✅ Définir les couleurs comme une tuple
  const primaryColor: [number, number, number] = [41, 128, 185]; // Bleu
  const secondaryColor: [number, number, number] = [236, 240, 241]; // Gris clair

  // ✅ Ajouter un en-tête stylisé avec un rectangle bleu
  doc.setFillColor(...primaryColor); 
  doc.rect(0, 0, 210, 30, 'F'); // Rectangle bleu sur toute la largeur
  doc.setTextColor(255, 255, 255); // Texte blanc
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport Mensuel de Pointage', 50, 20);

  // ✅ Ajouter des informations générales
  doc.setTextColor(0, 0, 0); // Noir
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Employé ID: ${rapport.employe.nom} ${rapport.employe.prenom}`, 20, 40);
  doc.text(`Période: ${rapport.periode}`, 20, 50);
  doc.text(`Total Heures Travaillées: ${rapport.heures_travaillees}`, 20, 60);
  doc.text(`Total Heures Supplémentaires: ${rapport.heures_supplementaires}`, 20, 70);
  doc.text(`Total Retards: ${rapport.retards}`, 20, 80);
  doc.text(`Total Absences: ${rapport.absences}`, 20, 90);

  // ✅ Ajouter un tableau bien stylisé
  autoTable(doc, {
    startY: 100,
    head: [['Jour', 'Heures Travaillées', 'Heures Supplémentaires', 'Retard', 'Absence']],
    body: rapport.details.map(detail => [
      detail.jour,
      detail.heuresTravaillees,
      detail.heuresSupplementaires,
      detail.enRetard ? '⚠️ Oui' : '✅ Non',
      detail.absent ? '❌ Oui' : '✅ Non'
    ]),
    theme: 'grid',
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' }, // Titre en bleu
    styles: { fontSize: 10, cellPadding: 3 },
    alternateRowStyles: { fillColor: secondaryColor }, // Alternance de couleur
  });

  // ✅ Ajouter un pied de page avec la date actuelle
  const currentDate = new Date().toLocaleDateString();
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Rapport généré le ${currentDate}`, 20, 280);

  // ✅ Sauvegarder le PDF avec un nom dynamique
  doc.save(`Rapport_Pointage_${rapport.employe.nom}_${rapport.employe.prenom}_${rapport.periode}.pdf`);
}
  // Fonction pour générer le rapport en Excel
  generateExcel(rapport: Rapport): void {
    const worksheet = XLSX.utils.json_to_sheet(rapport.details);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Détails du Rapport');

    XLSX.writeFile(workbook, 'rapport_' + rapport.employe.nom + rapport.employe.prenom + '_' + rapport.periode + '.xlsx');
  }
}
