import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PetSpecies =
    | 'dog'
    | 'cat'
    | 'bird'
    | 'rodent'
    | 'reptile'
    | 'fish'
    | 'rabbit'
    | 'other';

export interface PetVaccination {
    id: string;
    name: string;
    date: string;
    nextDate?: string;
    veterinarian?: string;
    notes?: string;
}

export interface PetMedicalRecord {
    id: string;
    date: string;
    type: 'consulta' | 'exame' | 'cirurgia' | 'emergencia' | 'observacao' | 'outro';
    description: string;
    veterinarian?: string;
    cost?: number;
    notes?: string;
}

export interface Pet {
    id: string;
    name: string;
    species: PetSpecies;
    breed?: string;
    color?: string;
    gender?: 'macho' | 'femea';
    birthDate?: string;
    adoptionDate?: string;
    weight?: number;
    microchipId?: string;
    isNeutered?: boolean;
    allergies?: string[];
    dietNotes?: string;
    vetName?: string;
    vetPhone?: string;
    vaccinations: PetVaccination[];
    medicalRecords: PetMedicalRecord[];
    notes?: string;
    photoEmoji: string;
    createdAt: string;
}

export const SPECIES_CONFIG: Record<PetSpecies, { label: string; emoji: string; color: string }> = {
    dog: { label: 'Cachorro', emoji: '🐕', color: '#f59e0b' },
    cat: { label: 'Gato', emoji: '🐱', color: '#ec4899' },
    bird: { label: 'Pássaro', emoji: '🦜', color: '#22c55e' },
    rodent: { label: 'Roedor', emoji: '🐹', color: '#a78bfa' },
    reptile: { label: 'Réptil', emoji: '🦎', color: '#14b8a6' },
    fish: { label: 'Peixe', emoji: '🐠', color: '#3b82f6' },
    rabbit: { label: 'Coelho', emoji: '🐰', color: '#f472b6' },
    other: { label: 'Outro', emoji: '🐾', color: '#8b5cf6' },
};

interface PetState {
    pets: Pet[];
    addPet: (pet: Omit<Pet, 'id' | 'createdAt' | 'vaccinations' | 'medicalRecords'>) => void;
    updatePet: (id: string, data: Partial<Pet>) => void;
    removePet: (id: string) => void;
    addVaccination: (petId: string, vaccination: Omit<PetVaccination, 'id'>) => void;
    removeVaccination: (petId: string, vaccinationId: string) => void;
    addMedicalRecord: (petId: string, record: Omit<PetMedicalRecord, 'id'>) => void;
    removeMedicalRecord: (petId: string, recordId: string) => void;
}

export const usePetStore = create<PetState>()(
    persist(
        (set) => ({
            pets: [],

            addPet: (petData) =>
                set((state) => ({
                    pets: [
                        ...state.pets,
                        {
                            ...petData,
                            id: `pet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                            vaccinations: [],
                            medicalRecords: [],
                            createdAt: new Date().toISOString(),
                        },
                    ],
                })),

            updatePet: (id, data) =>
                set((state) => ({
                    pets: state.pets.map((p) => (p.id === id ? { ...p, ...data } : p)),
                })),

            removePet: (id) =>
                set((state) => ({
                    pets: state.pets.filter((p) => p.id !== id),
                })),

            addVaccination: (petId, vaccination) =>
                set((state) => ({
                    pets: state.pets.map((p) =>
                        p.id === petId
                            ? {
                                ...p,
                                vaccinations: [
                                    ...p.vaccinations,
                                    {
                                        ...vaccination,
                                        id: `vac-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                    },
                                ],
                            }
                            : p
                    ),
                })),

            removeVaccination: (petId, vaccinationId) =>
                set((state) => ({
                    pets: state.pets.map((p) =>
                        p.id === petId
                            ? { ...p, vaccinations: p.vaccinations.filter((v) => v.id !== vaccinationId) }
                            : p
                    ),
                })),

            addMedicalRecord: (petId, record) =>
                set((state) => ({
                    pets: state.pets.map((p) =>
                        p.id === petId
                            ? {
                                ...p,
                                medicalRecords: [
                                    ...p.medicalRecords,
                                    {
                                        ...record,
                                        id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                    },
                                ],
                            }
                            : p
                    ),
                })),

            removeMedicalRecord: (petId, recordId) =>
                set((state) => ({
                    pets: state.pets.map((p) =>
                        p.id === petId
                            ? { ...p, medicalRecords: p.medicalRecords.filter((r) => r.id !== recordId) }
                            : p
                    ),
                })),
        }),
        {
            name: 'alenfinos-pets',
            partialize: (state) => ({ pets: state.pets }),
        }
    )
);
