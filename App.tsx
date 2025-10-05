import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { StepIndicator } from './components/StepIndicator';
import { ImageUploader } from './components/ImageUploader';
import { ScriptPromptCard } from './components/ScriptPromptCard';
import { FinalPromptCard } from './components/FinalPromptCard';
import { generateScriptFromImage, generateVeoPromptsFromImages } from './services/geminiService';
import type { ShotDetail } from './types';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
  const [step, setStep] = useState(1);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [script, setScript] = useState<ShotDetail[]>([]);
  const [userImages, setUserImages] = useState<(File | null)[]>(Array(5).fill(null));
  const [veoPrompts, setVeoPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScriptGeneration = useCallback(async () => {
    if (!productImage) {
      setError('Please upload a product image first.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const base64Image = await fileToBase64(productImage);
      const generatedScript = await generateScriptFromImage(base64Image);
      // Ensure we only take up to 5 shots
      const limitedScript = generatedScript.slice(0, 5);
      setScript(limitedScript);
      setUserImages(Array(limitedScript.length).fill(null)); // Resize userImages array based on script length
      setStep(2);
    } catch (err) {
      setError('Failed to generate script. Please check your connection or API key and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [productImage]);

  const handleVeoGeneration = useCallback(async () => {
    if (userImages.some(img => img === null)) {
      setError('Please upload an image for every shot.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const base64Images = await Promise.all(
        userImages.map(file => file ? fileToBase64(file) : Promise.resolve(''))
      );
      const generatedPrompts = await generateVeoPromptsFromImages(base64Images, script);
      setVeoPrompts(generatedPrompts);
      setStep(4);
    } catch (err) {
      setError('Failed to generate Veo prompts. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [userImages, script]);

  const handleReset = () => {
    setStep(1);
    setProductImage(null);
    setScript([]);
    setUserImages(Array(5).fill(null));
    setVeoPrompts([]);
    setError(null);
    setIsLoading(false);
  };

  const handleUserImageChange = (index: number, file: File | null) => {
    setUserImages(prev => {
      const newImages = [...prev];
      newImages[index] = file;
      return newImages;
    });
  };
  
  const handleStepClick = (stepNumber: number) => {
    // Only allow navigating to previous steps
    if (stepNumber < step) {
      setStep(stepNumber);
    }
  };

  const allUserImagesUploaded = userImages.every(img => img !== null) && userImages.length > 0;

  return (
    <div className="min-h-screen text-white font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
          <StepIndicator currentStep={step} onStepClick={handleStepClick} />

          {isLoading && <LoadingSpinner />}
          {error && !isLoading && <div className="my-6"><ErrorMessage message={error} /></div>}

          {!isLoading && (
            <>
              {step === 1 && (
                <div className="mt-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-200 mb-4">Upload Your Product Image</h2>
                  <p className="text-gray-400 mb-6 max-w-2xl mx-auto">Upload a clear image of your product to begin. Our AI will analyze it to create a custom video ad concept.</p>
                  <ImageUploader file={productImage} setFile={setProductImage} />
                  <button
                    onClick={handleScriptGeneration}
                    disabled={!productImage}
                    className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
                  >
                    Generate Script & Prompts
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="mt-8">
                  <h2 className="text-2xl font-bold text-center text-gray-200 mb-2">Your AI-Generated Script</h2>
                  <p className="text-gray-400 text-center mb-8 max-w-3xl mx-auto">Use the prompts below in your favorite AI image generator (e.g., Imagen, Midjourney). Then, upload the created images in the next step.</p>
                  <div className="space-y-6">
                    {script.map((shot, index) => (
                      <ScriptPromptCard key={index} shot={shot} />
                    ))}
                  </div>
                  <div className="text-center mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                    <button onClick={() => setStep(1)} className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                        Back
                    </button>
                    <button onClick={() => setStep(3)} className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105">
                      I've created the images, what's next?
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                 <div className="mt-8">
                    <h2 className="text-2xl font-bold text-center text-gray-200 mb-2">Upload Your Generated Images</h2>
                    <p className="text-gray-400 text-center mb-8">Upload the image you created for each corresponding shot from the script.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {script.map((shot, index) => (
                         <div key={index} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                           <h3 className="font-bold text-lg mb-2 text-gray-300">{shot.shot_number}</h3>
                           <p className="text-sm text-gray-400 mb-4 h-16 overflow-auto">{shot.shot_description}</p>
                           <ImageUploader file={userImages[index]} setFile={(file) => handleUserImageChange(index, file)} small />
                         </div>
                       ))}
                    </div>
                    <div className="text-center mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={() => setStep(2)} className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                            Back
                        </button>
                        <button 
                            onClick={handleVeoGeneration} 
                            disabled={!allUserImagesUploaded}
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Generate Veo Prompts
                        </button>
                    </div>
                 </div>
              )}

              {step === 4 && (
                <div className="mt-8">
                   <h2 className="text-3xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-blue-400 to-purple-500 mb-2">Your Ad is Ready to Create!</h2>
                   <p className="text-gray-400 text-center mb-8">Use these images and Veo prompts to generate your video, shot by shot.</p>
                   <div className="space-y-8">
                     {veoPrompts.map((prompt, index) => (
                       <FinalPromptCard key={index} imageFile={userImages[index]} veoPrompt={prompt} shotNumber={index + 1} />
                     ))}
                   </div>
                   <div className="text-center mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={() => setStep(3)} className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors">
                            Back
                        </button>
                        <button onClick={handleReset} className="w-full sm:w-auto border border-gray-600 hover:bg-gray-700 text-gray-300 font-bold py-3 px-8 rounded-lg transition-colors">
                            Start a New Project
                        </button>
                   </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;