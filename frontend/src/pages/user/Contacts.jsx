import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Navbar from '../../components/Navbar';
import Modal  from '../../components/Modal';
import api    from '../../api/axios';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [form,     setForm]     = useState({ name:'', phone:'', relation:'' });
  const [saving,   setSaving]   = useState(false);

  const load = () => {
    setLoading(true);
    api.get('/user/contacts')
      .then(r => setContacts(r.data))
      .catch(() => toast.error('Failed to load contacts'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) { toast.error('Name and phone are required'); return; }
    if (!/^\d{10}$/.test(form.phone)) { toast.error('Phone must be exactly 10 digits'); return; }
    setSaving(true);
    try {
      await api.post('/user/addContact', form);
      toast.success('Contact added!');
      setShowAdd(false);
      setForm({ name:'', phone:'', relation:'' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add contact');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact?')) return;
    setDeleting(id);
    try {
      await api.delete(`/user/contacts/${id}`);
      toast.success('Contact removed');
      setContacts(cs => cs.filter(c => c.contact_id !== id));
    } catch (err) {
      toast.error('Failed to delete contact');
    } finally {
      setDeleting(null);
    }
  };

  const RELATIONS = ['Mother','Father','Sister','Brother','Friend','Colleague','Spouse','Other'];

  return (
    <>
      <Navbar />
      <div className="bg-black min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white">Emergency Contacts</h1>
              <p className="text-sm text-gray-500 mt-1">
                People we'll alert when you trigger SOS
              </p>
            </div>
            <button 
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={contacts.length >= 5} 
              onClick={() => setShowAdd(true)}
            >
              + Add Contact
            </button>
          </div>

          {/* Alert Messages */}
          {contacts.length === 0 && !loading && (
            <div className="mb-4 p-3 bg-yellow-900/30 text-yellow-500 rounded-lg border border-yellow-800 text-sm">
              ⚠️ You have no emergency contacts. Please add at least one before using SOS.
            </div>
          )}
          {contacts.length >= 5 && (
            <div className="mb-4 p-3 bg-blue-900/30 text-blue-400 rounded-lg border border-blue-800 text-sm">
              ℹ️ You've reached the maximum of 5 contacts.
            </div>
          )}

          {/* Contacts Card */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
              </div>
            ) : contacts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">👤</div>
                <p className="text-gray-500 text-sm">No contacts yet.</p>
                <button 
                  onClick={() => setShowAdd(true)}
                  className="mt-4 text-red-500 text-sm font-medium hover:text-red-400 transition-colors"
                >
                  Add your first contact →
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-500 font-medium">#</th>
                      <th className="text-left py-4 px-6 text-gray-500 font-medium">Name</th>
                      <th className="text-left py-4 px-6 text-gray-500 font-medium">Phone</th>
                      <th className="text-left py-4 px-6 text-gray-500 font-medium">Relation</th>
                      <th className="text-left py-4 px-6 text-gray-500 font-medium">Added</th>
                      <th className="text-left py-4 px-6 text-gray-500 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c, i) => (
                      <tr key={c.contact_id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-6 text-gray-500">{i+1}</td>
                        <td className="py-3 px-6">
                          <span className="font-medium text-white">{c.name}</span>
                        </td>
                        <td className="py-3 px-6 text-gray-400">{c.phone}</td>
                        <td className="py-3 px-6">
                          {c.relation ? (
                            <span className="px-2 py-1 bg-red-900/30 text-red-400 rounded-full text-xs font-medium border border-red-800">
                              {c.relation}
                            </span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="py-3 px-6 text-gray-500 text-xs">
                          {new Date(c.created_at).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-3 px-6">
                          <button 
                            className="px-3 py-1 text-red-500 text-sm font-medium hover:text-red-400 transition-colors disabled:opacity-50"
                            onClick={() => handleDelete(c.contact_id)}
                            disabled={deleting === c.contact_id}
                          >
                            {deleting === c.contact_id ? '...' : 'Remove'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="➕ Add Emergency Contact">
        <form onSubmit={handleAdd}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Full Name *
            </label>
            <input 
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors text-white placeholder-gray-500"
              placeholder="Ananya Sharma"
              value={form.name} 
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number *
            </label>
            <input 
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors text-white placeholder-gray-500"
              placeholder="10-digit mobile"
              value={form.phone} 
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Relation
            </label>
            <select 
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors text-white"
              value={form.relation} 
              onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}
            >
              <option value="">Select relation…</option>
              {RELATIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          
          <div className="flex gap-3 justify-end mt-6">
            <button 
              type="button" 
              className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Add Contact'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}