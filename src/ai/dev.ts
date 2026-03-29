'use client';
import { config } from 'dotenv';
config();

import '@/ai/flows/extract-and-validate-data.ts';
import '@/ai/flows/summarize-application-flow.ts';
import '@/ai/flows/validate-image-quality.ts';
