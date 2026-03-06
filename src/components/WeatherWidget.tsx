import { useEffect, useState } from 'react';
import { Cloud, Sun, CloudRain, Loader2, Thermometer } from 'lucide-react';

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
        if (!iconCode) return <Cloud size={18} />;
        if (iconCode.includes('01') || iconCode.includes('02')) return <Sun size={18} style={{ color: '#fbbf24' }} />;
        if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain size={18} style={{ color: '#60a5fa' }} />;
        return <Cloud size={18} style={{ color: '#9d99b8' }} />;
    };

    const widgetStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 18px',
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-full)',
        border: '1px solid var(--color-border-default)',
        boxShadow: 'var(--shadow-card)',
        backdropFilter: 'blur(8px)',
    };

    if (loading) {
        return (
            <div style={widgetStyle}>
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--color-accent-secondary)' }} />
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Carregando...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                ...widgetStyle,
                background: 'var(--color-error-muted)',
                borderColor: 'rgba(239, 68, 68, 0.15)',
            }}>
                <Cloud size={16} style={{ color: 'var(--color-error)' }} />
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Falta Configurar API</span>
            </div>
        );
    }

    if (!weather) return null;

    return (
        <div style={widgetStyle}>
            {getWeatherIcon(weather.icon)}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>{weather.temp}°C</span>
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{weather.description}</span>
            </div>
        </div>
    );
}
