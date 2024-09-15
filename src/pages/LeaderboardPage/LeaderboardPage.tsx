import { useEffect, useState } from 'react';
import axios from 'axios';
import { NavigationBar } from '@/components/NavigationBar/NavigationBar';

interface LeaderboardEntry {
  place: number;
  username: string;
  ballCryBalance: number;
}

// Укажите здесь базовый URL вашего бэкенда
const API_BASE_URL = 'https://e95eef8375dc9c3be0e3aaaf5fb76235.serveo.net'; // Замените на реальный URL вашего бэкенда

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await axios.get<LeaderboardEntry[]>(`${API_BASE_URL}/api/leaderboard`);
        setLeaderboard(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Ошибка при загрузке данных лидерборда');
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ padding: '20px', paddingBottom: '60px' }}>
      <h2>Таблица лидеров</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Место</th>
            <th style={tableHeaderStyle}>Имя пользователя</th>
            <th style={tableHeaderStyle}>BallCry баланс</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry) => (
            <tr key={entry.place}>
              <td style={tableCellStyle}>{entry.place}</td>
              <td style={tableCellStyle}>{entry.username}</td>
              <td style={tableCellStyle}>{entry.ballCryBalance}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <NavigationBar />
    </div>
  );
};

const tableHeaderStyle: React.CSSProperties = {
  backgroundColor: '#f2f2f2',
  padding: '10px',
  textAlign: 'left',
  borderBottom: '1px solid #ddd'
};

const tableCellStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #ddd'
};