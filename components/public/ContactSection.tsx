"use client"
import { useState } from 'react';

const ContactSection = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">Contact Us</h2>
        <p className="text-gray-600 text-center mb-8">Email us at <a href="mailto:support@doctorcare.com" className="text-blue-600 underline">support@doctorcare.com</a> or use the form below.</p>
        <form onSubmit={handleSubmit} className="space-y-6 bg-blue-50 p-6 rounded-lg shadow">
          <div>
            <label htmlFor="name" className="block text-gray-700 mb-1">Name</label>
            <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
            <input type="email" id="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-700 mb-1">Message</label>
            <textarea id="message" name="message" value={form.message} onChange={handleChange} required rows={5} className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">Send Message</button>
          {submitted && <p className="text-green-600 text-center mt-2">Thank you! We'll be in touch soon.</p>}
        </form>
      </div>
    </section>
  );
};

export default ContactSection; 