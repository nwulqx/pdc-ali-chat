import { useEffect, useState } from "react";

const useDebugMode = () => {
  const [debugMode, setDebugMode] = useState(false);
  useEffect(() => {
    window.setDebugMode = (value: boolean) => {
      setDebugMode(value);
    };
  }, []);
  return { debugMode };
};

export default useDebugMode;
