import { setStorage } from '@browsers/storage';
import { EXT_STORAGE_CONFIG, EXT_STORAGE_WORD_LIST } from '@constants/storage';
import { DEFAULT_CONFIG } from '@utils/config';
import { logger } from '@utils/logger';
import { genWordDetailList } from '@utils/word';

export const storeEssentialDataOnInstall = async () => {
  const config = DEFAULT_CONFIG;
  const words = genWordDetailList();

  await Promise.all([
    setStorage({ type: 'sync', key: EXT_STORAGE_CONFIG, value: config }),
    setStorage({ type: 'local', key: EXT_STORAGE_WORD_LIST, value: JSON.stringify(words) }),
  ]);

  logger('[background] Init storage settings done!');
};
