"use client";

import { Resume, Experience, Education } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";
import { getSampleResume } from "@/lib/store";

interface ResumeFormProps {
  resume: Resume;
  onChange: (resume: Resume) => void;
}

export default function ResumeForm({ resume, onChange }: ResumeFormProps) {
  const updateContact = (field: string, value: string) => {
    onChange({ ...resume, contact: { ...resume.contact, [field]: value } });
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: uuidv4(),
      company: "",
      title: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    };
    onChange({ ...resume, experience: [...resume.experience, newExp] });
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...resume.experience];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resume, experience: updated });
  };

  const removeExperience = (index: number) => {
    onChange({ ...resume, experience: resume.experience.filter((_, i) => i !== index) });
  };

  const addBullet = (expIndex: number) => {
    const updated = [...resume.experience];
    updated[expIndex] = { ...updated[expIndex], bullets: [...updated[expIndex].bullets, ""] };
    onChange({ ...resume, experience: updated });
  };

  const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const updated = [...resume.experience];
    const bullets = [...updated[expIndex].bullets];
    bullets[bulletIndex] = value;
    updated[expIndex] = { ...updated[expIndex], bullets };
    onChange({ ...resume, experience: updated });
  };

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...resume.experience];
    updated[expIndex] = {
      ...updated[expIndex],
      bullets: updated[expIndex].bullets.filter((_, i) => i !== bulletIndex),
    };
    onChange({ ...resume, experience: updated });
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: uuidv4(),
      institution: "",
      degree: "",
      field: "",
      graduationDate: "",
      gpa: "",
    };
    onChange({ ...resume, education: [...resume.education, newEdu] });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...resume.education];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resume, education: updated });
  };

  const removeEducation = (index: number) => {
    onChange({ ...resume, education: resume.education.filter((_, i) => i !== index) });
  };

  const updateSkills = (value: string) => {
    const skills = value.split(",").map(s => s.trim()).filter(Boolean);
    onChange({ ...resume, skills });
  };

  const loadSample = () => {
    onChange(getSampleResume());
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Resume</h2>
          <p className="text-gray-500 mt-1">Enter your resume details or load a sample to get started.</p>
        </div>
        <button
          onClick={loadSample}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          Load Sample
        </button>
      </div>

      {/* Contact Information */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">
            👤
          </span>
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Full Name" value={resume.contact.fullName} onChange={v => updateContact("fullName", v)} placeholder="John Doe" />
          <Input label="Email" value={resume.contact.email} onChange={v => updateContact("email", v)} placeholder="john@example.com" type="email" />
          <Input label="Phone" value={resume.contact.phone} onChange={v => updateContact("phone", v)} placeholder="(555) 123-4567" />
          <Input label="Location" value={resume.contact.location} onChange={v => updateContact("location", v)} placeholder="San Francisco, CA" />
          <Input label="LinkedIn" value={resume.contact.linkedin} onChange={v => updateContact("linkedin", v)} placeholder="linkedin.com/in/johndoe" />
          <Input label="Website" value={resume.contact.website} onChange={v => updateContact("website", v)} placeholder="johndoe.dev" />
        </div>
      </section>

      {/* Summary */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">
            📝
          </span>
          Professional Summary
        </h3>
        <textarea
          value={resume.summary}
          onChange={e => onChange({ ...resume, summary: e.target.value })}
          placeholder="A brief professional summary highlighting your key qualifications..."
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 resize-none"
        />
      </section>

      {/* Experience */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">
              💼
            </span>
            Work Experience
          </h3>
          <button
            onClick={addExperience}
            className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            + Add Position
          </button>
        </div>

        {resume.experience.length === 0 && (
          <p className="text-gray-400 text-center py-8">No experience added yet. Click &quot;Add Position&quot; to get started.</p>
        )}

        <div className="space-y-6">
          {resume.experience.map((exp, expIndex) => (
            <div key={exp.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Position {expIndex + 1}</span>
                <button
                  onClick={() => removeExperience(expIndex)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input label="Job Title" value={exp.title} onChange={v => updateExperience(expIndex, "title", v)} placeholder="Software Engineer" />
                <Input label="Company" value={exp.company} onChange={v => updateExperience(expIndex, "company", v)} placeholder="Acme Corp" />
                <Input label="Start Date" value={exp.startDate} onChange={v => updateExperience(expIndex, "startDate", v)} placeholder="2022-01" />
                <Input label="End Date" value={exp.endDate} onChange={v => updateExperience(expIndex, "endDate", v)} placeholder="Present" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Bullet Points</label>
                {exp.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2">
                    <span className="text-gray-400 mt-2.5">•</span>
                    <input
                      value={bullet}
                      onChange={e => updateBullet(expIndex, bulletIndex, e.target.value)}
                      placeholder="Describe an accomplishment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-sm"
                    />
                    <button
                      onClick={() => removeBullet(expIndex, bulletIndex)}
                      className="text-gray-400 hover:text-red-500 text-sm px-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addBullet(expIndex)}
                  className="text-sm text-indigo-500 hover:text-indigo-700 mt-1"
                >
                  + Add bullet
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">
              🎓
            </span>
            Education
          </h3>
          <button
            onClick={addEducation}
            className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            + Add Education
          </button>
        </div>

        {resume.education.length === 0 && (
          <p className="text-gray-400 text-center py-8">No education added yet. Click &quot;Add Education&quot; to get started.</p>
        )}

        <div className="space-y-4">
          {resume.education.map((edu, eduIndex) => (
            <div key={edu.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">Education {eduIndex + 1}</span>
                <button
                  onClick={() => removeEducation(eduIndex)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input label="Institution" value={edu.institution} onChange={v => updateEducation(eduIndex, "institution", v)} placeholder="Stanford University" />
                <Input label="Degree" value={edu.degree} onChange={v => updateEducation(eduIndex, "degree", v)} placeholder="Bachelor of Science" />
                <Input label="Field of Study" value={edu.field} onChange={v => updateEducation(eduIndex, "field", v)} placeholder="Computer Science" />
                <Input label="Graduation Date" value={edu.graduationDate} onChange={v => updateEducation(eduIndex, "graduationDate", v)} placeholder="2022-05" />
                <Input label="GPA (optional)" value={edu.gpa} onChange={v => updateEducation(eduIndex, "gpa", v)} placeholder="3.8" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center text-sm">
            🛠
          </span>
          Skills
        </h3>
        <textarea
          value={resume.skills.join(", ")}
          onChange={e => updateSkills(e.target.value)}
          placeholder="JavaScript, TypeScript, React, Node.js, Python, SQL, Docker, AWS..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 resize-none"
        />
        <p className="text-sm text-gray-400 mt-1">Separate skills with commas</p>
        {resume.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {resume.skills.map((skill, i) => (
              <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full">
                {skill}
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400 text-sm"
      />
    </div>
  );
}
