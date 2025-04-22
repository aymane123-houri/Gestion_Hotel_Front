export interface Administrateur {

    id?: number;
    nom: string;
    prenom: string;
    email:string;
    telephone: string;
    cin:string;
    role:string;
  }

  export interface AdministrateurAdd {

    id?: number;
    nom: string;
    prenom: string;
    email:string;
    telephone: string;
    cin:string;
    role:string;
    motDePasse:string ;
  }