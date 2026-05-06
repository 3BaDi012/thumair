import { useLocale } from '../context/LocaleContext';
import type { MessageKey } from './messages';
import { t as translate } from './messages';

export function useT() {
  const { locale } = useLocale();
  return {
    locale,
    t: (key: MessageKey) => translate(locale, key),
  };
}

