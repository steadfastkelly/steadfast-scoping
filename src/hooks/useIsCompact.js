import { useEffect, useState } from 'react';

const DEFAULT_BREAKPOINT = 760;

export default function useIsCompact(breakpoint = DEFAULT_BREAKPOINT) {
  const initial = typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false;
  const [isCompact, setIsCompact] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    function onResize() {
      setIsCompact(window.innerWidth <= breakpoint);
    }

    onResize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [breakpoint]);

  return isCompact;
}
