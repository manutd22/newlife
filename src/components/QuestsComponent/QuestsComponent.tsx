import { useState, FC } from 'react';
import { Button } from '@telegram-apps/telegram-ui';
import { DisplayData, DisplayDataRow } from '@/components/DisplayData/DisplayData';

interface Quest {
  id: number;
  title: string;
  reward: number;
  completed: boolean;
}

export const QuestsComponent: FC = () => {
  const [quests, setQuests] = useState<Quest[]>([
    { id: 1, title: "Подпишись на официальный канал телеграм", reward: 200, completed: false },
    { id: 2, title: "Ежедневный бонус", reward: 100, completed: false },
    { id: 3, title: "Пригласи 5 друзей", reward: 800, completed: false },
    { id: 4, title: "Подключи кошелёк", reward: 150, completed: false },
    { id: 5, title: "Выставь историю в инстаграм со своим любимым клубом и хештегом BallCry", reward: 300, completed: false },
    { id: 6, title: "Подпишись на канал в X", reward: 100, completed: false },
    { id: 7, title: "Соверши транзакцию Ton", reward: 250, completed: false },
  ]);

  const handleQuestCompletion = (questId: number) => {
    setQuests(quests.map(quest => 
      quest.id === questId ? { ...quest, completed: true } : quest
    ));
  };

  const questRows: DisplayDataRow[] = quests.map(quest => ({
    title: quest.title,
    value: (
      <>
        <span>Reward: {quest.reward} BallCry</span>
        {quest.completed ? 
          <span style={{ color: 'green', marginLeft: '10px' }}>Completed</span> : 
          <Button onClick={() => handleQuestCompletion(quest.id)} style={{ marginLeft: '10px' }}>Complete</Button>
        }
      </>
    )
  }));

  return (
    <DisplayData
      header="Available Quests"
      rows={questRows}
    />
  );
};