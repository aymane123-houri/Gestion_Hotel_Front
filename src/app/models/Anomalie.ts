import { Employe } from "./Employe ";

export interface Anomalie {
    id?: string;
    pointage_id: string;
    empoloyer_id: number;
    type: string;
    description: string;
    statut: string;
    dateValidation?: string;
    validePar?: number;
    employe:Employe;
  }
  