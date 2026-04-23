export interface AIAnalysisResult {
  summary: string;
  entities: {
    type: string;
    value: string;
    confidence: number;
    explanation: string;
  }[];
  riskLevel: 'Low' | 'Moderate' | 'High';
  recommendations: string[];
  xaiData: {
    keyFactors: string[];
    reasoningModel: string;
  };
}

export async function analyzeMedicalText(text: string): Promise<AIAnalysisResult> {
  // Simulating AI analysis delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const lowerText = text.toLowerCase();
  
  // Very basic heuristic-based "AI" for demonstration
  const entities = [];
  
  if (lowerText.includes('cholesterol') || lowerText.includes('ldl') || lowerText.includes('hdl')) {
    entities.push({
      type: 'Biomarker',
      value: 'Cholesterol Profile',
      confidence: 0.94,
      explanation: 'Detected keywords related to lipid panel measurements.'
    });
  }

  if (lowerText.includes('blood pressure') || lowerText.includes('systolic')) {
    entities.push({
      type: 'Vital Sign',
      value: 'Blood Pressure',
      confidence: 0.98,
      explanation: 'Identified numeric patterns consistent with BP readings (mmHg).'
    });
  }

  // Default simulated result if no matches
  if (entities.length === 0) {
    return {
      summary: "General medical report processed. No specific acute biomarkers were automatically identified with high confidence.",
      entities: [
        {
          type: 'Condition',
          value: 'General Health Status',
          confidence: 0.85,
          explanation: 'AI detected general physical examination terminology.'
        }
      ],
      riskLevel: 'Low',
      recommendations: ["Maintain regular checkups", "Discuss these results with your primary physician"],
      xaiData: {
        keyFactors: ["Physical examination notes", "Patient history mentions"],
        reasoningModel: "MedText-LLM-v1 (Simulated)"
      }
    };
  }

  return {
    summary: "Significant biomarkers detected. The report contains data regarding cardiovascular health indicators.",
    entities,
    riskLevel: lowerText.includes('high') || lowerText.includes('elevated') ? 'Moderate' : 'Low',
    recommendations: [
      "Follow up with Dr. Specialist regarding identified markers.",
      "Monitor dietary intake of saturated fats.",
      "Schedule a follow-up test in 3 months."
    ],
    xaiData: {
      keyFactors: entities.map(e => e.value),
      reasoningModel: "HealthInsight-XAI-v4 (Explainable Engine)"
    }
  };
}
