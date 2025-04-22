import { Component } from '@angular/core';
import { Employe } from '../models/Employe ';
import { EmployerService } from '../employer.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-employer-detail',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './employer-detail.component.html',
  styleUrl: './employer-detail.component.css'
})
export class EmployerDetailComponent {
  employes: Employe[] = [];

  constructor(private router: Router,private employerService: EmployerService) {}
  userRole: string = '';
  ngOnInit(): void {
    const user = localStorage.getItem('User');
    if (user) {
      this.userRole = JSON.parse(user).role;
    }
      this.loadEmployes();
     
  }

  /*ngAfterViewInit(): void {
    $('#example1').DataTable({
      paging: true,
      lengthChange: true,
      pageLength: 3,
      searching: true,
      ordering: true,
      info: true,
      autoWidth: false
    });
  }


*/
  deleteEmployer(employer: any) {
    alert('Employé supprimé : ' + employer.nom + ' ' + employer.prenom);
  }

  selectEmployer(employer: any) {
    alert('Employé sélectionné pour modification : ' + employer.nom + ' ' + employer.prenom);
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
        //console.log(this.employes)
        this.calculatePagination();
        
      },
      (error) => {
        console.error('Erreur lors du chargement des employes :', error);
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
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 6; // Nombre d'employés par page
  totalPages: number[] = []; // Liste des numéros de pages
  calculatePagination(): void {
    const pages = Math.ceil(this.employes.length / this.itemsPerPage);
    this.totalPages = Array.from({ length: pages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
  }

  get paginatedEmployes(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.employes.slice(start, start + this.itemsPerPage);
  }
  viewProfile(employerId: number): void {
    this.router.navigate(['/employer', employerId]);
  }

  contactEmployer(email: string): void {
    if (email) {
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${email}`;
      window.open(gmailUrl, '_blank'); // Ouvre Gmail dans un nouvel onglet
    } else {
      alert('Aucune adresse e-mail disponible pour cet employé.');
    }
  }
}

