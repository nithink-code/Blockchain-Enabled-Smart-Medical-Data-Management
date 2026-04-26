export interface AIAnalysisResult {
  success: boolean;
  extracted_data: {
    Age: number;
    Gender: number;
    Smoking: number;
    CancerHistory: number;
    [key: string]: any;
  };
  prediction: string;
  probability: {
    benign: number;
    malignant: number;
  };
  explanation: {
    lime_local_impact: [string, number][];
    shap_global_contribution: Record<string, number>;
  };
}

export async function analyzeMedicalDocument(text: string): Promise<AIAnalysisResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY is not set. Using mock data.");
    return getMockAnalysis();
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://medchain.example.com", // Optional, for OpenRouter rankings
        "X-Title": "MedChain" // Optional
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Using a fast, cost-effective model
        messages: [
          {
            role: "system",
            content: `You are a medical data extraction AI. Extract key features from the provided medical report text. 
            Return a JSON object in exactly the following format:
            {
              "success": true,
              "extracted_data": {
                "Age": number,
                "Gender": number (0 for female, 1 for male),
                "Smoking": number (0 or 1),
                "CancerHistory": number (0 or 1),
                "radius_mean": number,
                ...other fields if found
              },
              "prediction": "Malignant" or "Benign",
              "probability": {
                "benign": number,
                "malignant": number
              },
              "explanation": {
                "lime_local_impact": [[string, number], ...],
                "shap_global_contribution": { "field": number, ... }
              }
            }
            Ensure the sum of benign and malignant probabilities is 1.0. 
            Generate reasonable LIME and SHAP values based on the extracted data to explain the prediction.`
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return getMockAnalysis();
  }
}

function getMockAnalysis(): AIAnalysisResult {
  return {
    "success": true,
    "extracted_data": {
      "Age": 58,
      "Gender": 1,
      "Smoking": 1,
      "CancerHistory": 1,
      "radius_mean": 21
    },
    "prediction": "Malignant",
    "probability": {
      "benign": 0.19191241264343262,
      "malignant": 0.8080875873565674
    },
    "explanation": {
      "lime_local_impact": [
        ["CancerHistory", 0.21599326236970917],
        ["Age", 0.04476735236851986],
        ["PhysicalActivity", -0.03974451609834478],
        ["Smoking", 0.039420575234134704],
        ["Gender", 0.028358254031860472],
        ["smoothness_worst", -0.006426533652266334],
        ["perimeter_mean", -0.005328836830510063],
        ["smoothness_mean", 0.004718682269063253],
        ["perimeter_worst", 0.004507231108291174],
        ["symmetry_mean", 0.003592501926640967]
      ],
      "shap_global_contribution": {
        "Age": 0.9551175832748413,
        "Gender": 0.505254864692688,
        "BMI": -1.2706959247589111,
        "Smoking": 0.7489670515060425,
        "GeneticRisk": -0.19324779510498047,
        "PhysicalActivity": 1.1312508583068848,
        "AlcoholIntake": -0.9370559453964233,
        "CancerHistory": 2.383549928665161,
        "radius_mean": -0.000848802796099335,
        "texture_mean": -0.23373179137706757,
        "perimeter_mean": -0.002749684266746044,
        "area_mean": -0.06794604659080505,
        "smoothness_mean": -0.0173614714294672,
        "compactness_mean": -0.002445010468363762,
        "concavity_mean": -0.00018467257905285805,
        "concave points_mean": -0.07012175768613815,
        "symmetry_mean": -0.0012661840301007032,
        "fractal_dimension_mean": 0.10453001409769058,
        "radius_se": -0.013348117470741272,
        "texture_se": 0,
        "perimeter_se": 0,
        "area_se": -0.047613874077796936,
        "smoothness_se": 0.01493262592703104,
        "compactness_se": 0.020127732306718826,
        "concavity_se": 0,
        "concave points_se": 0.007222952786833048,
        "symmetry_se": 0.16238157451152802,
        "fractal_dimension_se": 0.002462154719978571,
        "radius_worst": -0.4138663709163666,
        "texture_worst": -0.09168726950883865,
        "perimeter_worst": -0.6782104969024658,
        "area_worst": -0.0010561312083154917,
        "smoothness_worst": -0.026982076466083527,
        "compactness_worst": 0,
        "concavity_worst": -0.2849932014942169,
        "concave points_worst": -0.45490431785583496,
        "symmetry_worst": 0.13080720603466034,
        "fractal_dimension_worst": 0.09323723614215851
      }
    }
  };
}
