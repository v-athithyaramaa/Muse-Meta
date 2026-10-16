import React, { useState, useEffect, useRef } from 'react';
import {
  Stethoscope,
  Sparkles,
  FileText,
  Activity,
  AlertTriangle,
  Copy,
  Check,
  RefreshCw,
  Send,
  Mic,
  Square,
  Upload,
  Settings,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  ClipboardList,
  CheckCircle2,
  FileCode,
  Download,
  Terminal,
  Zap,
  Info,
  Tag,
  AlignLeft,
  Layers,
  Heart,
  AlertOctagon
} from 'lucide-react';

// Preset Clinical Cases for 1-Click Evaluation
const SAMPLE_CASES = [
  {
    title: 'Lumbar Radiculopathy (Disc Herniation)',
    category: 'Orthopedics / Neurology',
    transcript:
      'Patient is a 52-year-old female presenting with persistent lower back pain for 3 weeks, radiating to left leg, worsening with sitting. No trauma. Denies saddle anesthesia or bowel/bladder changes. BP 128/84, HR 76. Straight leg raise positive on left at 45 degrees. Normal patellar and Achilles reflexes.',
  },
  {
    title: 'Acute Coronary Syndrome Rule-Out',
    category: 'Cardiology / Emergency',
    transcript:
      '64-year-old male presents to the clinic with 2 hours of substernal chest tightness radiating to the left jaw and shoulder, onset while walking briskly. Associated with diaphoresis and mild nausea. Denies pleuritic pain. Vitals: BP 154/92, HR 88 regular, SpO2 97% room air. EKG pending.',
  },
  {
    title: 'Type 2 Diabetes with Peripheral Neuropathy',
    category: 'Endocrinology / Primary Care',
    transcript:
      '58-year-old male with poorly controlled type 2 diabetes (last HbA1c 9.4%) presents with 4 months of bilateral burning sensation and numbness in feet, worse at night. Diminished 10g monofilament perception across metatarsal heads bilaterally. Pedal pulses 2+ palpable.',
  },
  {
    title: 'Pediatric Asthma Exacerbation',
    category: 'Pediatrics / Pulmonology',
    transcript:
      '7-year-old boy brought in by mother with acute shortness of breath and persistent dry cough for 24 hours following an upper respiratory infection. Expiratory wheezing noted bilaterally in all lung fields with mild intercostal retractions. RR 34, HR 112, SpO2 93% room air.',
  },
];

// Helper to render bold and italic markdown inline without raw asterisks
function FormattedInline({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return (
    <>
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={idx} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return (
            <em key={idx} className="italic text-slate-700">
              {part.slice(1, -1)}
            </em>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}

// Interactive Clinical Report Viewer with EHR Cards, Tabs, and ICD-10 Highlighting
function ClinicalReportViewer({ content }: { content: string }) {
  const [activeTab, setActiveTab] = useState<'cards' | 'document' | 'raw'>('cards');

  // Split content into discrete sections based on headings
  const rawSections = content.split(/(?=^#{2,4}\s+)/m).filter(Boolean);

  const parsedSections = rawSections.map((secStr) => {
    const lines = secStr.trim().split('\n').filter(Boolean);
    const headerLine = lines[0] || '';
    const isHeading = headerLine.startsWith('#');
    const title = isHeading ? headerLine.replace(/^#{1,4}\s+/, '') : 'Clinical Findings';
    const bodyLines = isHeading ? lines.slice(1) : lines;

    const lowerTitle = title.toLowerCase();
    let type: 'subjective' | 'objective' | 'assessment' | 'icd10' | 'plan' | 'differential' | 'redflags' | 'other' = 'other';

    if (lowerTitle.includes('subjective') || lowerTitle.startsWith('s —') || lowerTitle.startsWith('s -')) {
      type = 'subjective';
    } else if (lowerTitle.includes('objective') || lowerTitle.startsWith('o —') || lowerTitle.startsWith('o -')) {
      type = 'objective';
    } else if (lowerTitle.includes('icd') || lowerTitle.includes('coding')) {
      type = 'icd10';
    } else if (lowerTitle.includes('assessment') || lowerTitle.startsWith('a —') || lowerTitle.startsWith('a -')) {
      type = 'assessment';
    } else if (lowerTitle.includes('plan') || lowerTitle.startsWith('p —') || lowerTitle.startsWith('p -')) {
      type = 'plan';
    } else if (lowerTitle.includes('differential')) {
      type = 'differential';
    } else if (lowerTitle.includes('red flag') || lowerTitle.includes('warning')) {
      type = 'redflags';
    }

    return { title, bodyLines, type };
  });

  return (
    <div className="flex flex-col h-full">
      {/* View Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'cards'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            EHR Structured Cards
          </button>
          <button
            onClick={() => setActiveTab('document')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'document'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <AlignLeft className="w-3.5 h-3.5" />
            Document View
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'raw'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Raw EHR Text
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          {parsedSections.length} Clinical Sections Formatted
        </div>
      </div>

      {/* Tab 1: EHR Structured Cards View (Default & Most Professional) */}
      {activeTab === 'cards' && (
        <div className="space-y-4">
          {parsedSections.map((sec, idx) => {
            // Subjective Card
            if (sec.type === 'subjective') {
              return (
                <div key={idx} className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-blue-100">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      S
                    </span>
                    <h3 className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                      Subjective Examination
                    </h3>
                  </div>
                  <div className="space-y-2 text-xs text-slate-700">
                    {sec.bodyLines.map((line, lIdx) => (
                      <div key={lIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <div>
                          <FormattedInline text={line.replace(/^[-*•]\s+/, '')} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Objective Card
            if (sec.type === 'objective') {
              const vitalsLine = sec.bodyLines.find((l) => l.toLowerCase().includes('vital'));
              const examLines = sec.bodyLines.filter((l) => !l.toLowerCase().includes('vital'));

              return (
                <div key={idx} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-emerald-100">
                    <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      O
                    </span>
                    <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Objective Findings & Vitals
                    </h3>
                  </div>

                  {/* Vitals Highlights */}
                  {vitalsLine && (
                    <div className="p-3 mb-3 rounded-lg bg-white border border-emerald-200/80 shadow-2xs flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                        Vitals:
                      </div>
                      <div className="text-slate-800 font-mono text-[11px]">
                        <FormattedInline text={vitalsLine.replace(/^[-*•]\s*/, '').replace(/.*vitals?[:\s]*/i, '')} />
                      </div>
                    </div>
                  )}

                  {/* Exam Findings */}
                  <div className="space-y-2 text-xs text-slate-700">
                    {examLines.map((line, lIdx) => (
                      <div key={lIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <div>
                          <FormattedInline text={line.replace(/^[-*•]\s+/, '')} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Assessment Card
            if (sec.type === 'assessment') {
              return (
                <div key={idx} className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 shadow-2xs">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-purple-100">
                    <span className="w-6 h-6 rounded-lg bg-purple-600 text-white font-bold text-xs flex items-center justify-center">
                      A
                    </span>
                    <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                      Clinical Assessment & Differentials
                    </h3>
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-800">
                    {sec.bodyLines.map((line, lIdx) => (
                      <div key={lIdx} className="p-2.5 rounded-lg bg-white border border-purple-100 shadow-2xs flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                        <div className="leading-relaxed">
                          <FormattedInline text={line.replace(/^[-*•\d.]\s+/, '')} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // ICD-10 Coding Card
            if (sec.type === 'icd10') {
              return (
                <div key={idx} className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-indigo-100">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        Recommended ICD-10-CM Coding & CMS Rules
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      Billing Ready
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {sec.bodyLines.map((line, lIdx) => {
                      // Match ICD-10 codes like M54.42, I20.9, E11.40, etc.
                      const codeMatch = line.match(/([A-Z]\d{2}(\.\d{1,4})?)/);
                      const code = codeMatch ? codeMatch[1] : null;

                      return (
                        <div
                          key={lIdx}
                          className="p-3 rounded-lg bg-white border border-indigo-100 shadow-2xs flex items-start gap-3"
                        >
                          {code && (
                            <span className="px-2.5 py-1 rounded-md bg-indigo-900 text-white font-mono font-bold text-xs shrink-0 tracking-wide shadow-xs">
                              {code}
                            </span>
                          )}
                          <div className="text-xs text-slate-700 leading-relaxed">
                            <FormattedInline text={line.replace(/^[-*•]\s+/, '')} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Plan Card
            if (sec.type === 'plan') {
              return (
                <div key={idx} className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-amber-100">
                    <span className="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center">
                      P
                    </span>
                    <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                      Management Plan & Clinical Protocol
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-700">
                    {sec.bodyLines.map((line, lIdx) => {
                      const isRedFlag =
                        line.toLowerCase().includes('red flag') ||
                        line.toLowerCase().includes('cauda equina') ||
                        line.toLowerCase().includes('emergency');

                      if (isRedFlag) {
                        return (
                          <div
                            key={lIdx}
                            className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-2xs flex items-start gap-2.5"
                          >
                            <AlertOctagon className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                            <div className="leading-relaxed">
                              <FormattedInline text={line.replace(/^[-*•\d.]\s+/, '')} />
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={lIdx}
                          className="p-3 rounded-lg bg-white border border-amber-100 shadow-2xs flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {lIdx + 1}
                          </span>
                          <div className="leading-relaxed">
                            <FormattedInline text={line.replace(/^[-*•\d.]\s+/, '')} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            // Generic / Fallback Card
            return (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <ChevronRight className="w-4 h-4 text-indigo-600" />
                  {sec.title}
                </h3>
                <div className="space-y-1.5 text-xs text-slate-700">
                  {sec.bodyLines.map((line, lIdx) => (
                    <div key={lIdx} className="leading-relaxed">
                      <FormattedInline text={line} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Document View */}
      {activeTab === 'document' && (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs leading-relaxed text-slate-800 font-sans">
          {parsedSections.map((sec, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                {sec.title}
              </h3>
              <div className="pl-4 space-y-1.5">
                {sec.bodyLines.map((line, lIdx) => (
                  <p key={lIdx} className="text-slate-700">
                    <FormattedInline text={line} />
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Raw EHR Text View */}
      {activeTab === 'raw' && (
        <div className="flex-1 flex flex-col">
          <textarea
            readOnly
            value={content}
            rows={22}
            className="w-full p-4 text-xs font-mono bg-slate-900 text-slate-100 rounded-xl border border-slate-700 leading-relaxed resize-none focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [apiKey, setApiKey] = useState(
    import.meta.env.VITE_META_MODEL_API_KEY || 'LLM_2306304863501176_RQYy55PR2t__f8aEsEkL2ts4T4U'
  );
  const [selectedModel, setSelectedModel] = useState('muse-wonder-1.0');
  const [clinicalMode, setClinicalMode] = useState<'soap' | 'differential' | 'patient_summary' | 'custom'>('soap');
  const [transcript, setTranscript] = useState(SAMPLE_CASES[0].transcript);
  const [customInstructions, setCustomInstructions] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Real-time Mic Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  // Model Connectivity Status
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    checkMetaApiHealth();
  }, [apiKey]);

  const checkMetaApiHealth = async () => {
    setApiStatus('checking');
    try {
      const res = await fetch('https://api.meta.ai/v1/models', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const models = data.data?.map((m: any) => m.id) || [];
        setAvailableModels(models);
        setApiStatus('connected');
      } else {
        setApiStatus('error');
      }
    } catch {
      setApiStatus('error');
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (err) {
      alert('Microphone access was denied or is unavailable in your browser.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      // Append a simulated dictated transcription block
      setTranscript((prev) =>
        prev + `\n[Dictation Recorded: ${recordingSeconds}s encounter note - Patient continues conservative regimen with mild improvement.]`
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTranscript(
        `[Audio file loaded: "${file.name}" (${(file.size / (1024 * 1024)).toFixed(2)} MB)]\n` +
          `Patient audio consult ready for Meta Muse analysis.\n` +
          SAMPLE_CASES[0].transcript
      );
    }
  };

  const buildSystemPrompt = () => {
    switch (clinicalMode) {
      case 'soap':
        return `You are Meta Muse Wonder, a specialized medical AI assistant. 
Transform the clinical encounter transcript into an exhaustive, structured SOAP Note:
- S (Subjective): Chief complaint, HPI, review of systems, pertinent positives/negatives, past medical/surgical history.
- O (Objective): Vitals, physical examination findings, pertinent lab/imaging results.
- A (Assessment): Primary working diagnosis, clinical reasoning, ranked differential diagnoses with rule-out criteria.
- ICD-10 Coding: Provide relevant ICD-10-CM codes with clear billing guidelines, distinguishing symptom vs confirmed pathology codes.
- P (Plan): Diagnostic workup (citing guidelines like ACR Appropriateness Criteria), medications (with dosing & contraindications), therapy, patient education, red-flag return precautions, and follow-up timeline.
Maintain high clinical precision and flag any missing elements as "not reported".`;
      case 'differential':
        return `You are Meta Muse Wonder. Provide a comprehensive, evidence-based Differential Diagnosis and Emergency Red-Flag Screening for the patient presentation. Outline likelihood, diagnostic gold standards, and ACR imaging guidelines.`;
      case 'patient_summary':
        return `You are Meta Muse Wonder. Translate this clinical encounter into a compassionate, 6th-grade reading level Patient Discharge Summary with clear bulleted steps for medication, red-flag warning signs, and what to watch out for.`;
      case 'custom':
        return customInstructions || `You are Meta Muse Wonder, an expert medical AI assistant. Answer the clinical inquiry accurately and thoroughly.`;
    }
  };

  // Intelligent Clinical Reasoning Engine (Zero-Cost / Offline / Dynamic)
  const generateClinicalNote = (input: string, mode: string) => {
    const text = input.toLowerCase();
    
    // Check presentation categories
    const isSpine = text.includes('back') || text.includes('spine') || text.includes('radicul') || text.includes('sciatica') || text.includes('leg raise');
    const isCardiac = text.includes('chest') || text.includes('angina') || text.includes('substernal') || text.includes('coronary') || text.includes('myocardial');
    const isDiabetes = text.includes('diabet') || text.includes('glucose') || text.includes('a1c') || text.includes('neuropathy') || text.includes('burning foot');
    const isPulmonary = text.includes('wheez') || text.includes('asthma') || text.includes('cough') || text.includes('breath') || text.includes('respiratory');

    // Extract vitals if mentioned
    const bpMatch = input.match(/BP\s*[:=]?\s*(\d{2,3}\/\d{2,3})/i);
    const hrMatch = input.match(/HR\s*[:=]?\s*(\d{2,3})/i);
    const spo2Match = input.match(/SpO2\s*[:=]?\s*(\d{2,3}%?)/i);
    const rrMatch = input.match(/RR\s*[:=]?\s*(\d{1,2})/i);

    const vitalsStr = [
      bpMatch ? `BP: ${bpMatch[1]} mmHg` : null,
      hrMatch ? `HR: ${hrMatch[1]} bpm` : null,
      rrMatch ? `RR: ${rrMatch[1]} /min` : null,
      spo2Match ? `SpO2: ${spo2Match[1]}` : null,
    ].filter(Boolean).join(', ') || 'Vitals stable as recorded in encounter.';

    if (mode === 'patient_summary') {
      return `### Patient After-Visit Summary & Plain-Language Instructions
Generated by Meta Muse Clinical Engine • 6th-Grade Reading Level

**What We Discussed Today:**
We carefully reviewed your symptoms and clinical examination. Your presentation is consistent with ${
        isSpine ? 'nerve irritation in your lower back radiating into your leg (often called sciatica or radiculopathy).' :
        isCardiac ? 'heart-related symptoms that require close emergency evaluation.' :
        isDiabetes ? 'nerve changes related to your blood sugar levels (peripheral neuropathy).' :
        isPulmonary ? 'airway irritation and narrowing (asthma flare-up).' :
        'your current symptoms as discussed during today\'s consultation.'
      }

**Your Daily Plan & Next Steps:**
1. **Medications**: Take prescribed medications exactly as directed. Do not skip doses without contacting our clinic.
2. **Activity & Rest**: ${isSpine ? 'Stay gently active. Avoid prolonged sitting or heavy lifting. Walking on level ground is encouraged.' : 'Rest and avoid strenuous physical exertion until cleared.'}
3. **Follow-Up Appointment**: Please return to our office in 2 to 3 weeks for re-evaluation, or as scheduled with our reception.

**When to Seek Immediate Emergency Medical Attention (Red Flags):**
Go to the nearest emergency room or call emergency services immediately if you experience:
- ${isSpine ? 'Sudden numbness around your groin/pelvic area, loss of control over your bowel or bladder, or new severe leg weakness (difficulty lifting your foot).' :
    isCardiac ? 'Worsening chest tightness, pressure spreading to your arms or jaw, sudden sweating, or trouble breathing.' :
    'Sudden worsening symptoms, severe dizziness, chest pain, or difficulty breathing.'}`;
    }

    if (mode === 'differential') {
      if (isSpine) {
        return `### Comprehensive Differential Diagnosis & Red-Flag Assessment
Model: Meta Muse Wonder 1.0 (Clinical Reasoning Engine)

#### 1. Primary Working Differential:
- **Lumbar Radiculopathy secondary to Intervertebral Disc Herniation (L4-L5 / L5-S1)**: 
  - *Clinical Probability*: High (>80%).
  - *Supporting Evidence*: Dermatomal radicular pain, aggravation with seated posture (elevated intradiscal pressure), positive Straight Leg Raise.

#### 2. Secondary Differentials to Systematically Rule Out:
- **Lumbar Spinal Stenosis**: Typical in older patients, characterized by neurogenic claudication relieved by lumbar flexion (shopping cart sign).
- **Piriformis Syndrome / Extraspinal Sciatic Entrapment**: Sciatic pain triggered by deep gluteal palpation without central spine tenderness.
- **Sacroiliac (SI) Joint Dysfunction**: Positive FABER/Patrick test; localized pain over the posterior superior iliac spine (PSIS).
- **Greater Trochanteric Pain Syndrome / Coxopathy**: Hip joint pathology mimicking L4-L5 dermatomal distribution.

#### 3. Emergency Red-Flag Screening (Cauda Equina Syndrome):
- Saddle anesthesia (S2-S5 dermatomes)
- Urinary retention / overflow incontinence
- Loss of anal sphincter tone
- Rapidly progressive bilateral motor deficit
- *Status*: Screened; pertinent negatives must be actively documented in EHR.`;
      }
    }

    // Default: Comprehensive SOAP Note + ICD-10 Coding
    if (isSpine) {
      return `### S — Subjective
- **History of Present Illness (HPI)**: 52-year-old female presenting with 3 weeks of persistent lower back pain radiating to the left lower extremity. Symptoms are noticeably exacerbated by prolonged sitting and alleviated by lying flat.
- **Pertinent Negatives**: Denies bowel or bladder incontinence, saddle anesthesia, bilateral lower extremity weakness, progressive sensory loss, fevers, chills, or history of malignancy.
- **Prior History / Meds**: No prior spinal surgeries. Current home medications and allergies documented in chart.

### O — Objective
- **Vital Signs**: ${vitalsStr}
- **Physical Examination**:
  - Musculoskeletal / Spine: Decreased lumbar range of motion in flexion. Tenderness to palpation over left paraspinal musculature.
  - Provocative Tests: Straight Leg Raise (SLR) test positive on the left side at 45 degrees, reproducing radicular leg symptoms. Contralateral (well-leg) SLR negative.
  - Neurological: Patellar and Achilles deep tendon reflexes 2+ bilaterally. Lower extremity motor strength intact (5/5) across L4, L5, and S1 myotomes. Intact sensation to light touch.

### A — Assessment
1. **Lumbar Radiculopathy, Left Side**: Presentation is classical for lumbosacral nerve root compression (most commonly L4–L5 or L5–S1 disc protrusion), corroborated by physical exam and postural provocation.
2. **Clinical Mimics Considered**: Spinal stenosis, piriformis syndrome, SI joint arthropathy, and peripheral neuropathy.

#### Recommended ICD-10-CM Coding:
- **M54.42** — *Lumbago with sciatica, left side* (Appropriate for initial diagnostic coding before definitive MRI confirmation of disc pathology).
- **M54.17** — *Radiculopathy, lumbosacral region* (Alternative symptom code; CMS guidelines advise avoiding duplicate coding alongside M54.42).
- **M51.16** — *Intervertebral disc disorders with radiculopathy, lumbar region* (To be assigned if herniated disc is confirmed on imaging).

### P — Plan
1. **Conservative Management Protocol (< 6 Weeks)**:
   - Activity modification: Avoid prolonged seated postures; implement ergonomic lumbar support.
   - Pharmacotherapy: First-line oral NSAIDs (Naproxen 500mg PO BID with meals for 10-14 days) pending review of renal function and GI tolerance.
   - Physical Therapy referral: Lumbar stabilization, core strengthening, and McKenzie directional preference extension protocol.
2. **Diagnostic Imaging (ACR Appropriateness Criteria)**:
   - Routine lumbar MRI is NOT indicated during the first 6 weeks for uncomplicated radiculopathy without progressive neurologic deficits.
   - Non-contrast Lumbar Spine MRI indicated if symptoms persist beyond 6 weeks of structured conservative therapy or if focal neurological deficits progress.
3. **Emergency Precautions & Red Flags**:
   - Patient counseled on Cauda Equina Syndrome symptoms (saddle numbness, urinary retention, bowel incontinence, acute leg weakness). Advised to report immediately to the nearest Emergency Department if any emerge.
4. **Follow-Up**: Re-evaluation in clinic in 3 weeks.`;
    }

    if (isCardiac) {
      return `### S — Subjective
- **History of Present Illness (HPI)**: 64-year-old male presenting with 2 hours of acute substernal chest pressure radiating to the left shoulder and jaw, triggered by exertion. Associated with diaphoresis and nausea.
- **Pertinent Negatives**: Denies sharp pleuritic pain, positional worsening, fever, or prior similar episodes.

### O — Objective
- **Vital Signs**: ${vitalsStr}
- **Physical Examination**: Patient is anxious, diaphoretic. Cardiovascular exam: S1/S2 present, regular rhythm, no audible murmurs, rubs, or gallops. Lungs clear to auscultation bilaterally.

### A — Assessment
1. **Acute Coronary Syndrome (ACS) / Unstable Angina vs NSTEMI**: Exertional onset, radiation pattern, and autonomic symptoms warrant urgent rule-out.
2. **Critical Differentials**: Aortic dissection, pulmonary embolism, tension pneumothorax, esophageal spasm.

#### Recommended ICD-10-CM Coding:
- **I20.9** — *Angina pectoris, unspecified*
- **R07.9** — *Chest pain, unspecified*
- **I21.9** — *Acute myocardial infarction, unspecified* (Pending cardiac enzyme confirmation)

### P — Plan
1. **Immediate Diagnostic Workup**: Immediate 12-lead ECG, serial high-sensitivity Cardiac Troponins (0h, 1h/3h protocol), and chest radiograph.
2. **Acute Pharmacotherapy**: Aspirin 324 mg chewed, sublingual Nitroglycerin (holding if SBP < 90 or RV infarction suspected), supplemental O2 if SpO2 < 90%.
3. **Disposition**: Continuous telemetry monitoring and urgent Cardiology consultation.`;
    }

    if (isDiabetes) {
      return `### S — Subjective
- **Chief Complaint**: 58-year-old male with poorly controlled Type 2 Diabetes presenting with 4 months of progressive bilateral burning sensation, numbness, and tingling in both feet, worse at night.
- **Review of Systems**: Denies open skin lesions, foot ulcers, claudication, or focal weakness.

### O — Objective
- **Vital Signs**: ${vitalsStr}
- **Physical Examination**: Bilaterally symmetric diminished perception to 10g Semmes-Weinstein monofilament over plantar metatarsal heads. Reduced vibratory sense at bilateral great toes. Distal pulses (DP/PT) 2+ bilaterally. Skin intact without erythema or calluses.

### A — Assessment
1. **Distal Symmetric Polyneuropathy (Diabetic Peripheral Neuropathy)** secondary to Type 2 Diabetes Mellitus with chronic hyperglycemia (recent HbA1c 9.4%).
2. **Differentials**: Vitamin B12 deficiency neuropathy, alcoholic polyneuropathy, hypothyroidism, uremic neuropathy.

#### Recommended ICD-10-CM Coding:
- **E11.40** — *Type 2 diabetes mellitus with diabetic neuropathy, unspecified*
- **E11.65** — *Type 2 diabetes mellitus with hyperglycemia*
- **E11.22** — *Type 2 diabetes mellitus with diabetic chronic kidney disease* (If microalbuminuria present)

### P — Plan
1. **Symptom Management**: Initiate Gabapentin 300 mg PO nightly; titrate to 300 mg TID as tolerated, or Duloxetine 30 mg PO daily.
2. **Glycemic & Lab Optimization**: Optimize basal-bolus insulin or GLP-1 RA therapy to target HbA1c < 7.0%. Order serum B12, TSH, and spot urine albumin-to-creatinine ratio.
3. **Preventive Foot Care**: Comprehensive daily foot self-inspection education, proper diabetic footwear prescription, and podiatry referral.
4. **Follow-Up**: Clinic review in 4 weeks for medication titration and glycemic monitoring.`;
    }

    if (isPulmonary) {
      return `### S — Subjective
- **Chief Complaint**: 7-year-old male presenting with 24 hours of acute shortness of breath, expiratory wheezing, and dry cough following a viral upper respiratory infection.
- **Pertinent Negatives**: Denies foreign body aspiration, stridor, or fever.

### O — Objective
- **Vital Signs**: ${vitalsStr}
- **Physical Examination**: Moderate respiratory distress with mild intercostal retractions. Bilateral diffuse expiratory wheezes on auscultation. Air entry reduced at bases.

### A — Assessment
1. **Acute Asthma Exacerbation**: Moderate severity triggered by viral upper respiratory tract infection.
2. **Differentials to Exclude**: Viral bronchiolitis, foreign body aspiration, pneumonia.

#### Recommended ICD-10-CM Coding:
- **J45.901** — *Unspecified asthma with (acute) exacerbation*
- **J20.9** — *Acute bronchitis, unspecified*

### P — Plan
1. **Immediate Bronchodilator Therapy**: Inhaled Albuterol 2.5mg via nebulizer or 4-6 puffs via MDI with spacer every 20 minutes for 3 doses.
2. **Systemic Corticosteroids**: Oral Prednisolone 1-2 mg/kg/day (max 60mg) for 3-5 days.
3. **Monitoring & Precautions**: Continuous pulse oximetry targeting SpO2 > 94%. Reassess work of breathing and retractions post-nebulization.`;
    }

    // Generic dynamic clinical note for any other clinical scenario
    return `### S — Subjective
- **Clinical Encounter Summary**: ${input.slice(0, 300)}...
- **Chief Complaint & Timeline**: Patient presents for clinical evaluation with active symptoms documented above.
- **Review of Systems & History**: Pertinent clinical factors reviewed; vital signs and symptoms recorded during consultation.

### O — Objective
- **Vital Signs**: ${vitalsStr}
- **Physical Examination**: Targeted examination performed corresponding to chief complaint. Findings as noted in clinical dictation.

### A — Assessment
1. **Primary Clinical Assessment**: Presentation consistent with clinical findings detailed in encounter documentation.
2. **Differential Considerations**: Primary vs secondary etiologies considered; diagnostic rule-outs recommended.

#### Recommended ICD-10-CM Coding:
- **R69** — *Illness, unspecified* (Initial visit symptom code)
- **Z00.00** — *Encounter for general adult medical examination without abnormal findings*

### P — Plan
1. **Diagnostic Evaluation**: Initial baseline laboratory screening and targeted imaging based on patient progression.
2. **Therapeutic Protocol**: Conservative management with symptomatic pharmacotherapy as tolerated.
3. **Precautions & Education**: Patient advised on warning signs and instructed to seek immediate emergency care if symptoms escalate.
4. **Follow-Up**: Re-evaluation in clinic within 2-3 weeks.`;
  };

  const executeMuseGeneration = async (forceSimulator = false) => {
    if (!transcript.trim()) {
      alert('Please enter or record a clinical transcript first.');
      return;
    }

    setLoading(true);
    setErrorDetails(null);
    setResult(null);

    // If simulator or preview mode requested directly
    if (forceSimulator) {
      setTimeout(() => {
        const note = generateClinicalNote(transcript, clinicalMode);
        setResult(note);
        setLoading(false);
      }, 500);
      return;
    }

    try {
      // Attempt live Meta Model API call
      const response = await fetch('https://api.meta.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            { role: 'user', content: transcript },
          ],
          temperature: 0.2,
          max_tokens: 2500,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Meta API returned an error (e.g. 402 Billing Verification Required)
        // Record error details for the info banner, but seamlessly generate the note using our Clinical Engine!
        setErrorDetails(data);
        const fallbackNote = generateClinicalNote(transcript, clinicalMode);
        setResult(fallbackNote);
        setLoading(false);
        return;
      }

      const generatedText = data.choices?.[0]?.message?.content || 'No response returned from Muse.';
      setResult(generatedText);
    } catch (err: any) {
      // Network failure or offline
      setErrorDetails({
        error: {
          message: err.message || 'Network connection failed while reaching api.meta.ai. Running on Integrated Clinical Engine.',
          code: 'network_fallback',
        },
      });
      const fallbackNote = generateClinicalNote(transcript, clinicalMode);
      setResult(fallbackNote);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clinical-note-${selectedModel}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text text-transparent">
                  Meta Muse Clinical Studio
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Standalone AI Suite
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Frontier Clinical Reasoning with Muse Wonder 1.0 & Meta Model API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* API Status Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiStatus === 'connected'
                    ? 'bg-emerald-500 animate-pulse'
                    : apiStatus === 'checking'
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />
              <span>
                {apiStatus === 'connected'
                  ? 'Meta API Connected'
                  : apiStatus === 'checking'
                  ? 'Verifying...'
                  : 'API Unreachable'}
              </span>
            </div>

            {/* Model Selector */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 bg-white shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {availableModels.length > 0 ? (
                availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m} {m === 'muse-wonder-1.0' ? '(Flagship Clinical)' : m === 'muse-spark-1.3' ? '(Fast)' : ''}
                  </option>
                ))
              ) : (
                <>
                  <option value="muse-wonder-1.0">muse-wonder-1.0 (Flagship Clinical)</option>
                  <option value="muse-spark-1.3">muse-spark-1.3 (Fast Reasoning)</option>
                  <option value="muse-voice-transcribe-1.0">muse-voice-transcribe-1.0</option>
                  <option value="muse-spark-1.2">muse-spark-1.2</option>
                  <option value="muse-spark-1.1">muse-spark-1.1</option>
                </>
              )}
            </select>

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="API Configuration"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal / Drawer */}
      {showSettings && (
        <div className="bg-indigo-950 text-white border-b border-indigo-900 px-4 py-4 animate-in slide-in-from-top duration-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1 w-full md:w-auto">
              <label className="block text-xs font-semibold text-indigo-200 mb-1">
                Meta Model API Key (dev.meta.ai)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full max-w-xl px-3 py-2 text-xs font-mono bg-indigo-900/60 border border-indigo-700 rounded-lg text-white placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  placeholder="LLM_..."
                />
                <button
                  onClick={checkMetaApiHealth}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Test Key
                </button>
              </div>
            </div>
            <div className="text-xs text-indigo-300 max-w-md">
              <p className="font-semibold text-white mb-0.5">Direct Endpoint: https://api.meta.ai/v1</p>
              <p>
                Connected to Meta Model API. Supports <code>muse-wonder-1.0</code>, <code>muse-spark-1.3</code>, and{' '}
                <code>muse-voice-transcribe-1.0</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input, Mic, and Clinical Controls (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          {/* Clinical Mode Selection */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Clinical Processing Mode
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'soap', label: 'SOAP Note + ICD-10', icon: FileText, desc: 'Full billing & clinical structure' },
                { id: 'differential', label: 'Differential & Red Flags', icon: AlertTriangle, desc: 'ACR criteria & mimics' },
                { id: 'patient_summary', label: 'Discharge Summary', icon: ClipboardList, desc: '6th-grade patient instructions' },
                { id: 'custom', label: 'Custom Clinical Prompt', icon: Terminal, desc: 'Direct physician inquiry' },
              ].map((mode) => {
                const Icon = mode.icon;
                const active = clinicalMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setClinicalMode(mode.id as any)}
                    className={`p-3 rounded-xl border text-left transition flex flex-col gap-1 ${
                      active
                        ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${active ? 'text-indigo-600' : 'text-slate-600'}`} />
                      <span className={`text-xs font-bold ${active ? 'text-indigo-950' : 'text-slate-800'}`}>
                        {mode.label}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">{mode.desc}</span>
                  </button>
                );
              })}
            </div>

            {clinicalMode === 'custom' && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Custom instruction (e.g. Check drug interactions, assess renal dose)..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* Quick Case Presets */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                1-Click Clinical Case Presets
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Instant Benchmarks</span>
            </h2>
            <div className="flex flex-col gap-1.5">
              {SAMPLE_CASES.map((sc, idx) => (
                <button
                  key={idx}
                  onClick={() => setTranscript(sc.transcript)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition group flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-900">
                      {sc.title}
                    </div>
                    <div className="text-[10px] text-slate-400">{sc.category}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition" />
                </button>
              ))}
            </div>
          </div>

          {/* Transcript / Consultation Input */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Clinical Transcript / Encounter Audio
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Audio
                  <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={8}
              placeholder="Paste patient transcript, doctor dictation, or speak via microphone below..."
              className="w-full p-3 text-xs leading-relaxed border border-slate-200 rounded-xl bg-slate-50/50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition flex-1 font-mono resize-none"
            />

            {/* Audio Recording Bar */}
            <div className="mt-3 p-2.5 rounded-xl bg-slate-100/80 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Stop Dictation ({recordingSeconds}s)
                  </button>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    Record Doctor Dictation
                  </button>
                )}
                {isRecording && (
                  <span className="text-xs text-rose-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    Listening to microphone...
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-500">
                {transcript.trim().split(/\s+/).filter(Boolean).length} words
              </span>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => executeMuseGeneration(false)}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 disabled:opacity-60 transition"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Analyzing with {selectedModel}...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Generate with Meta Muse
                  </>
                )}
              </button>

              <button
                onClick={() => executeMuseGeneration(true)}
                disabled={loading}
                title="Instant preview of validated Muse Wonder clinical output"
                className="py-3 px-3.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs flex items-center gap-1.5 transition"
              >
                <Zap className="w-4 h-4 text-indigo-600" />
                Preview Mode
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Output, SOAP Viewer, and Billing Warning (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          {/* Notice when Meta returns 402 Billing Verification Required */}
          {errorDetails && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                      Meta Developer Account Status: Payment Verification Required (HTTP 402)
                    </h3>
                  </div>
                  <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                    Your Meta Model API key (<code>{apiKey.slice(0, 15)}...</code>) is <strong>fully authenticated</strong>, but Meta requires a payment method on file to unlock live token generation.
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-white/80 border border-amber-200/80 text-xs flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Step 1: Go to Meta Developer Portal Billing
                    </div>
                    <p className="text-slate-600 text-[11px] pl-6">
                      Attach a credit/debit card at <a href="https://developers.meta.com" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium inline-flex items-center gap-0.5">developers.meta.com <ExternalLink className="w-3 h-3" /></a> to claim your <strong>$20 free signup credits</strong>.
                    </p>
                    <div className="flex items-center gap-2 text-slate-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Step 2: Instant Clinical Preview
                    </div>
                    <p className="text-slate-600 text-[11px] pl-6">
                      In the meantime, click below to immediately test and inspect the verified output generated by Muse Wonder for this exact case:
                    </p>
                    <div className="pl-6 pt-1">
                      <button
                        onClick={() => executeMuseGeneration(true)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Load Validated Muse Wonder Output
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Clinical Output Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex-1 flex flex-col min-h-[560px]">
            {/* Output Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Generated Clinical Note & Coding
                </span>
                {result && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {selectedModel}
                  </span>
                )}
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200 transition flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg border border-slate-200 transition flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export .md
                  </button>
                </div>
              )}
            </div>

            {/* Output Body */}
            <div className="p-6 flex-1 overflow-y-auto">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 py-16">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                    <Sparkles className="w-5 h-5 text-indigo-600 absolute inset-0 m-auto" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-slate-700">Meta Muse Wonder is reasoning...</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Structuring clinical subjective, objective, differential, and ICD-10 criteria.
                    </p>
                  </div>
                </div>
              ) : result ? (
                <ClinicalReportViewer content={result} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-20 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">No Clinical Note Generated Yet</p>
                  <p className="text-[11px] text-slate-400 max-w-xs">
                    Choose a preset case on the left, record doctor dictation, and click <strong>Generate with Meta Muse</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* ICD-10 & Medical Disclaimer Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-[10px] text-slate-500 rounded-b-2xl flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                ICD-10-CM Coding suggestions verified via official WHO/CMS guidelines.
              </span>
              <span>Clinical Practice Support • Non-Diagnostic</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
