import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface OpportunityIntakeProps {
  isDark: boolean;
}

export default function OpportunityIntake({ isDark }: OpportunityIntakeProps) {
  const [formData, setFormData] = useState({
    opportunityName: '',
    opportunityType: '',
    capitalRequested: '',
    location: '',
    description: ''
  });
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    console.log('Save Draft:', formData, attachments);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submit:', formData, attachments);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Opportunity Intake
        </h2>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Submit a new opportunity for review
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className={`dashboard-card p-8 ${!isDark && 'bg-white border-gray-200 shadow-sm'}`}>
            <div className="space-y-6">
              {/* Opportunity Name */}
              <div>
                <label
                  htmlFor="opportunityName"
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Opportunity Name
                  <span className="text-[#f59e0b] ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="opportunityName"
                  name="opportunityName"
                  value={formData.opportunityName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                    isDark
                      ? 'bg-[#0f172a] border-[#1f2937] text-white focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]'
                  } outline-none`}
                  placeholder="Enter opportunity name"
                />
              </div>

              {/* Opportunity Type */}
              <div>
                <label
                  htmlFor="opportunityType"
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Opportunity Type
                  <span className="text-[#f59e0b] ml-1">*</span>
                </label>
                <select
                  id="opportunityType"
                  name="opportunityType"
                  value={formData.opportunityType}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                    isDark
                      ? 'bg-[#0f172a] border-[#1f2937] text-white focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]'
                  } outline-none`}
                >
                  <option value="">Select opportunity type</option>
                  <option value="expansion">Business Expansion</option>
                  <option value="acquisition">Acquisition</option>
                  <option value="refinancing">Refinancing</option>
                  <option value="equipment">Equipment Purchase</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="working-capital">Working Capital</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Capital Requested */}
              <div>
                <label
                  htmlFor="capitalRequested"
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Capital Requested
                  <span className="text-[#f59e0b] ml-1">*</span>
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    $
                  </span>
                  <input
                    type="text"
                    id="capitalRequested"
                    name="capitalRequested"
                    value={formData.capitalRequested}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-8 pr-4 py-2.5 rounded-lg border transition-all ${
                      isDark
                        ? 'bg-[#0f172a] border-[#1f2937] text-white focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]'
                        : 'bg-white border-gray-300 text-gray-900 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]'
                    } outline-none`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Location
                  <span className="text-[#f59e0b] ml-1">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all ${
                    isDark
                      ? 'bg-[#0f172a] border-[#1f2937] text-white focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]'
                  } outline-none`}
                  placeholder="City, State or Region"
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Description
                  <span className="text-[#f59e0b] ml-1">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className={`w-full px-4 py-2.5 rounded-lg border transition-all resize-none ${
                    isDark
                      ? 'bg-[#0f172a] border-[#1f2937] text-white focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]'
                      : 'bg-white border-gray-300 text-gray-900 focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]'
                  } outline-none`}
                  placeholder="Provide a detailed description of the opportunity"
                />
              </div>

              {/* Attachments */}
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                >
                  Attachments
                </label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                    isDark
                      ? 'border-[#1f2937] hover:border-[#f59e0b]'
                      : 'border-gray-300 hover:border-[#f59e0b]'
                  }`}
                >
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload
                      className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                      size={32}
                    />
                    <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Click to upload files
                    </span>
                    <span className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      PDF, DOC, XLS, or images
                    </span>
                  </label>
                </div>

                {/* File List */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isDark ? 'bg-[#0f172a]' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                            isDark ? 'bg-[#1e293b]' : 'bg-gray-200'
                          }`}>
                            <Upload size={16} className="text-[#f59e0b]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              {file.name}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className={`p-1 rounded hover:bg-red-500/10 transition-colors flex-shrink-0 ${
                            isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'
                          }`}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-[#1f2937]">
              <button
                type="button"
                onClick={handleSaveDraft}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  isDark
                    ? 'bg-[#0f172a] text-gray-300 hover:bg-[#1e293b] border border-[#1f2937]'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                Save Draft
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#f59e0b] text-white rounded-lg font-medium hover:bg-[#d97706] transition-all hover:shadow-lg hover:shadow-[#f59e0b]/20"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
