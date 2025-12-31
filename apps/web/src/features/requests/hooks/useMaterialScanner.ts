import { useState, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useToast } from '@/hooks/use-toast';
import type { PriorityLevel } from '@/types';

interface ScannedData {
    material_name?: string;
    quantity?: number;
    unit?: string;
    priority?: PriorityLevel;
    notes?: string;
}

export function useMaterialScanner({ onScanComplete }: { onScanComplete: (data: ScannedData) => void }) {
    const [scanning, setScanning] = useState(false);
    const isScanningRef = useRef(false);
    const { toast } = useToast();

    const compressImage = async (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1024;
                    let width = img.width;
                    let height = img.height;
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7).split(',')[1]);
                };
            };
        });
    };

    const scanDocument = async (file: File) => {
        if (isScanningRef.current) return;

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            toast({ variant: 'destructive', title: 'API Key Missing', description: 'Please configure VITE_GEMINI_API_KEY in .env' });
            return;
        }

        isScanningRef.current = true;
        setScanning(true);
        toast({ title: 'Optimizing Image', description: 'Preparing AI Smart Scan...' });

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const compressedBase64 = await compressImage(file);

            const potentialModels = [
                'gemini-1.5-flash-latest',
                'gemini-flash-latest',
                'gemini-2.0-flash-exp', // Updated assuming 'exp' for next-gen
                'gemini-pro',
            ];

            let text = '';
            let success = false;
            let lastError = '';

            for (const modelId of potentialModels) {
                if (success) break;
                try {
                    console.log(`AI Scan - Probing: ${modelId}`);
                    const model = genAI.getGenerativeModel({ model: modelId });
                    const prompt = `
            ANALYZE CONSTRUCTION DOCUMENT.
            Return strictly JSON:
            {
                "material_name": "string",
                "quantity": number,
                "unit": "pieces" | "kg" | "m" | "bags" | "m3" | "liters",
                "priority": "low" | "medium" | "high" | "urgent",
                "notes": "string"
            }
            PRIORITY RULES:
            - "High Priority" or "Important" -> "high"
            - "Urgent", "ASAP", or "Emergency" -> "urgent"
            - Include deadlines in notes.
          `;
                    const result = await model.generateContent([
                        prompt,
                        { inlineData: { data: compressedBase64, mimeType: 'image/jpeg' } },
                    ]);
                    text = result.response.text();
                    if (text) {
                        success = true;
                    }
                } catch (err: any) {
                    lastError = err.message || 'Unknown error';
                }
            }

            if (!success) {
                const isLimitZero = lastError.includes('limit: 0');
                throw new Error(isLimitZero ? 'Google Quota Block: Use a different project or try again later.' : lastError);
            }

            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                onScanComplete({
                    material_name: parsed.material_name,
                    quantity: Number(parsed.quantity),
                    unit: parsed.unit,
                    priority: parsed.priority,
                    notes: parsed.notes,
                });
                toast({ title: 'Scan Complete', description: 'Details populated via AI model.' });
            }
        } catch (error: any) {
            console.error('AI Scan Fatal Error:', error);
            toast({
                variant: 'destructive',
                title: 'Scan Unsuccessful',
                description: error.message,
            });
        } finally {
            setScanning(false);
            isScanningRef.current = false;
        }
    };

    return { scanDocument, scanning };
}
