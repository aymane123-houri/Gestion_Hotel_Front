import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { Employe } from '../models/Employe ';
import { EmployerService } from '../employer.service';
import { ReactiveFormsModule } from '@angular/forms'; // <-- Import ReactiveFormsModule
import Swal from 'sweetalert2';
@Component({
  selector: 'app-details',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive,BaseChartDirective,ReactiveFormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent {
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
  reloadPage(route: string) {
    this.router.navigateByUrl(route).then(() => {
      window.location.reload(); // Recharge la page
      //this.loadEmploye();
    });
  }
  /*employerForm: FormGroup; // Formulaire réactif
  employer: Employe | undefined;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employerService: EmployerService
  ) {
    // Initialisation du formulaire
    this.employerForm = this.fb.group({
      id: [''], // Champ caché pour l'ID
      matricule: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      dateEmbauche: ['', Validators.required],
      genre: ['', Validators.required],
      departement: ['', Validators.required],
      cin: ['', Validators.required],
      adresse: ['', Validators.required],
      photoProfil: ['']
    });
  }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.employerService.getEmployerById(id).subscribe(
      (data) => {
        this.employer = data;
        this.employerForm.patchValue(data); // Remplir le formulaire avec les données de l'employé
      },
      (error) => {
        console.error('Erreur lors du chargement des détails de l\'employé :', error);
      }
    );
  }

  onSubmit(): void {
    if (this.employerForm.valid) {
      const updatedEmployer = this.employerForm.value;
      this.employerService.updateEmployer(updatedEmployer).subscribe(
        (response) => {
          console.log('Employé mis à jour avec succès :', response);
          alert('Employé mis à jour avec succès !');
          this.router.navigate(['/employer-list']); // Rediriger vers la liste des employés
        },
        (error) => {
          console.error('Erreur lors de la mise à jour de l\'employé :', error);
          alert('Une erreur est survenue lors de la mise à jour de l\'employé.');
        }
      );
    } else {
      alert('Veuillez remplir tous les champs obligatoires.');
    }
  }

  goBack(): void {
    this.router.navigate(['/employer-list']); // Retour à la liste des employés
  }*/


    employerForm: FormGroup;
  employer: Employe | undefined;
  editingStates: { [key: string]: boolean } = {}; // État d'édition pour chaque champ

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employerService: EmployerService
  ) {
    this.employerForm = this.fb.group({
      id: [''],
      matricule: ['', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      genre: ['', Validators.required],
      departement: ['', Validators.required],
      cin: ['', Validators.required],
      adresse: ['', Validators.required],
      photoProfil: ['']
    });
  }


  toggleEdit(field: string): void {
    this.editingStates[field] = !this.editingStates[field];
  }
  userRole: string = '';
  ngOnInit(): void {
    const user = localStorage.getItem('User');
    if (user) {
      this.userRole = JSON.parse(user).role;
    }
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.employerService.getEmployerById(id).subscribe(
      (data) => {
        // Convertir la date de naissance au format yyyy-MM-dd
        if (data.dateNaissance) {
          data.dateNaissance = this.formatDate(data.dateNaissance);
        }
        this.employerForm.patchValue(data); // Remplir le formulaire avec les données de l'employé
      },
      (error) => {
        console.error('Erreur lors du chargement des détails de l\'employé :', error);
      }
    );
  }
  
  // Fonction pour convertir une date au format yyyy-MM-dd
  formatDate(date: string | Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2); // Ajoute un zéro devant si nécessaire
    const day = ('0' + d.getDate()).slice(-2); // Ajoute un zéro devant si nécessaire
    return `${year}-${month}-${day}`;
  }


  // Enregistrer les modifications
  onSubmit(): void {
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
                if (this.employerForm.valid) {
                    const updatedEmployer = this.employerForm.value;
                    this.employerService.updateEmployer(updatedEmployer).subscribe(
                    (response) => {
                        Swal.fire(
                        'Updates!',
                        `The Employer  has been successfully updated.`,
                        'success'
                    ).then(() => {
                        //this.loadEmployes();
                        this.router.navigate(['/EmployerDetail']);
                    });
                  }
                );
              }else {
                alert('Veuillez remplir tous les champs obligatoires.');
              
              }
            } 
          },
        (error) => {
          console.error('Erreur lors de la mise à jour de l\'employé :', error);
          alert('Une erreur est survenue lors de la mise à jour de l\'employé.');
        }
      );
  }



  goBack(): void {
    this.router.navigate(['/EmployerDetail']);
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

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.employerForm.get('photoProfil')?.setValue(base64String.split(',')[1]); // Enregistrer en base64
      };
      reader.readAsDataURL(file);
    }
  }
}
