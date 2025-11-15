/* API Integration - React Components
   Form for adding teams with validation and automatic list updates
   
   IMPORTANT: Update the API_BASE_URL below with your actual Render deployment URL.
   Your server should have:
   - GET endpoint at /api/teams (or adjust API_ENDPOINT)
   - POST endpoint at /api/teams (or adjust API_ENDPOINT)
   - Joi validation matching the client-side validation in validateTeam()
*/

const { useState, useEffect } = React;

// API Configuration - Update these URLs based on your actual deployment
// Replace 'https://game-day-api.onrender.com' with your actual Render URL
const API_BASE_URL = 'https://game-day-api.onrender.com'; // ⚠️ UPDATE THIS with your Render URL
const API_ENDPOINT = `${API_BASE_URL}/api/teams`; // Adjust path if your endpoint differs

// Client-side validation matching server-side Joi validation
function validateTeam(team) {
  const errors = {};
  
  // Name: required, string, min 2 chars, max 100 chars
  if (!team.name || team.name.trim().length === 0) {
    errors.name = 'Team name is required';
  } else if (team.name.trim().length < 2) {
    errors.name = 'Team name must be at least 2 characters';
  } else if (team.name.length > 100) {
    errors.name = 'Team name must be less than 100 characters';
  }
  
  // City: required, string, min 2 chars, max 100 chars
  if (!team.city || team.city.trim().length === 0) {
    errors.city = 'City is required';
  } else if (team.city.trim().length < 2) {
    errors.city = 'City must be at least 2 characters';
  } else if (team.city.length > 100) {
    errors.city = 'City must be less than 100 characters';
  }
  
  // Sport: required, string, min 2 chars, max 50 chars
  if (!team.sport || team.sport.trim().length === 0) {
    errors.sport = 'Sport is required';
  } else if (team.sport.trim().length < 2) {
    errors.sport = 'Sport must be at least 2 characters';
  } else if (team.sport.length > 50) {
    errors.sport = 'Sport must be less than 50 characters';
  }
  
  // League: required, string, min 2 chars, max 50 chars
  if (!team.league || team.league.trim().length === 0) {
    errors.league = 'League is required';
  } else if (team.league.trim().length < 2) {
    errors.league = 'League must be at least 2 characters';
  } else if (team.league.length > 50) {
    errors.league = 'League must be less than 50 characters';
  }
  
  // Record: optional, string, max 20 chars if provided
  if (team.record && team.record.length > 20) {
    errors.record = 'Record must be less than 20 characters';
  }
  
  // Streak: optional, string, max 10 chars if provided
  if (team.streak && team.streak.length > 10) {
    errors.streak = 'Streak must be less than 10 characters';
  }
  
  // img_name: optional, string, max 200 chars if provided
  if (team.img_name && team.img_name.length > 200) {
    errors.img_name = 'Image name must be less than 200 characters';
  }
  
  return errors;
}

// Team Form Component
function TeamForm({ onTeamAdded }) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    sport: '',
    league: '',
    record: '',
    streak: '',
    img_name: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    // Clear submit status when user makes changes
    if (submitStatus) {
      setSubmitStatus(null);
      setSubmitMessage('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    const validationErrors = validateTeam(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitStatus('error');
      setSubmitMessage('Please fix the errors above before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});
    setSubmitStatus(null);
    setSubmitMessage('');
    
    try {
      // Prepare data for submission (only include non-empty optional fields)
      const submitData = {
        name: formData.name.trim(),
        city: formData.city.trim(),
        sport: formData.sport.trim(),
        league: formData.league.trim()
      };
      
      if (formData.record.trim()) submitData.record = formData.record.trim();
      if (formData.streak.trim()) submitData.streak = formData.streak.trim();
      if (formData.img_name.trim()) submitData.img_name = formData.img_name.trim();
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success !== false) {
        setSubmitStatus('success');
        setSubmitMessage('✅ Team added successfully!');
        // Reset form
        setFormData({
          name: '',
          city: '',
          sport: '',
          league: '',
          record: '',
          streak: '',
          img_name: ''
        });
        // Notify parent to refresh teams list
        if (onTeamAdded) {
          onTeamAdded();
        }
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus(null);
          setSubmitMessage('');
        }, 5000);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(`❌ Error: ${result.message || result.error || 'Failed to add team'}`);
      }
    } catch (error) {
      console.error('Error submitting team:', error);
      setSubmitStatus('error');
      setSubmitMessage(`❌ Network error: ${error.message}. Please check your API endpoint.`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="team-form-container">
      <h3>Add New Team</h3>
      <form onSubmit={handleSubmit} className="team-form" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Team Name <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              required
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="city">City <span className="required">*</span></label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? 'error' : ''}
              required
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="sport">Sport <span className="required">*</span></label>
            <input
              type="text"
              id="sport"
              name="sport"
              value={formData.sport}
              onChange={handleChange}
              className={errors.sport ? 'error' : ''}
              required
            />
            {errors.sport && <span className="error-message">{errors.sport}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="league">League <span className="required">*</span></label>
            <input
              type="text"
              id="league"
              name="league"
              value={formData.league}
              onChange={handleChange}
              className={errors.league ? 'error' : ''}
              required
            />
            {errors.league && <span className="error-message">{errors.league}</span>}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="record">Record</label>
            <input
              type="text"
              id="record"
              name="record"
              value={formData.record}
              onChange={handleChange}
              className={errors.record ? 'error' : ''}
              placeholder="e.g., 3-0"
            />
            {errors.record && <span className="error-message">{errors.record}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="streak">Streak</label>
            <input
              type="text"
              id="streak"
              name="streak"
              value={formData.streak}
              onChange={handleChange}
              className={errors.streak ? 'error' : ''}
              placeholder="e.g., W3"
            />
            {errors.streak && <span className="error-message">{errors.streak}</span>}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="img_name">Image Name (optional)</label>
          <input
            type="text"
            id="img_name"
            name="img_name"
            value={formData.img_name}
            onChange={handleChange}
            className={errors.img_name ? 'error' : ''}
            placeholder="e.g., images/team-logo.png"
          />
          {errors.img_name && <span className="error-message">{errors.img_name}</span>}
        </div>
        
        {submitStatus && (
          <div className={`submit-message ${submitStatus}`}>
            {submitMessage}
          </div>
        )}
        
        <button type="submit" className="submit-btn" disabled={isSubmitting}>
          {isSubmitting ? 'Adding Team...' : 'Add Team'}
        </button>
      </form>
    </div>
  );
}

// Teams List Component
function TeamsList({ refreshTrigger }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(API_ENDPOINT, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      // Handle both array and object with items property
      const teamsArray = Array.isArray(data) ? data : (data.items || data.teams || []);
      setTeams(teamsArray);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(`Failed to load teams: ${err.message}. Please check your API endpoint.`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchTeams();
  }, [refreshTrigger]);
  
  if (loading) {
    return (
      <div className="teams-list-container">
        <div className="teams-header">
          <h3>Teams List</h3>
        </div>
        <p className="loading-message">Loading teams...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="teams-list-container">
        <div className="teams-header">
          <h3>Teams List</h3>
        </div>
        <p className="error-message">{error}</p>
        <button onClick={fetchTeams} className="retry-btn">Retry</button>
      </div>
    );
  }
  
  return (
    <div className="teams-list-container">
      <div className="teams-header">
        <h3>Teams List ({teams.length} {teams.length === 1 ? 'team' : 'teams'})</h3>
        <button onClick={fetchTeams} className="refresh-btn">Refresh</button>
      </div>
      
      {teams.length === 0 ? (
        <p className="empty-message">No teams found. Add your first team using the form below!</p>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <div key={team._id || team.id} className="team-card">
              {team.img_name && (
                <div className="team-image">
                  <img 
                    src={team.img_name} 
                    alt={`${team.name} logo`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="team-info">
                <h4>{team.name}</h4>
                <p className="team-city">{team.city}</p>
                <p className="team-sport">{team.sport} • {team.league}</p>
                {team.record && <p className="team-record">Record: {team.record}</p>}
                {team.streak && <p className="team-streak">Streak: {team.streak}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Main App Component
function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleTeamAdded = () => {
    // Trigger refresh of teams list
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="api-integration-app">
      <TeamForm onTeamAdded={handleTeamAdded} />
      <TeamsList refreshTrigger={refreshTrigger} />
    </div>
  );
}

// Render the app
const root = ReactDOM.createRoot(document.getElementById('react-root'));
root.render(<App />);

