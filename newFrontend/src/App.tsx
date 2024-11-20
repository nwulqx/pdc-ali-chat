import React from 'react';
import { Route, Routes } from 'react-router-dom';

import './styles/app.scss';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/auth" element={<div>123</div>} />
    </Routes>
  );
};

export default App;
