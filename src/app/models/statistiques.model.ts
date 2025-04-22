// src/app/models/statistiques.model.ts

export interface StatistiquesMensuelles {
    [key: string]: number; 
    totalAbsences: number;
    totalHeuresSupplementaires: number;
    totalRetards: number;
  }
  
  export interface StatistiquesAnnuelles {
    totalAbsences: number;
    totalHeuresSupplementaires: number;
    totalRetards: number;
  }
  
  export interface StatistiquesParDepartement {
    [key: string]: {
      totalAbsences: number;
      totalRetards: number;
    };
  }