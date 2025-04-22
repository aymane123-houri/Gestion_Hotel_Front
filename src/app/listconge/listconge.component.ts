import { CommonModule, DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { Conge, CongeStatut } from '../models/Conge';
import { CongeService } from '../conge.service';


@Component({
  selector: 'app-listconge',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive,NgxPaginationModule],
  templateUrl: './listconge.component.html',
  styleUrl: './listconge.component.css'
})
export class ListcongeComponent {
  Status: string[] = [
    'EN_ATTENTE',
    'APPROUVE',
    'REFUSE',
  ];
    page: number = 1;
    itemsPerPage = 5;
    searchText: string = ''; // Stocke la recherche
  
    conges: Conge[] = [];
      conge: Conge = {
        administrateurId: 0,// Récupérer l'admin depuis le local storage
        dateDebut: '',
        dateFin: '',
        affecteSurRapport: '',
        commentaire: '',
        statut: '', // Statut initial "En attente"
        nombreJours: 0,
        employeId: 0, 
        type: 0,
        validateur : {
          id: 0 ,
          nom: '',
          prenom: '',
          email:'',
          telephone: '',
          cin:'',
          role:'',
        },
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

  constructor(private router: Router,private congeService: CongeService) {}

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
    this.loadConges();
   
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
  get filteredConges() {
    if (!this.searchText.trim()) {
      return this.conges;
    }
  
    const searchTextLower = this.searchText.toLowerCase();
  
    return this.conges.filter(conge => {
      const nom = conge.employe?.nom.toLowerCase();
      const prenom = conge.employe?.prenom.toLowerCase();
      const nomAdmin = conge.validateur?.nom.toLowerCase();
      const prenomAdmin = conge.validateur?.prenom.toLowerCase();
      const statut = conge.statut.toLowerCase();
      // Convertir les dates en chaînes pour les comparer
      const dateHeureEntree = conge.dateDebut ? conge.dateDebut.toString().toLowerCase() : '';
      const dateHeureSortie = conge.dateFin ? conge.dateFin.toString().toLowerCase() : '';
  
      return nom?.includes(searchTextLower) ||
             prenom?.includes(searchTextLower) ||
             nomAdmin?.includes(searchTextLower) ||
             prenomAdmin?.includes(searchTextLower) ||
             dateHeureEntree.includes(searchTextLower) ||
             dateHeureSortie.includes(searchTextLower) ||
             statut.includes(searchTextLower);
             
    });
  }
  

  loadConges(): void {
    this.congeService.getAllConge().subscribe(
      (data) => {
        this.conges = data;
        //console.log(this.horaire)
        
      },
      (error) => {
        console.error('Erreur lors du chargement des Conges :', error);
      }
    );
  }
  deleteConge(conge: any): void {
    console.log('leave ID to delete:', conge.id);
  
    Swal.fire({
      title: 'Are you sure you want to delete this leave?',
      text: 'This action is irreversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete!',
    }).then((result) => {
      if (result.isConfirmed) {
        // Suppression de la chambre
        this.congeService.deleteConge(conge.id).subscribe(
          (response) => {
            // Affichage d'un message de succès après suppression
            Swal.fire(
              'Deleted!',
              `The leave ${conge.id} has been successfully deleted.`,
              'success'
            ).then(() => {
              this.loadConges();
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


  selectConge(conge: Conge) {
    // Affecter les informations du horaire sélectionné à l'objet horaire
    this.conge = { ...conge };
    console.log('conge sélectionné pour modification :', this.conge);
  }


  onSubmit(): void {
      console.log('onSubmit appelé');
  
          const confirmationText = `Are you sure you want to update this leave?`;
      
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
              if (this.conge.id) {
                // Si l'ID existe, c'est une mise à jour
                this.congeService.updateHoraire(this.conge).subscribe(
                  (response) => {
                    Swal.fire(
                      'Updates!',
                      `The leave ${this.conge.id} has been successfully updated.`,
                      'success'
                    ).then(() => {
                      this.loadConges();
                    });
                  },
                  (error) => {
                    // Stocker l'état de l'alerte d'erreur dans localStorage
                    console.log("Erreur lors de modification de congé")
                  }
                );
              } 
            }
          });
        }
  
}
