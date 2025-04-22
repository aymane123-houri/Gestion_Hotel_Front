
import { Administrateur } from "./Administrateur";
import { Employe } from "./Employe ";

export interface Conge {
    id?: number;
    validateur?:Administrateur;
    dateDebut: string;
    dateFin: string;
    affecteSurRapport:string;
    commentaire:string;
    dateValidation?:string;
    statut: string;
    nombreJours:number
    employe?: Employe;
    employeId:number|null;
    administrateurId : number;
    type:number;
  }

  export enum CongeType {
    PAYE = "Congé payé",
    SANS_SOLDE = "Congé sans solde",
    MALADIE = "Congé maladie",
    AUTRE = "Autre"
}

export enum CongeStatut {
    EN_ATTENTE = "En attente",
    APPROUVE = "Approuvé",
    REJETE = "Rejeté"
}