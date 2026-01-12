// Reusable gradient button for HOME action grid
import './HomeActionButton.css';

export default function HomeActionButton({ icon, label, gradient, onClick }) {
  return (
    <button 
      className="home-action-button" 
      style={{ background: gradient }}
      onClick={onClick}
    >
      <span className="action-icon">{icon}</span>
      <span className="action-label">{label}</span>
    </button>
  );
}
