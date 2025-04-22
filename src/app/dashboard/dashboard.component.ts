import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EmployerService } from '../employer.service';
import { PointageService } from '../pointage.service';
import { HoraireService } from '../horaire.service';
import { RapportService } from '../rapport.service';
import Swal from 'sweetalert2';
import { Employe } from '../models/Employe ';
import { Pointage } from '../models/Pointage';
import { Horaire, Horairee } from '../models/Horaire';
import { Administrateur } from '../models/Administrateur';
import { AdministrateurService } from '../administrateur.service';
import { AnomalieService } from '../anomalie.service';
//import { ChartOptions, ChartData, ChartType } from 'chart.js';
import { ChartConfiguration, ChartEvent, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { StatistiquesService } from '../statistiques.service';
import { StatistiquesAnnuelles, StatistiquesMensuelles, StatistiquesParDepartement } from '../models/statistiques.model';
import { NgZone } from '@angular/core';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, RouterLink, RouterLinkActive,BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
isBrowser: boolean;
onChartClick($event: { event?: ChartEvent; active?: object[]; }) {
throw new Error('Method not implemented.');
}
  statistiquesMensuelles: { [key: string]: { totalAbsences: number, totalRetards: number, totalHeuresSupplementaires: number } } = {};
  statistiquesAnnuelles: { [key: string]: { totalAbsences: number, totalRetards: number, totalHeuresSupplementaires: number } } = {};
  statistiquesParDepartement: { [key: string]: { [key: string]: { totalAbsences: number, totalRetards: number, totalHeuresSupplementaires: number } } } = {};
constructor(private router: Router,private employerService: EmployerService,private pointageService:PointageService,private horaireService:HoraireService,private administrateurServoce:AdministrateurService,private anoamlieService:AnomalieService,private statistiquesService: StatistiquesService,private ngZone: NgZone,@Inject(PLATFORM_ID) private platformId: Object) {this.isBrowser = isPlatformBrowser(this.platformId);}

reloadPage(route: string) {
  this.router.navigateByUrl(route).then(() => {
    window.location.reload(); // Recharge la page
    //this.loadEmploye();
  });
}
userRole: string = '';
email:string='';
nom:string='';
prenom:string='';

@ViewChild('absenceChart') absenceChart!: BaseChartDirective;
@ViewChild('retardChart') retardChart!: BaseChartDirective;
@ViewChild('departementChart') departementChart!: BaseChartDirective;
@ViewChild('heuresSupplementairesChart') heuresSupplementairesChart!: BaseChartDirective;
@ViewChild(BaseChartDirective) tauxChart!: BaseChartDirective;
ngOnInit(): void {

  const user = localStorage.getItem('User');
  if (user) {
    this.userRole = JSON.parse(user).role;
  }
  if (!user) {
    // Redirige vers la page de connexion si non connecté
    window.location.href = '/login';
  } else {
    this.userRole = JSON.parse(user).role;
    this.email = JSON.parse(user).email;
    this.nom = JSON.parse(user).nom;
    this.prenom = JSON.parse(user).prenom;
    console.log(this.userRole);
  }

  this.loadEmploye();
  this.loadPointages();
  this.loadHoraire();
  this.loadAdministrateurs();

  const mois = new Date().getMonth() + 1; // Mois actuel
  const annee = new Date().getFullYear(); // Année actuelle

// Récupérer les statistiques annuelles
this.statistiquesService.getStatistiquesAnnuelles(annee).subscribe(data => {
  this.statistiquesAnnuelles = data;
  console.log('Statistiques annuelles :', this.statistiquesAnnuelles);

  // Mapper les données annuelles aux graphiques
  const moisLabels = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const donneesMensuelles = moisLabels.map(mois => this.statistiquesAnnuelles[mois]?.['totalAbsences'] || 0);

  this.absenceChartData = {
    ...this.absenceChartData,
    datasets: [
      {
        ...this.absenceChartData.datasets[0],
        data: donneesMensuelles, // Tableau de nombres
      },
    ],
  };

  // Forcer la mise à jour du graphique
  this.updateChart();
});

  // Récupérer les statistiques annuelles
  this.statistiquesService.getStatistiquesAnnuelles(annee).subscribe(data => {
    this.statistiquesAnnuelles = data;
    console.log('Statistiques annuelles :', this.statistiquesAnnuelles);

    // Mapper les données annuelles aux graphiques
    const moisLabels = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    const donneesAnnuelles = moisLabels.map(mois => this.statistiquesAnnuelles[mois]?.['totalRetards'] || 0);

    this.retardChartData = {
      ...this.retardChartData,
      datasets: [
        {
          ...this.retardChartData.datasets[0],
          data: donneesAnnuelles, // Tableau de nombres
        },
      ],
    };

    // Forcer la mise à jour du graphique
    this.updateChart();
  });

// Récupérer les statistiques par département
this.statistiquesService.getStatistiquesParDepartement(mois, annee).subscribe(data => {
  this.statistiquesParDepartement = data;
  console.log('Statistiques par département :', this.statistiquesParDepartement);

  // Déterminer le mois actuel
  const moisActuel = new Date().toLocaleString('default', { month: 'long' }).toLowerCase(); // Ex: "mars"

  // Mapper les données par département aux graphiques
  const departements = Object.keys(data);
  const absencesParDepartement = departements.map(departement => data[departement]?.[moisActuel]?.['totalAbsences'] || 0);
  const retardsParDepartement = departements.map(departement => data[departement]?.[moisActuel]?.['totalRetards'] || 0);

  // Vérifier les données extraites
  console.log('Départements :', departements);
  console.log('Absences par département :', absencesParDepartement);
  console.log('Retards par département :', retardsParDepartement);

  // Assigner les données au graphique
  this.departementChartData = {
    ...this.departementChartData,
    labels: departements, // Labels des départements
    datasets: [
      {
        ...this.departementChartData.datasets[0],
        data: absencesParDepartement, // Tableau de nombres
      },
      {
        ...this.departementChartData.datasets[1],
        data: retardsParDepartement, // Tableau de nombres
      },
    ],
  };

  // Forcer la mise à jour du graphique
  this.updateChart();
});

  // Récupérer le taux d'absentéisme
  this.statistiquesService.getTauxAbsenteisme(mois, annee).subscribe(data => {
    console.log('Taux d\'absentéisme :', data);
    this.tauxAbsenteisme = data;
  });

  // Récupérer le taux de retards
  this.statistiquesService.getTauxRetards(mois, annee).subscribe(data => {
    console.log('Taux de retards :', data);
    this.tauxRetards = data;
  });





  this.statistiquesService.getTauxAbsenteisme(mois, annee).subscribe(data => {
    this.tauxChartData.datasets[0].data[0] = data;
    this.updateTauxChart();
  });

  this.statistiquesService.getTauxRetards(mois, annee).subscribe(data => {
    this.tauxChartData.datasets[0].data[1] = data;
    this.updateTauxChart();
  });

  this.statistiquesService.getHeuresTravailleesMoyennes(mois, annee).subscribe(
    (data) => {
      console.log('Heures travaillées moyennes :', data); // Vérifiez la valeur de data
      this.heuresTravailleesMoyennes = data;
    },
    (error) => {
      console.error('Erreur lors de la récupération des heures travaillées moyennes :', error);
    }
  );
}
updateChart(): void {
  if (this.absenceChart) {
    this.absenceChart.update();
  }
  if (this.retardChart) {
    this.retardChart.update();
  }
  if (this.departementChart) {
    this.departementChart.update();
  }
  if (this.heuresSupplementairesChart) {
    this.heuresSupplementairesChart.update();
  }
}
ngAfterViewInit() {
  console.log('tauxChart:', this.tauxChart);
}


updateTauxChart(): void {
  if (this.tauxChart && this.tauxChart.update) {
    this.tauxChart.update();
  } else {
    console.error('tauxChart n\'est pas initialisé ou update n\'est pas une fonction');
  }
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

employes: Employe[] = [];
numberOfEmploye: number = 0;
loadEmploye(): void {
  this.employerService.getAllEmployes().subscribe(
    (data) => {
      this.employes = data; // Affecter les données reçues à la liste des employes
      this.numberOfEmploye = this.employes.length; // Récupérer le nombre de employes
      //console.log('Employe:', this.employes); // Afficher les employes dans la console
      //console.log('Nombre de employes:', this.numberOfEmploye); // Afficher le nombre de employes
    },
    (error) => {
      console.error('Erreur lors du chargement des employes :', error);
    }
  );
}



pointages: Pointage[] = [];
numberOfPointage: number = 0;
loadPointages(): void {
  this.pointageService.getAllPointage().subscribe(
    (data) => {
      this.pointages = data; // Affecter les données reçues à la liste des pointages
      this.numberOfPointage = this.pointages.length; // Récupérer le nombre de pointages
      //console.log('pointages:', this.pointages); // Afficher les pointages dans la console
      //console.log('Nombre de pointages:', this.numberOfPointage); // Afficher le nombre de pointages
    },
    (error) => {
      console.error('Erreur lors du chargement des pointages :', error);
    }
  );
}

Horaires: Horairee[] = [];
numberOfHoraire: number = 0;
loadHoraire(): void {
  this.horaireService.getAllHoraire().subscribe(
    (data) => {
      this.Horaires = data; // Affecter les données reçues à la liste des Horaire
      this.numberOfHoraire = this.Horaires.length; // Récupérer le nombre de Horaire
      //console.log('Horaire:', this.Horaires); // Afficher les Horaire dans la console
      //console.log('Nombre de Horaire:', this.numberOfHoraire); // Afficher le nombre de Horaire
    },
    (error) => {
      console.error('Erreur lors du chargement des Horaire :', error);
    }
  );
}

administrateurs: Administrateur[] = [];
numberOfAdministrateurs: number = 0;
  loadAdministrateurs(): void {
    this.administrateurServoce.getAllAdministrateur().subscribe(
      (data) => {
        this.administrateurs = data; // Affecter les données reçues à la liste des Administrateur
        this.numberOfAdministrateurs = this.administrateurs.length; // Récupérer le nombre de Administrateur
        //console.log('Administrateur:', this.administrateurs); // Afficher les Administrateur dans la console
        //console.log('Nombre de Administrateur:', this.numberOfAdministrateurs); // Afficher le nombre de Administrateur
      },
      (error) => {
        console.error('Erreur lors du chargement des Administrateur :', error);
      }
    );
  }


    
  // Données pour le graphique des absences
  public absenceChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Absences',
        data: [], // Données initiales vides
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  public absenceChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Statistiques des absences par mois',
      },
    },
  };

  // Données pour le graphique des retards
  public retardChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Retards',
        data: [], // Données initiales vides
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      },
    ],
  };

  public retardChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Statistiques des retards par mois',
      },
    },
  };

  // Données pour le graphique des heures supplémentaires
  public heuresSupplementairesChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
      {
        label: 'Heures supplémentaires',
        data: [], // Données initiales vides
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  public heuresSupplementairesChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Statistiques des heures supplémentaires par mois',
      },
    },
  };

  // Données pour le graphique des statistiques par département
  public departementChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [], // Labels dynamiques (noms des départements)
    datasets: [
      {
        label: 'Absences',
        data: [], // Données dynamiques
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
      {
        label: 'Retards',
        data: [], // Données dynamiques
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  public departementChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Statistiques par département',
      },
    },
  };

  // Taux d'absentéisme
  public tauxAbsenteisme: number = 0;

  // Taux de retards
  public tauxRetards: number = 0;

  // Heures travaillées moyennes
  public heuresTravailleesMoyennes: number = 0;




  
  public tauxChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Taux d\'absentéisme', 'Taux de retards', 'Heures travaillées moyennes'],
    datasets: [
      {
        data: [0, 0, 0], // Données initiales
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(75, 192, 192, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)'],
        borderWidth: 1,
      },
    ],
  };


  public tauxChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Statistiques globales',
      },
      legend: {
        position: 'bottom',
      },
    },
  };
}
