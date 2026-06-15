import { Types } from "mongoose";


export interface IGeneralInfo{
    height: number;       
    weight: number; 
    bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-'; 
    maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
    isSmoking: boolean;   
}
export interface IPrescription {
    specialization: string;
    date: Date;
    prescriptionImages: string[];
    notes?: string;
}
export interface IScan {
    scanName: string;
    scanDate: Date;
    scanImages: string[];
    centerName: string;
    notes?: string;
}

export interface ITest {
    testName: string;
    testDate: Date;
    testImages: string[];
    labName: string;
    notes?: string;
}

export interface IMedication {
    drugName: string;
    dose: string;        
    frequency: string;   
    notes?: string;
}

export interface ISurgery {
    surgeryName: string;
    surgeryDate: Date;
    doctorName: string;
    hospitalName: string;
    notes?: string;
}

export interface IChronicDisease {
    diseaseName: string;
    dateOfDiagnosis: Date;
    notes?: string;
}

export interface IAllergy {
    allergyName: string;
    notes?: string;
}

export interface IHealthLog {
    patientId: Types.ObjectId; 
    generalInfo: IGeneralInfo;
    prescriptions: IPrescription[];
    scans: IScan[];
    tests: ITest[];
    medications: IMedication[];
    surgeries: ISurgery[];
    chronicDiseases: IChronicDisease[];
    allergies: IAllergy[];

    createdAt: Date;
    updatedAt: Date;
}
