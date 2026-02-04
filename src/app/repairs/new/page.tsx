'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Wrench, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'SMARTPHONE', label: 'Smartphone' },
  { value: 'LAPTOP', label: 'Laptop' },
  { value: 'TABLET', label: 'Tablet' },
  { value: 'DESKTOP', label: 'Desktop Computer' },
  { value: 'TV', label: 'Television' },
  { value: 'APPLIANCE', label: 'Home Appliance' },
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'HVAC', label: 'HVAC / Climate Control' },
  { value: 'PLUMBING', label: 'Plumbing' },
  { value: 'ELECTRICAL', label: 'Electrical' },
  { value: 'OTHER', label: 'Other' },
];

const URGENCY_LEVELS = [
  { value: 'LOW', label: 'Low - Can wait a few weeks', color: 'text-gray-600' },
  { value: 'NORMAL', label: 'Normal - Within a week', color: 'text-blue-600' },
  { value: 'HIGH', label: 'High - Within a few days', color: 'text-orange-600' },
  { value: 'EMERGENCY', label: 'Emergency - ASAP', color: 'text-red-600' },
];

interface DiagnosisResult {
  diagnosis: string;
  possibleCauses: string[];
  recommendedActions: string[];
  estimatedCostRange: { min: number; max: number };
  urgencyLevel: string;
  confidence: number;
  diyPossible: boolean;
  diyInstructions?: string;
  warningNotes?: string[];
}

export default function NewRepairPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'NORMAL',
    deviceType: '',
    deviceBrand: '',
    deviceModel: '',
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin?callbackUrl=/repairs/new');
    return null;
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/repair-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create repair request');
      }

      setDiagnosis(data.diagnosis);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isElectronics = ['SMARTPHONE', 'LAPTOP', 'TABLET', 'DESKTOP', 'TV'].includes(
    formData.category
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                    step >= s
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s ? <CheckCircle className="h-5 w-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > s ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600">
            <span>Details</span>
            <span>Review</span>
            <span>Diagnosis</span>
          </div>
        </div>

        <div className="card">
          {step === 1 && (
            <form onSubmit={() => setStep(2)}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Tell us about your repair
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What needs to be repaired? *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="input"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., iPhone screen cracked"
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the problem in detail *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell us what happened, any symptoms, error messages, etc."
                    required
                    className="input"
                  />
                </div>

                {isElectronics && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Device Type
                      </label>
                      <input
                        type="text"
                        name="deviceType"
                        value={formData.deviceType}
                        onChange={handleInputChange}
                        placeholder="e.g., Phone"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        name="deviceBrand"
                        value={formData.deviceBrand}
                        onChange={handleInputChange}
                        placeholder="e.g., Apple"
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Model
                      </label>
                      <input
                        type="text"
                        name="deviceModel"
                        value={formData.deviceModel}
                        onChange={handleInputChange}
                        placeholder="e.g., iPhone 14"
                        className="input"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How urgent is this repair?
                  </label>
                  <div className="space-y-2">
                    {URGENCY_LEVELS.map((level) => (
                      <label
                        key={level.value}
                        className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value={level.value}
                          checked={formData.urgency === level.value}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <span className={level.color}>{level.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={!formData.category || !formData.title || !formData.description}
                >
                  Continue
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Review your request
              </h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-red-700">{error}</span>
                </div>
              )}

              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">
                    {CATEGORIES.find((c) => c.value === formData.category)?.label}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Title</span>
                  <span className="font-medium">{formData.title}</span>
                </div>
                <div className="py-2 border-b">
                  <span className="text-gray-600 block mb-1">Description</span>
                  <span className="text-gray-900">{formData.description}</span>
                </div>
                {isElectronics && (formData.deviceBrand || formData.deviceModel) && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Device</span>
                    <span className="font-medium">
                      {[formData.deviceBrand, formData.deviceModel].filter(Boolean).join(' ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Urgency</span>
                  <span className="font-medium">
                    {URGENCY_LEVELS.find((u) => u.value === formData.urgency)?.label.split(' - ')[0]}
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                      Getting AI Diagnosis...
                    </>
                  ) : (
                    'Submit & Get Diagnosis'
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 3 && diagnosis && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  AI Diagnosis Complete
                </h2>
                <p className="text-gray-600 mt-2">
                  Confidence: {Math.round(diagnosis.confidence * 100)}%
                </p>
              </div>

              <div className="space-y-6">
                <div className="bg-primary-50 rounded-lg p-4">
                  <h3 className="font-semibold text-primary-900 mb-2">Diagnosis</h3>
                  <p className="text-primary-800">{diagnosis.diagnosis}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Possible Causes</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {diagnosis.possibleCauses.map((cause, i) => (
                      <li key={i}>{cause}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Recommended Actions</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {diagnosis.recommendedActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Estimated Cost</h3>
                  <p className="text-2xl font-bold text-primary-600">
                    ${diagnosis.estimatedCostRange.min} - ${diagnosis.estimatedCostRange.max}
                  </p>
                </div>

                {diagnosis.diyPossible && diagnosis.diyInstructions && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-green-900 mb-2">
                      DIY Option Available
                    </h3>
                    <p className="text-green-800">{diagnosis.diyInstructions}</p>
                  </div>
                )}

                {diagnosis.warningNotes && diagnosis.warningNotes.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
                    <ul className="list-disc list-inside space-y-1 text-yellow-800">
                      {diagnosis.warningNotes.map((note, i) => (
                        <li key={i}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => router.push('/shops')}
                    className="btn-primary flex-1"
                  >
                    Find Repair Shops
                  </button>
                  <button
                    onClick={() => router.push('/repairs')}
                    className="btn-secondary flex-1"
                  >
                    View My Repairs
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
