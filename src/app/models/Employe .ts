// src/app/models/employe.model.ts
export interface Employe {

    id: number;
    matricule:string;
    nom: string;
    prenom: string;
    email:string;
    telephone: string;
    dateNaissance: string;
    dateEmbauche: string;
    genre:string;
    departement:string;
    cin:string;
    adresse:string;
    photoProfil:string;
    //[key: string]: string | number | Date; 
    [key: string]: string | number | Date | undefined;
    presencePercentage?: number;
  }
  