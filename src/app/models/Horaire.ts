import { Employe } from "./Employe ";


    export interface Horaire {
        id?: number;
        heure_arrivee: string;
        heure_depart: string;
        type: string;
       employeId: number;  // Doit être un ID (nombre) et non un objet `Employe`
       //employe: Employe;
      }

      export interface Horairee {
        id?: number;
        heure_arrivee: string;
        heure_depart: string;
        type: string;
       //employeId: number;  // Doit être un ID (nombre) et non un objet `Employe`
       employe: Employe;
      }