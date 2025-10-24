// utils/getEmbedding.ts
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const getEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await hf.featureExtraction({
      model: "BAAI/bge-small-en-v1.5",
      inputs: text,
    });

    return response as number[];
  } catch (error) {
    console.error("Embedding generation error:", error);
    throw new Error("Failed to generate embedding");
  }
};
