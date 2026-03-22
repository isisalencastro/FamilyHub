import { useState, useMemo } from 'react';
import { useMenuStore, type Meal } from '@/stores/menuStore';
import { UtensilsCrossed, ChevronLeft, ChevronRight, Plus, X, Trash2, Clock, ShoppingCart, DollarSign, Package, Sunset, Sun } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export function MenusView() {
    const { meals, addMeal, removeMeal } = useMenuStore();
    const { activeWorkspace } = useWorkspaceStore();
    
    // Set to the Sunday of the current week
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay()); // Sunday
        return d;
    });

    const [isAddingMeal, setIsAddingMeal] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [ingredients, setIngredients] = useState('');
    const [dateToMake, setDateToMake] = useState(new Date().toISOString().split('T')[0]);
    const [dateToConsume, setDateToConsume] = useState(new Date().toISOString().split('T')[0]);
    const [mealType, setMealType] = useState<'almoco' | 'janta'>('almoco');
    const [averageCost, setAverageCost] = useState('');
    const [isMarmita, setIsMarmita] = useState(false);

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !dateToConsume) return;
        
        addMeal({
            name: name.trim(),
            ingredients: ingredients.trim(),
            dateToMake: dateToMake || dateToConsume,
            dateToConsume,
            mealType,
            averageCost: parseFloat(averageCost) || 0,
            isMarmita,
            owner: activeWorkspace.id
        });

        // Reset form
        setName('');
        setIngredients('');
        setAverageCost('');
        setIsMarmita(false);
        setMealType('almoco');
        setIsAddingMeal(false);
    };

    const isFamilia = activeWorkspace.id === 'familia';

    const prevWeek = () => setCurrentWeekStart(new Date(currentWeekStart.getTime() - 7 * 86400000));
    const nextWeek = () => setCurrentWeekStart(new Date(currentWeekStart.getTime() + 7 * 86400000));
    const goToCurrentWeek = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - d.getDay());
        setCurrentWeekStart(d);
    };

    const days = useMemo(() => {
        const result = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(currentWeekStart);
            d.setDate(currentWeekStart.getDate() + i);
            result.push(d);
        }
        return result;
    }, [currentWeekStart]);

    const getBadgeColor = (m: Meal) => {
        if (m.isMarmita) return '#f59e0b';
        return m.mealType === 'almoco' ? '#3b82f6' : '#8b5cf6'; // Blue for lunch, Purple for dinner
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    // Format Week Header, e.g. "12 Mar - 18 Mar, 2026"
    const endOfWeek = new Date(currentWeekStart);
    endOfWeek.setDate(currentWeekStart.getDate() + 6);
    const weekHeaderInfo = `${currentWeekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - ${endOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;

    const renderMealCard = (meal: Meal) => (
        <div key={meal.id} 
            onClick={() => setSelectedMeal(meal)}
            style={{
            fontSize: '11px', padding: '8px', borderRadius: '8px',
            background: 'var(--color-bg-tertiary)',
            borderLeft: `3px solid ${getBadgeColor(meal)}`,
            cursor: 'pointer', transition: 'all 0.2s ease',
            display: 'flex', flexDirection: 'column', gap: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }} title="Ver Detalhes do Cardápio" onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.05)';
        }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
        }}>
            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                {meal.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                {meal.averageCost > 0 ? <span style={{ color: 'var(--color-text-tertiary)', fontSize: '10px', fontWeight: 600 }}>{formatCurrency(meal.averageCost)}</span> : <span />}
                {meal.isMarmita && <Package size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />}
            </div>
        </div>
    );

    return (
        <div className="main-content">
            <div className="page-container">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #10b981, #3b82f6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 20px rgba(16, 185, 129, 0.2)',
                            }}>
                                <UtensilsCrossed size={24} color="white" />
                            </div>
                            <div>
                                <h1 className="page-title" style={{ marginBottom: '2px' }}>Cardápios da Semana</h1>
                                <p className="page-subtitle">
                                    Planeje seus almoços e jantas da semana.
                                    {!isFamilia && ' Visão individual e da família.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setIsAddingMeal(!isAddingMeal)}
                        >
                            <Plus size={16} /> {isAddingMeal ? 'Cancelar' : 'Nova Refeição'}
                        </button>
                    </div>
                </div>

                {isAddingMeal && (
                    <div className="card" style={{ marginBottom: '24px', animation: 'scaleIn 0.2s ease-out' }}>
                        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Cadastrar Refeição</div>
                        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Qual é a Refeição? *</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Escondidinho de Frango"
                                        className="input"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Tipo da Refeição *</label>
                                    <select
                                        className="input"
                                        value={mealType}
                                        onChange={e => setMealType(e.target.value as 'almoco' | 'janta')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <option value="almoco">☀️ Almoço</option>
                                        <option value="janta">🌙 Jantar</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Data do Consumo *</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={dateToConsume}
                                        onChange={e => setDateToConsume(e.target.value)}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Data do Preparo</label>
                                    <input
                                        type="date"
                                        className="input"
                                        value={dateToMake}
                                        onChange={e => setDateToMake(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Preço Médio (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="Ex: 15.50"
                                        className="input"
                                        value={averageCost}
                                        onChange={e => setAverageCost(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Ingredientes da Porção</label>
                                <textarea
                                    className="input"
                                    placeholder="Ex: 150g Frango, 100g Mandioca..."
                                    value={ingredients}
                                    onChange={e => setIngredients(e.target.value)}
                                    style={{ minHeight: '60px', resize: 'vertical' }}
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                <div
                                    onClick={() => setIsMarmita(!isMarmita)}
                                    style={{
                                        width: 20, height: 20, borderRadius: '6px',
                                        border: isMarmita ? 'none' : '2px solid var(--color-text-tertiary)',
                                        background: isMarmita ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'transparent',
                                        display: 'flex', alignItems: 'center', justifyItems: 'center', paddingLeft: isMarmita ? '3px' : '0' , cursor: 'pointer', transition: 'all 200ms ease'
                                    }}
                                >
                                    {isMarmita && <span style={{ color: 'white', fontSize: '12px', fontWeight: 700 }}>✓</span>}
                                </div>
                                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Esta refeição é uma Marmita (Congelada/Armazenada)</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setIsAddingMeal(false)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Salvar Refeição</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Main Weekly View */}
                <div className="card">
                    {/* Calendar Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid var(--color-border-default)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{weekHeaderInfo}</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary" onClick={prevWeek} style={{ padding: '8px 12px' }}><ChevronLeft size={16} /> Ant.</button>
                            <button className="btn btn-secondary" onClick={goToCurrentWeek} style={{ padding: '8px 14px' }}>Atual</button>
                            <button className="btn btn-secondary" onClick={nextWeek} style={{ padding: '8px 12px' }}>Próx. <ChevronRight size={16} /></button>
                        </div>
                    </div>

                    {/* Columns headers */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
                        background: 'var(--color-bg-tertiary)', borderBottom: '1px solid var(--color-border-default)'
                    }}>
                        {days.map((d, idx) => {
                            const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
                            const isToday = new Date().toDateString() === d.toDateString();
                            return (
                                <div key={idx} style={{ padding: '14px 8px', textAlign: 'center', borderRight: idx < 6 ? '1px solid var(--color-border-subtle)' : 'none' }}>
                                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {dayNames[d.getDay()]}
                                    </div>
                                    <div style={{ 
                                        fontSize: '18px', fontWeight: isToday ? 800 : 600, 
                                        color: isToday ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                                        marginTop: '4px' 
                                    }}>
                                        {d.getDate()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Almoço & Janta Rows via Flex columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '400px' }}>
                        {days.map((date, idx) => {
                            const dateStr = date.toISOString().split('T')[0];
                            const dayMeals = meals.filter(m => m.dateToConsume === dateStr);
                            const almocos = dayMeals.filter(m => m.mealType === 'almoco' || !m.mealType);
                            const jantas = dayMeals.filter(m => m.mealType === 'janta');

                            const isToday = new Date().toDateString() === date.toDateString();

                            return (
                                <div key={idx} style={{
                                    borderRight: idx < 6 ? '1px solid var(--color-border-subtle)' : 'none',
                                    display: 'flex', flexDirection: 'column',
                                    background: isToday ? 'rgba(139, 92, 246, 0.02)' : 'transparent'
                                }}>
                                    {/* Almoço Area */}
                                    <div style={{ flex: 1, padding: '12px', borderBottom: '1px dashed var(--color-border-subtle)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                            <Sun size={14} style={{ color: '#3b82f6' }} />
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>ALMOÇO</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {almocos.map(renderMealCard)}
                                        </div>
                                    </div>

                                    {/* Janta Area */}
                                    <div style={{ flex: 1, padding: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                            <Sunset size={14} style={{ color: '#8b5cf6' }} />
                                            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-tertiary)' }}>JANTA</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {jantas.map(renderMealCard)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Meal Details Popup */}
                {selectedMeal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 9999, padding: '20px'
                    }} onClick={() => setSelectedMeal(null)}>
                        <div style={{
                            background: 'var(--color-bg-primary)',
                            borderRadius: '24px',
                            width: '100%',
                            maxWidth: '400px',
                            padding: '32px',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                            animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            position: 'relative'
                        }} onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setSelectedMeal(null)}
                                style={{
                                    position: 'absolute', top: '24px', right: '24px',
                                    background: 'var(--color-bg-tertiary)', border: 'none',
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', color: 'var(--color-text-secondary)',
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-bg-tertiary)'}
                            >
                                <X size={16} />
                            </button>

                            <div style={{
                                width: '48px', height: '48px', borderRadius: '16px',
                                background: selectedMeal.isMarmita 
                                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.05))' 
                                    : (selectedMeal.mealType === 'janta' ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.05))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05))'),
                                color: selectedMeal.isMarmita ? '#f59e0b' : (selectedMeal.mealType === 'janta' ? '#8b5cf6' : '#3b82f6'),
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '20px'
                            }}>
                                {selectedMeal.isMarmita ? <Package size={24} /> : (selectedMeal.mealType === 'janta' ? <Sunset size={24} /> : <Sun size={24} />)}
                            </div>

                            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', lineHeight: 1.2 }}>
                                {selectedMeal.name}
                            </h2>
                            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', fontWeight: 600 }}>
                                {selectedMeal.mealType === 'janta' ? '🌙 Jantar' : '☀️ Almoço'}{selectedMeal.isMarmita && ' • 🧊 Marmita'}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border-subtle)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Consumo</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
                                        <UtensilsCrossed size={14} style={{ color: 'var(--color-accent-primary)' }} />
                                        {new Date(selectedMeal.dateToConsume + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', fontWeight: 600, textTransform: 'uppercase' }}>Preparo</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-primary)', fontSize: '14px', fontWeight: 600 }}>
                                        <Clock size={14} style={{ color: 'var(--color-accent-secondary)' }} />
                                        {new Date(selectedMeal.dateToMake + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </div>
                                </div>
                            </div>

                            {selectedMeal.ingredients && (
                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '14px' }}>
                                        <ShoppingCart size={16} style={{ color: 'var(--color-accent-primary)' }} />
                                        Ingredientes
                                    </div>
                                    <p style={{
                                        fontSize: '14px', color: 'var(--color-text-secondary)',
                                        lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0,
                                        background: 'var(--color-bg-tertiary)', padding: '12px', borderRadius: '12px'
                                    }}>
                                        {selectedMeal.ingredients}
                                    </p>
                                </div>
                            )}

                            {selectedMeal.averageCost > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px', color: 'var(--color-text-primary)', fontWeight: 700, fontSize: '14px' }}>
                                    <DollarSign size={16} style={{ color: '#10b981' }} />
                                    Custo Médio: <span style={{ color: '#10b981' }}>{formatCurrency(selectedMeal.averageCost)}</span>
                                </div>
                            )}

                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    removeMeal(selectedMeal.id);
                                    setSelectedMeal(null);
                                }}
                                style={{
                                    width: '100%', color: 'var(--color-error)', border: '1px solid var(--color-error)',
                                    background: 'transparent'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <Trash2 size={16} /> Excluir Refeição
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
