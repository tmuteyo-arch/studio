'use server';

/**
 * @fileOverview This file defines a Genkit flow for validating the quality of document images.
 * It checks for blurriness, lighting, shake, edge visibility, and readability.
 *
 * - validateImageQuality - A function that handles the image quality assessment.
 * - ValidateImageQualityInput - The input type for the validateImageQuality function.
 * - ValidateImageQualityOutput - The return type for the validateImageQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateImageQualityInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A data URI of the document image, that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ValidateImageQualityInput = z.infer<typeof ValidateImageQualityInputSchema>;

const ValidateImageQualityOutputSchema = z.object({
  isValid: z.boolean().describe('Whether the image meets quality standards for document processing.'),
  reason: z.string().optional().describe('The reason why the image was rejected, if any.'),
});
export type ValidateImageQualityOutput = z.infer<typeof ValidateImageQualityOutputSchema>;

export async function validateImageQuality(input: ValidateImageQualityInput): Promise<ValidateImageQualityOutput> {
  return validateImageQualityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateImageQualityPrompt',
  input: {schema: ValidateImageQualityInputSchema},
  output: {schema: ValidateImageQualityOutputSchema},
  prompt: `You are an expert document imaging specialist. Your task is to evaluate the quality of a provided document image.

Analyze the image for the following criteria:
1. **Blurriness**: Is the image sharp and in focus?
2. **Lighting**: Is the image well-lit? It should not be too dark or have excessive glare.
3. **Camera Shake**: Is there any motion blur from camera movement?
4. **Edge Visibility**: Is the entire document (all four corners/edges) visible within the frame?
5. **Readability**: Is the text on the document clear and easy to read?

If the image fails ANY of these criteria, mark it as invalid.

Image: {{media url=imageDataUri}}

Return a JSON object with:
- "isValid": true/false
- "reason": A brief description of the failure if isValid is false.`,
});

const validateImageQualityFlow = ai.defineFlow(
  {
    name: 'validateImageQualityFlow',
    inputSchema: ValidateImageQualityInputSchema,
    outputSchema: ValidateImageQualityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
