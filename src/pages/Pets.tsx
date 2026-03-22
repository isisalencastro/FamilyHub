import { useState } from 'react';
import {
    PawPrint,
    Plus,
    Trash2,
    Pencil,
    Heart,
    Syringe,
    Stethoscope,
    Phone,
    Calendar,
    Weight,
    AlertCircle,
} from 'lucide-react';
import {
    usePetStore,
    SPECIES_CONFIG,
    type Pet,
    type PetSpecies,
    type PetVaccination,
    type PetMedicalRecord,
} from '@/stores/petStore';

type ViewMode = 'grid' | 'detail';
type DetailTab = 'info' | 'saude' | 'vacinas' | 'historico';

export function Pets() {
    const { pets, addPet, updatePet, removePet, addVaccination, removeVaccination, addMedicalRecord, removeMedicalRecord } = usePetStore();

    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
    const [detailTab, setDetailTab] = useState<DetailTab>('info');
    const [showAddPet, setShowAddPet] = useState(false);
    const [showAddVaccine, setShowAddVaccine] = useState(false);
    const [showAddRecord, setShowAddRecord] = useState(false);
    const [editingPet, setEditingPet] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    // Form state for new pet
    const [formName, setFormName] = useState('');
    const [formSpecies, setFormSpecies] = useState<PetSpecies>('dog');
    const [formBreed, setFormBreed] = useState('');
    const [formColor, setFormColor] = useState('');
    const [formGender, setFormGender] = useState<'macho' | 'femea' | ''>('');
    const [formBirthDate, setFormBirthDate] = useState('');
    const [formWeight, setFormWeight] = useState('');
    const [formNeutered, setFormNeutered] = useState(false);
    const [formVetName, setFormVetName] = useState('');
    const [formVetPhone, setFormVetPhone] = useState('');
    const [formDietNotes, setFormDietNotes] = useState('');
    const [formNotes, setFormNotes] = useState('');
    const [formMicrochip, setFormMicrochip] = useState('');

    // Vaccine form
    const [vacName, setVacName] = useState('');
    const [vacDate, setVacDate] = useState('');
    const [vacNextDate, setVacNextDate] = useState('');
    const [vacVet, setVacVet] = useState('');

    // Medical record form
    const [recDate, setRecDate] = useState('');
    const [recType, setRecType] = useState<PetMedicalRecord['type']>('consulta');
    const [recDesc, setRecDesc] = useState('');
    const [recVet, setRecVet] = useState('');
    const [recCost, setRecCost] = useState('');

    const selectedPet = pets.find((p) => p.id === selectedPetId);

    const resetForm = () => {
        setFormName('');
        setFormSpecies('dog');
        setFormBreed('');
        setFormColor('');
        setFormGender('');
        setFormBirthDate('');
        setFormWeight('');
        setFormNeutered(false);
        setFormVetName('');
        setFormVetPhone('');
        setFormDietNotes('');
        setFormNotes('');
        setFormMicrochip('');
    };

    const loadPetToForm = (pet: Pet) => {
        setFormName(pet.name);
        setFormSpecies(pet.species);
        setFormBreed(pet.breed || '');
        setFormColor(pet.color || '');
        setFormGender(pet.gender || '');
        setFormBirthDate(pet.birthDate || '');
        setFormWeight(pet.weight?.toString() || '');
        setFormNeutered(pet.isNeutered || false);
        setFormVetName(pet.vetName || '');
        setFormVetPhone(pet.vetPhone || '');
        setFormDietNotes(pet.dietNotes || '');
        setFormNotes(pet.notes || '');
        setFormMicrochip(pet.microchipId || '');
    };

    const handleAddPet = () => {
        if (!formName.trim()) return;
        const speciesConf = SPECIES_CONFIG[formSpecies];
        addPet({
            name: formName.trim(),
            species: formSpecies,
            breed: formBreed.trim() || undefined,
            color: formColor.trim() || undefined,
            gender: formGender || undefined,
            birthDate: formBirthDate || undefined,
            weight: formWeight ? parseFloat(formWeight) : undefined,
            isNeutered: formNeutered,
            vetName: formVetName.trim() || undefined,
            vetPhone: formVetPhone.trim() || undefined,
            dietNotes: formDietNotes.trim() || undefined,
            notes: formNotes.trim() || undefined,
            microchipId: formMicrochip.trim() || undefined,
            photoEmoji: speciesConf.emoji,
        });
        resetForm();
        setShowAddPet(false);
    };

    const handleUpdatePet = () => {
        if (!selectedPetId || !formName.trim()) return;
        const speciesConf = SPECIES_CONFIG[formSpecies];
        updatePet(selectedPetId, {
            name: formName.trim(),
            species: formSpecies,
            breed: formBreed.trim() || undefined,
            color: formColor.trim() || undefined,
            gender: formGender || undefined,
            birthDate: formBirthDate || undefined,
            weight: formWeight ? parseFloat(formWeight) : undefined,
            isNeutered: formNeutered,
            vetName: formVetName.trim() || undefined,
            vetPhone: formVetPhone.trim() || undefined,
            dietNotes: formDietNotes.trim() || undefined,
            notes: formNotes.trim() || undefined,
            microchipId: formMicrochip.trim() || undefined,
            photoEmoji: speciesConf.emoji,
        });
        setEditingPet(false);
    };

    const handleAddVaccination = () => {
        if (!selectedPetId || !vacName.trim() || !vacDate) return;
        addVaccination(selectedPetId, {
            name: vacName.trim(),
            date: vacDate,
            nextDate: vacNextDate || undefined,
            veterinarian: vacVet.trim() || undefined,
        });
        setVacName('');
        setVacDate('');
        setVacNextDate('');
        setVacVet('');
        setShowAddVaccine(false);
    };

    const handleAddRecord = () => {
        if (!selectedPetId || !recDesc.trim() || !recDate) return;
        addMedicalRecord(selectedPetId, {
            date: recDate,
            type: recType,
            description: recDesc.trim(),
            veterinarian: recVet.trim() || undefined,
            cost: recCost ? parseFloat(recCost) : undefined,
        });
        setRecDate('');
        setRecType('consulta');
        setRecDesc('');
        setRecVet('');
        setRecCost('');
        setShowAddRecord(false);
    };

    const calculateAge = (birthDate?: string) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const now = new Date();
        const years = now.getFullYear() - birth.getFullYear();
        const months = now.getMonth() - birth.getMonth();
        const totalMonths = years * 12 + months;
        if (totalMonths < 12) return `${totalMonths} ${totalMonths === 1 ? 'mês' : 'meses'}`;
        const y = Math.floor(totalMonths / 12);
        const m = totalMonths % 12;
        return m > 0 ? `${y} ${y === 1 ? 'ano' : 'anos'} e ${m} ${m === 1 ? 'mês' : 'meses'}` : `${y} ${y === 1 ? 'ano' : 'anos'}`;
    };

    const getUpcomingVaccines = () => {
        const upcoming: { pet: Pet; vac: PetVaccination }[] = [];
        const now = new Date();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        pets.forEach((pet) => {
            pet.vaccinations.forEach((vac) => {
                if (vac.nextDate) {
                    const next = new Date(vac.nextDate);
                    if (next.getTime() - now.getTime() < thirtyDays && next.getTime() >= now.getTime()) {
                        upcoming.push({ pet, vac });
                    }
                }
            });
        });
        return upcoming.sort((a, b) => new Date(a.vac.nextDate!).getTime() - new Date(b.vac.nextDate!).getTime());
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        background: 'var(--color-bg-tertiary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--color-text-primary)',
        fontSize: '13px',
        fontFamily: 'inherit',
        outline: 'none',
        transition: 'border-color 150ms ease',
    };

    const labelStyle = {
        fontSize: '12px',
        fontWeight: 600 as const,
        color: 'var(--color-text-secondary)',
        marginBottom: '6px',
        display: 'block' as const,
    };

    const upcomingVaccines = getUpcomingVaccines();

    // ─── Pet Form (shared between add & edit) ───
    const renderPetForm = (isEdit: boolean) => (
        <div className="card" style={{ marginBottom: '20px', animation: 'scaleIn 0.2s ease-out' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>
                {isEdit ? `Editar ${selectedPet?.name}` : 'Novo Pet'}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Name */}
                <div>
                    <label style={labelStyle}>Nome *</label>
                    <input style={inputStyle} placeholder="Nome do pet..." value={formName} onChange={(e) => setFormName(e.target.value)} autoFocus />
                </div>

                {/* Species */}
                <div>
                    <label style={labelStyle}>Espécie *</label>
                    <select value={formSpecies} onChange={(e) => setFormSpecies(e.target.value as PetSpecies)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {Object.entries(SPECIES_CONFIG).map(([key, cfg]) => (
                            <option key={key} value={key}>{cfg.emoji} {cfg.label}</option>
                        ))}
                    </select>
                </div>

                {/* Breed */}
                <div>
                    <label style={labelStyle}>Raça</label>
                    <input style={inputStyle} placeholder="Ex: Golden Retriever..." value={formBreed} onChange={(e) => setFormBreed(e.target.value)} />
                </div>

                {/* Color */}
                <div>
                    <label style={labelStyle}>Cor / Pelagem</label>
                    <input style={inputStyle} placeholder="Ex: Caramelo..." value={formColor} onChange={(e) => setFormColor(e.target.value)} />
                </div>

                {/* Gender */}
                <div>
                    <label style={labelStyle}>Sexo</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {(['macho', 'femea'] as const).map((g) => (
                            <button
                                key={g}
                                onClick={() => setFormGender(g)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    borderRadius: 'var(--radius-md)',
                                    border: formGender === g ? '2px solid var(--color-accent-primary)' : '1px solid var(--color-border-default)',
                                    background: formGender === g ? 'var(--color-accent-muted)' : 'var(--color-bg-tertiary)',
                                    color: formGender === g ? 'var(--color-accent-secondary)' : 'var(--color-text-secondary)',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    transition: 'all 150ms ease',
                                }}
                            >
                                {g === 'macho' ? '♂ Macho' : '♀ Fêmea'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Birth Date */}
                <div>
                    <label style={labelStyle}>Data de Nascimento</label>
                    <input type="date" style={inputStyle} value={formBirthDate} onChange={(e) => setFormBirthDate(e.target.value)} />
                </div>

                {/* Weight */}
                <div>
                    <label style={labelStyle}>Peso (kg)</label>
                    <input type="number" step="0.1" style={inputStyle} placeholder="Ex: 12.5" value={formWeight} onChange={(e) => setFormWeight(e.target.value)} />
                </div>

                {/* Microchip */}
                <div>
                    <label style={labelStyle}>Microchip ID</label>
                    <input style={inputStyle} placeholder="Número do microchip..." value={formMicrochip} onChange={(e) => setFormMicrochip(e.target.value)} />
                </div>

                {/* Neutered */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '24px' }}>
                    <div
                        onClick={() => setFormNeutered(!formNeutered)}
                        style={{
                            width: 22,
                            height: 22,
                            borderRadius: '6px',
                            border: formNeutered ? 'none' : '2px solid var(--color-text-tertiary)',
                            background: formNeutered ? 'linear-gradient(135deg, var(--color-accent-primary), #7c3aed)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 200ms ease',
                        }}
                    >
                        {formNeutered && <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Castrado(a)</span>
                </div>

                {/* Vet Name */}
                <div>
                    <label style={labelStyle}>Veterinário</label>
                    <input style={inputStyle} placeholder="Nome do veterinário..." value={formVetName} onChange={(e) => setFormVetName(e.target.value)} />
                </div>

                {/* Vet Phone */}
                <div>
                    <label style={labelStyle}>Telefone do Veterinário</label>
                    <input style={inputStyle} placeholder="(00) 00000-0000" value={formVetPhone} onChange={(e) => setFormVetPhone(e.target.value)} />
                </div>

                {/* Diet */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Alimentação / Dieta</label>
                    <input style={inputStyle} placeholder="Informações sobre alimentação..." value={formDietNotes} onChange={(e) => setFormDietNotes(e.target.value)} />
                </div>

                {/* Notes */}
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Observações</label>
                    <textarea
                        style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }}
                        placeholder="Notas importantes sobre o pet..."
                        value={formNotes}
                        onChange={(e) => setFormNotes(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button className="btn btn-secondary" onClick={() => { isEdit ? setEditingPet(false) : setShowAddPet(false); resetForm(); }}>
                    Cancelar
                </button>
                <button className="btn btn-primary" onClick={isEdit ? handleUpdatePet : handleAddPet}>
                    {isEdit ? 'Salvar Alterações' : 'Adicionar Pet'}
                </button>
            </div>
        </div>
    );

    // ─── Pet Card ───
    const renderPetCard = (pet: Pet) => {
        const speciesConf = SPECIES_CONFIG[pet.species];
        const age = calculateAge(pet.birthDate);
        const pendingVaccines = pet.vaccinations.filter((v) => {
            if (!v.nextDate) return false;
            return new Date(v.nextDate).getTime() <= Date.now() + 30 * 24 * 60 * 60 * 1000;
        }).length;

        return (
            <div
                key={pet.id}
                onClick={() => { setSelectedPetId(pet.id); setViewMode('detail'); setDetailTab('info'); }}
                className="card"
                style={{
                    cursor: 'pointer',
                    animation: 'scaleIn 0.3s ease-out',
                    borderTop: `3px solid ${speciesConf.color}`,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Decorative gradient */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '120px',
                    height: '120px',
                    background: `radial-gradient(circle at top right, ${speciesConf.color}12, transparent 70%)`,
                    pointerEvents: 'none',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: `${speciesConf.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        flexShrink: 0,
                    }}>
                        {pet.photoEmoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                            {pet.name}
                        </div>
                        <div style={{ fontSize: '13px', color: speciesConf.color, fontWeight: 600 }}>
                            {speciesConf.emoji} {speciesConf.label}
                            {pet.breed && <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}> · {pet.breed}</span>}
                        </div>
                    </div>
                    {pendingVaccines > 0 && (
                        <div style={{
                            background: 'var(--color-warning-muted)',
                            color: 'var(--color-warning)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}>
                            <Syringe size={12} /> {pendingVaccines}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                    {age && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={12} /> {age}
                        </div>
                    )}
                    {pet.weight && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Weight size={12} /> {pet.weight} kg
                        </div>
                    )}
                    {pet.gender && (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>
                            {pet.gender === 'macho' ? '♂ Macho' : '♀ Fêmea'}
                        </div>
                    )}
                    {pet.isNeutered && (
                        <div style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            background: 'var(--color-success-muted)',
                            color: 'var(--color-success)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                        }}>
                            Castrado
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ─── Detail View ───
    const renderDetailView = () => {
        if (!selectedPet) return null;
        const speciesConf = SPECIES_CONFIG[selectedPet.species];

        const detailTabs: { key: DetailTab; label: string; icon: any }[] = [
            { key: 'info', label: 'Informações', icon: Heart },
            { key: 'saude', label: 'Saúde', icon: Stethoscope },
            { key: 'vacinas', label: 'Vacinas', icon: Syringe },
            { key: 'historico', label: 'Histórico', icon: Calendar },
        ];

        return (
            <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                {/* Back + Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <button
                        onClick={() => { setViewMode('grid'); setSelectedPetId(null); setEditingPet(false); }}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '13px' }}
                    >
                        ← Voltar
                    </button>
                    <div style={{ flex: 1 }} />
                    <button
                        onClick={() => { loadPetToForm(selectedPet); setEditingPet(true); }}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Pencil size={14} /> Editar
                    </button>
                    <button
                        onClick={() => setConfirmDelete(selectedPet.id)}
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Trash2 size={14} /> Remover
                    </button>
                </div>

                {/* Edit form */}
                {editingPet && renderPetForm(true)}

                {/* Pet Header Card */}
                {!editingPet && (
                    <div className="card" style={{
                        marginBottom: '20px',
                        borderTop: `3px solid ${speciesConf.color}`,
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '200px',
                            height: '200px',
                            background: `radial-gradient(circle at top right, ${speciesConf.color}10, transparent 70%)`,
                            pointerEvents: 'none',
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                                width: '72px',
                                height: '72px',
                                borderRadius: '20px',
                                background: `${speciesConf.color}18`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '36px',
                                flexShrink: 0,
                            }}>
                                {selectedPet.photoEmoji}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', margin: 0 }}>
                                    {selectedPet.name}
                                </h2>
                                <div style={{ fontSize: '14px', color: speciesConf.color, fontWeight: 600, marginTop: '2px' }}>
                                    {speciesConf.label}{selectedPet.breed ? ` · ${selectedPet.breed}` : ''}
                                </div>
                                <div style={{ display: 'flex', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
                                    {calculateAge(selectedPet.birthDate) && (
                                        <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                                            📅 {calculateAge(selectedPet.birthDate)}
                                        </span>
                                    )}
                                    {selectedPet.weight && (
                                        <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                                            ⚖️ {selectedPet.weight} kg
                                        </span>
                                    )}
                                    {selectedPet.gender && (
                                        <span style={{ fontSize: '13px', color: 'var(--color-text-tertiary)' }}>
                                            {selectedPet.gender === 'macho' ? '♂ Macho' : '♀ Fêmea'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Detail Tabs */}
                {!editingPet && (
                    <>
                        <div style={{
                            display: 'flex',
                            gap: '4px',
                            marginBottom: '20px',
                            padding: '4px',
                            background: 'var(--color-bg-card)',
                            borderRadius: 'var(--radius-full)',
                            border: '1px solid var(--color-border-default)',
                            width: 'fit-content',
                        }}>
                            {detailTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setDetailTab(tab.key)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        borderRadius: 'var(--radius-full)',
                                        border: 'none',
                                        background: detailTab === tab.key
                                            ? 'linear-gradient(135deg, var(--color-accent-primary), #7c3aed)'
                                            : 'transparent',
                                        color: detailTab === tab.key ? 'white' : 'var(--color-text-secondary)',
                                        fontSize: '13px',
                                        fontWeight: detailTab === tab.key ? 700 : 500,
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                        boxShadow: detailTab === tab.key ? 'var(--shadow-glow)' : 'none',
                                        transition: 'all 150ms ease',
                                    }}
                                >
                                    <tab.icon size={14} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        {detailTab === 'info' && (
                            <div className="card">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    {[
                                        { label: 'Cor / Pelagem', value: selectedPet.color },
                                        { label: 'Microchip', value: selectedPet.microchipId },
                                        { label: 'Castrado(a)', value: selectedPet.isNeutered ? 'Sim ✅' : 'Não' },
                                        { label: 'Data de Nascimento', value: selectedPet.birthDate ? new Date(selectedPet.birthDate).toLocaleDateString('pt-BR') : undefined },
                                        { label: 'Veterinário', value: selectedPet.vetName },
                                        { label: 'Tel. Veterinário', value: selectedPet.vetPhone },
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                                {item.label}
                                            </div>
                                            <div style={{ fontSize: '14px', color: item.value ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)', fontWeight: 500 }}>
                                                {item.value || '—'}
                                            </div>
                                        </div>
                                    ))}
                                    {selectedPet.dietNotes && (
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                                Alimentação / Dieta
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                                                {selectedPet.dietNotes}
                                            </div>
                                        </div>
                                    )}
                                    {selectedPet.notes && (
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                                                Observações
                                            </div>
                                            <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: 500, whiteSpace: 'pre-wrap' }}>
                                                {selectedPet.notes}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {detailTab === 'saude' && (
                            <div className="card">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                    <div style={{
                                        padding: '16px',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border-subtle)',
                                        textAlign: 'center',
                                    }}>
                                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>💉</div>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                                            {selectedPet.vaccinations.length}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Vacinas</div>
                                    </div>
                                    <div style={{
                                        padding: '16px',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border-subtle)',
                                        textAlign: 'center',
                                    }}>
                                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>🩺</div>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                                            {selectedPet.medicalRecords.length}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Consultas</div>
                                    </div>
                                    <div style={{
                                        padding: '16px',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border-subtle)',
                                        textAlign: 'center',
                                    }}>
                                        <div style={{ fontSize: '24px', marginBottom: '4px' }}>⚖️</div>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                                            {selectedPet.weight ? `${selectedPet.weight} kg` : '—'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)' }}>Peso</div>
                                    </div>
                                </div>
                                {selectedPet.vetName && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '14px',
                                        background: 'var(--color-bg-tertiary)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border-subtle)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                    }}>
                                        <Stethoscope size={18} style={{ color: 'var(--color-accent-secondary)' }} />
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                {selectedPet.vetName}
                                            </div>
                                            {selectedPet.vetPhone && (
                                                <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                                    <Phone size={11} /> {selectedPet.vetPhone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {detailTab === 'vacinas' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                    <button className="btn btn-primary" onClick={() => setShowAddVaccine(true)} style={{ fontSize: '13px' }}>
                                        <Plus size={14} /> Nova Vacina
                                    </button>
                                </div>

                                {showAddVaccine && (
                                    <div className="card" style={{ marginBottom: '16px', animation: 'scaleIn 0.2s ease-out' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Registrar Vacina</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={labelStyle}>Nome da Vacina *</label>
                                                <input style={inputStyle} placeholder="Ex: V10, Antirrábica..." value={vacName} onChange={(e) => setVacName(e.target.value)} autoFocus />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Data da Aplicação *</label>
                                                <input type="date" style={inputStyle} value={vacDate} onChange={(e) => setVacDate(e.target.value)} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Próxima Dose</label>
                                                <input type="date" style={inputStyle} value={vacNextDate} onChange={(e) => setVacNextDate(e.target.value)} />
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Veterinário</label>
                                                <input style={inputStyle} placeholder="Nome do vet..." value={vacVet} onChange={(e) => setVacVet(e.target.value)} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                                            <button className="btn btn-secondary" onClick={() => setShowAddVaccine(false)}>Cancelar</button>
                                            <button className="btn btn-primary" onClick={handleAddVaccination}>Registrar</button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {selectedPet.vaccinations.length === 0 ? (
                                        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>
                                            <Syringe size={24} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                                            <p style={{ fontSize: '14px' }}>Nenhuma vacina registrada</p>
                                        </div>
                                    ) : (
                                        selectedPet.vaccinations.map((vac) => {
                                            const isOverdue = vac.nextDate && new Date(vac.nextDate).getTime() < Date.now();
                                            return (
                                                <div
                                                    key={vac.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        padding: '14px 16px',
                                                        background: 'var(--color-bg-card)',
                                                        borderRadius: 'var(--radius-lg)',
                                                        border: isOverdue ? '1px solid var(--color-warning)' : '1px solid var(--color-border-subtle)',
                                                    }}
                                                >
                                                    <div style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: '10px',
                                                        background: isOverdue ? 'var(--color-warning-muted)' : 'var(--color-success-muted)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}>
                                                        <Syringe size={16} style={{ color: isOverdue ? 'var(--color-warning)' : 'var(--color-success)' }} />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                            {vac.name}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                                                            Aplicada em {new Date(vac.date).toLocaleDateString('pt-BR')}
                                                            {vac.nextDate && (
                                                                <span style={{ color: isOverdue ? 'var(--color-warning)' : 'inherit' }}>
                                                                    {' '}· Próxima: {new Date(vac.nextDate).toLocaleDateString('pt-BR')}
                                                                    {isOverdue && ' ⚠️ Atrasada'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeVaccination(selectedPet.id, vac.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--color-text-tertiary)',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            opacity: 0.5,
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}

                        {detailTab === 'historico' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                                    <button className="btn btn-primary" onClick={() => setShowAddRecord(true)} style={{ fontSize: '13px' }}>
                                        <Plus size={14} /> Novo Registro
                                    </button>
                                </div>

                                {showAddRecord && (
                                    <div className="card" style={{ marginBottom: '16px', animation: 'scaleIn 0.2s ease-out' }}>
                                        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Novo Registro / Nota</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <label style={labelStyle}>Tipo *</label>
                                                <select value={recType} onChange={(e) => setRecType(e.target.value as PetMedicalRecord['type'])} style={{ ...inputStyle, cursor: 'pointer' }}>
                                                    <option value="consulta">🩺 Consulta</option>
                                                    <option value="exame">🔬 Exame</option>
                                                    <option value="cirurgia">🏥 Cirurgia</option>
                                                    <option value="emergencia">🚨 Emergência</option>
                                                    <option value="observacao">📝 Observação</option>
                                                    <option value="outro">📋 Outro</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={labelStyle}>Data *</label>
                                                <input type="date" style={inputStyle} value={recDate} onChange={(e) => setRecDate(e.target.value)} />
                                            </div>
                                            <div style={{ gridColumn: '1 / -1' }}>
                                                <label style={labelStyle}>Descrição *</label>
                                                <input style={inputStyle} placeholder="O que foi feito..." value={recDesc} onChange={(e) => setRecDesc(e.target.value)} />
                                            </div>
                                            {recType !== 'observacao' && (
                                                <>
                                                    <div>
                                                        <label style={labelStyle}>Veterinário</label>
                                                        <input style={inputStyle} placeholder="Nome do vet..." value={recVet} onChange={(e) => setRecVet(e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <label style={labelStyle}>Custo (R$)</label>
                                                        <input type="number" step="0.01" style={inputStyle} placeholder="0.00" value={recCost} onChange={(e) => setRecCost(e.target.value)} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                                            <button className="btn btn-secondary" onClick={() => setShowAddRecord(false)}>Cancelar</button>
                                            <button className="btn btn-primary" onClick={handleAddRecord}>Registrar</button>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {selectedPet.medicalRecords.length === 0 ? (
                                        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-tertiary)' }}>
                                            <Stethoscope size={24} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                                            <p style={{ fontSize: '14px' }}>Nenhum registro médico</p>
                                        </div>
                                    ) : (
                                        selectedPet.medicalRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((rec) => {
                                            const typeConfig: Record<string, { emoji: string; color: string }> = {
                                                consulta: { emoji: '🩺', color: 'var(--color-info)' },
                                                exame: { emoji: '🔬', color: 'var(--color-accent-primary)' },
                                                cirurgia: { emoji: '🏥', color: 'var(--color-error)' },
                                                emergencia: { emoji: '🚨', color: 'var(--color-warning)' },
                                                observacao: { emoji: '📝', color: 'var(--color-success)' },
                                                outro: { emoji: '📋', color: 'var(--color-text-tertiary)' },
                                            };
                                            const cfg = typeConfig[rec.type] || typeConfig.outro;
                                            return (
                                                <div
                                                    key={rec.id}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'flex-start',
                                                        gap: '12px',
                                                        padding: '14px 16px',
                                                        background: 'var(--color-bg-card)',
                                                        borderRadius: 'var(--radius-lg)',
                                                        border: '1px solid var(--color-border-subtle)',
                                                    }}
                                                >
                                                    <div style={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: '10px',
                                                        background: `${cfg.color}18`,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '16px',
                                                        flexShrink: 0,
                                                    }}>
                                                        {cfg.emoji}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                                            {rec.description}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', marginTop: '4px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                                            <span>{new Date(rec.date).toLocaleDateString('pt-BR')}</span>
                                                            {rec.veterinarian && <span>Dr(a). {rec.veterinarian}</span>}
                                                            {rec.cost !== undefined && <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>R$ {rec.cost.toFixed(2)}</span>}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => removeMedicalRecord(selectedPet.id, rec.id)}
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--color-text-tertiary)',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            opacity: 0.5,
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="main-content">
            <div className="page-container">
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '28px',
                }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #f59e0b, #ec4899)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)',
                        }}>
                            <PawPrint size={24} color="white" />
                        </div>
                        <div>
                            <h1 className="page-title" style={{ marginBottom: '2px' }}>Nossos Pets</h1>
                            <p className="page-subtitle">
                                {pets.length} {pets.length === 1 ? 'pet cadastrado' : 'pets cadastrados'}
                            </p>
                        </div>
                    </div>
                    {viewMode === 'grid' && (
                        <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddPet(true); }}>
                            <Plus size={16} />
                            Novo Pet
                        </button>
                    )}
                </div>

                {/* Upcoming Vaccines Alert */}
                {viewMode === 'grid' && upcomingVaccines.length > 0 && (
                    <div style={{
                        marginBottom: '20px',
                        padding: '14px 18px',
                        background: 'var(--color-warning-muted)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        <AlertCircle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-warning)' }}>
                                Vacinas próximas
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                                {upcomingVaccines.map((u) => `${u.pet.name}: ${u.vac.name}`).join(' · ')}
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Pet Form */}
                {showAddPet && viewMode === 'grid' && renderPetForm(false)}

                {/* Content */}
                {viewMode === 'grid' ? (
                    <>
                        {pets.length === 0 && !showAddPet ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '80px 0',
                                color: 'var(--color-text-tertiary)',
                            }}>
                                <div style={{
                                    width: '72px',
                                    height: '72px',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(236, 72, 153, 0.1))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px',
                                    fontSize: '32px',
                                }}>
                                    🐾
                                </div>
                                <p style={{ fontSize: '16px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                                    Nenhum pet cadastrado
                                </p>
                                <p style={{ fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
                                    Adicione seus companheiros e mantenha tudo organizado: vacinas, histórico médico e informações importantes.
                                </p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                                gap: '16px',
                            }}>
                                {pets.map(renderPetCard)}
                            </div>
                        )}
                    </>
                ) : (
                    renderDetailView()
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={() => setConfirmDelete(null)}
                >
                    <div
                        className="card"
                        style={{ maxWidth: '400px', width: '100%', animation: 'scaleIn 0.2s ease-out' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>😢</div>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                Remover pet?
                            </div>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                                Tem certeza que deseja remover <strong>{pets.find((p) => p.id === confirmDelete)?.name}</strong>? Esta ação não pode ser desfeita.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{ background: 'var(--color-error)' }}
                                onClick={() => {
                                    removePet(confirmDelete);
                                    setConfirmDelete(null);
                                    setViewMode('grid');
                                    setSelectedPetId(null);
                                }}
                            >
                                <Trash2 size={14} /> Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
