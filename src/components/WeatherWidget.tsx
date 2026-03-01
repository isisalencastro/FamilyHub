import { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Loader2 } from 'lucide-react';

interface WeatherData {
    temp: number;
    description: string;
    icon: string;
}

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Get the API key from environment variables
                const apiKey = import.meta.env.VITE_OPENWEATHER_KEY;

                if (!apiKey) {
                    setError('Chave de API não configurada');
                    setLoading(false);
                    return;
                }

                // Default location: Porto Alegre, BR (can be changed to user's preference)
                const lat = -30.0346;
                const lon = -51.2177;

                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`
                );

                if (!response.ok) {
                    throw new Error('Falha ao carregar clima');
                }

                const data = await response.json();

                setWeather({
                    temp: Math.round(data.main.temp),
                    description: data.weather[0].description,
                    icon: data.weather[0].icon,
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, []);

    const getWeatherIcon = (iconCode: string) => {
        if (!iconCode) return <Cloud size={20} />;
        if (iconCode.includes('01') || iconCode.includes('02')) return <Sun size={20} style={{ color: '#f59e0b' }} />;
        if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain size={20} style={{ color: '#3b82f6' }} />;
        return <Cloud size={20} style={{ color: '#9ca3af' }} />;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px', border: '1px solid var(--color-border-default)' }}>
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-text-tertiary)' }} />
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Carregando clima...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <Cloud size={16} style={{ color: 'var(--color-error)' }} />
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Falta Configurar API</span>
            </div>
        );
    }

    if (!weather) return null;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05))', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            {getWeatherIcon(weather.icon)}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{weather.temp}°C</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{weather.description}</span>
            </div>
        </div>
    );
}
