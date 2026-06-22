import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize the Gemini client securely on the server
// Telemetry require User-Agent 'aistudio-build'
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Retry wrapper for Gemini API calls to handle transient/high-demand (503) errors cleanly
async function generateContentWithRetry(params: any, maxRetries = 2, delayMs = 1500) {
  let attempt = 0;
  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      attempt++;
      const errorMsg = error?.message || String(error);
      const isTransient = errorMsg.includes("503") || errorMsg.includes("UNAVAILABLE") || errorMsg.includes("overloaded") || errorMsg.includes("Service Unavailable") || errorMsg.includes("500") || errorMsg.includes("high demand") || errorMsg.includes("busy");
      if (isTransient && attempt <= maxRetries) {
        console.warn(`[Gemini API] Transient error (attempt ${attempt}/${maxRetries}): ${errorMsg}. Retrying in ${delayMs * attempt}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
        continue;
      }
      throw error;
    }
  }
}

const DB_FILE = path.join(process.cwd(), "database.json");

// Define types for Database
interface Student {
  id: string;
  name: string;
  lastName?: string;
  phone?: string;
  email: string;
  country: string;
  city: string; // Current city of residence
  targetCity: string; // Target studying city in Spain
  gender: string;
  age: number;
  language: string;
  level: string; // A1, A2, B1, B2, C1, C2
  academicGoal: string; // FP Grado Superior, Universidad, Grado Medio, Máster
  currentEducation?: string; // e.g. Bachillerato, Cursando Grado Medio, etc.
  currentCountry?: string; // Current country they reside in
  professionalGoal: string; // Software Developer, Nurse, Business Admin, etc.
  xp: number; // Student Score (starts at 0)
  streak: number;
  completedLessons: number;
  completedExams: number;
  studyTimeMinutes: number;
  hasCv: boolean;
  registrationDate: string; // YYYY-MM-DD
  premiumStatus: boolean; // true = premium, false = free
  vocationalTopChoice: string; // "Informática", "Sanidad", etc.
  isInternshipReady: boolean;
  hasJobReady: boolean;
  activeInCommunity: boolean;
  channel: string; // "Instagram", "Facebook", "SEO", "Direct", "Referred"
  paymentAmount: number; // Amount spent
  isBlocked?: boolean; // If blocked due to moderation violations
  studentIdCode?: string; // Random unique ID for study logins
}

interface Teacher {
  id: string;
  name: string;
  subject: string; // Subject of tutoring
  email: string;
  bio: string;
  phone?: string;
  photoUrl?: string;
  rating: number;
}

interface DB {
  students: Student[];
  communityMessages: Array<{ id: string; user: string; text: string; time: string; system?: boolean; email?: string }>;
  customMetrics: {
    totalPageViews: number;
    totalVisits: number;
    avgSessionSeconds: number;
    bounceRatePercent: number;
  };
  alerts: Array<{ 
    id: string; 
    title: string; 
    type: "warning" | "success" | "info"; 
    timestamp: string;
    violatorEmail?: string;
    violatorName?: string;
    isViolationUnit?: boolean;
  }>;
  teachers?: Teacher[];
  admins?: any[];
  customData?: any;
  ads?: Array<{
    id: string;
    brand: string;
    title: string;
    description: string;
    imageUrl?: string;
    targetUrl?: string;
    status: "active" | "paused";
    viewsCount: number;
    clicksCount: number;
    createdAt: string;
  }>;
  progressReports?: Array<{
    id: string;
    title: string;
    date: string;
    metricType: "registros" | "ingresos" | "conversiones" | "soporte";
    summary: string;
    value: string;
    trend: "up" | "down" | "stable";
    author: string;
  }>;
}

const MULTILINGUAL_BAD_WORDS = [
  // Spanish
  "mierda", "puta", "puto", "cabron", "cabrón", "joder", "maricon", "maricón", "gilipollas", "pendejo", "chingar",
  // French
  "merde", "putain", "connard", "salope", "fils de pute", "chier", "bordel", "con",
  // English
  "shit", "fuck", "bitch", "asshole", "bastard", "cunt", "dick",
  // Arabic (Latin & transliterated keywords)
  "zamel", "kahba", "9ahba", "khara", "zab", "tabon", "mok", "zebe", "mounafiq", "quosombak", "kosomak", "sharmouta"
];

function containsInappropriateContent(text: string): boolean {
  if (!text) return false;
  const normalized = text.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // strip accents
  
  return MULTILINGUAL_BAD_WORDS.some(word => {
    const normalizedWord = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalized.includes(normalizedWord);
  });
}

function getDefaultTeachers(): Teacher[] {
  return [
    {
      id: "teach_1",
      name: "Mónica Ruiz Castro",
      subject: "Español A1 - B2 (Comprensión y Gramática)",
      email: "monica.ruiz@espana-study.com",
      bio: "Profesora nativa de Madrid con más de 8 años de experiencia preparando a alumnos marroquíes y argelinos para integrarse en FP y universidades en España. Experta en pedagogía CEFR.",
      phone: "+34 612 345 678",
      photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      rating: 5
    },
    {
      id: "teach_2",
      name: "Yassine El Amrani",
      subject: "Preparación PCE Selectividad (Matemáticas y Física)",
      email: "yassine.amrani@espana-study.com",
      bio: "Doctor por la Universidad de Granada, especialista en guiar a estudiantes de Marruecos y Argelia para superar las pruebas UNEDasiss con máximas calificaciones en ciencias y homologación rápida.",
      phone: "+34 688 123 456",
      photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
      rating: 5
    },
    {
      id: "teach_3",
      name: "Prof. Alberto Sanz",
      subject: "Español Técnico para FP (Informática y Sanidad)",
      email: "alberto.sanz@espana-study.com",
      bio: "Especialista en enseñanza de terminología técnica para alumnos marroquíes y procedencias árabes cursando ciclos de Grado Superior (DAW, DAM, Higiene Bucodental o Dirección de Cocina).",
      phone: "+34 633 987 654",
      photoUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      rating: 4.8
    }
  ];
}

// Seed helper
function seedDatabase(): DB {
  const students: Student[] = [];
  const communityMessages: any[] = [];

  const customMetrics = {
    totalPageViews: 0,
    totalVisits: 0,
    avgSessionSeconds: 0,
    bounceRatePercent: 0
  };

  const alerts: any[] = [];

  const teachers = getDefaultTeachers();
  return { students, communityMessages, customMetrics, alerts, teachers };
}

function readDB(): DB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const dbInstance = JSON.parse(data);
      let changed = false;
      if (!dbInstance.teachers || !Array.isArray(dbInstance.teachers)) {
        dbInstance.teachers = getDefaultTeachers();
        changed = true;
      }
      if (!dbInstance.admins || !Array.isArray(dbInstance.admins)) {
        dbInstance.admins = [
          { email: "soullis8@gmail.com", password: "Sullivanem123_", role: "master", name: "Soulaymane" }
        ];
        changed = true;
      }
      if (dbInstance.students && Array.isArray(dbInstance.students)) {
        dbInstance.students.forEach((s: any, idx: number) => {
          if (!s.accountCode) {
            s.accountCode = `AE-ACCT-${10000 + idx}`;
            changed = true;
          }
        });
      }
      if (!dbInstance.ads || !Array.isArray(dbInstance.ads)) {
        dbInstance.ads = [];
        changed = true;
      }
      if (!dbInstance.progressReports || !Array.isArray(dbInstance.progressReports)) {
        dbInstance.progressReports = [];
        changed = true;
      }
      if (!dbInstance.customData) {
        dbInstance.customData = {};
        changed = true;
      }
      if (changed) {
        writeDB(dbInstance);
      }
      return dbInstance;
    }
  } catch (e) {
    console.error("Error reading database file, returning seeded values", e);
  }
  const seeded = seedDatabase();
  seeded.admins = [
    { email: "soullis8@gmail.com", password: "Sullivanem123_", role: "master", name: "Soulaymane" }
  ];
  writeDB(seeded);
  return seeded;
}

function writeDB(db: DB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving database file", e);
  }
}

async function startServer() {
  app.use(express.json());

  // Dynamic system for tracking active student sessions by device IP to prevent concurrent logins on same account
  const activeSessions = new Map<string, string>(); // email.toLowerCase() -> client IP string

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // DB Get Complete Stats & Lists API
  app.get("/api/db/stats", (req, res) => {
    const db = readDB();

    // Check optional IP/Device session validator
    const verifyEmail = req.query.verifyEmail as string;
    if (verifyEmail) {
      const clientIP: string = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
      const existingIP = activeSessions.get(verifyEmail.toLowerCase());
      if (existingIP && existingIP !== clientIP) {
        return res.status(403).json({
          status: "ip_conflict",
          error: `Sesión cerrada. Tu cuenta fue accedida desde otra dirección IP (${existingIP}).`
        });
      }
      // Keep-alive or confirm registration of current active IP
      if (!existingIP) {
        activeSessions.set(verifyEmail.toLowerCase(), clientIP);
      }
    }

    res.json(db);
  });

  // Student Auth Login / Registration API
  app.post("/api/auth/student-login", (req, res) => {
    const { 
      email, 
      name, 
      lastName, 
      phone, 
      country, 
      age, 
      gender, 
      currentEducation, 
      academicGoal, 
      city, 
      targetCity, 
      currentCountry,
      level
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: "El correo electrónico es requerido." });
    }

    // IP validation to prevent simultaneous logins
    const clientIP: string = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "127.0.0.1").split(",")[0].trim();
    const existingIP = activeSessions.get(email.toLowerCase());
    if (existingIP && existingIP !== clientIP) {
      return res.status(403).json({
        success: false,
        error: `Este correo ya está conectado desde otra dirección IP (${existingIP}). Para evitar el uso compartido de cuentas individuales, solo se permite un dispositivo a la vez.`
      });
    }

    const db = readDB();
    const searchVal = email.toLowerCase().trim();
    let student = db.students.find(s => 
      s.email.toLowerCase() === searchVal || 
      s.id.toLowerCase() === searchVal ||
      (s.studentIdCode && s.studentIdCode.toLowerCase() === searchVal)
    );

    if (student) {
      if (student.isBlocked) {
        return res.status(403).json({ 
          success: false, 
          error: "SU ACCESO HA SIDO TEMPORALMENTE RESTRINGIDO. Motivo: Infracción recurrente de las Directrices de la Comunidad (comentarios inadecuados)." 
        });
      }
    } else {
      // If it doesn't exist and does not resemble an email, restrict creation with helpful error
      if (!searchVal.includes("@")) {
        return res.status(404).json({
          success: false,
          error: "ID único o código de estudiante no encontrado. Por favor, verifique el código (ej: AE-STUD-XXXX) o complete su registro de correo."
        });
      }

      // Register brand new student with initial 0 score/XP
      student = {
        id: `stud_${Date.now()}`,
        name: name || email.split("@")[0],
        lastName: lastName || "",
        phone: phone || "",
        email: email.toLowerCase(),
        country: country || "Morocco",
        city: city || "Rabat",
        targetCity: targetCity || "Madrid",
        gender: gender || "Masculino",
        age: age ? Number(age) : 20,
        language: "fr",
        level: level || "A1", // initial custom selected Spanish CEFR level
        academicGoal: academicGoal || "FP Grado Superior",
        currentEducation: currentEducation || "Bachillerato",
        currentCountry: currentCountry || country || "Morocco",
        professionalGoal: "Estudiante de FP / Universidad",
        xp: 0, // NEW REGISTRATION = 0 XP
        streak: 3, // Start with 3 lives / energies like Duolingo!
        completedLessons: 0,
        completedExams: 0,
        studyTimeMinutes: 0,
        hasCv: false,
        registrationDate: new Date().toISOString().split("T")[0],
        premiumStatus: false,
        vocationalTopChoice: "Informática",
        isInternshipReady: false,
        hasJobReady: false,
        activeInCommunity: true,
        channel: "Direct",
        paymentAmount: 0,
        isBlocked: false
      };
      db.students.push(student);
      writeDB(db);
    }

    // Save/Activate active sessions IP mapping
    activeSessions.set(email.toLowerCase(), clientIP);

    res.json({ success: true, student });
  });

  // Student Logout API
  app.post("/api/auth/student-logout", (req, res) => {
    const { email } = req.body;
    if (email) {
      activeSessions.delete(email.toLowerCase());
    }
    res.json({ success: true });
  });

  // Admin / Hosts / Creators Login API
  app.post("/api/auth/admin-login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Correo administrativo y contraseña requeridos." });
    }

    const db = readDB();
    if (!db.admins) {
      db.admins = [
        { email: "soullis8@gmail.com", password: "Sullivanem123_", role: "master", name: "Soulaymane" }
      ];
      writeDB(db);
    }

    const admin = db.admins.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (admin) {
      res.json({ success: true, admin });
    } else {
      res.status(401).json({ error: "Credenciales de colaborador inválidas. Acceso restringido únicamente a personal autorizado." });
    }
  });

  // Create Collaborator API (Only accessible to master admin soullis8@gmail.com)
  app.post("/api/admin/create-collaborator", (req, res) => {
    const { creatorEmail, name, password, adminEmail, canEditData } = req.body;

    if (!adminEmail || adminEmail.toLowerCase() !== "soullis8@gmail.com") {
      return res.status(403).json({ error: "Permiso denegado. Solo el Administrador Maestro puede crear otros anfitriones." });
    }

    if (!creatorEmail || !password || !name) {
      return res.status(400).json({ error: "Todos los campos del nuevo colaborador son obligatorios." });
    }

    const db = readDB();
    if (!db.admins) {
      db.admins = [{ email: "soullis8@gmail.com", password: "Sullivanem123_", role: "master", name: "Soulaymane" }];
    }

    const exists = db.admins.find(a => a.email.toLowerCase() === creatorEmail.toLowerCase());
    if (exists) {
      return res.status(400).json({ error: "Este correo electrónico ya está registrado como colaborador." });
    }

    db.admins.push({
      email: creatorEmail.toLowerCase().trim(),
      password,
      role: "anfitrion",
      name: name.trim(),
      canEditData: !!canEditData
    });

    writeDB(db);
    res.json({ success: true, admins: db.admins });
  });

  // Toggle Collaborator Edit Privileges API
  app.post("/api/admin/toggle-collaborator-edit", (req, res) => {
    const { email, canEditData, adminEmail } = req.body;
    if (!adminEmail || adminEmail.toLowerCase() !== "soullis8@gmail.com") {
      return res.status(403).json({ error: "Permiso denegado. Solo el Administrador Maestro puede modificar privilegios de edición." });
    }

    const db = readDB();
    if (!db.admins) db.admins = [];
    const idx = db.admins.findIndex(a => a.email.toLowerCase() === email.toLowerCase());
    if (idx !== -1) {
      db.admins[idx].canEditData = !db.admins[idx].canEditData;
      writeDB(db);
      res.json({ success: true, admins: db.admins });
    } else {
      res.status(404).json({ error: "Colaborador no encontrado." });
    }
  });

  // Create Student Account with Unique ID API
  app.post("/api/admin/create-student", (req, res) => {
    const { name, lastName, country, targetCity, academicGoal, emailInput, level, adminEmail } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "El nombre del estudiante es obligatorio." });
    }

    const db = readDB();
    
    // Generate random unique ID code
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const studentIdCode = `AE-STUD-${randomSuffix}`;
    const generatedEmail = emailInput && emailInput.trim() ? emailInput.trim().toLowerCase() : `estudiante-${randomSuffix.toLowerCase()}@atrevete.com`;

    // Ensure email is unique
    const exists = db.students.find(s => s.email.toLowerCase() === generatedEmail || (s.studentIdCode && s.studentIdCode.toLowerCase() === studentIdCode.toLowerCase()));
    if (exists) {
      return res.status(400).json({ error: "Este correo electrónico o ID único ya se encuentra registrado." });
    }

    const newStudent = {
      id: `stud_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`,
      studentIdCode: studentIdCode,
      name: name.trim(),
      lastName: (lastName || "").trim(),
      phone: "+212 600-000000",
      email: generatedEmail,
      country: country || "Morocco",
      city: "Casablanca",
      targetCity: targetCity || "Madrid",
      gender: "Masculino",
      age: 20,
      language: "fr",
      level: level || "A1",
      academicGoal: academicGoal || "FP Grado Superior",
      currentEducation: "Bachillerato",
      currentCountry: country || "Morocco",
      professionalGoal: "Estudiante de FP / Universidad",
      xp: 0,
      streak: 3,
      completedLessons: 0,
      completedExams: 0,
      studyTimeMinutes: 0,
      hasCv: false,
      registrationDate: new Date().toISOString().split("T")[0],
      premiumStatus: false,
      vocationalTopChoice: "Informática",
      isInternshipReady: false,
      hasJobReady: false,
      activeInCommunity: true,
      channel: "Direct",
      paymentAmount: 0,
      isBlocked: false
    };

    db.students.push(newStudent);
    writeDB(db);

    res.json({ success: true, student: newStudent, students: db.students });
  });

  // Delete Collaborator API (Only accessible to master admin soullis8@gmail.com)
  app.post("/api/admin/delete-collaborator", (req, res) => {
    const { email, adminEmail } = req.body;
    if (!adminEmail || adminEmail.toLowerCase() !== "soullis8@gmail.com") {
      return res.status(403).json({ error: "Permiso denegado. Solo el Administrador Maestro puede eliminar colaboradores." });
    }

    const db = readDB();
    if (!db.admins) return res.json({ success: true });

    db.admins = db.admins.filter(a => a.email.toLowerCase() !== email.toLowerCase());
    writeDB(db);
    res.json({ success: true, admins: db.admins });
  });

  // Get Collaborators List
  app.get("/api/admin/collaborators", (req, res) => {
    const db = readDB();
    res.json({ success: true, collaborators: db.admins || [] });
  });

  // Toggle Student Block (Suspension)
  app.post("/api/admin/toggle-student-block", (req, res) => {
    const { id, isBlocked } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ID de alumno requerido." });
    }

    const db = readDB();
    const idx = db.students.findIndex(s => s.id === id);

    if (idx !== -1) {
      db.students[idx].isBlocked = !!isBlocked;
      writeDB(db);
      res.json({ success: true, student: db.students[idx], students: db.students });
    } else {
      res.status(404).json({ error: "Alumno no encontrado." });
    }
  });

  // Update Student Profile State
  app.post("/api/student/update", (req, res) => {
    const { id, updates } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const db = readDB();
    const idx = db.students.findIndex(s => s.id === id);

    if (idx !== -1) {
      db.students[idx] = { ...db.students[idx], ...updates };
      writeDB(db);
      res.json({ success: true, student: db.students[idx] });
    } else {
      res.status(404).json({ error: "Student not found" });
    }
  });

  // Host/Owner Update Custom KPI Overrides and Alerts Action
  app.post("/api/admin/update-metrics", (req, res) => {
    const { customMetrics, alerts, newAlert } = req.body;
    const db = readDB();

    if (customMetrics) {
      db.customMetrics = { ...db.customMetrics, ...customMetrics };
    }
    if (alerts) {
      db.alerts = alerts;
    }
    if (newAlert) {
      db.alerts.unshift({
        id: `alert_${Date.now()}`,
        title: newAlert.title,
        type: newAlert.type || "info",
        timestamp: "Ahora"
      });
    }

    writeDB(db);
    res.json({ success: true, db });
  });

  // Admin Dismis Alert
  app.post("/api/admin/dismiss-alert", (req, res) => {
    const { id } = req.body;
    const db = readDB();
    db.alerts = db.alerts.filter(a => a.id !== id);
    writeDB(db);
    res.json({ success: true, db });
  });

  // Save custom lists from Owner dashboard
  app.post("/api/admin/save-custom-data", (req, res) => {
    const { key, data } = req.body;
    if (!key) {
      return res.status(400).json({ error: "No key specified for dynamic customization." });
    }
    const db = readDB();
    if (!db.customData) {
      db.customData = {};
    }
    db.customData[key] = data;
    writeDB(db);
    res.json({ success: true, customData: db.customData });
  });

  // --- ADVERTISING CAMPAIGNS FOR BRANDS ---
  app.get("/api/admin/ads", (req, res) => {
    const db = readDB();
    res.json({ success: true, ads: db.ads || [] });
  });

  app.post("/api/admin/ads/create", (req, res) => {
    const { brand, title, description, imageUrl, targetUrl } = req.body;
    if (!brand || !title) {
      return res.status(400).json({ error: "La marca y el título de la publicidad son obligatorios." });
    }

    const db = readDB();
    if (!db.ads) db.ads = [];

    const newAd = {
      id: `ad_${Date.now()}`,
      brand,
      title,
      description: description || "",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=300",
      targetUrl: targetUrl || "https://atrevete-espana.com",
      status: "active" as const,
      viewsCount: 0,
      clicksCount: 0,
      createdAt: new Date().toISOString()
    };

    db.ads.push(newAd);
    writeDB(db);
    res.json({ success: true, ad: newAd, ads: db.ads });
  });

  app.post("/api/admin/ads/toggle", (req, res) => {
    const { id } = req.body;
    const db = readDB();
    if (!db.ads) db.ads = [];

    const idx = db.ads.findIndex(a => a.id === id);
    if (idx !== -1) {
      db.ads[idx].status = db.ads[idx].status === "active" ? "paused" : "active";
      writeDB(db);
      res.json({ success: true, ad: db.ads[idx], ads: db.ads });
    } else {
      res.status(404).json({ error: "Publicidad no encontrada." });
    }
  });

  app.post("/api/admin/ads/delete", (req, res) => {
    const { id } = req.body;
    const db = readDB();
    if (!db.ads) db.ads = [];

    db.ads = db.ads.filter(a => a.id !== id);
    writeDB(db);
    res.json({ success: true, ads: db.ads });
  });


  // --- PROGRESS & AUDIT REPORTS ---
  app.get("/api/admin/reports", (req, res) => {
    const db = readDB();
    res.json({ success: true, reports: db.progressReports || [] });
  });

  app.post("/api/admin/reports/create", (req, res) => {
    const { title, metricType, summary, value, trend, author } = req.body;
    if (!title || !metricType || !summary) {
      return res.status(400).json({ error: "El título, tipo de métrica y resumen son requeridos." });
    }

    const db = readDB();
    if (!db.progressReports) db.progressReports = [];

    const newReport = {
      id: `rep_${Date.now()}`,
      title,
      date: new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute:"2-digit" }),
      metricType,
      summary,
      value: value || "N/A",
      trend: trend || "stable",
      author: author || "Administrador"
    };

    db.progressReports.push(newReport);
    writeDB(db);
    res.json({ success: true, report: newReport, reports: db.progressReports });
  });

  // Community Feed Post Chat Message with Multi-Language "Regularizador" Moderation check
  app.post("/api/community/post", (req, res) => {
    const { user, text, email } = req.body;
    if (!text || !user) {
      return res.status(400).json({ error: "User and Text are required" });
    }

    const db = readDB();

    // Word checking "Regularizador"
    if (containsInappropriateContent(text)) {
      const alertId = `viol_${Date.now()}`;
      
      // Register a moderation alert so the organizer can see the notice and choose to block or ignore
      db.alerts.unshift({
        id: alertId,
        title: `⚠️ COMENTARIO RESTRINGIDO por vocabulario inapropiado de "${user}" (${email || "Invitado"}): "${text}"`,
        type: "warning",
        timestamp: "Ahora mismo",
        violatorEmail: email,
        violatorName: user,
        isViolationUnit: true
      });

      writeDB(db);

      return res.status(400).json({ 
        success: false, 
        restricted: true, 
        error: "Tu comentario contiene palabras que violan nuestras directrices de la comunidad y ha sido restringido." 
      });
    }

    const newMsgObj = {
      id: `msg_${Date.now()}`,
      user,
      text,
      time: new Date().toISOString(),
      email
    };
    db.communityMessages.push(newMsgObj);

    // If an Arab student posted a message, also record active state in DB and add +5 XP score
    if (email) {
      const idx = db.students.findIndex(s => s.email.toLowerCase() === email.toLowerCase());
      if (idx !== -1) {
        db.students[idx].xp += 5; // posting chat message gives 5 score points!
        db.students[idx].activeInCommunity = true;
      }
    }

    writeDB(db);
    res.json({ success: true, message: newMsgObj, scoreUp: email ? 5 : 0 });
  });

  // Admin delete message endpoint
  app.post("/api/community/delete", (req, res) => {
    const id = req.body.id || req.body.postId;
    if (!id) {
      return res.status(400).json({ error: "ID de mensaje requerido (id o postId)." });
    }

    const db = readDB();
    db.communityMessages = db.communityMessages.filter(m => m.id !== id);
    writeDB(db);
    res.json({ success: true, communityMessages: db.communityMessages });
  });

  // Admin edit message endpoint
  app.post("/api/community/edit", (req, res) => {
    const { id, text } = req.body;
    if (!id || text === undefined) {
      return res.status(400).json({ error: "ID y texto del mensaje requeridos." });
    }

    const db = readDB();
    const idx = db.communityMessages.findIndex(m => m.id === id);
    if (idx !== -1) {
      db.communityMessages[idx].text = text;
      writeDB(db);
      return res.json({ success: true, communityMessages: db.communityMessages });
    }
    res.status(404).json({ error: "Mensaje no encontrado." });
  });

  // Block student endpoint
  app.post("/api/admin/block-student", (req, res) => {
    const { email, block } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Correo del estudiante requerido." });
    }

    const db = readDB();
    const studentIndex = db.students.findIndex(s => s.email.toLowerCase() === email.toLowerCase());
    
    if (studentIndex !== -1) {
      db.students[studentIndex].isBlocked = !!block;
      // If we are blocking, clean out their alerts from infraction panel
      if (block) {
        db.alerts = db.alerts.filter(a => !(a.violatorEmail && a.violatorEmail.toLowerCase() === email.toLowerCase()));
      }
      writeDB(db);
      res.json({ success: true, student: db.students[studentIndex], message: block ? "Estudiante bloqueado correctamente." : "Estudiante desbloqueado." });
    } else {
      res.status(404).json({ error: "No se encontró el estudiante para bloquear." });
    }
  });

  // Teacher Profile ADD (Create)
  app.post("/api/teachers/create", (req, res) => {
    const { name, subject, email, bio, phone, photoUrl, rating } = req.body;
    if (!name || !subject || !email) {
      return res.status(400).json({ error: "Nombre, asignatura y correo son requeridos para el profesor." });
    }

    const db = readDB();
    if (!db.teachers) db.teachers = [];

    const newTeacher: Teacher = {
      id: `teach_${Date.now()}`,
      name,
      subject,
      email,
      bio: bio || "Profesor docente colaborador de Atrévete a España.",
      phone: phone || "",
      photoUrl: photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      rating: rating ? Number(rating) : 5.0
    };

    db.teachers.push(newTeacher);
    writeDB(db);
    res.json({ success: true, teacher: newTeacher, teachers: db.teachers });
  });

  // Teacher Profile UPDATE (Modify)
  app.post("/api/teachers/update", (req, res) => {
    const { id, name, subject, email, bio, phone, photoUrl, rating } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ID del profesor requerido para modificación." });
    }

    const db = readDB();
    if (!db.teachers) db.teachers = [];

    const idx = db.teachers.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.teachers[idx] = {
        ...db.teachers[idx],
        name: name || db.teachers[idx].name,
        subject: subject || db.teachers[idx].subject,
        email: email || db.teachers[idx].email,
        bio: bio !== undefined ? bio : db.teachers[idx].bio,
        phone: phone !== undefined ? phone : db.teachers[idx].phone,
        photoUrl: photoUrl !== undefined ? photoUrl : db.teachers[idx].photoUrl,
        rating: rating !== undefined ? Number(rating) : db.teachers[idx].rating
      };
      writeDB(db);
      res.json({ success: true, teacher: db.teachers[idx], teachers: db.teachers });
    } else {
      res.status(404).json({ error: "Profesor no encontrado." });
    }
  });

  // Teacher Profile DELETE (Remove)
  app.post("/api/teachers/delete", (req, res) => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ID del profesor requerido para el borrado." });
    }

    const db = readDB();
    if (!db.teachers) db.teachers = [];

    db.teachers = db.teachers.filter(t => t.id !== id);
    writeDB(db);
    res.json({ success: true, teachers: db.teachers });
  });

  // AI Administrative Deep Advisor
  app.post("/api/admin/advisor", async (req, res): Promise<any> => {
    const { query } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
    }

    const db = readDB();
    
    // Core facts of the platform
    const totalUsers = db.students.length;
    const premiumUsers = db.students.filter(s => s.premiumStatus).length;
    const freeUsers = totalUsers - premiumUsers;
    const conversionRate = ((premiumUsers / totalUsers) * 100).toFixed(1);
    
    // Origin breakdowns
    const origMap: Record<string, number> = {};
    db.students.forEach(s => {
      origMap[s.country] = (origMap[s.country] || 0) + 1;
    });

    const context = `You are the master Business Intelligence, Data Analyst, and Product Management AI assistant inside the student success portal 'Atrévete a España' for Arab students.
    
    Here is the live metrics summary:
    - Registered students: ${totalUsers}
    - Premium subscribers: ${premiumUsers} (${conversionRate}% conversion)
    - Free tier subscribers: ${freeUsers}
    - Country of origin traffic: ${JSON.stringify(origMap)}
    - Platform views over time: ${db.customMetrics.totalPageViews} (Bounce rate: ${db.customMetrics.bounceRatePercent}%)
    - Active community threads: ${db.communityMessages.length} total messages
    
    Query: "${query}"
    
    Please answer the query with highly analytical, factual, expert Product Management, BI, and UX suggestions in a fully detailed and professional tone. Highlight specific recommended actions for monetization, user growth, content value optimization, and strategic partnerships with Spanish colleges. Return answer in Spanish. Use proper Markdown formatting.`;

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: context,
      });
      res.json({ response: response.text });
    } catch (error: any) {
      console.error("AI Advisor error:", error);
      res.status(500).json({ error: "Gemini error: " + error.message });
    }
  });

  // Endpoint: Generate interactive CEFR lessons
  app.post("/api/lesson", async (req, res): Promise<any> => {
    const { level, page, topic, targetLang } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required" });
    }

    const prompt = `You are an expert Spanish language professor specialized in teaching foreign students speaking ${targetLang}.
Prepare a highly exhaustive, comprehensive masterclass textbook-style lesson.
Level: ${level} (CEFR)
Topic: "${topic}"
Page: ${page} of 300

Create the lesson. The output MUST be a JSON object containing:
1. "title": A suitable short title for this lesson (in Spanish and/or ${targetLang}).
2. "explanation": A very thorough, deeply detailed, step-by-step complete academic explanation detailing all aspects of "${topic}". DO NOT give brief summaries. It should be at least 800-1200 words long to simulate a complete classroom lesson.
   You must explain in extensive detail:
   - The core concept, purpose, and grammatical rules (e.g., when to use it, why it matters).
   - All regular conjugation endings or construction patterns with copious examples.
   - Irregular forms, spelling shifts, stem changes (e.g., e->ie, o->ue), or common exceptions. If the topic has any irregular verbs, you MUST list them and their full conjugations in standard markdown tables.
   - Practical example sentences with deep contextual explanations and direct translated meanings in ${targetLang}.
   - Clear comparison or nuances with related structures (e.g., preterite vs imperfect, or ser vs estar).
   - Common pitfalls, mistakes, and exact guidelines on how foreign speakers can avoid them.
   Use rich Markdown formatting including clear headers (###, ####), bullet points (*), lists, bolding (**key concepts**), blockquotes (> for special notes), and markdown tables for conjugation matrices to make it visually professional and easy to study.
3. "vocabulary": A list of 6-8 key vocabulary terms/phrases related to this lesson. Each vocabulary item should have:
   - "spanish": the Spanish word or phrase
   - "dynamicLang": its translation in ${targetLang}
   - "explanation": a short usage note or details in ${targetLang}
4. "practice": A list of 6-8 interactive and highly-developed exercises to test comprehension, closely adapted to the CEFR level ${level}. Include a mix of these types:
   - "multiple-choice" (requires "options" string array and "correctIndex" number)
   - "fill-blank" (requires "blankWord" to fill, e.g. "soy")
   - "translation" (requires "correctTranslation", e.g. "Yo hablo español")
   - "conjugation" (requires "verb" and "correctAnswer")
   - "writing" (an open-ended prompt)

Ensure your output is strictly valid JSON conforming exactly to the following responseSchema.`;

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["title", "explanation", "vocabulary", "practice"],
            properties: {
              title: { type: Type.STRING },
              explanation: { type: Type.STRING },
              vocabulary: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["spanish", "dynamicLang", "explanation"],
                  properties: {
                    spanish: { type: Type.STRING },
                    dynamicLang: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  }
                }
              },
              practice: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["type", "question"],
                  properties: {
                    type: { type: Type.STRING, description: "One of: multiple-choice, fill-blank, translation, conjugation, writing" },
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctIndex: { type: Type.INTEGER },
                    blankWord: { type: Type.STRING },
                    correctTranslation: { type: Type.STRING },
                    verb: { type: Type.STRING },
                    correctAnswer: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const text = response.text;
      res.json(JSON.parse(text || "{}"));
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isQuota = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || (error?.status === 429);
      if (isQuota) {
        console.log("[Gemini API] Quota or rate limit reached (429). Returning 429 status for offline client fallback.");
        res.status(429).json({ error: "Gemini Quota Exceeded (429)", isQuota: true });
      } else {
        console.log("Error generating lesson (suppressed stderr):", errorMsg);
        res.status(500).json({ error: errorMsg || "Failed to generate lesson" });
      }
    }
  });

  // Endpoint: Generate Level Advancement Examination
  app.post("/api/exam", async (req, res): Promise<any> => {
    const { level, examId, targetLang } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required" });
    }

    const examNumber = examId || 1;
    const prompt = `Create a highly thorough, professional, and comprehensive official SIELE-inspired Spanish language examination for student level ${level}.
This is EXAM VERSION/NUMBER ${examNumber} out of 30 distinct exams.
The target student's interface language is ${targetLang}.

CRITICAL TOPIC RESTRICTION (STRICT MANDATE) FOR EXAM VERSION ${examNumber}:
- You MUST NOT include any questions, texts, or mentions related to administration, official bureaucracy, legal paperwork, visas, TIE, NIE, "empadronamiento", university enrollment, academic subjects (like mathematics, history, physics), certificate validations, or official offices.
- Every single question must focus EXCLUSIVELY on the SPANISH LANGUAGE: grammar rules, verb conjugations, correct preposition pairings, syntax structures, spelling rules, vocabulary lists, and natural/fictional everyday life dialogues or reading comprehension passages (such as ordering coffee, greeting friends, talking about the weather, expressing thoughts, or simple fictional scenarios).
- Make sure this exam version ${examNumber} is completely unique, with different sentence examples, vocabulary, and reading comprehension texts compared to other versions of this level's exam.

PROGRESSIVE DIFFICULTY STRUCTURE (SIELE PATTERN):
The exam must contain exactly 40 questions divided into 5 "Tareas" (Tasks), with 8 questions per Tarea. The level of difficulty must scale progressively:
- Tarea 1 (Q1 - Q8) [CEFR A1]: Simple comprehension of short messages/notices, basic vocabulary (greetings, food, items).
- Tarea 2 (Q9 - Q16) [CEFR A2]: Short descriptive dialogues, daily routines, basic past tenses (Imperfecto vs Indefinido).
- Tarea 3 (Q17 - Q24) [CEFR B1]: Detailed paragraphs on hobbies, travel, or cultural customs. Usage of Ser/Estar, future tense, and basic subjuntivo.
- Tarea 4 (Q25 - Q32) [CEFR B2]: Expressing opinions, agreement/disagreement, and doubts. Advanced usage of Subjuntivo, Por/Para, and prepositions.
- Tarea 5 (Q33 - Q40) [CEFR C1]: Advanced reading comprehension of an essay/opinion fragment, requiring sophisticated stylistic, syntactic, idiom, and register analysis.

REQUIREMENTS:
1. Return exactly 40 high-quality, diverse, and deeply developed multiple-choice ("tipo test") questions.
2. Every question must have exactly 4 clear, realistic options and exactly 1 correct index (0 to 3).
3. Include an elegant, concise explanation ("tip") in ${targetLang} explaining the underlying linguistic rule, grammar points, or syntactic structure behind the correct option to help the student learn.
4. For each question, specify the corresponding "tarea" identifier integer (1 to 5).

Ensure your output is strictly valid JSON conforming exactly to the following responseSchema.`;

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["examTitle", "questions"],
            properties: {
              examTitle: { type: Type.STRING },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: ["question", "options", "correctIndex", "tip", "tarea"],
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctIndex: { type: Type.INTEGER },
                    tip: { type: Type.STRING },
                    tarea: { type: Type.INTEGER }
                  }
                }
              }
            }
          }
        }
      });

      const text = response.text;
      res.json(JSON.parse(text || "{}"));
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isQuota = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || (error?.status === 429);
      if (isQuota) {
        console.log("[Gemini API] Quota or rate limit reached (429) during exam gen. Returning 429 status for offline client fallback.");
        res.status(429).json({ error: "Gemini Quota Exceeded (429)", isQuota: true });
      } else {
        console.log("Error generating exam (suppressed stderr):", errorMsg);
        res.status(500).json({ error: errorMsg || "Failed to generate exam" });
      }
    }
  });

  // Endpoint: Format and boost student CV to Spanish Standards
  app.post("/api/cv", async (req, res): Promise<any> => {
    const { name, email, role, city, edu, skills, exp } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required" });
    }

    const prompt = `You are a professional Spanish career advisor and CV formatter.
Generate a highly polished, clean European-standard CV in Spanish for the following individual.
The output MUST be a JSON object containing:
1. "cvHtml": Robust, beautiful HTML content (without outer <html>/<body>/<head> tags, wrapped inside a clean <div> with inline styled classes for excellent contrast and styling, using neutral grey, charcoal, and elegant accents) featuring:
   - Datos personales
   - Perfil / Objetivo profesional
   - Formación académica
   - Experiencia profesional (expanded and improved with professional Spanish verbs)
   - Competencias y habilidades
   - Idiomas (languages)

Information provided:
Full Name: ${name}
Email/Contact: ${email}
Target Role: ${role}
City/Location in Spain: ${city}
Education: ${edu}
Skills: ${skills}
Experience: ${exp}

Translate and elevate all points to reach premium business Spanish level. Make sure the typography is solid and margins feel professional.
Conform exactly to the following responseSchema.`;

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["cvHtml"],
            properties: {
              cvHtml: { type: Type.STRING }
            }
          }
        }
      });

      const text = response.text;
      res.json(JSON.parse(text || '{"cvHtml": ""}'));
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const isQuota = errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("RESOURCE_EXHAUSTED") || (error?.status === 429);
      if (isQuota) {
        console.log("[Gemini API] Quota or rate limit reached (429) during CV. Returning 429 status.");
        res.status(429).json({ error: "Gemini Quota Exceeded (429)", isQuota: true });
      } else {
        console.log("Error generating CV (suppressed stderr):", errorMsg);
        res.status(500).json({ error: errorMsg || "Failed to generate CV" });
      }
    }
  });

  // Endpoint: Automated Spanish Grammar Checking on Community chatroom
  app.post("/api/chat-correct", async (req, res): Promise<any> => {
    const { message } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is required" });
    }

    const prompt = `An Arab student has written a message in a Spanish community chatroom:
"${message}"

Analyze if this message is trying to use Spanish and has grammar or spelling errors.
If there are errors, provide a helpful and encouraging 1-2 sentence correction tip (in French, Arabic, or English, matching the most likely user profile).
If the message is not in Spanish, or has zero mistakes, return null.

Provide the response in JSON matching the following responseSchema.`;

    try {
      const response = await generateContentWithRetry({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["tip"],
            properties: {
              tip: { type: Type.STRING }
            }
          }
        }
      });

      const text = response.text;
      res.json(JSON.parse(text || '{"tip": null}'));
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.log("Error checking chat (suppressed stderr):", errorMsg);
      res.json({ tip: null });
    }
  });

  // Vite or static serving middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
