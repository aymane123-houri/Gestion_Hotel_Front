import { Component } from '@angular/core';
import { Employe } from '../models/Employe ';
import { HoraireService } from '../horaire.service';
import { Horaire, Horairee } from '../models/Horaire';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-horaire',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './horaire.component.html',
  styleUrl: './horaire.component.css'
})
export class HoraireComponent {

  horaires: Horaire[] = [];


employers: any;
reloadPage(route: string) {
  this.router.navigateByUrl(route).then(() => {
    window.location.reload();
  });
}

employes: Employe[] = [];
nomRecherche: string = '';
employeSelectionne: Employe | null = null; // Stocke l'employé sélectionné

horaire: Horaire = {
  heure_arrivee: '',
  heure_depart: '',
  type: 'FIXE',
  employeId: 0  // Utilise l'ID de l'employé au lieu de l'objet complet
};


constructor(private horaireService: HoraireService,private router: Router) {}
userRole: string = '';
ngOnInit(): void {
  const user = localStorage.getItem('User');
  if (user) {
    this.userRole = JSON.parse(user).role;
  }
  this.loadHoraire();
 
}

rechercherEmploye(): void {
  if (!this.nomRecherche.trim()) return; // Empêcher une requête vide
  this.horaireService.rechercherEmployeParNom(this.nomRecherche).subscribe(employes => {
    this.employes = employes;
  });
}

selectionnerEmploye(employe: Employe): void {
  this.employeSelectionne = employe;
  this.horaire.employeId = employe.id; 
}

assignerHoraire(): void {
  if (this.horaire.employeId === 0) {
    console.error('Aucun employé sélectionné');
    return;
  }
  console.log("Horaire à envoyer : ", this.horaire);  // Inspecte l'objet entier avant l'envoi

  this.horaireService.createHoraire(this.horaire).subscribe(
    result => {
      console.log('Horaire assigné avec succès !', result);
      this.loadHoraire();  // Recharger les horaires après l'ajout
    },
    error => {
      console.error('Erreur lors de l\'assignation de l\'horaire', error);
    }
  );
}



horairess: Horairee[] = [];
loadHoraire(): void {
  this.horaireService.getAllHoraire().subscribe(
    (data) => {
      this.horairess = data;
      //console.log(this.horaire)
      
    },
    (error) => {
      console.error('Erreur lors du chargement des horaires :', error);
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




      
deleteHoraire(horaire: any): void {
  console.log('Horaire ID to delete:', horaire.id);

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
      this.horaireService.deleteHoraire(horaire.id).subscribe(
        (response) => {
          // Affichage d'un message de succès après suppression
          Swal.fire(
            'Deleted!',
            `The hourly ${horaire.id} has been successfully deleted.`,
            'success'
          ).then(() => {
            this.loadHoraire();
          });
        },
        (error) => {
          // Gestion des erreurs
          console.error('Error while deleting the horaire:', error);
          Swal.fire(
            'Error!',
            'An error occurred while deleting the horaire.',
            'error'
          );
        }
      );
    }
  });
}


horairee: Horairee = {
  heure_arrivee: '',
  heure_depart: '',
  type: 'FIXE',
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
};

  selectHoraire(horairee: Horairee) {
    // Affecter les informations du horaire sélectionné à l'objet horaire
    this.horairee = { ...horairee };
    console.log('horaire sélectionné pour modification :', this.horairee);
  }


  onSubmit(): void {
    console.log('onSubmit appelé');

        const confirmationText = `Are you sure you want to update this Horaire?`;
    
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
            if (this.horairee.id) {
              // Si l'ID existe, c'est une mise à jour
              this.horaireService.updateHoraire(this.horairee).subscribe(
                (response) => {
                  Swal.fire(
                    'Updates!',
                    `The hourly ${this.horairee.id} has been successfully updated.`,
                    'success'
                  ).then(() => {
                    this.loadHoraire();
                  });
                },
                (error) => {
                  // Stocker l'état de l'alerte d'erreur dans localStorage
                  console.log("Erreur lors de modification de Horaire")
                }
              );
            } 
          }
        });
      }
}
