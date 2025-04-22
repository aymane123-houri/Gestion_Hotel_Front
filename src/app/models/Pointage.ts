import { Employe } from "./Employe ";

export interface Pointage {
    id: number;
    dateHeureEntree: string;
    dateHeureSortie: string;
    statut: string;
    employe: Employe; 
  }