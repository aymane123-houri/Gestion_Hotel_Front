import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { Conge, CongeStatut, CongeType } from '../models/Conge';
import { Employe } from '../models/Employe ';
import { CongeService } from '../conge.service';
import { EmployerService } from '../employer.service';
@Component({
  selector: 'app-ajouterconge',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive,NgxPaginationModule],
  templateUrl: './ajouterconge.component.html',
  styleUrl: './ajouterconge.component.css'
})
export class AjoutercongeComponent {
 reloadPage(route: string) {
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
  conge: Conge = {
    administrateurId: JSON.parse(localStorage.getItem('User') || '{}').id, // Récupérer l'admin depuis le local storage
    dateDebut: '',
    dateFin: '',
    affecteSurRapport: '',
    commentaire: '',
    statut: CongeStatut.EN_ATTENTE, // Statut initial "En attente"
    nombreJours: 0,
    employeId: null, 
    type: 0
  };
  selectEmploye(event: Event) {
    const selectElement = event.target as HTMLSelectElement; // Assurez-vous que c'est bien un élément <select>
    if (selectElement && selectElement.value) {
      this.conge.employeId = +selectElement.value; // Convertir la valeur en nombre
    }
  }
  employes: Employe[] = [];
  typesConge = Object.values(CongeType); // Récupérer les types de congé
  message: string = '';

  constructor(private congeService: CongeService,private employerService : EmployerService,private router: Router) {}
  userRole: string = '';
  ngOnInit() {
    this.chargerEmployes();
    this.getDemandesEnAttente();
    const user = localStorage.getItem('User');
    if (user) {
      this.userRole = JSON.parse(user).role;
    }
  }

  chargerEmployes() {
    // Appel API pour récupérer la liste des employés
    this.employerService.getAllEmployes().subscribe((data) => {
      this.employes = data;
    });
  }

  /*ajouterConge() {
    console.log('Données envoyées:', this.conge);

    this.congeService.ajouterConge(this.conge).subscribe(
      (response) => {
        this.message = 'Congé enregistré avec succès !';
        console.log('Réponse API:', response);
      },
      (error) => {
        console.error('Erreur lors de l\'ajout du congé', error);
      }
    );
  }*/

    ajouterConge() {
      console.log('Données envoyées:', this.conge);
      const confirmationText = `Are you sure you want to save this leave?`;
    
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
             this.congeService.ajouterConge(this.conge).subscribe(
              (response) => {
                Swal.fire(
                  'Updates!',
                  `The leave ${this.conge.id} has been successfully updated.`,
                  'success'
                ).then(() => {
                  this.getDemandesEnAttente();
                });
              },
              (error) => {
                // Stocker l'état de l'alerte d'erreur dans localStorage
                console.log("Erreur lors de modification de leave")
              }
            );
          } 
      });
    }


  // Fonction pour calculer le nombre de jours de congé
 // Fonction pour calculer le nombre de jours de congé
 calculerNombreJours() {
  if (this.conge.dateDebut && this.conge.dateFin) {
    const startDate = new Date(this.conge.dateDebut);
    const endDate = new Date(this.conge.dateFin);
    
    // Vérifiez que la date de fin est après la date de début
    if (endDate >= startDate) {
      const diffTime = endDate.getTime() - startDate.getTime(); // Différence en millisecondes
      const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1; // Convertir en jours (ajoutez 1 jour)
      this.conge.nombreJours = diffDays; // Mettre à jour le nombre de jours
    } else {
      this.conge.nombreJours = 0; // Si la date de fin est avant la date de début
    }
  } else {
    this.conge.nombreJours = 0; // Si les dates ne sont pas renseignées
  }
}

demandesEnAttente: Conge[] = [];
getDemandesEnAttente() {
  this.congeService.getDemandesEnAttente().subscribe((data) => {
    this.demandesEnAttente = data;
  });
}

/*validerDemande(id: number | undefined, statut: string) {

  if (id !== undefined) {
    // Vous pouvez maintenant appeler l'API avec un ID valide
    this.congeService.validerDemande(id, statut).subscribe(
      (response) => {
        // Traitez la réponse
        console.log('Demande validée:', response);
      },
      (error) => {
        // Gérer l'erreur
        console.error('Erreur lors de la validation:', error);
      }
    );
  } else {
    console.error('ID de la demande non défini');
  }
}
*/


validerDemande(id: number | undefined, statut: string, commentaireExistant?: string): void {
  if (id !== undefined) {
    let commentaire = commentaireExistant || ''; // Utiliser le commentaire existant par défaut

    if (statut === 'REFUSE') {
      // Demander un commentaire uniquement en cas de refus
      Swal.fire({
        title: 'Enter a reason for refusal',
        input: 'textarea',
        inputPlaceholder: 'Type your reason here...',
        inputAttributes: { 'aria-label': 'Type your reason here' },
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        preConfirm: (value) => {
          if (!value) {
            Swal.showValidationMessage('You must provide a reason for refusal.');
          }
          return value;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          commentaire = result.value;
          this.envoyerValidation(id, statut, commentaire);
        }
      });
    } else {
      // Si approuvé, conserver l'ancien commentaire et envoyer la validation
      this.envoyerValidation(id, statut, commentaire);
    }
  } else {
    console.error('ID de la demande non défini');
  }
}

// Fonction pour envoyer la requête au backend
private envoyerValidation(id: number, statut: string, commentaire: string): void {
  this.congeService.validerDemande(id, statut, commentaire).subscribe(
    (response) => {
      Swal.fire(
        `${statut === 'APPROUVE' ? 'Approved' : 'Refused'}!`,
        `The leave request has been ${statut === 'APPROUVE' ? 'approved' : 'refused'} successfully.`,
        'success'
      ).then(() => {
        this.getDemandesEnAttente(); // Rafraîchir la liste
      });
    },
    (error) => {
      Swal.fire(
        'Error!',
        'There was an issue validating the request. Please try again later.',
        'error'
      );
    }
  );
}


}
