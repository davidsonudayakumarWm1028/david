import { GoogleGenAI, Type } from "@google/genai";
import type { ShotDetail } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const scriptSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      shot_number: {
        type: Type.STRING,
        description: "The shot number, e.g., 'Shot 1'."
      },
      shot_description: {
        type: Type.STRING,
        description: 'Cinematic description of the shot for the video script. Should be engaging and concise.'
      },
      image_prompt: {
        type: Type.STRING,
        description: 'A detailed text-to-image prompt to generate the visual for this shot. Should be artistic and visually rich.'
      },
    },
    required: ["shot_number", "shot_description", "image_prompt"],
  },
};

const veoPromptsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            veo_prompt: {
                type: Type.STRING,
                description: 'A concise but powerful Veo prompt (under 250 characters) that animates the corresponding image. It should focus on subtle camera movements and environmental effects to bring the image to life.'
            }
        },
        required: ["veo_prompt"]
    }
};

export const generateScriptFromImage = async (base64ProductImage: string): Promise<ShotDetail[]> => {
  const generationPrompt = `
    Analyze the product in the attached image. Based on this product, create a concept for a 20-second Meta advertisement.
    1.  **Develop a script** broken down into 4-5 distinct shots. Each shot description should be cinematic and detailed, focusing on visual storytelling. The script must have a strong hook in the first shot to grab attention.
    2.  **For EACH shot**, create a detailed image generation prompt suitable for a text-to-image AI model like Imagen. This prompt should describe the exact visual scene for that shot, including composition, lighting, style, and mood.
    Your output MUST be a JSON array of objects, following the provided schema.
  `;
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64ProductImage,
    },
  };
  const textPart = { text: generationPrompt };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: scriptSchema,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    const jsonText = response.text.trim();
    const script: ShotDetail[] = JSON.parse(jsonText);
    return script;
  } catch (error) {
    console.error("Error calling Gemini API for script generation:", error);
    throw new Error("Failed to communicate with the Gemini API for script generation.");
  }
};

export const generateVeoPromptsFromImages = async (base64UserImages: string[], script: ShotDetail[]): Promise<string[]> => {
    const scriptContext = script.map(s => `${s.shot_number}: ${s.shot_description}`).join('\n');
    const generationPrompt = `
      You are an expert in creating animation prompts for Google's Veo text-to-video model.
      Your task is to animate a sequence of still images for a product advertisement.

      Here is the script context for each shot:
      ${scriptContext}

      For each of the attached images, provide a concise but powerful Veo prompt (under 250 characters) that animates it according to its script context.
      The animation should be subtle but engaging, bringing the still image to life. Focus on elements like camera movement (slow zoom in, gentle pan), environmental effects (light shifting, dust motes in the air), and minor object animations. Do not change the core subject of the image.

      Return a JSON array of objects, one for each image in the order they were provided.
    `;

    const textPart = { text: generationPrompt };
    const imageParts = base64UserImages.map(imgBase64 => ({
        inlineData: {
            mimeType: 'image/jpeg',
            data: imgBase64,
        }
    }));

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [textPart, ...imageParts] },
            config: {
                responseMimeType: "application/json",
                responseSchema: veoPromptsSchema,
                temperature: 0.5,
            }
        });
        const jsonText = response.text.trim();
        const prompts: {veo_prompt: string}[] = JSON.parse(jsonText);
        return prompts.map(p => p.veo_prompt);
    } catch (error) {
        console.error("Error calling Gemini API for Veo prompt generation:", error);
        throw new Error("Failed to communicate with the Gemini API for Veo prompt generation.");
    }
}
