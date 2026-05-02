// Utilise le proxy Vite en développement, sinon l'URL de production
const API_URL = import.meta.env.DEV ? '/api' : import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API URL:', API_URL);

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const api = {
// Authentification
register: async (email: string, password: string, nom: string, role?: string) => {
console.log('Tentative d\'inscription...', { email, nom, role, API_URL });
const response = await fetch(`${API_URL}/auth/register`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email, password, nom, role }),
});
const data = await response.json();
console.log('Réponse inscription:', data);
return data;
},

login: async (email: string, password: string) => {
console.log('Tentative de connexion...', { email, API_URL });
try {
const response = await fetch(`${API_URL}/auth/login`, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ email, password }),
});
const data = await response.json();
console.log('Réponse connexion:', data);
return data;
} catch (error) {
console.error('Erreur de connexion:', error);
throw error;
}
},

getProfile: async (token: string) => {
const response = await fetch(`${API_URL}/auth/profile`, {
headers: { 'Authorization': `Bearer ${token}` },
});
return response.json();
},

// Matières premières
getMatieresPremieres: async () => {
const response = await fetch(`${API_URL}/matieres-premieres`);
return response.json();
},

createMatierePremiere: async (data: any) => {
const response = await fetch(`${API_URL}/matieres-premieres`, {
method: 'POST',
headers: getAuthHeaders(),
body: JSON.stringify(data),
});
return response.json();
},

updateMatierePremiere: async (id: string, data: any) => {
const response = await fetch(`${API_URL}/matieres-premieres/${id}`, {
method: 'PUT',
headers: getAuthHeaders(),
body: JSON.stringify(data),
});
return response.json();
},

deleteMatierePremiere: async (id: string) => {
const response = await fetch(`${API_URL}/matieres-premieres/${id}`, {
method: 'DELETE',
headers: getAuthHeaders(),
});
return response.json();
},

// Produits finis
getProduitsFinis: async () => {
const response = await fetch(`${API_URL}/produits-finis`);
return response.json();
},

createProduitFini: async (data: any) => {
const response = await fetch(`${API_URL}/produits-finis`, {
method: 'POST',
headers: getAuthHeaders(),
body: JSON.stringify(data),
});
return response.json();
},

updateProduitFini: async (id: string, data: any) => {
const response = await fetch(`${API_URL}/produits-finis/${id}`, {
method: 'PUT',
headers: getAuthHeaders(),
body: JSON.stringify(data),
});
return response.json();
},

deleteProduitFini: async (id: string) => {
const response = await fetch(`${API_URL}/produits-finis/${id}`, {
method: 'DELETE',
headers: getAuthHeaders(),
});
return response.json();
},

// Recettes
getRecettes: async () => {
const response = await fetch(`${API_URL}/recettes`);
return response.json();
},

getRecetteById: async (id: string) => {
const response = await fetch(`${API_URL}/recettes/${id}`);
return response.json();
},

createRecette: async (data: any) => {
const response = await fetch(`${API_URL}/recettes`, {
method: 'POST',
headers: getAuthHeaders(),
body: JSON.stringify(data),
});
return response.json();
},

updateRecette: async (id: string, data: any) => {
const response = await fetch(`${API_URL}/recettes/${id}`, {
method: 'PUT',
headers: getAuthHeaders(),
body: JSON.stringify(data),
});
return response.json();
},

deleteRecette: async (id: string) => {
const response = await fetch(`${API_URL}/recettes/${id}`, {
method: 'DELETE',
headers: getAuthHeaders(),
});
return response.json();
},

lancerTransformation: async (recetteId: string, data: any) => {
const response = await fetch(`${API_URL}/recettes/${recetteId}/transformer`, {
method: 'POST',
headers: getAuthHeaders(),
body: JSON.stringify(data),
});
return response.json();
},

// Transformations
getTransformations: async () => {
const response = await fetch(`${API_URL}/transformations`);
return response.json();
},

createTransformation: async (data: any) => {
const response = await fetch(`${API_URL}/transformations`, {
method: 'POST',
headers: getAuthHeaders(),
body: JSON.stringify(data),
});
return response.json();
},

getStatsProduction: async () => {
const response = await fetch(`${API_URL}/transformations/stats/production`);
return response.json();
},

getStatsRendements: async () => {
const response = await fetch(`${API_URL}/transformations/stats/rendements`);
return response.json();
},
};
