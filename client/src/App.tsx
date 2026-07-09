import { useState, useEffect } from 'react';
import Widget from './Widget';
import Home from './Home';

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (route === '#/widget') {
    return <Widget />;
  }

  return <Home />;
}
