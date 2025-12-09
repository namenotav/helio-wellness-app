import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import './FamilyMembers.css';

const FamilyMembers = ({ user, planType }) => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeMember, setActiveMember] = useState(user?.uid || 'me');
  const [newMember, setNewMember] = useState({
    name: '',
    age: '',
    gender: 'male',
    relationship: 'spouse'
  });

  const maxSlots = planType === 'premium' ? 3 : planType === 'ultimate' ? 5 : 0;

  useEffect(() => {
    if (user && maxSlots > 0) {
      loadFamilyMembers();
    }
  }, [user, maxSlots]);

  const loadFamilyMembers = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'familyMembers'),
        where('parentUserId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFamilyMembers(members);
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.age) {
      alert('Please fill in name and age');
      return;
    }

    if (familyMembers.length >= maxSlots) {
      alert(`You can only add ${maxSlots} family members on ${planType} plan`);
      return;
    }

    try {
      await addDoc(collection(db, 'familyMembers'), {
        parentUserId: user.uid,
        name: newMember.name,
        age: parseInt(newMember.age),
        gender: newMember.gender,
        relationship: newMember.relationship,
        createdAt: new Date()
      });

      setNewMember({ name: '', age: '', gender: 'male', relationship: 'spouse' });
      setShowAddModal(false);
      loadFamilyMembers();
    } catch (error) {
      console.error('Error adding family member:', error);
      alert('Failed to add family member');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm('Remove this family member?')) return;

    try {
      await deleteDoc(doc(db, 'familyMembers', memberId));
      loadFamilyMembers();
      if (activeMember === memberId) {
        setActiveMember('me');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  if (maxSlots === 0) {
    return (
      <div className="family-members-upgrade" style={{
        padding: '30px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
        borderRadius: '20px',
        border: '2px solid rgba(59, 130, 246, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '15px' }}>👨‍👩‍👧‍👦</div>
        <h3 style={{ fontSize: '24px', marginBottom: '10px', color: 'white' }}>Family Members</h3>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', marginBottom: '20px' }}>
          Track health for your entire family. Upgrade to Premium or Ultimate to unlock this feature.
        </p>
        <button
          onClick={() => window.location.href = '/#pricing'}
          style={{
            padding: '15px 30px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Upgrade Now
        </button>
      </div>
    );
  }

  return (
    <div className="family-members-container" style={{
      padding: '30px',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '24px', color: 'white', margin: 0 }}>
          👨‍👩‍👧‍👦 Family Members
        </h3>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={familyMembers.length >= maxSlots}
          style={{
            padding: '10px 20px',
            background: familyMembers.length >= maxSlots ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: familyMembers.length >= maxSlots ? 'not-allowed' : 'pointer',
            opacity: familyMembers.length >= maxSlots ? 0.5 : 1
          }}
        >
          + Add Member ({familyMembers.length}/{maxSlots})
        </button>
      </div>

      {/* Active Member Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
          Active Profile:
        </label>
        <select
          value={activeMember}
          onChange={(e) => setActiveMember(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.2)',
            borderRadius: '10px',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          <option value="me">Me ({user?.displayName || user?.email})</option>
          {familyMembers.map(member => (
            <option key={member.id} value={member.id}>
              {member.name} ({member.age}yo, {member.relationship})
            </option>
          ))}
        </select>
      </div>

      {/* Family Members List */}
      <div style={{ display: 'grid', gap: '15px' }}>
        {familyMembers.map(member => (
          <div
            key={member.id}
            style={{
              padding: '20px',
              background: activeMember === member.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.05)',
              border: activeMember === member.id ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>
                {member.gender === 'male' ? '👨' : member.gender === 'female' ? '👩' : '👤'} {member.name}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                {member.age} years old • {member.relationship}
              </div>
            </div>
            <button
              onClick={() => handleDeleteMember(member.id)}
              style={{
                padding: '8px 16px',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🗑️ Remove
            </button>
          </div>
        ))}

        {familyMembers.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.6)',
            fontSize: '16px'
          }}>
            No family members added yet. Click "Add Member" to get started!
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '100%',
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px', color: 'white' }}>
              Add Family Member
            </h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
                Name
              </label>
              <input
                type="text"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="e.g., Sarah"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
                Age
              </label>
              <input
                type="number"
                value={newMember.age}
                onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                placeholder="e.g., 35"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
                Gender
              </label>
              <select
                value={newMember.gender}
                onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
                Relationship
              </label>
              <select
                value={newMember.relationship}
                onChange={(e) => setNewMember({ ...newMember, relationship: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                <option value="spouse">Spouse/Partner</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="sibling">Sibling</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAddMember}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Add Member
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  flex: 1,
                  padding: '15px',
                  background: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyMembers;
