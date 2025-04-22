import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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
import { RapportService } from '../rapport.service'
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';
import { Administrateur, AdministrateurAdd } from '../models/Administrateur';
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive,NgxPaginationModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit {
  page: number = 1;
  itemsPerPage = 5;
  searchText: string = ''; // Stocke la recherche
  

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
  administrators: Administrateur[] = [];

  constructor(private router: Router,private adminService: AdminService) {
    const today = new Date(); // Date actuelle
    this.currentMonth = today.getMonth() + 1; // Mois actuel (1-12)
    this.currentYear = today.getFullYear(); // Année actuelle
  }
  userRole: string = '';
  ngOnInit(): void {
    this.loadAdminstrators();
    const user = localStorage.getItem('User');
    if (user) {
      this.userRole = JSON.parse(user).role;
    }
  }


  reloadPage(route: string) {
    this.router.navigateByUrl(route).then(() => {
      window.location.reload();
    });
  }

  loadAdminstrators(): void {
    this.adminService.getAllAdministrateurs().subscribe(
      (data) => {
        this.administrators = data;   
      },
      (error) => {
        console.error('Erreur lors du chargement des admins :', error);
      }
    );
    
  }



  deleteAdmin(admin: any): void {
    console.log('Employer ID to delete:', admin.id);
  
    Swal.fire({
      title: 'Are you sure you want to delete this admin?',
      text: 'This action is irreversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Suppression de la chambre
        this.adminService.deleteAdministrateur(admin.id).subscribe(
          (response) => {
            // Affichage d'un message de succès après suppression
            Swal.fire(
              'Deleted!',
              `The Admin ${admin.id} has been successfully deleted.`,
              'success'
            ).then(() => {
              this.loadAdminstrators();
            });
          },
          (error) => {
            // Gestion des erreurs
            console.error('Error while deleting the admin:', error);
            Swal.fire(
              'Error!',
              'An error occurred while deleting the admin.',
              'error'
            );
          }
        );
      }
    });
  }
  
  
  admin: Administrateur = {
      id: 0,  // Remplis l'objet employe avec les propriétés attendues
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      cin: '',
      role: ''
    }
  
  
    selectAdmin(admin: Administrateur) {
      // Affecter les informations du horaire sélectionné à l'objet horaire
      this.admin = { ...admin };
      console.log('admin sélectionné pour modification :', this.admin);
    }
  
  
    onSubmit(): void {
      console.log('onSubmit appelé');
  
          const confirmationText = `Are you sure you want to update this Admin?`;
      
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
              if (this.admin.id) {
                // Si l'ID existe, c'est une mise à jour
                this.adminService.updateAdministrateurr(this.admin).subscribe(
                  (response) => {
                    Swal.fire(
                      'Updates!',
                      `The Admin ${this.admin.id} has been successfully updated.`,
                      'success'
                    ).then(() => {
                      this.loadAdminstrators();
                      
                    });
                  },
                  (error) => {
                    // Stocker l'état de l'alerte d'erreur dans localStorage
                    console.log("Erreur lors de modification de Admin")
                  }
                );
              } 
            }
          });
        }




 // Méthode pour filtrer les anomalies
 get filteredAdmin() {
  if (!this.searchText.trim()) {
    return this.administrators;
  }
  return this.administrators.filter(admin => 
    admin.nom.toLowerCase().includes(this.searchText.toLowerCase()) ||
    admin.prenom.toLowerCase().includes(this.searchText.toLowerCase()) ||
    admin.cin.toLowerCase().includes(this.searchText.toLowerCase()) ||
    admin.role.toLowerCase().includes(this.searchText.toLowerCase()) ||
    admin.email.toLowerCase().includes(this.searchText.toLowerCase()) ||
    admin.telephone.toLowerCase().includes(this.searchText.toLowerCase())
  );
}

        // ✅ Exporter en Excel
exportToExcel() {
  const worksheet = XLSX.utils.json_to_sheet(this.filteredAdmin.map(a => ({
    ID: a.id,
    Nom: a.nom,
    Prénom: a.prenom,
    CIN: a.cin,
    Role: a.role,
    Email: a.email,
    Telephone: a.telephone
  })));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Admin');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  saveAs(data, 'Admins.xlsx');
}


exportToPDF() {
  const doc = new jsPDF();

  // 🏷️ Ajouter un titre avec mise en page
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);  // Taille réduite pour le titre
  doc.setTextColor(40, 40, 40);
  doc.text("Rapport des Admins", 14, 15);

  // 🕒 Ajouter la date et l’heure d’export
  const date = new Date();
  const dateString = date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR");
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Généré le : ${dateString}`, 14, 22);

  // 🎨 Style du tableau avec autoTable
  autoTable(doc, {
    startY: 28, // Position du tableau après le titre
    head: [["Nom", "Prénom", "CIN", "Role", "Email", "Téléphone"]],
    body: this.filteredAdmin.map(a => [
     a.nom || '', a.prenom || '', a.cin || '', a.role || '', a.email || '', a.telephone || ''
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
  doc.save("Rapport_Admins.pdf");
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







// Définir la liste des rôles
rolesList = [
  { value: 'RH', label: 'Ressources Humaines' },
  { value: 'ADMINISTRATEUR', label: 'Administrateur' },
  { value: 'Super_Admin', label: 'Super Administrateur' }
];



// ... vos autres variables existantes ...

newAdmin: AdministrateurAdd = {
  nom: '',
  prenom: '',
  cin: '',
  email: '',
  motDePasse: '',
  role: 'RH', // Valeur par défaut
  telephone: ''
};
confirmMotDePasse: string = '';


addAdmin(form: NgForm) {
  // Validation côté client
  if (!form.valid) {
    Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires', 'error');
    return;
  }

  if (this.newAdmin.motDePasse !== this.confirmMotDePasse) {
    Swal.fire('Erreur', 'Les mots de passe ne correspondent pas', 'error');
    return;
  }

  Swal.fire({
    title: 'Confirmation',
    text: `Voulez-vous vraiment créer l'administrateur ${this.newAdmin.nom} ${this.newAdmin.prenom} ?`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Oui, créer',
    cancelButtonText: 'Annuler'
  }).then((result) => {
    if (result.isConfirmed) {
      this.adminService.createAdmin(this.newAdmin).subscribe({
        next: (response) => {
          Swal.fire('Succès', 'Administrateur créé avec succès', 'success');
          this.resetForm(form);
          this.loadAdminstrators(); // Recharger la liste
        },
        error: (err) => {
          console.error('Erreur création admin:', err);
          let errorMsg = 'Erreur lors de la création';
          if (err.error?.message) {
            errorMsg += `: ${err.error.message}`;
          }
          Swal.fire('Erreur', errorMsg, 'error');
        }
      });
    }
  });
}

private resetForm(form: NgForm): void {
  this.newAdmin = {
    nom: '',
    prenom: '',
    cin: '',
    email: '',
    motDePasse: '',
    role: 'RH',
    telephone: ''
  };
  this.confirmMotDePasse = '';
  form.resetForm();
}

}
