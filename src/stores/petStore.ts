import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

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
    isLoading: boolean;
    fetchPets: () => Promise<void>;
    addPet: (pet: Omit<Pet, 'id' | 'createdAt' | 'vaccinations' | 'medicalRecords'>) => Promise<void>;
    updatePet: (id: string, data: Partial<Pet>) => Promise<void>;
    removePet: (id: string) => Promise<void>;
    addVaccination: (petId: string, vaccination: Omit<PetVaccination, 'id'>) => Promise<void>;
    removeVaccination: (petId: string, vaccinationId: string) => Promise<void>;
    addMedicalRecord: (petId: string, record: Omit<PetMedicalRecord, 'id'>) => Promise<void>;
    removeMedicalRecord: (petId: string, recordId: string) => Promise<void>;
    subscribeRealtime: () => () => void;
}

export const usePetStore = create<PetState>((set, get) => ({
    pets: [],
    isLoading: false,

    fetchPets: async () => {
        if (!isSupabaseConfigured()) return;
        set({ isLoading: true });

        const [petsRes, vacsRes, medsRes] = await Promise.all([
            supabase.from('pets').select('*').order('created_at', { ascending: false }),
            supabase.from('pet_vaccinations').select('*'),
            supabase.from('pet_medical_records').select('*'),
        ]);

        if (!petsRes.error && petsRes.data) {
            const vaccinations = vacsRes.data || [];
            const medRecords = medsRes.data || [];

            const pets: Pet[] = petsRes.data.map((p: any) => ({
                id: p.id,
                name: p.name,
                species: p.species as PetSpecies,
                breed: p.breed,
                color: p.color,
                gender: p.gender,
                birthDate: p.birth_date,
                adoptionDate: p.adoption_date,
                weight: p.weight ? parseFloat(p.weight) : undefined,
                microchipId: p.microchip_id,
                isNeutered: p.is_neutered,
                allergies: p.allergies || [],
                dietNotes: p.diet_notes,
                vetName: p.vet_name,
                vetPhone: p.vet_phone,
                notes: p.notes,
                photoEmoji: p.photo_emoji || '🐾',
                createdAt: p.created_at,
                vaccinations: vaccinations
                    .filter((v: any) => v.pet_id === p.id)
                    .map((v: any) => ({
                        id: v.id,
                        name: v.name,
                        date: v.date,
                        nextDate: v.next_date,
                        veterinarian: v.veterinarian,
                        notes: v.notes,
                    })),
                medicalRecords: medRecords
                    .filter((m: any) => m.pet_id === p.id)
                    .map((m: any) => ({
                        id: m.id,
                        date: m.date,
                        type: m.type,
                        description: m.description,
                        veterinarian: m.veterinarian,
                        cost: m.cost ? parseFloat(m.cost) : undefined,
                        notes: m.notes,
                    })),
            }));
            set({ pets });
        }
        set({ isLoading: false });
    },

    addPet: async (petData) => {
        const id = `pet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const createdAt = new Date().toISOString();
        const pet: Pet = {
            ...petData,
            id,
            vaccinations: [],
            medicalRecords: [],
            createdAt,
        };

        set((state) => ({ pets: [...state.pets, pet] }));

        if (isSupabaseConfigured()) {
            await supabase.from('pets').insert({
                id,
                name: petData.name,
                species: petData.species,
                breed: petData.breed || null,
                color: petData.color || null,
                gender: petData.gender || null,
                birth_date: petData.birthDate || null,
                adoption_date: petData.adoptionDate || null,
                weight: petData.weight || null,
                microchip_id: petData.microchipId || null,
                is_neutered: petData.isNeutered || false,
                allergies: petData.allergies || [],
                diet_notes: petData.dietNotes || null,
                vet_name: petData.vetName || null,
                vet_phone: petData.vetPhone || null,
                notes: petData.notes || null,
                photo_emoji: petData.photoEmoji || '🐾',
                created_at: createdAt,
            });
        }
    },

    updatePet: async (id, data) => {
        set((state) => ({
            pets: state.pets.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }));

        if (isSupabaseConfigured()) {
            const dbData: any = {};
            if (data.name !== undefined) dbData.name = data.name;
            if (data.species !== undefined) dbData.species = data.species;
            if (data.breed !== undefined) dbData.breed = data.breed;
            if (data.color !== undefined) dbData.color = data.color;
            if (data.gender !== undefined) dbData.gender = data.gender;
            if (data.birthDate !== undefined) dbData.birth_date = data.birthDate;
            if (data.adoptionDate !== undefined) dbData.adoption_date = data.adoptionDate;
            if (data.weight !== undefined) dbData.weight = data.weight;
            if (data.microchipId !== undefined) dbData.microchip_id = data.microchipId;
            if (data.isNeutered !== undefined) dbData.is_neutered = data.isNeutered;
            if (data.allergies !== undefined) dbData.allergies = data.allergies;
            if (data.dietNotes !== undefined) dbData.diet_notes = data.dietNotes;
            if (data.vetName !== undefined) dbData.vet_name = data.vetName;
            if (data.vetPhone !== undefined) dbData.vet_phone = data.vetPhone;
            if (data.notes !== undefined) dbData.notes = data.notes;
            if (data.photoEmoji !== undefined) dbData.photo_emoji = data.photoEmoji;

            if (Object.keys(dbData).length > 0) {
                await supabase.from('pets').update(dbData).eq('id', id);
            }
        }
    },

    removePet: async (id) => {
        set((state) => ({ pets: state.pets.filter((p) => p.id !== id) }));

        if (isSupabaseConfigured()) {
            await supabase.from('pets').delete().eq('id', id); // cascades
        }
    },

    addVaccination: async (petId, vaccination) => {
        const vacId = `vac-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newVac: PetVaccination = { ...vaccination, id: vacId };

        set((state) => ({
            pets: state.pets.map((p) =>
                p.id === petId ? { ...p, vaccinations: [...p.vaccinations, newVac] } : p
            ),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('pet_vaccinations').insert({
                id: vacId,
                pet_id: petId,
                name: vaccination.name,
                date: vaccination.date,
                next_date: vaccination.nextDate || null,
                veterinarian: vaccination.veterinarian || null,
                notes: vaccination.notes || null,
            });
        }
    },

    removeVaccination: async (petId, vaccinationId) => {
        set((state) => ({
            pets: state.pets.map((p) =>
                p.id === petId
                    ? { ...p, vaccinations: p.vaccinations.filter((v) => v.id !== vaccinationId) }
                    : p
            ),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('pet_vaccinations').delete().eq('id', vaccinationId);
        }
    },

    addMedicalRecord: async (petId, record) => {
        const medId = `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const newRec: PetMedicalRecord = { ...record, id: medId };

        set((state) => ({
            pets: state.pets.map((p) =>
                p.id === petId ? { ...p, medicalRecords: [...p.medicalRecords, newRec] } : p
            ),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('pet_medical_records').insert({
                id: medId,
                pet_id: petId,
                date: record.date,
                type: record.type,
                description: record.description,
                veterinarian: record.veterinarian || null,
                cost: record.cost || null,
                notes: record.notes || null,
            });
        }
    },

    removeMedicalRecord: async (petId, recordId) => {
        set((state) => ({
            pets: state.pets.map((p) =>
                p.id === petId
                    ? { ...p, medicalRecords: p.medicalRecords.filter((r) => r.id !== recordId) }
                    : p
            ),
        }));

        if (isSupabaseConfigured()) {
            await supabase.from('pet_medical_records').delete().eq('id', recordId);
        }
    },

    subscribeRealtime: () => {
        if (!isSupabaseConfigured()) return () => {};

        const ch1 = supabase
            .channel('pets-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pets' }, () => {
                get().fetchPets();
            })
            .subscribe();

        const ch2 = supabase
            .channel('pet-vaccinations-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pet_vaccinations' }, () => {
                get().fetchPets();
            })
            .subscribe();

        const ch3 = supabase
            .channel('pet-medical-records-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pet_medical_records' }, () => {
                get().fetchPets();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ch1);
            supabase.removeChannel(ch2);
            supabase.removeChannel(ch3);
        };
    },
}));
