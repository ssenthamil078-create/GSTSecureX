import { useEffect } from 'react';
import { loadModels } from './testModels';
import UploadAadhaar from './components/UploadAadhaar';

function App() {
  useEffect(() => {
    loadModels();
  }, []);

  const handleEmbeddingGenerated = (embedding) => {
    console.log('Final embedding stored/ready, length:', embedding.length);
  };

  return (
    <div>
      <UploadAadhaar onEmbeddingGenerated={handleEmbeddingGenerated} />
    </div>
  );
}

export default App;
