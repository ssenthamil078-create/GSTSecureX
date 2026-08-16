import { useEffect, useState } from 'react';
import { loadModels } from './testModels';
import UploadAadhaar from './components/UploadAadhaar';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  const handleImageSelected = (file, previewUrl) => {
    console.log('File selected:', file.name);
    setUploadedFile({ file, previewUrl });
  };

  return (
    <div>
      <UploadAadhaar onImageSelected={handleImageSelected} />
    </div>
  );
}

export default App;
