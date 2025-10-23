import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

interface ImageInput {
  data: string;
  mimeType: string;
}

export async function generatePoseImage(userImage: ImageInput, templateImage: ImageInput): Promise<string> {
  const model = 'gemini-2.5-flash-image';
  
  const prompt = `You are an expert in AI-powered image manipulation, specializing in pose transfer. Your task is to meticulously transfer the pose, including the body posture and facial expression, from a 'pose reference' image onto a 'subject' image.

**Core Objective:** Redraw the person from the 'subject' image to perfectly match the pose and expression from the 'pose reference' image, while seamlessly integrating them into the original background.

**CRITICAL INSTRUCTIONS (Follow these without deviation):**

1.  **Pose & Expression Extraction:**
    *   From the 'pose reference' image, analyze and extract the complete three-dimensional skeletal pose, body posture, limb positioning, head angle, and facial expression.
    *   This reference image is **ONLY** for the pose and expression. Ignore its subject's identity, clothing, style, and background entirely.

2.  **Subject Preservation:**
    *   The person's identity, face (while adapting the expression), body shape, and all clothing from the 'subject' image must be perfectly preserved.
    *   The original image's style, lighting, shadows, reflections, and color grading must be maintained in the final output to ensure a natural look.

3.  **Background Integrity & Inpainting:**
    *   The entire background from the 'subject' image must remain unchanged.
    *   If the new pose reveals parts of the background previously hidden by the subject, you must intelligently inpaint these areas. The inpainted sections must flawlessly match the surrounding background in texture, lighting, and perspective.
    *   Similarly, if the new pose requires extending parts of the subject's body or clothing that were not fully visible, you must reasonably and realistically generate these extensions.

**Final Output:** A single, photorealistic image where the person from the first image is in the exact pose and expression from the second image, located within the original background of the first image. The result should be seamless and believable.`;

  const userImagePart = {
    inlineData: {
      data: userImage.data,
      mimeType: userImage.mimeType,
    },
  };
  
  const templateImagePart = {
    inlineData: {
      data: templateImage.data,
      mimeType: templateImage.mimeType,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          userImagePart,
          templateImagePart
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstPart = response.candidates?.[0]?.content?.parts?.[0];
    if (firstPart && 'inlineData' in firstPart && firstPart.inlineData) {
      return firstPart.inlineData.data;
    } else {
      // Check for safety ratings or other reasons for no output
      const safetyReason = response.candidates?.[0]?.finishReason;
      if (safetyReason === 'SAFETY') {
          throw new Error('Image generation failed due to safety filters. Please try a different image.');
      }
      throw new Error('No image data found in the API response. The model may have been unable to generate an image.');
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('API_KEY')) {
         throw new Error('Invalid API Key. Please check your configuration.');
    }
    throw new Error(error instanceof Error ? error.message : 'Failed to generate image. The model may be unable to process this request.');
  }
}