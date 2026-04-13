import api from './api';

export interface GameConfig {
  name: string;
  ranks: string[];
  roles: string[];
}

export interface PlatformConfig {
  regions: string[];
  gameConfigs: GameConfig[];
}

export const defaultPlatformConfig: PlatformConfig = {
  regions: ['NA', 'EU', 'APAC', 'SA', 'ME', 'OCE'],
  gameConfigs: [
    {
      name: 'Valorant',
      ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'],
      roles: ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex']
    },
    {
      name: 'CS2',
      ranks: ['Silver', 'Gold Nova', 'MG', 'MGE', 'DMG', 'LE', 'LEM', 'Supreme', 'Global'],
      roles: ['Entry Fragger', 'Awper', 'Support', 'IGL', 'Lurker']
    },
    {
      name: 'League of Legends',
      ranks: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'],
      roles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support']
    }
  ]
};

export const fetchPlatformConfig = async (): Promise<PlatformConfig> => {
  try {
    const res = await api.get('/platform-config');
    const cfg = res.data as PlatformConfig;
    if (!cfg?.gameConfigs?.length && !cfg?.regions?.length) return defaultPlatformConfig;
    return cfg;
  } catch {
    return defaultPlatformConfig;
  }
};
