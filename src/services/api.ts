import defaultDb from '../../db.json';

const DB_KEY = 'plataforma_cursos_db';

// Inicializa o localStorage se não existir
if (!localStorage.getItem(DB_KEY)) {
  localStorage.setItem(DB_KEY, JSON.stringify(defaultDb));
}

const getDb = () => JSON.parse(localStorage.getItem(DB_KEY) || '{}');
const saveDb = (data: any) => localStorage.setItem(DB_KEY, JSON.stringify(data));

// Simula um delay de rede
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const parseUrl = (url: string) => {
  const [path, queryString] = url.split('?');
  const endpoint = path.replace(/^\//, ''); // remove barra inicial
  
  const params: any = {};
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
  }
  
  return { endpoint, params };
};

const api = {
  get: async (url: string) => {
    await delay();
    let db = getDb();
    
    const parts = url.split('?')[0].split('/').filter(Boolean);
    const collectionName = parts[0];
    const id = parts.length > 1 ? Number(parts[1]) : null;
    
    const collection = db[collectionName] || [];
    
    if (id) {
       const item = collection.find((i: any) => String(i.id) === String(id));
       if (!item) return Promise.reject(new Error("Not found"));
       return { data: item };
    }
    
    const { params } = parseUrl(url);
    let result = [...collection];
    
    for (const key in params) {
       result = result.filter((item: any) => String(item[key]) === String(params[key]));
    }
    
    return { data: result };
  },
  post: async (url: string, data: any) => {
    await delay();
    let db = getDb();
    const parts = url.split('?')[0].split('/').filter(Boolean);
    const collectionName = parts[0];
    
    const collection = db[collectionName] || [];
    const newId = collection.length > 0 ? Math.max(...collection.map((i:any) => Number(i.id) || 0)) + 1 : 1;
    const newItem = { ...data, id: newId };
    
    db[collectionName] = [...collection, newItem];
    saveDb(db);
    
    return { data: newItem };
  },
  put: async (url: string, data: any) => {
    await delay();
    let db = getDb();
    const parts = url.split('?')[0].split('/').filter(Boolean);
    const collectionName = parts[0];
    const id = parts.length > 1 ? Number(parts[1]) : null;
    
    const collection = db[collectionName] || [];
    const index = collection.findIndex((i: any) => String(i.id) === String(id));
    
    if (index === -1) return Promise.reject(new Error("Not found"));
    
    const updatedItem = { ...collection[index], ...data, id };
    collection[index] = updatedItem;
    db[collectionName] = collection;
    saveDb(db);
    
    return { data: updatedItem };
  },
  delete: async (url: string) => {
    await delay();
    let db = getDb();
    const parts = url.split('?')[0].split('/').filter(Boolean);
    const collectionName = parts[0];
    const id = parts.length > 1 ? Number(parts[1]) : null;
    
    const collection = db[collectionName] || [];
    db[collectionName] = collection.filter((i: any) => String(i.id) !== String(id));
    saveDb(db);
    
    return { data: {} };
  }
};

export default api;
