import { supabase } from './supabase';
import { getSim, createUserVector, calculateCosineSimilarity } from './matchEngine';

// Auth via Supabase
export const registerUser = async (data) => {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: { data: { name: data.name } }
  });
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { token: authData.session?.access_token || '', ...authData.user } };
};

export const loginUser = async (data) => {
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });
  if (error) throw { response: { data: { message: error.message } } };
  return { data: { token: authData.session?.access_token || '', ...authData.user } };
};

export const getMe = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw { response: { data: { message: "Not logged in" } } };
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (error) throw { response: { data: { message: error.message } } };
  
  // Format for frontend
  return { data: {
    ...profile,
    experienceLevel: { overall: profile.experience_level },
    campus: { college: profile.college },
    profilePicture: profile.profile_picture,
    onboardingCompleted: profile.onboarding_completed
  }};
};

// Users
export const getUsers = async () => {
  const { data, error } = await supabase.from('profiles').select('*').eq('onboarding_completed', true);
  if (error) throw { response: { data: { message: error.message } } };
  return { data };
};

export const getUserById = async (id) => {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) throw { response: { data: { message: error.message } } };
  return { data };
};

export const updateProfile = async (data) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw { response: { data: { message: "Not logged in" } } };

  const payload = {
    name: data.name,
    bio: data.bio !== undefined ? data.bio : undefined,
    college: data.campus?.college || '',
    city: data.campus?.city || '',
    region: data.campus?.region || '',
    department: data.campus?.department || '',
    state: data.state || '',
    country: data.country || '',
    timezone: data.timezone || '',
    experience_level: data.experienceLevel?.overall || 'Beginner',
    years_of_coding: data.experienceLevel?.yearsOfCoding || 0,
    availability_hours: data.availabilityHours || 0,
    skills: data.skills || [],
    profile_picture: data.profilePicture || '',
    onboarding_completed: data.onboardingCompleted !== undefined ? data.onboardingCompleted : undefined
  };
  Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

  const { data: updated, error } = await supabase.from('profiles').update(payload).eq('id', user.id).select().single();
  if (error) throw { response: { data: { message: error.message } } };

  const formatted = {
    ...updated,
    campus: { college: updated.college },
    experienceLevel: { overall: updated.experience_level },
    profilePicture: updated.profile_picture,
    onboardingCompleted: updated.onboarding_completed
  };
  return { data: formatted };
};

export const uploadProfilePicture = async (formData) => {
  const file = formData.get('profilePicture');
  if (!file) throw { response: { data: { message: "No file provided" } } };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw { response: { data: { message: "Not logged in" } } };

  const filepath = `${user.id}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('avatars').upload(filepath, file, { upsert: true });
  if (error) throw { response: { data: { message: error.message } } };

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filepath);
  return { data: { profilePicture: publicUrl } };
};

// Matches (Client-side AI Engine)
export const getMatches = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const swiped = new Set([...(me.swiped_right || []), ...(me.swiped_left || [])]);
  const { data: others } = await supabase.from('profiles').select('*').neq('id', me.id).eq('onboarding_completed', true);
  
  const eligible = others.filter(u => !swiped.has(u.id));
  const candidates = eligible.map(u => {
    const score = getSim(me, u);
    return {
      matchScore: score,
      user: {
        _id: u.id,
        name: u.name,
        email: u.email,
        bio: u.bio,
        skills: u.skills || [],
        experienceLevel: { overall: u.experience_level },
        campus: { college: u.college },
        profilePicture: u.profile_picture
      }
    };
  });
  
  candidates.sort((a,b) => b.matchScore - a.matchScore);
  return { data: candidates };
};

export const recordSwipe = async (data) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { data: me } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const targetId = data.targetUserId;
  const isRight = data.direction === 'right';

  let updateData = {};
  if (isRight) {
    updateData.swiped_right = [...new Set([...(me.swiped_right || []), targetId])];
  } else {
    updateData.swiped_left = [...new Set([...(me.swiped_left || []), targetId])];
  }

  if (isRight) {
     const { data: target } = await supabase.from('profiles').select('*').eq('id', targetId).single();
     if (target.swiped_right?.includes(me.id)) {
        updateData.matches = [...new Set([...(me.matches || []), targetId])];
        await supabase.from('profiles').update({ matches: [...new Set([...(target.matches || []), me.id])] }).eq('id', targetId);
     }
  }

  await supabase.from('profiles').update(updateData).eq('id', me.id);
  return { data: { success: true } };
};

export const demoCompare = async (data) => {
  const v1 = createUserVector(data.user1Skills);
  const v2 = createUserVector(data.user2Skills);
  const score = calculateCosineSimilarity(v1, v2);
  return { data: { matchScore: score, vector1: v1, vector2: v2 } };
};

const MOCK_USERS = [
  { id: "demo1", name: "Aisha Sharma", college: "Thapar Institute", state: "Punjab", skills: [{name: "React"}, {name: "Next.js"}, {name: "Tailwind"}], profile_picture: "", experience_level: "Expert" },
  { id: "demo2", name: "Alex Rivera", college: "Stanford University", state: "CA", skills: [{name: "Figma"}, {name: "UI/UX"}, {name: "React"}], profile_picture: "", experience_level: "Advanced" },
  { id: "demo3", name: "Rishi Singh", college: "PEC", state: "Chandigarh", skills: [{name: "Rust"}, {name: "Python"}, {name: "NLP"}], profile_picture: "", experience_level: "Intermediate" }
];

export const getSwipedProfiles = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: fullMe, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) return { data: { accepted: [], rejected: [] } };

    const acceptedIds = fullMe.swiped_right || [];
    const rejectedIds = fullMe.swiped_left || [];
    
    let acceptedProfiles = [];
    let rejectedProfiles = [];

    if (acceptedIds.length > 0) {
        const realIds = acceptedIds.filter(id => !id.startsWith('demo'));
        if (realIds.length > 0) {
            const { data } = await supabase.from('profiles').select('*').in('id', realIds);
            acceptedProfiles = data || [];
        }
        const demoIds = acceptedIds.filter(id => id.startsWith('demo'));
        demoIds.forEach(did => {
            const mockUser = MOCK_USERS.find(m => m.id === did);
            if (mockUser) acceptedProfiles.push(mockUser);
        });
    }
    
    if (rejectedIds.length > 0) {
        const realIds = rejectedIds.filter(id => !id.startsWith('demo'));
        if (realIds.length > 0) {
            const { data } = await supabase.from('profiles').select('*').in('id', realIds);
            rejectedProfiles = data || [];
        }
        const demoIds = rejectedIds.filter(id => id.startsWith('demo'));
        demoIds.forEach(did => {
            const mockUser = MOCK_USERS.find(m => m.id === did);
            if (mockUser) rejectedProfiles.push(mockUser);
        });
    }

    const formatProfile = (u) => ({
      matchScore: getSim(fullMe, u),
      user: {
        _id: u.id,
        name: u.name,
        email: u.email,
        bio: u.bio,
        skills: u.skills || [],
        experienceLevel: { overall: u.experience_level },
        campus: { college: u.college },
        profilePicture: u.profile_picture
      }
    });

    return { 
      data: { 
        accepted: acceptedProfiles.map(formatProfile).sort((a,b) => b.matchScore - a.matchScore), 
        rejected: rejectedProfiles.map(formatProfile).sort((a,b) => b.matchScore - a.matchScore) 
      } 
    };
};

// Teams Mapping
export const getTeams = async () => {
    const { data } = await supabase.from('teams').select('*');
    
    // Map to camelCase for UI
    const mapped = (data || []).map(t => ({
       ...t,
       hackathonTrack: t.hackathon_track,
       maxSize: t.max_size,
       requiredSkills: t.required_skills,
       minExperienceLevel: t.min_experience_level,
       leaderId: t.leader_id
    }));
    return { data: mapped };
};
export const getTeamById = async (id) => {
    const { data } = await supabase.from('teams').select('*').eq('id', id).single();
    if (!data) return { data: null };
    
    const mapped = {
       ...data,
       hackathonTrack: data.hackathon_track,
       maxSize: data.max_size,
       requiredSkills: data.required_skills,
       minExperienceLevel: data.min_experience_level,
       leaderId: data.leader_id
    };
    return { data: mapped };
};
export const createTeam = async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Map camelCase to snake_case for Postgres
    const payload = {
        name: data.name,
        hackathon_track: data.hackathonTrack || '',
        max_size: data.maxSize || 4,
        required_skills: data.requiredSkills || [],
        min_experience_level: data.minExperienceLevel || 'Beginner',
        description: data.description || '',
        leader_id: user.id,
        members: [user.id] // Auto-add leader to members list
    };
    
    const { data: res, error } = await supabase.from('teams').insert(payload).select().single();
    if (error) throw error;
    
    await supabase.from('profiles').update({ team_id: res.id }).eq('id', user.id);
    return { data: res };
};
export const sendJoinRequest = async (data) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: res } = await supabase.from('join_requests').insert({ team_id: data.teamId, user_id: user.id, message: data.message }).select().single();
    return { data: res };
};
export const getTeamRequests = async (id) => {
    const { data } = await supabase.from('join_requests').select('*, profiles(*)').eq('team_id', id);
    return { data: data || [] };
};
export const respondJoinRequest = async (id, data) => {
    const { data: req } = await supabase.from('join_requests').update({ status: data.status }).eq('id', id).select().single();
    if (data.status === 'accepted') {
        const { data: team } = await supabase.from('teams').select('*').eq('id', req.team_id).single();
        await supabase.from('teams').update({ members: [...team.members, req.user_id] }).eq('id', req.team_id);
    }
    return { data: req };
};

// Hackathon Client-Side
export const joinHackathon = async (data) => {
  const email = data.email || `guest_${Date.now()}@hackathon.local`;
  const password = Math.random().toString(36);
  const { data: newAuth } = await supabase.auth.signUp({ email, password, options: { data: { name: data.name } } });
  
  const payload = {
     name: data.name,
     college: data.campus,
     state: data.state,
     skills: typeof data.skills === 'string' ? data.skills.split(',').map(s=>({name: s.trim(), level: data.experienceLevel})) : data.skills,
     experience_level: data.experienceLevel,
     hackathon_id: data.hackathonId,
     is_local_participant: true,
     onboarding_completed: true
  };
  
  // Wait shortly for trigger to fire, then update
  await new Promise(r => setTimeout(r, 1000));
  await supabase.from('profiles').update(payload).eq('id', newAuth.user.id);
  return { data: { token: newAuth.session?.access_token || '', _id: newAuth.user.id, name: data.name } };
};

export const getHackathonMatches = async (id) => {
  const { data: users } = await supabase.from('profiles').select('*').eq('hackathon_id', id).eq('is_local_participant', true);
  if (!users || users.length < 2) return { data: { totalParticipants: users ? users.length : 0, topPairs: [] } };

  const pairs = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const score = getSim(users[i], users[j]);
      pairs.push({
        user1: { _id: users[i].id, name: users[i].name, skills: users[i].skills },
        user2: { _id: users[j].id, name: users[j].name, skills: users[j].skills },
        score
      });
    }
  }
  pairs.sort((a, b) => b.score - a.score);
  return { data: { totalParticipants: users.length, topPairs: pairs.slice(0, 50) } };
};

export const getSuggestedTeams = async (id) => {
  const { data: users } = await supabase.from('profiles').select('*').eq('hackathon_id', id).eq('is_local_participant', true);
  if (!users || users.length < 3) return { data: { teams: [] } };

  const teams = [];
  let pool = [...users];

  while (pool.length >= 3) {
    let bestPair = [pool[0], pool[1]];
    let bestScore = -1;
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const score = getSim(pool[i], pool[j]);
        if (score > bestScore) {
          bestScore = score;
          bestPair = [pool[i], pool[j]];
        }
      }
    }

    const currentTeam = [...bestPair];
    pool = pool.filter(u => u.id !== bestPair[0].id && u.id !== bestPair[1].id);

    while (currentTeam.length < 4 && pool.length > 0) {
      let bestCandidate = null;
      let bestCandidateScore = -1;
      for (const candidate of pool) {
        let sum = 0;
        for (const member of currentTeam) sum += getSim(candidate, member);
        const avg = sum / currentTeam.length;
        if (avg > bestCandidateScore) {
          bestCandidateScore = avg;
          bestCandidate = candidate;
        }
      }
      currentTeam.push(bestCandidate);
      pool = pool.filter(u => u.id !== bestCandidate.id);
    }

    let sumAlignment = 0;
    let pairs = 0;
    for (let i=0; i<currentTeam.length; i++) {
       for (let j=i+1; j<currentTeam.length; j++) {
          sumAlignment += getSim(currentTeam[i], currentTeam[j]);
          pairs++;
       }
    }
    teams.push({
      members: currentTeam.map(u => ({ _id: u.id, name: u.name })),
      compatibilityScore: Math.round(sumAlignment / pairs)
    });
  }
  return { data: { teams } };
};
