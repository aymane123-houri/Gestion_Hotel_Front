import { Details } from "./Details";
import { Employe } from "./Employe ";

export interface Rapport {
    id:number;
    employe_id: number;
    periode: string;
    heures_travaillees: string;
    heures_supplementaires: string;
    retards:string;
    absences: string;
    employe: Employe;
    details: Details[];
  }