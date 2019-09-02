import { useState, useCallback } from 'react';

const useCallbackRef = () => {
  const [item, setItem] = useState(null);
  const ref = useCallback((node) => {
    if (node !== null) {
      setItem(node);
    }
  }, []);
  return [item, ref];
};

export default useCallbackRef;
