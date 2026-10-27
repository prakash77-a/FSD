import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FileText,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Send,
  Building2,
  Flag,
  Layers,
} from 'lucide-react';
import api from '../services/api.ts';

const CATEGORIES = [
  'Infrastructure',
  'Technical Issue',
  'Maintenance',
  'Staff or Service',
  'Billing',
  'Other',
];

const PRIORITIES: Array<{ value: 'Low' | 'Medium' | 'High'; label: string; desc: string }> = [
  { value: 'Low', label: 'Low Priority', desc: 'Minor inconvenience; does not block work' },
  { value: 'Medium', label: 'Medium Priority', desc: 'Affects daily tasks or team operations' },
  { value: 'High', label: 'High Priority', desc: 'Severe outage, hazard, or business disruption' },
];

export const SubmitComplaint: React.FC = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technical Issue');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [locationOrDepartment, setLocationOrDepartment] = useState('');
  const [description, setDescription] = useState('');

  // Field validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Please provide a clear title for the complaint.';
    } else if (title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }

    if (!category) {
      errs.category = 'Please choose a complaint category.';
    }

    if (!description.trim()) {
      errs.description = 'Please provide detailed information describing the issue.';
    } else if (description.trim().length < 10) {
      errs.description = 'Description must be at least 10 characters long.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/complaints', {
        title: title.trim(),
        category,
        priority,
        locationOrDepartment: locationOrDepartment.trim(),
        description: description.trim(),
      });

      if (res.data.success && res.data.complaint) {
        const id = res.data.complaint._id;
        // Redirect directly to the newly created complaint details page
        navigate(`/complaints/${id}?created=true`);
      } else {
        setServerError(res.data.message || 'Submission failed.');
      }
    } catch (err: any) {
      console.error('Submit complaint error:', err);
      setServerError(
        err.response?.data?.message || 'Failed to submit complaint. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          to="/complaints"
          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Complaints
        </Link>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight mt-2">
          Submit New Complaint
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Provide accurate details about the issue to ensure timely triaging and resolution by the responsible department.
        </p>
      </div>

      {serverError && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-xs font-semibold text-gray-700">
            Complaint Subject / Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Network switch offline on 4th floor engineering wing"
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
              errors.title
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-[11px] text-rose-600">{errors.title}</p>
          )}
        </div>

        {/* Category & Location grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-gray-400" />
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="location" className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-gray-400" />
              Location or Department (Optional)
            </label>
            <input
              id="location"
              type="text"
              value={locationOrDepartment}
              onChange={(e) => setLocationOrDepartment(e.target.value)}
              placeholder="e.g. Building 2, Lab 402 or Finance Dept"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Priority Radio Cards */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
            <Flag className="h-3.5 w-3.5 text-gray-400" />
            Severity Priority <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRIORITIES.map((p) => {
              const isSelected = priority === p.value;
              return (
                <label
                  key={p.value}
                  className={`relative flex flex-col p-3 rounded-md border cursor-pointer transition text-xs ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 text-blue-900'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{p.label}</span>
                    <input
                      type="radio"
                      name="priority"
                      value={p.value}
                      checked={isSelected}
                      onChange={() => setPriority(p.value)}
                      className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <span className="mt-1 text-[11px] text-gray-500 leading-tight">
                    {p.desc}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-gray-700 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-gray-400" />
            Detailed Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            id="description"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, when the problem started, error messages observed, and any steps already attempted..."
            className={`mt-1 block w-full rounded-md border px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 ${
              errors.description
                ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500'
                : 'border-gray-300 focus:border-blue-600 focus:ring-blue-600'
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-[11px] text-rose-600">{errors.description}</p>
          )}
          <p className="mt-1 text-[10px] text-gray-400">
            Please be thorough so maintenance or IT personnel can diagnose without delay.
          </p>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <Link
            to="/complaints"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 disabled:opacity-60 transition"
          >
            {submitting ? (
              'Submitting Complaint...'
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Submit Complaint
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitComplaint;
