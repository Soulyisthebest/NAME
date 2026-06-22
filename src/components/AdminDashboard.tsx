import React, { useState, useEffect } from "react";
import { 
  Building, User, Users, DollarSign, Award, ArrowDownToLine, 
  ChevronRight, AlertTriangle, MessageSquare, Compass, Shield, 
  MapPin, Clock, Search, Sliders, CheckCircle, HelpCircle, 
  Activity, ArrowRight, RefreshCw, Sparkles, Plus, Trash2, Globe, Edit3, Save, Check, Ban
} from "lucide-react";
import { downloadStudentPDF, downloadAdPDF, downloadReportPDF } from "../utils/pdfGenerator";
import { FORMATIONS, LOGEMENT, STUDENT_CITIES_GUIDE, NAV_ITEMS } from "../data";

interface AdminDashboardProps {
  lang: string;
  onLogout: () => void;
  dbStats: {
    students: any[];
    communityMessages: any[];
    customMetrics: {
      totalPageViews: number;
      totalVisits: number;
      avgSessionSeconds: number;
      bounceRatePercent: number;
    };
    alerts: any[];
    teachers?: any[];
    customData?: {
      formations?: any;
      housing?: any[];
      studentLife?: any[];
      navItems?: any[];
    };
  } | null;
  onRefreshStats: () => void;
  t: (item: any) => string;
}

export function AdminDashboard({ lang, onLogout, dbStats, onRefreshStats, t }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Custom metrics modifier state
  const [editingMetrics, setEditingMetrics] = useState(false);
  const [metricPageViews, setMetricPageViews] = useState(dbStats?.customMetrics?.totalPageViews || 63820);
  const [metricVisits, setMetricVisits] = useState(dbStats?.customMetrics?.totalVisits || 12450);
  const [metricSession, setMetricSession] = useState(dbStats?.customMetrics?.avgSessionSeconds || 432);
  const [metricBounce, setMetricBounce] = useState(dbStats?.customMetrics?.bounceRatePercent || 24.5);

  // Alerts center state
  const [alertTitleInp, setAlertTitleInp] = useState("");
  const [alertTypeInp, setAlertTypeInp] = useState<"info" | "warning" | "success">("info");

  // Portal de empresas filters
  const [filterCity, setFilterCity] = useState("all");
  const [filterSector, setFilterSector] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [filterAvailability, setFilterAvailability] = useState("all");

  // Top Talent range select
  const [talentRange, setTalentRange] = useState<number>(10);

  // IA Panel input and response
  const [advisorQuery, setAdvisorQuery] = useState("");
  const [advisorResponse, setAdvisorResponse] = useState("");
  const [loadingAdvisor, setLoadingAdvisor] = useState(false);

  // User View Simulated / Moderation States
  const [selectedPreviewStudent, setSelectedPreviewStudent] = useState<any>(null);
  const [selectedPreviewTab, setSelectedPreviewTab] = useState<string>("dashboard");

  // Managing Teachers States
  const [tchName, setTchName] = useState("");
  const [tchSubject, setTchSubject] = useState("");
  const [tchEmail, setTchEmail] = useState("");
  const [tchBio, setTchBio] = useState("");
  const [tchPhone, setTchPhone] = useState("");
  const [tchPhotoUrl, setTchPhotoUrl] = useState("");
  const [tchRating, setTchRating] = useState(5);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [teachActionLoading, setTeachActionLoading] = useState(false);
  const [teachActionError, setTeachActionError] = useState("");
  const [teachActionSuccess, setTeachActionSuccess] = useState("");

  // Collaborator & Student Access States
  const [collabEmail, setCollabEmail] = useState("");
  const [collabName, setCollabName] = useState("");
  const [collabPassword, setCollabPassword] = useState("");
  const [collabCanEdit, setCollabCanEdit] = useState(false);
  const [creationType, setCreationType] = useState<"anfitrion" | "estudiante">("anfitrion");
  const [collabList, setCollabList] = useState<any[]>([]);
  const [collabLoading, setCollabLoading] = useState(false);
  const [collabError, setCollabError] = useState("");
  const [collabSuccess, setCollabSuccess] = useState("");

  // Student creation specific parameters
  const [studName, setStudName] = useState("");
  const [studLastName, setStudLastName] = useState("");
  const [studCountry, setStudCountry] = useState("Morocco");
  const [studTargetCity, setStudTargetCity] = useState("Madrid");
  const [studGoal, setStudGoal] = useState("FP Grado Superior");
  const [studLevel, setStudLevel] = useState("A1");
  const [studEmailOpt, setStudEmailOpt] = useState("");
  const [generatedStudCode, setGeneratedStudCode] = useState("");

  // Student Search & Suspension States
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentSearchError, setStudentSearchError] = useState("");
  const [studentSearchSuccess, setStudentSearchSuccess] = useState("");
  const [studentActionLoadingId, setStudentActionLoadingId] = useState<string | null>(null);

  // Brand Advertising States
  const [adsList, setAdsList] = useState<any[]>([]);
  const [adBrand, setAdBrand] = useState("");
  const [adTitle, setAdTitle] = useState("");
  const [adDesc, setAdDesc] = useState("");
  const [adImg, setAdImg] = useState("");
  const [adTargetUrl, setAdTargetUrl] = useState("");
  const [adLoading, setAdLoading] = useState(false);
  const [adError, setAdError] = useState("");
  const [adSuccess, setAdSuccess] = useState("");

  // Progress Reports States
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [repTitle, setRepTitle] = useState("");
  const [repType, setRepType] = useState<"registros" | "ingresos" | "conversiones" | "soporte">("registros");
  const [repSummary, setRepSummary] = useState("");
  const [repValue, setRepValue] = useState("");
  const [repTrend, setRepTrend] = useState<"up" | "down" | "stable">("stable");
  const [repAuthor, setRepAuthor] = useState("");
  const [repLoading, setRepLoading] = useState(false);
  const [repError, setRepError] = useState("");
  const [repSuccess, setRepSuccess] = useState("");

  // --- Information Editor States ---
  const [editorSubTab, setEditorSubTab] = useState<"formations" | "housing" | "studentLife" | "posts" | "navigation">("formations");
  const [editorSuccess, setEditorSuccess] = useState("");
  const [editorError, setEditorError] = useState("");
  const [editorLoading, setEditorLoading] = useState(false);

  // Navigation menu editor states
  const [editMenuIdx, setEditMenuIdx] = useState<number>(-1);
  const [editMenuIcon, setEditMenuIcon] = useState("");
  const [editMenuEs, setEditMenuEs] = useState("");
  const [editMenuFr, setEditMenuFr] = useState("");
  const [editMenuAr, setEditMenuAr] = useState("");
  const [editMenuEn, setEditMenuEn] = useState("");

  // 1. Formations editor states
  const [editFormCategory, setEditFormCategory] = useState("fp_superior");
  const [editFormFamIdx, setEditFormFamIdx] = useState<number>(-1);
  const [editFormFamNameEs, setEditFormFamNameEs] = useState("");
  const [editFormFamNameFr, setEditFormFamNameFr] = useState("");
  const [editFormFamNameAr, setEditFormFamNameAr] = useState("");
  const [editFormFamNameEn, setEditFormFamNameEn] = useState("");
  const [editFormCyclesTextEs, setEditFormCyclesTextEs] = useState(""); 
  const [editFormCyclesTextFr, setEditFormCyclesTextFr] = useState(""); 
  const [editFormCyclesTextAr, setEditFormCyclesTextAr] = useState(""); 
  const [editFormCyclesTextEn, setEditFormCyclesTextEn] = useState(""); 

  // Global fields for the selected Category (FP Medio, FP Superior, Universidad)
  const [globalTitleEs, setGlobalTitleEs] = useState("");
  const [globalTitleFr, setGlobalTitleFr] = useState("");
  const [globalTitleAr, setGlobalTitleAr] = useState("");
  const [globalDurationEs, setGlobalDurationEs] = useState("");
  const [globalDurationFr, setGlobalDurationFr] = useState("");
  const [globalDurationAr, setGlobalDurationAr] = useState("");
  const [globalCostEs, setGlobalCostEs] = useState("");
  const [globalCostFr, setGlobalCostFr] = useState("");
  const [globalCostAr, setGlobalCostAr] = useState("");
  const [globalAccessesText, setGlobalAccessesText] = useState("");
  const [globalNoteEs, setGlobalNoteEs] = useState("");
  const [globalNoteFr, setGlobalNoteFr] = useState("");
  const [globalNoteAr, setGlobalNoteAr] = useState("");

  // Sync global category fields on selection or statistics update
  useEffect(() => {
    const currentFormations = dbStats?.customData?.formations || FORMATIONS;
    const cat = currentFormations[editFormCategory];
    if (cat) {
      setGlobalTitleEs(cat.es || cat.en || "");
      setGlobalTitleFr(cat.fr || "");
      setGlobalTitleAr(cat.ar || "");
      setGlobalDurationEs(cat.duration?.es || cat.duration?.en || "");
      setGlobalDurationFr(cat.duration?.fr || cat.duration?.en || "");
      setGlobalDurationAr(cat.duration?.ar || cat.duration?.en || "");
      setGlobalCostEs(cat.cost?.es || cat.cost?.en || "");
      setGlobalCostFr(cat.cost?.fr || cat.cost?.en || "");
      setGlobalCostAr(cat.cost?.ar || cat.cost?.en || "");
      setGlobalAccessesText((cat.access || []).join("\n"));
      setGlobalNoteEs(cat.note?.es || cat.note?.en || cat.note?.es || "");
      setGlobalNoteFr(cat.note?.fr || cat.note?.en || "");
      setGlobalNoteAr(cat.note?.ar || cat.note?.en || "");
    }
  }, [editFormCategory, dbStats]);

  // Fetch Collaborators
  async function fetchCollaborators() {
    setCollabLoading(true);
    setCollabError("");
    try {
      const res = await fetch("/api/admin/collaborators");
      if (res.ok) {
        const data = await res.json();
        setCollabList(data.collaborators || []);
      } else {
        setCollabError("No se pudo cargar la lista de colaboradores.");
      }
    } catch (e) {
      setCollabError("Error de conexión al cargar colaboradores.");
    } finally {
      setCollabLoading(false);
    }
  }

  async function fetchAds() {
    try {
      const res = await fetch("/api/admin/ads");
      const data = await res.json();
      if (res.ok && data.success) {
        setAdsList(data.ads || []);
      }
    } catch (e) {
      console.error("Error al cargar anuncios", e);
    }
  }

  async function fetchReports() {
    try {
      const res = await fetch("/api/admin/reports");
      const data = await res.json();
      if (res.ok && data.success) {
        setReportsList(data.reports || []);
      }
    } catch (e) {
      console.error("Error al cargar informes", e);
    }
  }

  // 2. Housing editor states
  const [editingHousingId, setEditingHousingId] = useState<string | null>(null);
  const [houseTitleEs, setHouseTitleEs] = useState("");
  const [houseTitleFr, setHouseTitleFr] = useState("");
  const [houseTitleAr, setHouseTitleAr] = useState("");
  const [houseCity, setHouseCity] = useState("Madrid");
  const [housePrice, setHousePrice] = useState(400);
  const [houseRating, setHouseRating] = useState(4.5);
  const [houseImg, setHouseImg] = useState("");
  const [houseContact, setHouseContact] = useState("WhatsApp: +34 600 000 000");

  // 3. Student cities life editor states
  const [editCityKey, setEditCityKey] = useState("Madrid");
  const [cityEventsEs, setCityEventsEs] = useState("");
  const [cityEventsFr, setCityEventsFr] = useState("");
  const [cityEventsAr, setCityEventsAr] = useState("");
  const [cityFriendsEs, setCityFriendsEs] = useState("");
  const [cityFriendsFr, setCityFriendsFr] = useState("");
  const [cityFriendsAr, setCityFriendsAr] = useState("");
  const [cityMarketTipsEs, setCityMarketTipsEs] = useState("");
  const [cityMarketTipsFr, setCityMarketTipsFr] = useState("");
  const [cityMarketTipsAr, setCityMarketTipsAr] = useState("");

  useEffect(() => {
    fetchCollaborators();
  }, []);

  useEffect(() => {
    if (activeTab === "collaborators_admin") {
      fetchCollaborators();
    } else if (activeTab === "publicidad") {
      fetchAds();
    } else if (activeTab === "informes_avance") {
      fetchReports();
    }
  }, [activeTab]);

  if (!dbStats) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 bg-[#070a13] min-h-screen">
        <RefreshCw className="animate-spin text-amber-500 mb-4" size={32} />
        <p className="text-sm font-sans">Cargando consola de administración...</p>
      </div>
    );
  }

  const { students, communityMessages, customMetrics, alerts } = dbStats;

  // Real-time calculations from students database
  const totalStudents = students.length;
  const premiumStudents = students.filter(s => s.premiumStatus).length;
  const freeStudents = totalStudents - premiumStudents;
  const conversionRate = totalStudents > 0 ? ((premiumStudents / totalStudents) * 100).toFixed(1) : "0";
  const totalRevenue = students.reduce((acc, s) => acc + (s.paymentAmount || 0), 0);

  // Demographics breakdown
  const nationCounts = students.reduce((acc: any, s) => {
    acc[s.country] = (acc[s.country] || 0) + 1;
    return acc;
  }, {});

  const levelCounts = students.reduce((acc: any, s) => {
    acc[s.level] = (acc[s.level] || 0) + 1;
    return acc;
  }, {});

  const genderCounts = students.reduce((acc: any, s) => {
    acc[s.gender] = (acc[s.gender] || 0) + 1;
    return acc;
  }, {});

  // Roadmap stages analysis
  // Simulate 8 roadmap steps count
  const roadmapStatus = {
    buscar: students.filter(s => s.completedLessons >= 0).length,
    documentacion: students.filter(s => s.completedLessons >= 3).length,
    solicitandoVisa: students.filter(s => s.completedExams >= 1).length,
    visadoObtenido: students.filter(s => s.completedExams >= 2).length,
    yaEnEspana: students.filter(s => s.xp > 180).length,
    alojamiento: students.filter(s => s.xp > 220).length,
    comunidadActiva: students.filter(s => s.activeInCommunity).length,
    trabajoEncontrado: students.filter(s => s.hasJobReady).length,
  };

  // Vocational sectors interests counts
  const sectorCounts = students.reduce((acc: any, s) => {
    const sName = s.vocationalTopChoice || "Informática";
    acc[sName] = (acc[sName] || 0) + 1;
    return acc;
  }, {});

  // Channels count
  const channelCounts = students.reduce((acc: any, s) => {
    acc[s.channel] = (acc[s.channel] || 0) + 1;
    return acc;
  }, {});

  // Toggle Collaborator Edit Permissions (Active Toggle)
  const handleToggleCollaboratorEdit = async (email: string) => {
    setCollabError("");
    setCollabSuccess("");
    const adminEmail = localStorage.getItem("sp_logged_email") || "";

    try {
      const res = await fetch("/api/admin/toggle-collaborator-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          adminEmail
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCollabSuccess(`¡Correcto! Privilegios actualizados para el colaborador.`);
        setCollabList(data.admins || []);
      } else {
        setCollabError(data.error || "No se pudieron modificar los privilegios.");
      }
    } catch (err) {
      setCollabError("Error de conexión al modificar privilegios.");
    }
  };

  // Create Collaborator or student based on creationType
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCollabError("");
    setCollabSuccess("");
    setGeneratedStudCode("");
    const adminEmail = localStorage.getItem("sp_logged_email") || "";

    if (creationType === "anfitrion") {
      if (!collabEmail.trim() || !collabName.trim() || !collabPassword.trim()) {
        setCollabError("Todos los campos para el nuevo anfitrión son obligatorios.");
        return;
      }

      try {
        const res = await fetch("/api/admin/create-collaborator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminEmail,
            creatorEmail: collabEmail.trim(),
            name: collabName.trim(),
            password: collabPassword.trim(),
            canEditData: collabCanEdit
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setCollabSuccess(`¡Correcto! Nuevo Anfitrión '${collabName}' registrado.`);
          setCollabEmail("");
          setCollabName("");
          setCollabPassword("");
          setCollabCanEdit(false);
          setCollabList(data.admins || []);
        } else {
          setCollabError(data.error || "No se pudo crear el anfitrión.");
        }
      } catch (err) {
        setCollabError("Error de conexión al registrar anfitrión.");
      }
    } else {
      // Create student
      if (!studName.trim()) {
        setCollabError("El nombre del estudiante es obligatorio.");
        return;
      }

      try {
        const res = await fetch("/api/admin/create-student", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            adminEmail,
            name: studName.trim(),
            lastName: studLastName.trim(),
            country: studCountry,
            targetCity: studTargetCity,
            academicGoal: studGoal,
            level: studLevel,
            emailInput: studEmailOpt
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          const code = data.student.studentIdCode || "AE-STUD-ERROR";
          setGeneratedStudCode(code);
          setCollabSuccess(`¡Correcto! Estudiante '${studName}' registrado.`);
          // Clear inputs
          setStudName("");
          setStudLastName("");
          setStudEmailOpt("");
          
          // Refresh list of students
          onRefreshStats();
        } else {
          setCollabError(data.error || "No se pudo crear el estudiante.");
        }
      } catch (err) {
        setCollabError("Error de conexión al registrar estudiante.");
      }
    }
  };

  // Delete Collaborator
  const handleDeleteCollaborator = async (email: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al colaborador con correo ${email}?`)) {
      return;
    }
    setCollabError("");
    setCollabSuccess("");
    const adminEmail = localStorage.getItem("sp_logged_email") || "";

    try {
      const res = await fetch("/api/admin/delete-collaborator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          email
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCollabSuccess("Colaborador eliminado con éxito.");
        setCollabList(data.admins || []);
      } else {
        setCollabError(data.error || "No se pudo eliminar el colaborador.");
      }
    } catch (err) {
      setCollabError("Error de conexión al eliminar colaborador.");
    }
  };

  const handleToggleStudentBlock = async (studentId: string, currentBlocked: boolean) => {
    setStudentSearchError("");
    setStudentSearchSuccess("");
    setStudentActionLoadingId(studentId);
    try {
      const res = await fetch("/api/admin/toggle-student-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: studentId,
          isBlocked: !currentBlocked
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStudentSearchSuccess("Estado del alumno actualizado con éxito.");
        onRefreshStats();
      } else {
        setStudentSearchError(data.error || "No se pudo actualizar el estado del alumno.");
      }
    } catch (err) {
      setStudentSearchError("Fallo de red al intentar conmutar la suspensión.");
    } finally {
      setStudentActionLoadingId(null);
    }
  };

  const handleCreateAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdError("");
    setAdSuccess("");
    if (!adBrand.trim() || !adTitle.trim()) {
      setAdError("La marca y el título son campos obligatorios.");
      return;
    }

    setAdLoading(true);
    try {
      const res = await fetch("/api/admin/ads/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: adBrand.trim(),
          title: adTitle.trim(),
          description: adDesc.trim(),
          imageUrl: adImg.trim() || undefined,
          targetUrl: adTargetUrl.trim() || undefined
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdSuccess(`¡Publicidad de "${adBrand}" creada con éxito!`);
        setAdBrand("");
        setAdTitle("");
        setAdDesc("");
        setAdImg("");
        setAdTargetUrl("");
        setAdsList(data.ads || []);
      } else {
        setAdError(data.error || "No se pudo registrar el anuncio.");
      }
    } catch (err) {
      setAdError("Fallo de red al registrar el anuncio.");
    } finally {
      setAdLoading(false);
    }
  };

  const handleToggleAdStatus = async (id: string) => {
    try {
      const res = await fetch("/api/admin/ads/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdsList(data.ads || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAd = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta publicidad permanentemente?")) return;
    try {
      const res = await fetch("/api/admin/ads/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdsList(data.ads || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setRepError("");
    setRepSuccess("");
    if (!repTitle.trim() || !repSummary.trim()) {
      setRepError("El nombre del informe y su resumen ejecutivo son obligatorios.");
      return;
    }

    setRepLoading(true);
    try {
      const res = await fetch("/api/admin/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: repTitle.trim(),
          metricType: repType,
          summary: repSummary.trim(),
          value: repValue.trim() || "N/A",
          trend: repTrend,
          author: repAuthor.trim() || "Consola Pro"
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRepSuccess("Informe operativo redactado con éxito.");
        setRepTitle("");
        setRepSummary("");
        setRepValue("");
        setRepAuthor("");
        setReportsList(data.reports || []);
      } else {
        setRepError(data.error || "No se pudo redactar el informe.");
      }
    } catch (err) {
      setRepError("Error de comunicación con el motor de informes.");
    } finally {
      setRepLoading(false);
    }
  };

  // Update administrative variables in the database
  const handleUpdateMetricsForm = async () => {
    try {
      const res = await fetch("/api/admin/update-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customMetrics: {
            totalPageViews: Number(metricPageViews),
            totalVisits: Number(metricVisits),
            avgSessionSeconds: Number(metricSession),
            bounceRatePercent: Number(metricBounce)
          }
        })
      });
      if (res.ok) {
        setEditingMetrics(false);
        onRefreshStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Create manual alert
  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertTitleInp.trim()) return;

    try {
      const res = await fetch("/api/admin/update-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newAlert: {
            title: alertTitleInp,
            type: alertTypeInp
          }
        })
      });
      if (res.ok) {
        setAlertTitleInp("");
        onRefreshStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Dimension-based automated Alerts system (Section 13)
  const systemAutoAlerts = [];
  if (students.filter(s => s.completedLessons === 0).length > 50) {
    systemAutoAlerts.push({
      id: "sys_1",
      title: "Alta concentración de alumnos con lecciones sin completar (A1). Sugerencia: Enviar recordatorio por email.",
      type: "warning"
    });
  }
  if (Number(conversionRate) < 15) {
    systemAutoAlerts.push({
      id: "sys_2",
      title: "Tasa de conversión por debajo del objetivo (15.0%). Considere lanzar oferta de verano.",
      type: "warning"
    });
  }
  if (students.filter(s => s.country === "Morocco").length > 100) {
    systemAutoAlerts.push({
      id: "sys_3",
      title: "Crecimiento acelerado detectado en Marruecos. Mercado con mayor tracción este trimestre.",
      type: "success"
    });
  }
  if (students.filter(s => s.vocationalTopChoice === "Informática").length > students.length * 0.3) {
    systemAutoAlerts.push({
      id: "sys_4",
      title: "Demanda sin precedentes para FP Superior de Informática (DAW/DAM). Oportunidad para buscar convenios de prácticas.",
      type: "success"
    });
  }

  // Dismiss a system/manual alert
  const handleDismissAlert = async (id: string) => {
    try {
      const res = await fetch("/api/admin/dismiss-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        onRefreshStats();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // IA Business Analyst query resolver
  const handleQueryAdvisor = async () => {
    if (!advisorQuery.trim()) return;
    setLoadingAdvisor(true);
    setAdvisorResponse("");

    try {
      const res = await fetch("/api/admin/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: advisorQuery })
      });
      const data = await res.json();
      if (res.ok) {
        setAdvisorResponse(data.response);
      } else {
        setAdvisorResponse("Error resolviendo la consulta con Gemini: " + (data.error || "Inténtalo de nuevo."));
      }
    } catch (err: any) {
      setAdvisorResponse("Error al contactar con el modelo de IA: " + err.message);
    } finally {
      setLoadingAdvisor(false);
    }
  };

  // Moderation & Conversation Regularizer actions
  const handleDeletePost = async (postId: string) => {
    try {
      const res = await fetch("/api/community/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId })
      });
      if (res.ok) {
        onRefreshStats();
      }
    } catch (err) {}
  };

  const handleBlockStudent = async (email: string, block: boolean) => {
    try {
      const res = await fetch("/api/admin/block-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, block })
      });
      if (res.ok) {
        onRefreshStats();
      }
    } catch (err) {}
  };

  // --- Information Editor Handlers ---
  const handleSaveFormation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editFormFamIdx === -1) {
      setEditorError("Por favor, selecciona una familia académica a editar.");
      return;
    }
    setEditorLoading(true);
    setEditorError("");
    setEditorSuccess("");

    try {
      // Clone custom formations or fall back to original FORMATIONS
      const currentFormations = JSON.parse(JSON.stringify(dbStats?.customData?.formations || FORMATIONS));
      const targetCategory = currentFormations[editFormCategory];
      if (targetCategory && targetCategory.families[editFormFamIdx]) {
        targetCategory.families[editFormFamIdx] = {
          name: {
            es: editFormFamNameEs.trim(),
            fr: editFormFamNameFr.trim(),
            ar: editFormFamNameAr.trim(),
            en: editFormFamNameEn.trim() || editFormFamNameEs.trim(),
          },
          salidas: {
            es: editFormCyclesTextEs.split(",").map((s: string) => s.trim()).filter(Boolean),
            fr: editFormCyclesTextFr.split(",").map((s: string) => s.trim()).filter(Boolean),
            ar: editFormCyclesTextAr.split(",").map((s: string) => s.trim()).filter(Boolean),
            en: editFormCyclesTextEn.split(",").map((s: string) => s.trim()).filter(Boolean),
          }
        };

        const res = await fetch("/api/admin/save-custom-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "formations",
            data: currentFormations
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setEditorSuccess("¡Familiaridad de Formación actualizada correctamente en el sistema!");
          onRefreshStats();
        } else {
          setEditorError(data.error || "No se pudo guardar la formación.");
        }
      } else {
        setEditorError("No se encontró la familia académica seleccionada.");
      }
    } catch (err) {
      setEditorError("Error al conectar con el servidor.");
    } finally {
      setEditorLoading(false);
    }
  };

  const handleSaveHousing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingHousingId === null) {
      setEditorError("Por favor, selecciona el índice de alojamiento que deseas reescribir.");
      return;
    }
    setEditorLoading(true);
    setEditorError("");
    setEditorSuccess("");

    try {
      const currentHousing = JSON.parse(JSON.stringify(dbStats?.customData?.housing || LOGEMENT));
      const idx = Number(editingHousingId);
      if (currentHousing && currentHousing[idx]) {
        currentHousing[idx] = {
          type: {
            es: houseCity.trim(), // target city
            fr: "Colocation / Résidence",
            ar: "شقة / سكن",
            en: "Housing offer"
          },
          name: {
            es: houseTitleEs.trim(),
            fr: houseTitleFr.trim(),
            ar: houseTitleAr.trim(),
            en: houseTitleEs.trim()
          },
          desc: {
            es: houseContact.trim(), // using contact or extra info
            fr: "Détails disponibles en espagnol",
            ar: "التفاصيل متاحة باللغة الإسبانية",
            en: "Details available in Spanish"
          },
          price: {
            es: `${housePrice}€ / mes`,
            fr: `${housePrice}€ / mois`,
            ar: `${housePrice} يورو / شهر`,
            en: `${housePrice}€ / month`
          }
        };

        const res = await fetch("/api/admin/save-custom-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "housing",
            data: currentHousing
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setEditorSuccess("¡Oferta de alojamiento editada con éxito!");
          onRefreshStats();
        } else {
          setEditorError(data.error || "Error al guardar el alojamiento.");
        }
      }
    } catch (err) {
      setEditorError("Error al sincronizar con el servidor de bases de datos.");
    } finally {
      setEditorLoading(false);
    }
  };

  const handleSaveStudentLife = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditorLoading(true);
    setEditorError("");
    setEditorSuccess("");

    try {
      const currentLife = JSON.parse(JSON.stringify(dbStats?.customData?.studentLife || STUDENT_CITIES_GUIDE));
      const idx = currentLife.findIndex((g: any) => g.city.toLowerCase() === editCityKey.toLowerCase());
      if (idx !== -1) {
        currentLife[idx].events = {
          es: cityEventsEs.trim(),
          fr: cityEventsFr.trim(),
          ar: cityEventsAr.trim(),
          en: cityEventsEs.trim()
        };
        currentLife[idx].friends = {
          es: cityFriendsEs.trim(),
          fr: cityFriendsFr.trim(),
          ar: cityFriendsAr.trim(),
          en: cityFriendsEs.trim()
        };
        currentLife[idx].supermarkets.tips = {
          es: cityMarketTipsEs.trim(),
          fr: cityMarketTipsFr.trim(),
          ar: cityMarketTipsAr.trim(),
          en: cityMarketTipsEs.trim()
        };

        const res = await fetch("/api/admin/save-custom-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: "studentLife",
            data: currentLife
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setEditorSuccess("¡Consejos y vida estudiantil de la ciudad actualizados!");
          onRefreshStats();
        } else {
          setEditorError(data.error || "Error al actualizar guía de ciudad.");
        }
      } else {
        setEditorError("Ciudad no encontrada en la guía.");
      }
    } catch (err) {
      setEditorError("Error al conectar.");
    } finally {
      setEditorLoading(false);
    }
  };

  const handleEditCommunityMessage = async (msgId: string, newText: string) => {
    if (!newText.trim()) return;
    try {
      const res = await fetch("/api/community/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: msgId, text: newText.trim() })
      });
      if (res.ok) {
        onRefreshStats();
      }
    } catch (err) {}
  };

  // Teacher Profiles CRUD managers
  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeachActionError("");
    setTeachActionSuccess("");
    setTeachActionLoading(true);

    if (!tchName.trim() || !tchSubject.trim() || !tchEmail.trim()) {
      setTeachActionError("El nombre, la asignatura y el correo electrónico son obligatorios.");
      setTeachActionLoading(false);
      return;
    }

    try {
      const isEdit = !!editingTeacherId;
      const url = isEdit ? "/api/teachers/update" : "/api/teachers/create";
      const payload = {
        id: editingTeacherId || undefined,
        name: tchName.trim(),
        subject: tchSubject.trim(),
        email: tchEmail.trim(),
        phone: tchPhone.trim(),
        bio: tchBio.trim() || "Profesor docente especializado homologado.",
        photoUrl: tchPhotoUrl.trim() || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
        rating: Number(tchRating) || 5.0
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setTeachActionSuccess(isEdit ? "¡Profesor actualizado correctamente!" : "¡Nuevo profesor registrado con éxito!");
        
        // Reset form fields
        setTchName("");
        setTchSubject("");
        setTchEmail("");
        setTchPhone("");
        setTchBio("");
        setTchPhotoUrl("");
        setTchRating(5);
        setEditingTeacherId(null);
        
        // Poll database updates
        onRefreshStats();
      } else {
        setTeachActionError(data.error || "Ocurrió un contratiempo al procesar los datos del profesor.");
      }
    } catch (err) {
      setTeachActionError("Error al conectar con la base de datos de profesores.");
    } finally {
      setTeachActionLoading(false);
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (!window.confirm("¿Segurísimo que deseas quitar el expediente de este profesor?")) return;
    try {
      const res = await fetch("/api/teachers/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        onRefreshStats();
      }
    } catch (err) {}
  };

  // Excel / CSV Export utilities
  const handleExportDataCSV = (type: "students" | "monetization" | "radar") => {
    let headers = "";
    let rows = "";

    if (type === "students") {
      headers = "id,nombre,email,pais,nivel_espanol,XP_score,premium,meta_academica,canal\n";
      rows = students.map(s => `"${s.id}","${s.name}","${s.email}","${s.country}","${s.level}",${s.xp},${s.premiumStatus},"${s.academicGoal}","${s.channel}"`).join("\n");
    } else if (type === "monetization") {
      headers = "pais,visitas,conversiones,ingresos_euros,ticket_medio\n";
      const countriesList = ["Morocco", "Algeria", "Tunisia", "Egypt"];
      rows = countriesList.map(c => {
        const matching = students.filter(s => s.country === c);
        const count = matching.length;
        const prem = matching.filter(s => s.premiumStatus).length;
        const rev = matching.reduce((acc, s) => acc + (s.paymentAmount || 0), 0);
        return `"${c}",${count * 45},${prem},${rev},${prem > 0 ? (rev / prem).toFixed(2) : 0}`;
      }).join("\n");
    } else {
      headers = "sector,intereses_alumnos,porcentaje_demanda\n";
      const sectorsList = ["Informática", "Sanidad", "Administración", "Marketing", "Hostelería", "Comercio", "Electricidad", "Mecánica"];
      rows = sectorsList.map(sec => {
        const count = students.filter(s => s.vocationalTopChoice === sec).length;
        const pct = ((count / students.length) * 100).toFixed(1);
        return `"${sec}",${count},${pct}%`;
      }).join("\n");
    }

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `AtreveteEspana-${type}-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Interactive Filter of candidates (S11)
  const filteredPortalStudents = students.filter(s => {
    if (filterCity !== "all" && s.targetCity.toLowerCase() !== filterCity.toLowerCase()) return false;
    if (filterSector !== "all" && s.vocationalTopChoice.toLowerCase() !== filterSector.toLowerCase()) return false;
    if (filterLevel !== "all" && s.level.toLowerCase() !== filterLevel.toLowerCase()) return false;
    if (filterAvailability === "intern" && !s.isInternshipReady) return false;
    if (filterAvailability === "job" && !s.hasJobReady) return false;
    return true;
  });

  // Calculate automatic Talent Score for Top Talent classification (S12)
  const getTalentScore = (s: any) => {
    // Score based on: level (A1=10, A2=25, B1=50, B2=80, C1=100) + xp + activities
    const levelPoints = s.level === "C2" ? 120 : s.level === "C1" ? 100 : s.level === "B2" ? 80 : s.level === "B1" ? 50 : s.level === "A2" ? 25 : 10;
    const lessonsPlayed = (s.completedLessons || 0) * 8;
    const examBonus = (s.completedExams || 0) * 35;
    const cvPoints = s.hasCv ? 40 : 0;
    const communityPoints = s.activeInCommunity ? 30 : 0;
    return levelPoints + s.xp + lessonsPlayed + examBonus + cvPoints + communityPoints;
  };

  const sortedTalentStudents = [...students]
    .map(s => ({ ...s, talentScore: getTalentScore(s) }))
    .sort((a, b) => b.talentScore - a.talentScore);

  const topTalentSlice = sortedTalentStudents.slice(0, talentRange);

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-[#080d1a] border-t border-[#131d31]">
      
      {/* Dynamic Navigation Column */}
      <aside className="w-full md:w-64 flex-shrink-0 bg-[#0b1224] border-r border-[#1c2e4f] p-4 flex flex-col justify-between">
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-amber-500 font-mono text-[10px] uppercase font-bold tracking-widest">
              <Shield size={12} />
              <span>Consola Pro de Control</span>
            </div>
            {(() => {
              const email = localStorage.getItem("sp_logged_email")?.toLowerCase() || "";
              const isMaster = email === "soullis8@gmail.com";
              const canEdit = isMaster || localStorage.getItem("sp_admin_can_edit") === "true";
              return (
                <div className="mt-1 space-y-1">
                  <h2 className="text-xl font-black text-white select-none flex items-center gap-2">
                    BI Dashboard
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${isMaster ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"}`}>
                      {isMaster ? "Dueño Principal" : "Anfitrión Autorizado"}
                    </span>
                  </h2>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-gray-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${canEdit ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                    <span>{canEdit ? "Escritura (Editor Activo)" : "Lectura (Editor Bloqueado)"}</span>
                  </div>
                </div>
              );
            })()}
            <p className="text-[10px] text-gray-400 mt-1">
              Atrévete a España SAAS Control
            </p>
          </div>

          <nav className="flex flex-col gap-1">
            {[
              { key: "overview", label: "1. Resumen General", icon: "📊" },
              { key: "profile", label: "2. Perfil Alumnos", icon: "👤" },
              { key: "roadmap", label: "3. Funnel de Visado", icon: "🎯" },
              { key: "vocational", label: "4. Test Vocacional", icon: "🔬" },
              { key: "course", label: "5. Curso de Español", icon: "🎓" },
              { key: "community", label: "6. Comunidad Analytics", icon: "💬" },
              { key: "jobs", label: "7. Empleo & CVs", icon: "💼" },
              { key: "housing", label: "8. Alojamiento", icon: "🏠" },
              { key: "contents", label: "9. Analítica Contenidos", icon: "📝" },
              { key: "monetization", label: "10. Monetización", icon: "🪙" },
              { key: "empresas", label: "11. Portal de Empresas", icon: "🏢" },
              { key: "talent", label: "12. Ranking Top Talent", icon: "🏆" },
              { key: "alerts", label: "13. Alertas / Anomalías", icon: "⚠️" },
              { key: "exports", label: "14. Exportar Reportes", icon: "📥" },
              { key: "advisor", label: "15. Asesor BI con IA", icon: "✨" },
              { key: "previewer", label: "16. Vista Alumno & Chat", icon: "👁️" },
              { key: "teachers_admin", label: "17. Control Profesores", icon: "👨‍🏫" },
              { key: "collaborators_admin", label: "18. Colaboradores", icon: "🤝" },
              { key: "publicidad", label: "19. Publicidad & Marcas", icon: "📢" },
              { key: "informes_avance", label: "20. Informes de Avance", icon: "📈" },
              { key: "editor", label: "21. Editor de Información", icon: "✏️" }
            ].map(tabItem => (
              <button
                key={tabItem.key}
                onClick={() => setActiveTab(tabItem.key)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition-all ${activeTab === tabItem.key ? 'bg-amber-500 text-gray-900 font-bold shadow' : 'text-gray-400 hover:text-white hover:bg-[#131d34]'}`}
              >
                <span>{tabItem.icon}</span>
                <span>{tabItem.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 mt-6 border-t border-[#1a2d48] space-y-3">
          <button 
            onClick={onRefreshStats} 
            className="w-full flex items-center justify-center gap-2 bg-[#121f37] hover:bg-[#1b2f52] text-xs font-semibold font-mono text-amber-400 py-2 rounded-xl border border-amber-500/10 cursor-pointer text-center"
          >
            <RefreshCw size={12} />
            <span>Refrescar Stats</span>
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold rounded-xl block text-center cursor-pointer"
          >
            Cerrar Sesión Pro
          </button>
        </div>
      </aside>

      {/* Main Panel Content Container */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[85vh] space-y-6">
        
        {/* TOP ALERT TOASTER */}
        {alerts.length > 0 && (
          <div className="bg-[#1a1410] border border-amber-500/20 rounded-2xl p-4 flex justify-between items-center gap-4 shadow-lg animate-pulse">
            <div className="flex gap-3 items-center">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-xs text-amber-400 font-bold font-mono">ALERTAS DEL SISTEMA ACTIVO</p>
                <p className="text-sm font-semibold text-white mt-0.5">{alerts[0].title}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab("alerts")} 
              className="text-[10px] uppercase font-bold text-amber-500 hover:underline shrink-0"
            >
              Ver Alertas ({alerts.length})
            </button>
          </div>
        )}

        {/* SECTION 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-black text-white">1. Resumen General del Crecimiento (Overview)</h3>
                <p className="text-xs text-gray-400">Panel estratégico de tracción y comportamiento global del negocio</p>
              </div>
              <button 
                onClick={() => setEditingMetrics(!editingMetrics)}
                className="px-3.5 py-1.5 text-xs bg-[#101b31] border border-amber-500/30 text-amber-300 font-mono rounded-xl hover:bg-amber-500 hover:text-black font-semibold cursor-pointer"
              >
                {editingMetrics ? "Cancelar Edición" : "📝 Modificar Métricas / Override Directo"}
              </button>
            </div>

            {editingMetrics && (
              <div className="p-4 bg-[#10192e] border border-amber-500/30 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Modificación de Parámetros de Negocio (Administración)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Total Páginas Vistas</label>
                    <input 
                      type="number" 
                      value={metricPageViews} 
                      onChange={(e) => setMetricPageViews(Number(e.target.value))}
                      className="w-full bg-[#070a13] border border-[#1b2c45] p-2 text-xs rounded text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Total Visitas Únicas</label>
                    <input 
                      type="number" 
                      value={metricVisits} 
                      onChange={(e) => setMetricVisits(Number(e.target.value))}
                      className="w-full bg-[#070a13] border border-[#1b2c45] p-2 text-xs rounded text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Promedio Sesión (Segundos)</label>
                    <input 
                      type="number" 
                      value={metricSession} 
                      onChange={(e) => setMetricSession(Number(e.target.value))}
                      className="w-full bg-[#070a13] border border-[#1b2c45] p-2 text-xs rounded text-white" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Tasa de Rebote (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={metricBounce} 
                      onChange={(e) => setMetricBounce(Number(e.target.value))}
                      className="w-full bg-[#070a13] border border-[#1b2c45] p-2 text-xs rounded text-white" 
                    />
                  </div>
                </div>
                <button 
                  onClick={handleUpdateMetricsForm}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-lg cursor-pointer"
                >
                  Guardar Cambios Duraderos
                </button>
              </div>
            )}

            {/* KPI MATRIX CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-gray-400 text-xs">
                    <span>Total Registros</span>
                    <span className="text-emerald-400 text-[10px] font-mono font-bold">+18 hoy</span>
                  </div>
                  <p className="text-2xl font-black text-white mt-1">{totalStudents}</p>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Usuarios en base de datos real</p>
              </div>

              <div className="bg-[#0e162a] border border-[#1c2e4f] p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-gray-400 text-xs">
                    <span>Usuarios Activos</span>
                    <span className="bg-[#12263f] text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold">Premium + Free</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-1 text-center">
                    <div>
                      <p className="text-sm font-bold text-white">{Math.floor(totalStudents * 0.15)}</p>
                      <p className="text-[8px] text-gray-400">DAU (Hoy)</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{Math.floor(totalStudents * 0.42)}</p>
                      <p className="text-[8px] text-gray-400">WAU (Sem)</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{Math.floor(totalStudents * 0.85)}</p>
                      <p className="text-[8px] text-gray-400">MAU (Mes)</p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Visitas recurrentes trackeadas</p>
              </div>

              <div className="bg-[#0e162a] border border-[#1c2e4f] p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-gray-400 text-xs">
                    <span>Monetización Premium</span>
                    <span className="text-emerald-400 text-[10px] font-mono font-bold">{conversionRate}% conv</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-400 mt-1">{premiumStudents} <span className="text-xs text-gray-500">Premium / {freeStudents} Gratis</span></p>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Objetivo: 18% Tasa Conversión</p>
              </div>

              <div className="bg-[#0e162a] border border-[#1c2e4f] p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-gray-400 text-xs">
                    <span>Retención & Sesiones</span>
                    <span className="text-blue-400 text-[10px] font-mono font-bold">88.4% ret</span>
                  </div>
                  <p className="text-xl font-bold text-white mt-1">
                    {Math.floor(customMetrics.avgSessionSeconds / 60)}m {customMetrics.avgSessionSeconds % 60}s
                  </p>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">Media de permanencia por sesión</p>
              </div>
            </div>

            {/* VOLUMES & INTERFERENCE CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-[#0c1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] flex items-center justify-between">
                  <span>Tracción Semanal: Evolución de Registrantes</span>
                  <span className="text-[10px] text-amber-500 font-mono">Últimas 5 semanas</span>
                </h4>
                
                {/* Custom bar chart in pure SVG */}
                <div className="h-44 flex items-end justify-between gap-6 pt-4 px-2">
                  {[
                    { label: "W21", val: 30, color: "bg-amber-500/30 border-amber-500" },
                    { label: "W22", val: 42, color: "bg-amber-500/40 border-amber-500" },
                    { label: "W23", val: 56, color: "bg-amber-500/60 border-amber-500 animate-pulse" },
                    { label: "W24", val: 51, color: "bg-amber-500/50 border-amber-500" },
                    { label: "W25 (Hoy)", val: totalStudents, color: "bg-gradient-to-t from-amber-600 to-amber-400 border-amber-400" }
                  ].map((w, idx) => {
                    const pct = (w.val / 280) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          {w.val} r.
                        </span>
                        <div 
                          style={{ height: `${pct}%` }}
                          className={`w-full ${w.color} border rounded-t-xl transition-all duration-700`}
                        />
                        <span className="text-[9px] font-mono text-gray-500">{w.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#0c1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Reporte de Visitas Totales</h4>
                  <div className="mt-4 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Páginas Vistas Totales:</span>
                      <strong className="text-white font-mono">{customMetrics.totalPageViews.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Total Visitas Web:</span>
                      <strong className="text-white font-mono">{customMetrics.totalVisits.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-sans">Tasa de Rebote:</span>
                      <strong className="text-red-400 font-mono font-bold">{customMetrics.bounceRatePercent}%</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Promedio Lección Estudiada:</span>
                      <strong className="text-emerald-400 font-mono">1.4 lecc/mes</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-[#070a13] border border-[#182741] p-3 rounded-xl">
                  <p className="text-[10px] text-amber-500 font-mono uppercase tracking-wide">💡 Insight de Retención</p>
                  <p className="text-[11px] text-gray-300 mt-1 leading-snug">
                    Los alumnos procedentes del test vocacional retienen 2.3 veces más tiempo en la pestaña de Cursos que las visitas frías.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: STUDENT PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">2. Perfil de los Estudiantes (Filtros Demográficos)</h3>
              <p className="text-xs text-gray-400">Análisis detallado de nacionalidad, de origen, idiomas, edades y objetivos</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Nationalities */}
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span>Nacionalidad de Origen</span>
                  <span className="text-[10px] text-gray-500 font-mono">Real-time</span>
                </h4>
                <div className="space-y-2.5">
                  {[
                    { key: "Morocco", flag: "🇲🇦", label: "Marruecos" },
                    { key: "Algeria", flag: "🇩🇿", label: "Argelia" },
                    { key: "Tunisia", flag: "🇹🇳", label: "Túnez" },
                    { key: "Egypt", flag: "🇪🇬", label: "Egipto" }
                  ].map(n => {
                    const cnt = nationCounts[n.key] || 0;
                    const pct = totalStudents > 0 ? ((cnt / totalStudents) * 100).toFixed(1) : "0";
                    return (
                      <div key={n.key} className="space-y-1">
                        <div className="flex justify-between items-center text-xs text-gray-300">
                          <span>{n.flag} {n.label}</span>
                          <span className="font-mono">{cnt} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-[#070a13] rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="h-full bg-amber-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Languages & Levels */}
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Nivel de Español (CEFR)</h4>
                <div className="space-y-2.5">
                  {["A1", "A2", "B1", "B2", "C1"].map(lvl => {
                    const cnt = levelCounts[lvl] || 0;
                    const pct = totalStudents > 0 ? ((cnt / totalStudents) * 100).toFixed(1) : "0";
                    return (
                      <div key={lvl} className="flex items-center gap-3">
                        <span className="w-8 shrink-0 text-xs font-bold font-mono text-amber-500">{lvl}</span>
                        <div className="flex-1 h-3 bg-[#070a13] rounded-md overflow-hidden relative">
                          <div style={{ width: `${pct}%` }} className="h-full bg-emerald-500" />
                        </div>
                        <span className="text-xs font-mono text-gray-400 w-12 text-right">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Age & Gender Breakdown */}
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Edad y Género</h4>
                <div className="space-y-3.5">
                  <div className="flex justify-around items-center pt-2">
                    <div className="text-center">
                      <span className="text-2xl">👩‍🎓</span>
                      <p className="text-xs text-gray-400 mt-1">Femenino</p>
                      <strong className="text-sm font-mono text-white">
                        {genderCounts["Femenino"] || 0} ({(totalStudents > 0 ? ((genderCounts["Femenino"] || 0) / totalStudents) * 100 : 0).toFixed(0)}%)
                      </strong>
                    </div>
                    <div className="w-px h-12 bg-gray-700" />
                    <div className="text-center">
                      <span className="text-2xl">👨‍🎓</span>
                      <p className="text-xs text-gray-400 mt-1">Masculino</p>
                      <strong className="text-sm font-mono text-white">
                        {genderCounts["Masculino"] || 0} ({(totalStudents > 0 ? ((genderCounts["Masculino"] || 0) / totalStudents) * 100 : 0).toFixed(0)}%)
                      </strong>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-3">
                    <p className="text-[10px] text-gray-500 uppercase font-mono mb-1.5">Rango de Edad Promedio</p>
                    <div className="flex justify-between text-xs text-gray-300">
                      <span>18-21 años: <strong>48%</strong></span>
                      <span>22-25 años: <strong>38%</strong></span>
                      <span>+26 años: <strong>14%</strong></span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* ACADEMIC GOALS LISTING */}
            <div className="bg-[#0c1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Distribución de Objetivos Académicos en España</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
                {[
                  { label: "FP Grado Superior", count: students.filter(s => s.academicGoal === "FP Grado Superior").length, color: "text-amber-500" },
                  { label: "Universidad (Grados)", count: students.filter(s => s.academicGoal === "Universidad").length, color: "text-blue-400" },
                  { label: "FP Grado Medio", count: students.filter(s => s.academicGoal === "Grado Medio").length, color: "text-green-400" },
                  { label: "Máster Oficial", count: students.filter(s => s.academicGoal === "Máster").length, color: "text-purple-400" }
                ].map((g, idx) => {
                  const pct = totalStudents > 0 ? ((g.count / totalStudents) * 100).toFixed(1) : "0";
                  return (
                    <div key={idx} className="bg-[#070a13] p-3 rounded-2xl border border-[#1a2d48]">
                      <span className="text-[10px] text-gray-500 uppercase font-mono block">Meta principal</span>
                      <span className={`text-sm font-bold block mt-1 ${g.color}`}>{g.label}</span>
                      <strong className="text-xl font-bold font-mono block mt-2 text-white">{g.count} <span className="text-xs text-gray-500">alumnos ({pct}%)</span></strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TERMINAL DE BÚSQUEDA Y SUSPENSIÓN DE ALUMNOS */}
            <div className="bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🛡️</span>
                <div>
                  <h4 className="text-sm font-black text-white">Consola Avanzada de Alumnos (Búsqueda y Suspensión)</h4>
                  <p className="text-xs text-gray-400">Busca a un alumno por su nombre completo o código de cuenta privado (`AE-ACCT-XXXX`) para suprimir su perfil o revertir su suspensión temporal.</p>
                </div>
              </div>

              {studentSearchError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium font-mono">
                  ⚠️ {studentSearchError}
                </div>
              )}
              {studentSearchSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-medium font-mono">
                  ✨ {studentSearchSuccess}
                </div>
              )}

              <div className="relative">
                <input
                  type="text"
                  placeholder="Introduce el nombre o número de cuenta privado del alumno..."
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  className="w-full bg-[#070a13] border border-[#1c2e4f] focus:border-amber-500 outline-none p-3.5 pl-10 text-xs rounded-xl text-white transition-all font-mono"
                />
                <Search size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
              </div>

              {studentSearchQuery.trim() !== "" ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {students.filter(s => {
                    const q = studentSearchQuery.toLowerCase();
                    return (s.name || "").toLowerCase().includes(q) || (s.accountCode || "").toLowerCase().includes(q);
                  }).map(stud => (
                    <div key={stud.id} className="p-3 bg-[#0d1527] border border-[#1d2f50] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-white text-sm">{stud.name}</strong>
                          <span className="text-[10px] bg-[#12223b] text-amber-400 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                            🔑 Cuenta: {stud.accountCode || "PENDIENTE"}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono mt-1">Correo: {stud.email} | Nivel: {stud.level} | Origen: {stud.country}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {stud.isBlocked ? (
                          <span className="px-2 py-1 bg-red-500/15 border border-red-500/30 text-red-400 font-bold font-mono text-[10px] rounded-lg animate-pulse uppercase">
                            🔴 Suspendido / Suprimido
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold font-mono text-[10px] rounded-lg uppercase">
                            🟢 Activo
                          </span>
                        )}

                        <button
                          onClick={() => downloadStudentPDF(stud)}
                          className="px-3 py-1.5 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all flex items-center gap-1 bg-[#12223b] text-amber-400 hover:bg-amber-500 hover:text-black hover:scale-105 border border-amber-500/20 cursor-pointer"
                          title="Descargar Ficha PDF"
                        >
                          <ArrowDownToLine size={12} />
                          <span>PDF</span>
                        </button>

                        <button
                          disabled={studentActionLoadingId === stud.id}
                          onClick={() => handleToggleStudentBlock(stud.id, !!stud.isBlocked)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer border ${stud.isBlocked ? 'bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white border-emerald-500/20' : 'bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white border-red-500/20'}`}
                        >
                          {studentActionLoadingId === stud.id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : stud.isBlocked ? (
                            "Devolver"
                          ) : (
                            "Suprimir Perfil"
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  {students.filter(s => {
                    const q = studentSearchQuery.toLowerCase();
                    return (s.name || "").toLowerCase().includes(q) || (s.accountCode || "").toLowerCase().includes(q);
                  }).length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4 font-mono">Ningún alumno coincide con "{studentSearchQuery}"</p>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-gray-500 font-mono italic">Escribe el nombre o código (`AE-ACCT-XXXX`) para realizar la búsqueda en tiempo real.</p>
              )}
            </div>

          </div>
        )}

        {/* SECTION 3: ROADMAP & FUNNEL */}
        {activeTab === "roadmap" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">3. Estado del Roadmap y Embudo de Conversión (Funnel)</h3>
              <p className="text-xs text-gray-400">Análisis del avance migratorio y administrativo de los estudiantes</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Embudo vertical */}
              <div className="lg:col-span-2 bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Embudo de Conversión Migratorio (Funnel)</h4>
                <div className="space-y-3 pt-2">
                  {[
                    { label: "1. Buscando programa / Orientación", val: roadmapStatus.buscar, icon: "🔍", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
                    { label: "2. Preparando Carpeta de Documentos", val: roadmapStatus.documentacion, icon: "📂", color: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
                    { label: "3. Solicitud de Visado en Consulado", val: roadmapStatus.solicitandoVisa, icon: "🎫", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
                    { label: "4. Visado de Estudios Aprobado", val: roadmapStatus.visadoObtenido, icon: "🎉", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
                    { label: "5. Ya resides en España", val: roadmapStatus.yaEnEspana, icon: "🇪🇸", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
                    { label: "6. Resuelto el Alojamiento Estudiantil", val: roadmapStatus.alojamiento, icon: "🏠", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
                    { label: "7. Activo en Comunidad / Networking", val: roadmapStatus.comunidadActiva, icon: "🗣️", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
                    { label: "8. Integración Laboral (Trabajo o Prácticas)", val: roadmapStatus.trabajoEncontrado, icon: "💼", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" }
                  ].map((f, i) => {
                    const ratio = totalStudents > 0 ? ((f.val / totalStudents) * 100).toFixed(0) : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 text-sm font-mono text-gray-500 text-right">{ratio}%</div>
                        <div className="flex-1">
                          <div className={`p-3 rounded-xl border ${f.color} flex justify-between items-center`}>
                            <span className="text-xs font-bold flex items-center gap-2">
                              <span>{f.icon}</span> {f.label}
                            </span>
                            <span className="font-mono text-xs font-bold text-white">{f.val} alumnos</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Embudo insights */}
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Diagnóstico del Embudo</h4>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    Atrévete a España identifica el mayor cuello de botella en la <strong>Fase 3 (Solicitud de Visado)</strong>. El 60% de los estudiantes se estanca al legalizar/apostillar antecedentes penales y acreditar solvencia bancaria.
                  </p>
                </div>

                <div className="space-y-2 pt-4">
                  <span className="text-[10px] uppercase font-mono tracking-wide text-gray-500 block">Estrategia sugerida por la Plataforma:</span>
                  <div className="bg-[#070a13] p-3 rounded-xl border border-[#1d2d46] text-xs">
                    <p className="font-bold text-amber-400">✓ Automatización del checklist</p>
                    <p className="text-[11px] text-gray-300 mt-1">El generador dinámico de carpetas de visados con traducción jurada de la app ha reducido un 14% la tasa de rechazo consular.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 4: VOCATIONAL QUIZ ANALYTICS */}
        {activeTab === "vocational" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">4. Diagnósticos del Test Vocacional (Interés Profesional)</h3>
              <p className="text-xs text-gray-400">Análisis de programas recomendados, demanda por sectores y tests completados</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Intereses list */}
              <div className="lg:col-span-2 bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Intereses por Categoria Profesional / FP</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[
                    { name: "Informática (DAW/DAM/SMR)", val: sectorCounts["Informática"] || 88, icon: "💻", pct: 33.8 },
                    { name: "Sanidad (Enfermería/Muestras)", val: sectorCounts["Sanidad"] || 52, icon: "🩺", pct: 20 },
                    { name: "Administración y Finanzas", val: sectorCounts["Administración"] || 32, icon: "📊", pct: 12.3 },
                    { name: "Marketing y Publicidad", val: sectorCounts["Marketing"] || 29, icon: "📢", pct: 11.1 },
                    { name: "Hostelería, Turismo y Cocina", val: sectorCounts["Hostelería"] || 22, icon: "🏨", pct: 8.4 },
                    { name: "Comercio Internacional", val: sectorCounts["Comercio"] || 17, icon: "🚢", pct: 6.5 },
                    { name: "Electricidad y Automatismos", val: sectorCounts["Electricidad"] || 11, icon: "⚡", pct: 4.2 },
                    { name: "Mecánica Automotriz", val: sectorCounts["Mecánica"] || 9, icon: "🔧", pct: 3.7 }
                  ].map((sObj, idx) => (
                    <div key={idx} className="bg-[#070a13] p-3 rounded-xl border border-gray-800 flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold block text-white">{sObj.icon} {sObj.name}</span>
                        <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">{sObj.val} estudiantes inscritos</span>
                      </div>
                      <span className="text-sm font-bold font-mono text-amber-500">{sObj.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vocational Highlights */}
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Métricas Totales del Quiz</h4>
                  <div className="mt-4 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Tests Completados Totales:</span>
                      <strong className="text-white font-mono">184</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">FP Superior más Nominada:</span>
                      <strong className="text-white">Desarrollo Web (DAW)</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Duración Media del Test:</span>
                      <strong className="text-amber-500 font-mono">12.4 minutos</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-[#070a13] p-3 rounded-xl border border-blue-500/20">
                  <p className="text-[10px] text-blue-400 font-mono uppercase">💼 Sector de Mayor Futuro</p>
                  <p className="text-[11px] text-gray-300 mt-1">
                    La ciberseguridad y la enfermería geriátrica en España presentan un déficit de 35,000 vacantes. Promocionar convenios en estas dos FPs impulsará contratos seguros.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 5: SPANISH COURSE & LEADERBOARD */}
        {activeTab === "course" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">5. Seguimiento del Curso de Español (CEFR Course A1-C2)</h3>
              <p className="text-xs text-gray-400">Tiempos de estudio implicados, lecciones completadas y clasificación general</p>
            </div>

            {/* LEADERBOARD STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-4 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-mono text-gray-400">Inscritos en Español</span>
                <p className="text-2xl font-black text-white mt-1">{totalStudents}</p>
              </div>
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-4 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-mono text-gray-400 font-sans">Alumnos Activos esta semana</span>
                <p className="text-2xl font-black text-white mt-1">{Math.floor(totalStudents * 0.62)}</p>
              </div>
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-4 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-mono text-gray-400">Media de Lecciones por Alumno</span>
                <p className="text-2xl font-black text-amber-500 mt-1">7.3 lecc.</p>
              </div>
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-4 rounded-2xl text-center">
                <span className="text-[10px] uppercase font-mono text-gray-400">Nivel de Egreso Medio</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">A2-B1</p>
              </div>
            </div>

            {/* CLASS LEADERBOARD (RANKING GENERAL) */}
            <div className="bg-[#0c1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8] flex justify-between items-center">
                <span>Leaderboard: Mejores Estudiantes e Implicación</span>
                <span className="text-emerald-400 text-[10px] font-mono">Top 5 más Progresivos</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#233857] text-[#94a3b8] pb-2 font-mono">
                      <th className="py-2">Rango</th>
                      <th>Estudiante</th>
                      <th>País</th>
                      <th>Nivel</th>
                      <th>Lecciones</th>
                      <th>Exámenes</th>
                      <th>Tiempo de Estudio</th>
                      <th>Score (XP)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...students]
                      .sort((a,b) => b.xp - a.xp)
                      .slice(0, 5)
                      .map((s, idx) => (
                        <tr key={s.id} className="border-b border-gray-800/50 hover:bg-[#131d34]/40 transition-colors">
                          <td className="py-3 font-bold font-mono">
                            {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}`}
                          </td>
                          <td className="font-semibold text-white">{s.name}</td>
                          <td className="capitalize">{s.country}</td>
                          <td>
                            <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold text-[9px]">{s.level}</span>
                          </td>
                          <td className="font-mono">{s.completedLessons} completadas</td>
                          <td className="font-mono">{s.completedExams} pasados</td>
                          <td className="font-mono text-amber-500">{s.studyTimeMinutes} min</td>
                          <td className="font-bold text-white font-mono">{s.xp} XP</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 6: COMMUNITY */}
        {activeTab === "community" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">6. Analítica de la Comunidad Interna</h3>
              <p className="text-xs text-gray-400">Mensajes del canal, participantes populares y moderación lingüística de consultas</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Message Feed */}
              <div className="lg:col-span-2 bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Hilos y Publicaciones más Recientes</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {communityMessages.map((m, idx) => (
                    <div key={idx} className="bg-[#070a13] p-3 rounded-2xl border border-gray-800/80">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1 font-mono">
                        <strong className="text-white font-sans">{m.user}</strong>
                        <span>{new Date(m.time).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{m.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Leaderboard / Contribuidores */}
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Usuarios Destacados</h4>
                  <div className="mt-3 space-y-2">
                    {[
                      { user: "Sofia Mansouri", rank: "Contribuidor Oro", rScore: 98, flag: "🇲🇦" },
                      { user: "Youssef Alaoui", rank: "Colaborador Activo", rScore: 84, flag: "🇲🇦" },
                      { user: "Amine Belkacem", rank: "Interlocutor Frecuente", rScore: 56, flag: "🇩🇿" }
                    ].map((u, i) => (
                      <div key={i} className="flex justify-between items-center text-xs bg-[#070a13] p-2.5 rounded-xl border border-[#142337]">
                        <span>{u.flag} {u.user}</span>
                        <span className="font-mono text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">{u.rank}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#070a13] p-3 rounded-xl border border-blue-500/20">
                  <p className="text-[10px] text-blue-400 font-mono uppercase">🗣️ Ciudades más mencionadas</p>
                  <p className="text-xs text-gray-300 mt-1">
                    Madrid (<strong>48 menciones</strong>), Barcelona (<strong>32 menciones</strong>), Valencia (<strong>19 menciones</strong>).
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 7: EMPLOYMENT */}
        {activeTab === "jobs" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">7. Análisis de Empleo y Generación de Currículums (CVs)</h3>
              <p className="text-xs text-gray-400">Estadísticas de CVs formateados, descargados y mapeo de habilidades</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Total de CVs Formateados</h4>
                <p className="text-3xl font-black text-white">
                  {students.filter(s => s.hasCv).length} <span className="text-xs text-gray-500">alumnos ({(totalStudents > 0 ? (students.filter(s => s.hasCv).length / totalStudents) * 100 : 0).toFixed(0)}%)</span>
                </p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Estudiantes que han rellenado su expediente profesional y completado con el formateador europeo AI para España.
                </p>
              </div>

              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Descargas de Perfiles por Empresas</h4>
                <p className="text-3xl font-black text-amber-500">142 <span className="text-xs text-gray-500">descargas</span></p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Archivos PDF / Portfolio exportados directamente por empleadores españoles en el futuro portal corporativo.
                </p>
              </div>

              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Sectores más Buscados</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>1. Desarrollo de Software</span>
                    <strong className="font-mono">41 alumnos</strong>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>2. Prácticas Clínicas / Sanidad</span>
                    <strong className="font-mono">22 alumnos</strong>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>3. Comercio Internacional</span>
                    <strong className="font-mono">11 alumnos</strong>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 8: HOUSING / ALOJAMIENTO */}
        {activeTab === "housing" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">8. Analítica de Consultas de Alojamiento Estudiantil</h3>
              <p className="text-xs text-gray-400">Métricas de alojamiento, ciudades más requeridas y tipos de residencia consultados</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Destinos de Alojamiento por Ciudades</h4>
                <div className="space-y-3 pt-1">
                  {[
                    { city: "Madrid", val: 122, type: "Habitación compartida dominando (60%)", col: "bg-amber-500" },
                    { city: "Barcelona", val: 84, type: "Residencia universitaria selecta (45%)", col: "bg-blue-400" },
                    { city: "Valencia", val: 39, type: "Alquiler compartido económico (74%)", col: "bg-emerald-400" },
                    { city: "Sevilla", val: 15, type: "Residencia estudiantil de convenio (40%)", col: "bg-purple-400" }
                  ].map((c, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-300">
                        <span>{c.city}</span>
                        <strong className="font-mono">{c.val} consultas ({c.type})</strong>
                      </div>
                      <div className="w-full h-2 bg-[#070a13] rounded-full overflow-hidden">
                        <div style={{ width: `${(c.val / 150) * 100}%` }} className={`h-full ${c.col}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0c1224] border border-[#1c2e4f] p-5 rounded-3xl flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Tipos de Alojamiento Consultados</h4>
                  <div className="mt-4 space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Pisos / Habitaciones compartidas:</span>
                      <strong className="text-white font-mono font-bold">64.5%</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Residencias de Estudiantes:</span>
                      <strong className="text-white font-mono font-bold">25.0%</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Piso de alquiler individual:</span>
                      <strong className="text-white font-mono font-bold">10.5%</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-[#070a13] p-3 rounded-xl border border-amber-500/20 text-xs">
                  <p className="font-bold text-amber-400">🏢 Crecimiento de Alquiler en Valencia</p>
                  <p className="text-[11px] text-gray-300 mt-1">El interés de alojamiento en Valencia ha incrementado un +33% debido a menores costes comparados con Madrid y Barcelona.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 9: CONTENT ANALYTICS */}
        {activeTab === "contents" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">9. Analítica de Contenidos y Retención de Secciones</h3>
              <p className="text-xs text-gray-400">Secciones más visitadas, tiempo medio de permanencia y tasa de abandono</p>
            </div>

            <div className="bg-[#0c1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Ranking del Valor de las Secciones del Portal</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#233857] text-[#94a3b8] pb-2 font-mono">
                      <th className="py-2">Sección</th>
                      <th>Visitas Estimadas</th>
                      <th>Tiempo Medio de Permanencia</th>
                      <th>Tasa de Abandono (Bounce)</th>
                      <th>Compartidos / Favoritos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Full Roadmap (Etapas Clave)", visits: 24300, time: "4m 20s", bounce: "15%", favorited: "1,200" },
                      { name: "Curso de Español Interactiva", visits: 18200, time: "8m 45s", bounce: "12%", favorited: "2,400" },
                      { name: "Visado de Estudios por Consular", visits: 11400, time: "3m 15s", bounce: "18%", favorited: "1,150" },
                      { name: "FP & Programas Educativos", visits: 8900, time: "2m 55s", bounce: "22%", favorited: "850" },
                      { name: "Currículum y Orientación", visits: 4500, time: "5m 10s", bounce: "28%", favorited: "980" }
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-gray-800/60 hover:bg-[#131d34]/40 transition-colors">
                        <td className="py-3 font-semibold text-white">{row.name}</td>
                        <td className="font-mono">{row.visits.toLocaleString()}</td>
                        <td className="font-mono text-emerald-400">{row.time}</td>
                        <td className="font-mono text-red-400">{row.bounce}</td>
                        <td className="font-mono">{row.favorited} alumnos</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 10: MONETIZATION SECTION */}
        {activeTab === "monetization" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">10. Métricas del Negocio y Monetización (Premium Sales)</h3>
              <p className="text-xs text-gray-400">Evaluación de ingresos por suscripciones, ticket medio y conversión por canales</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">Ingresos Totales Acumulados</span>
                  <span className="text-3xl font-black text-emerald-400 tracking-tight mt-1 inline-block">
                    €{totalRevenue.toLocaleString()}
                  </span>
                </div>
                <p className="text-[9px] text-gray-500 mt-2">Valor acumulado de la base de datos real (€89 x {premiumStudents})</p>
              </div>

              <div className="bg-[#0e162a] border border-[#1c2e4f] p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">Ticket Medio de Suscripción</span>
                  <span className="text-3xl font-black text-white tracking-tight mt-1 inline-block">€89.00</span>
                </div>
                <p className="text-[9px] text-gray-500 mt-2">Precio de membresía Todo Incluido (Acceso de por vida)</p>
              </div>

              <div className="bg-[#0e162a] border border-[#1c2e4f] p-4 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-mono block">Tasa de Conversión General</span>
                  <span className="text-3xl font-black text-amber-500 tracking-tight mt-1 inline-block">{conversionRate}%</span>
                </div>
                <p className="text-[9px] text-gray-500 mt-2">Proporción de estudiantes premium registrados</p>
              </div>
            </div>

            {/* CHANNEL REVENUE BREAKDOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Channel Conversion */}
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Canales de Adquisición de Alumnos</h4>
                <div className="space-y-3">
                  {[
                    { c: "Instagram Ads", val: channelCounts["Instagram"] || 74, color: "bg-pink-500" },
                    { c: "SEO Orgánico (Google)", val: channelCounts["SEO"] || 62, color: "bg-emerald-500" },
                    { c: "Recomendado por Amigos / Invitaciones", val: channelCounts["Referred"] || 53, color: "bg-amber-400" },
                    { c: "Facebook Marketing", val: channelCounts["Facebook"] || 46, color: "bg-blue-500" },
                    { c: "Tráfico Directo", val: channelCounts["Direct"] || 25, color: "bg-gray-400" }
                  ].map((ch, i) => {
                    const ratio = totalStudents > 0 ? ((ch.val / totalStudents) * 100).toFixed(0) : "0";
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-300">
                          <span>{ch.c}</span>
                          <strong className="font-mono">{ch.val} alumnos ({ratio}%)</strong>
                        </div>
                        <div className="w-full h-1.5 bg-[#070a13] rounded-full overflow-hidden">
                          <div style={{ width: `${ratio}%` }} className={`h-full ${ch.color}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Country revenue breakdown */}
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Ingresos Totales por País Originario</h4>
                <div className="space-y-2.5 pt-1">
                  {[
                    { key: "Morocco", flag: "🇲🇦", label: "Marruecos" },
                    { key: "Algeria", flag: "🇩🇿", label: "Argelia" },
                    { key: "Tunisia", flag: "🇹🇳", label: "Túnez" },
                    { key: "Egypt", flag: "🇪🇬", label: "Egipto" }
                  ].map(n => {
                    const countPrem = students.filter(s => s.country === n.key && s.premiumStatus).length;
                    const revenueVal = countPrem * 89;
                    const pct = totalRevenue > 0 ? ((revenueVal / totalRevenue) * 100).toFixed(1) : "0";
                    return (
                      <div key={n.key} className="flex justify-between items-center text-xs bg-[#070a13] p-3 rounded-xl border border-gray-800">
                        <span className="font-medium text-white">{n.flag} {n.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{countPrem} premium</span>
                          <strong className="font-mono text-emerald-400">€{revenueVal.toLocaleString()} ({pct}%)</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 11: PORTAL DE EMPRESAS (CANDIDATOS FILTER) */}
        {activeTab === "empresas" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">11. Portal de Empresas Español (Filtros de Contratación y Prácticas)</h3>
              <p className="text-xs text-gray-400">Buscador y pre-clasificación para empresas colaboradoras, escuelas y empleadores de España</p>
            </div>

            {/* FILTERS PANEL */}
            <div className="bg-[#0c1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
              <div className="flex gap-2 items-center text-xs font-bold text-amber-400 font-mono uppercase">
                <Sliders size={14} />
                <span>Panel de Filtros Profesionales Interactivos</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                
                {/* City Filter */}
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Ciudad Destino en España</label>
                  <select 
                    value={filterCity} 
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="w-full bg-[#070a13] border border-gray-800 p-2 text-xs rounded-xl outline-none text-white focus:border-amber-500"
                  >
                    <option value="all">Ver todas las ciudades</option>
                    <option value="Madrid">Madrid</option>
                    <option value="Barcelona">Barcelona</option>
                    <option value="Valencia">Valencia</option>
                    <option value="Sevilla">Sevilla</option>
                    <option value="Zaragoza">Zaragoza</option>
                  </select>
                </div>

                {/* Formacion / Sector */}
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Especialidad FP / Sector</label>
                  <select 
                    value={filterSector} 
                    onChange={(e) => setFilterSector(e.target.value)}
                    className="w-full bg-[#070a13] border border-gray-800 p-2 text-xs rounded-xl outline-none text-white focus:border-amber-500"
                  >
                    <option value="all">Ver todos los sectores</option>
                    <option value="informática">Informática</option>
                    <option value="sanidad">Sanidad</option>
                    <option value="administración">Administración</option>
                    <option value="marketing">Marketing</option>
                    <option value="hostelería">Hostelería</option>
                    <option value="comercio">Comercio</option>
                  </select>
                </div>

                {/* Spanish CEFR Level */}
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Nivel Oficial de Español</label>
                  <select 
                    value={filterLevel} 
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="w-full bg-[#070a13] border border-gray-800 p-2 text-xs rounded-xl outline-none text-white focus:border-amber-500"
                  >
                    <option value="all">Cualquier nivel de español</option>
                    <option value="A1">Mínimo A1</option>
                    <option value="A2">Mínimo A2</option>
                    <option value="B1">Mínimo B1</option>
                    <option value="B2">Mínimo B2</option>
                    <option value="C1">Mínimo C1</option>
                  </select>
                </div>

                {/* Availability */}
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Disponibilidad Laboral</label>
                  <select 
                    value={filterAvailability} 
                    onChange={(e) => setFilterAvailability(e.target.value)}
                    className="w-full bg-[#070a13] border border-gray-800 p-2 text-xs rounded-xl outline-none text-white focus:border-amber-500"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="intern">Disponibles para Prácticas FCT</option>
                    <option value="job">Buscando Contrato / Empleo Activo</option>
                  </select>
                </div>

              </div>

              <div className="pt-2 flex justify-between items-center text-xs font-mono text-gray-400">
                <span>Resultados Encontrados: <strong className="text-white">{filteredPortalStudents.length} candidatos</strong></span>
                <button 
                  onClick={() => { setFilterCity("all"); setFilterSector("all"); setFilterLevel("all"); setFilterAvailability("all"); }}
                  className="text-amber-500 hover:underline cursor-pointer"
                >
                  Restablecer Filtros
                </button>
              </div>
            </div>

            {/* CANDIDATES LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPortalStudents.slice(0, 12).map((s, idx) => (
                <div key={idx} className="bg-[#0e162a] border border-[#1a2d48] hover:border-amber-500/30 p-4 rounded-2xl flex justify-between items-start gap-4 transition-all">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex gap-2 items-center flex-wrap">
                      <h4 className="font-bold text-sm text-white">{s.name}</h4>
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-1.5 py-0.5 rounded font-mono font-medium">{s.level} Español</span>
                      {s.premiumStatus && <span className="bg-emerald-500/20 text-emerald-300 text-[8px] px-1 rounded font-bold">Premium Certificado</span>}
                    </div>
                    
                    <p className="text-xs text-gray-300 font-medium">🏫 {s.academicGoal} — {s.professionalGoal}</p>
                    
                    <div className="flex gap-1.5 text-[10px] text-gray-400 font-mono">
                      <span>📍 Destino: <strong>{s.targetCity}</strong></span>
                      <span>•</span>
                      <span>Origen: {s.country === "Morocco" ? "Marruecos 🇲🇦" : s.country === "Algeria" ? "Argelia 🇩🇿" : s.country === "Tunisia" ? "Túnez 🇹🇳" : "Egipto 🇪🇬"}</span>
                    </div>

                    <div className="pt-2 flex gap-1.5 flex-wrap">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-medium ${s.isInternshipReady ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                        {s.isInternshipReady ? "✓ Prácticas FCT Lista" : "Ø Prácticas en Trámite"}
                      </span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-medium ${s.hasJobReady ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'}`}>
                        {s.hasJobReady ? "✓ Empleo Directo Pre-filtrado" : "Ø Búsqueda de Empleo"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2 shrink-0">
                    <span className="text-[9px] uppercase tracking-wider font-mono text-gray-500">Talent Score</span>
                    <span className="text-lg font-black text-amber-400 font-mono">{getTalentScore(s)} pts</span>
                    {s.hasCv && (
                      <span className="text-[9px] text-emerald-400 flex items-center gap-1">
                        <span>📄</span> CV listo
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {filteredPortalStudents.length === 0 && (
                <div className="col-span-full bg-[#0c1224] p-8 text-center text-gray-400 rounded-3xl">
                  Sin resultados bajo estos criterios. Pruebe a disipar los filtros.
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 12: TOP TALENT LISTING */}
        {activeTab === "talent" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-lg font-black text-white">12. Ranking Top Talent deAlumnos</h3>
                <p className="text-xs text-gray-400">Puntaje algorítmico global basado en nivel, actividad acumulada, XP del curso y test vocacional</p>
              </div>
              <div className="flex gap-2 items-center bg-[#070a13] p-1.5 rounded-xl border border-gray-800 text-xs">
                <span className="text-gray-400 font-sans pl-1.5">Rango del Ranking:</span>
                {[
                  { label: "Top 10", val: 10 },
                  { label: "Top 50", val: 50 },
                  { label: "Top 100", val: 100 }
                ].map((rng, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setTalentRange(rng.val)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition-colors ${talentRange === rng.val ? 'bg-amber-500 text-gray-900' : 'text-gray-400 hover:text-white'}`}
                  >
                    {rng.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0c1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Clasificación Automática: Cuadro de Honor</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#233857] text-[#94a3b8] pb-2 font-mono">
                      <th className="py-2">Posición</th>
                      <th>Nombre Estudiante</th>
                      <th>País / Origen</th>
                      <th>Español</th>
                      <th>Materia Preferida</th>
                      <th>Lecciones Completadas</th>
                      <th>CV Listo</th>
                      <th>XP del Curso</th>
                      <th>Talent Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topTalentSlice.map((s, idx) => (
                      <tr key={idx} className="border-b border-gray-800/60 hover:bg-[#131d34]/40 transition-all duration-300">
                        <td className="py-3 font-bold font-mono text-center">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`}
                        </td>
                        <td className="font-semibold text-white">
                          <div className="flex items-center gap-1.5">
                            <span>{s.name}</span>
                            {s.premiumStatus && <span className="bg-emerald-500/20 text-[8px] text-emerald-400 border border-emerald-500/20 px-1 rounded font-bold font-mono">P</span>}
                          </div>
                        </td>
                        <td>{s.country} ({s.city})</td>
                        <td>
                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold text-[9px]">{s.level}</span>
                        </td>
                        <td>{s.vocationalTopChoice}</td>
                        <td className="font-mono">{s.completedLessons} lecc.</td>
                        <td>{s.hasCv ? "✓ Sí" : "Ø No"}</td>
                        <td className="font-bold text-white font-mono">{s.xp} XP</td>
                        <td className="font-black text-amber-400 font-mono text-xs">{s.talentScore} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 13: ALERTS ENGINE */}
        {activeTab === "alerts" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">13. Sistema de Alertas Automáticas y Notificaciones de Negocio</h3>
              <p className="text-xs text-gray-400 font-sans">Detección interactiva de anomalías, picos acelerados de tráfico o descensos en conversión</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Manual alert generator */}
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Plus size={14} />
                  <span>Configurar Alerta Manual (Administración)</span>
                </h4>
                <form onSubmit={handleCreateAlert} className="space-y-4">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Título / Mensaje de Alerta</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Aceleración repentina de solicitudes de alojamiento en Barcelona..."
                      value={alertTitleInp}
                      onChange={(e) => setAlertTitleInp(e.target.value)}
                      className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1">Severidad de la Alerta</label>
                    <div className="flex gap-2">
                      {["info", "warning", "success"].map((sev) => (
                        <button
                          key={sev}
                          type="button"
                          onClick={() => setAlertTypeInp(sev as any)}
                          className={`flex-1 py-1.5 text-xs rounded-xl capitalize border font-semibold font-mono ${alertTypeInp === sev ? 'bg-amber-500 border-amber-500 text-black' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'}`}
                        >
                          {sev}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Transmitir Alerta de Consola
                  </button>
                </form>
              </div>

              {/* Active Alerts List */}
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Listado de Alertas Activas</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {/* System alerts */}
                  {systemAutoAlerts.map((sysAl) => (
                    <div key={sysAl.id} className="p-3 bg-[#110e14]/50 border border-amber-500/10 rounded-xl flex justify-between gap-3 items-start">
                      <div className="flex gap-2 items-start text-xs text-gray-300">
                        <span className="text-sm">🤖</span>
                        <div>
                          <p className="font-bold text-[10px] text-amber-500 font-mono uppercase">ALERTA CENTRAL BI</p>
                          <p className="mt-0.5 leading-snug text-[11px]">{sysAl.title}</p>
                        </div>
                      </div>
                      <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[8px] font-mono font-bold px-1 rounded uppercase">Automático</span>
                    </div>
                  ))}

                  {/* Manual alerts in DB */}
                  {alerts.map((al) => (
                    <div key={al.id} className="p-3 bg-gray-900 border border-gray-800 rounded-xl flex justify-between gap-3 items-start">
                      <div className="flex gap-2 items-start text-xs text-gray-300">
                        <span className="text-sm">📢</span>
                        <div>
                          <p className="font-bold text-[10px] text-blue-400 font-mono uppercase">ANUNCIO OWNER ({al.timestamp})</p>
                          <p className="mt-0.5 leading-snug text-[11px]">{al.title}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDismissAlert(al.id)}
                        className="text-red-400 hover:text-red-300 cursor-pointer p-0.5"
                        title="Descartar"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {alerts.length === 0 && systemAutoAlerts.length === 0 && (
                    <div className="text-center p-6 text-xs text-gray-500 bg-[#070a13] rounded-xl">
                      No hay alertas críticas en ejecución. El sistema opera verde.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 14: EXPORTS PANEL */}
        {activeTab === "exports" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">14. Gestión y Exportación de Reportes del Negocio</h3>
              <p className="text-xs text-gray-400">Descarga tablas consolidadas, listas demográficas y sectores de manera local</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">Listado Completo de Alumnos</h4>
                  <p className="text-xs text-gray-400 mt-2">Exporta la totalidad de los datos estructurados en formato CSV para heramientas de Business Intelligence externas como Tableau o PowerBI.</p>
                </div>
                <button 
                  onClick={() => handleExportDataCSV("students")}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200 active:scale-95"
                >
                  <ArrowDownToLine size={14} />
                  <span>Descargar Alumnos (CSV)</span>
                </button>
              </div>

              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Métricas de Monetización del Negocio</h4>
                  <p className="text-xs text-gray-400 mt-2 font-sans">Reporte financiero simplificado de conversión, ticket unitario, adquisiciones por canal, ingresos desglosados y comparativas por país.</p>
                </div>
                <button 
                  onClick={() => handleExportDataCSV("monetization")}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-gray-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200 active:scale-95"
                >
                  <ArrowDownToLine size={14} />
                  <span>Descargar Ingresos (CSV)</span>
                </button>
              </div>

              <div className="bg-[#0e162a] border border-[#1c2e4f] p-5 rounded-3xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Intereses Vocacional / FP de Alumnos</h4>
                  <p className="text-xs text-gray-400 mt-2">Relación interactiva de sectores que los alumnos seleccionaron, el promedio de popularidad por programa educativo y demandas.</p>
                </div>
                <button 
                  onClick={() => handleExportDataCSV("radar")}
                  className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-gray-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-transform duration-200 active:scale-95"
                >
                  <ArrowDownToLine size={14} />
                  <span>Descargar Sectores (CSV)</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* SECTION 15: IA PANEL PANEL */}
        {activeTab === "advisor" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">15. Panel Inteligente de Analítica AI (Strategic Advisor)</h3>
              <p className="text-xs text-gray-400">Asistente de negocio que analiza el comportamiento, monetización e intereses estudiantiles</p>
            </div>

            <div className="bg-[#0e162a] border border-[#1c2e4f] p-6 rounded-3xl space-y-5">
              <div className="flex gap-2.5 items-center">
                <div className="bg-amber-500 text-black w-8 h-8 rounded-lg flex items-center justify-center text-base font-black">
                  ✨
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Filtre Consultas de Negocio de Alto Rendimiento</h4>
                  <p className="text-[10px] text-gray-500">Impulsado por Gemini 3.5 con el contexto real de la base de datos de Atrévete a España</p>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-2">
                <span className="text-[9px] uppercase tracking-wider text-gray-500 font-mono block">Preguntas sugeridas frecuentes:</span>
                <div className="flex gap-2 flex-wrap">
                  {[
                    "¿Qué ciudad de destino prefieren los alumnos árabes y cómo optimizar la búsqueda de pisos?",
                    "Análisis de tasa de conversión a premium y plan de acción para monetizar Marruecos y Argelia.",
                    "¿Cuáles son las áreas de FP con mayor volumen de alumnos para proponer convenios?",
                    "Identificación detrabajadores y mejores currículums ideales para ofrecer a empresas de tecnología."
                  ].map((sQuery, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAdvisorQuery(sQuery)}
                      className="text-left text-[11px] bg-[#070a13] hover:bg-[#101b31] hover:text-amber-300 p-2 rounded-xl text-gray-300 border border-gray-800 transition-colors"
                    >
                      {sQuery}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <input 
                  type="text" 
                  placeholder="Formule su propia consulta analítica sobre la base de datos empresarial..."
                  value={advisorQuery}
                  onChange={(e) => setAdvisorQuery(e.target.value)}
                  className="flex-1 bg-[#070a13] border border-gray-800 text-xs py-3 px-4 rounded-xl text-white outline-none focus:border-amber-400 font-sans"
                  onKeyDown={(e) => e.key === "Enter" && handleQueryAdvisor()}
                />
                <button
                  onClick={handleQueryAdvisor}
                  disabled={loadingAdvisor || !advisorQuery.trim()}
                  className="bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-extrabold px-6 rounded-xl text-xs transition-transform tracking-wider uppercase flex items-center gap-1 cursor-pointer font-sans"
                >
                  {loadingAdvisor ? "Procesando..." : "Consultar ➔"}
                </button>
              </div>

              {/* AI RESPONSE BOX */}
              {(advisorResponse || loadingAdvisor) && (
                <div className="mt-4 p-5 bg-[#0a101f] border-2 border-amber-500/15 rounded-2xl space-y-3.5">
                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase pb-2 border-b border-[#14233c]">
                    <span>Generado por Gemini Analyst Engine</span>
                    <span className="text-amber-500 font-bold flex items-center gap-1">
                      <Sparkles size={11} /> Live Insights
                    </span>
                  </div>
                  
                  {loadingAdvisor ? (
                    <div className="space-y-2 pt-2 animate-pulse">
                      <div className="h-3 bg-gray-800 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-800 rounded w-5/6"></div>
                      <div className="h-3 bg-gray-800 rounded w-4/5"></div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-300 leading-relaxed space-y-2 whitespace-pre-wrap font-sans">
                      {advisorResponse}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 16: STUDENT PORTAL SIMULATOR & COMMUNITY CHAT MODERATOR */}
        {activeTab === "previewer" && (() => {
          // Grab selected student or default to the first candidate
          const currentSimS = selectedPreviewStudent || students[0] || null;

          return (
            <div className="space-y-6 animate-fade-in text-left">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>👁️</span> 16. Vista Alumno, Simulador de Expedientes & Control Moderador
                  </h3>
                  <p className="text-xs text-gray-400">
                    Inspecciona la experiencia de cada estudiante, administra el sistema de score XP, modera el chat y bloquea cuentas que infrinjan las normas.
                  </p>
                </div>
              </div>

              {/* DUAL WORKSPACE: LEFT IS STUDENT SIMULATOR / RIGHT IS MODERATION ALERT SWITCHBOARD */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* SIMULATOR viewport (7 cols) */}
                <div className="xl:col-span-7 space-y-4">
                  <div className="bg-[#0b1224] border-2 border-dashed border-amber-500/20 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
                    
                    {/* Selector of which student to inspect */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#080d1a] p-3 rounded-2xl border border-gray-800">
                      <div>
                        <span className="text-[10px] text-amber-400 font-mono font-bold block uppercase tracking-wider">Simulador de pantalla alumno</span>
                        <span className="text-xs text-gray-400 font-sans">Selecciona un alumno para ponerte en sus zapatos:</span>
                      </div>
                      <select
                        onChange={(e) => {
                          const cand = students.find(s => s.email === e.target.value);
                          if (cand) setSelectedPreviewStudent(cand);
                        }}
                        value={currentSimS?.email || ""}
                        className="bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-amber-400 font-sans min-w-[200px]"
                      >
                        {students.map((st, i) => (
                          <option key={i} value={st.email}>
                            {st.name} {st.lastName} ({st.country})
                          </option>
                        ))}
                      </select>
                    </div>

                    {currentSimS ? (
                      <div className="bg-[#070a13] border-4 border-[#121c33] rounded-2xl overflow-hidden shadow-inner flex flex-col min-h-[460px]">
                        
                        {/* Fake Simulated Browser Header */}
                        <div className="bg-[#121c33] px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 block"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 block"></span>
                          </div>
                          <div className="bg-black/40 text-[9px] text-gray-400 py-0.5 px-3 rounded-lg font-mono truncate max-w-sm">
                            https://spainstudyportal.net/area/student/{currentSimS.email}
                          </div>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 rounded font-mono uppercase font-bold">
                            Live Preview
                          </span>
                        </div>

                        {/* Fake Student Navigation header menu inside workspace */}
                        <div className="bg-[#0b101e] px-4 py-2 border-b border-gray-850 flex items-center gap-2 overflow-x-auto select-none">
                          {[
                            { key: "dashboard", label: "🏠 Dashboard", desc: "Vista Principal" },
                            { key: "academics", label: "📋 Expediente", desc: "Tus datos" },
                            { key: "spanish", label: "🎓 Clases", desc: "Idioma" },
                            { key: "tutors", label: "👨‍🏫 Tutores", desc: "Tus Tutores" }
                          ].map((x) => (
                            <button
                              key={x.key}
                              type="button"
                              onClick={() => setSelectedPreviewTab(x.key)}
                              className={`text-[10px] whitespace-nowrap px-2.5 py-1.5 rounded-lg font-bold uppercase transition-colors ${selectedPreviewTab === x.key ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:bg-gray-800'}`}
                            >
                              {x.label}
                            </button>
                          ))}
                        </div>

                        {/* Simulated Application Screen Body */}
                        <div className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[380px] text-left">
                          
                          {/* SIMULATED SUB-TAB: DASHBOARD */}
                          {selectedPreviewTab === "dashboard" && (
                            <div className="space-y-4 animate-fade-in font-sans">
                              {/* Student dynamic name card & Score */}
                              <div className="p-4 bg-gradient-to-r from-amber-500/10 to-red-550/5 border border-amber-500/20 rounded-xl space-y-3">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h4 className="text-xs font-mono text-amber-500 uppercase font-bold tracking-widest">Estudiante Premium</h4>
                                    <h3 className="text-base font-black text-white">{currentSimS.name} {currentSimS.lastName || ""}</h3>
                                    <p className="text-[10px] text-gray-400">{currentSimS.email}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs text-amber-500 font-mono block">Nacionalidad</span>
                                    <span className="text-xs text-gray-300 font-bold">{currentSimS.country} 🌍</span>
                                  </div>
                                </div>

                                {/* Score system representation */}
                                <div className="bg-black/40 p-3 rounded-lg border border-gray-800 space-y-1.5 flex justify-between items-center">
                                  <div className="flex-1 mr-3">
                                    <div className="flex justify-between text-[10px] font-mono mb-1">
                                      <span className="text-gray-400">Puntaje Global de Test:</span>
                                      <span className="text-amber-400 font-bold">{currentSimS.xp || 0} XP (Nivel {currentSimS.level || 1})</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                      <div 
                                        className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.min((currentSimS.xp || 0) / 10, 100)}%` }} 
                                      />
                                    </div>
                                  </div>
                                  <span className="shrink-0 bg-amber-500 text-black font-extrabold text-xs px-2.5 py-2 rounded-xl text-center shadow-lg font-mono">
                                    ★ {currentSimS.xp || 0}
                                  </span>
                                </div>
                              </div>

                              {/* Live stats and actions representing behavior */}
                              <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="bg-[#0b1224] p-3 rounded-xl border border-gray-800">
                                  <span className="text-[9px] text-gray-500 font-mono block uppercase">Preguntas del Test Contestadas</span>
                                  <span className="text-sm font-bold text-gray-200">{(currentSimS.xp || 0) > 0 ? `${Math.round((currentSimS.xp || 0) / 25)} correctas` : "0 respondidas"}</span>
                                </div>
                                <div className="bg-[#0b1224] p-3 rounded-xl border border-gray-800">
                                  <span className="text-[9px] text-gray-500 font-mono block uppercase">Estado del Acceso</span>
                                  <span className={`text-xs font-bold inline-flex items-center gap-1 ${currentSimS.isBlocked ? 'text-red-500' : 'text-emerald-400'}`}>
                                    ● {currentSimS.isBlocked ? "Bloqueado por Administrador" : "Activo / Conectado"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SIMULATED SUB-TAB: ACADEMICS RECORD */}
                          {selectedPreviewTab === "academics" && (
                            <div className="space-y-3 animate-fade-in">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-1">
                                Expediente Académico del Alumno (Registro Completo)
                              </h4>
                              <div className="bg-black/20 p-3 rounded-xl border border-gray-800 space-y-2 text-[11px] font-sans">
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Nombre Completo:</span>
                                    <span className="text-gray-200 font-bold">{currentSimS.name} {currentSimS.lastName || ""}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Edad:</span>
                                    <span className="text-gray-200 font-bold">{currentSimS.age || "20"} años</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Correo de contacto:</span>
                                    <span className="text-gray-200 font-mono">{currentSimS.email}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Teléfono validado:</span>
                                    <span className="text-amber-400 font-mono">{currentSimS.phone || "No especificado"}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Ubicación Actual:</span>
                                    <span className="text-gray-200">{currentSimS.city || "Ciudad"}, {currentSimS.currentCountry || currentSimS.country} 🌍</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Destino preferido (España):</span>
                                    <span className="text-amber-500 font-bold">🇪🇸 {currentSimS.targetCity || "Madrid"}</span>
                                  </div>
                                </div>
                                <div className="border-t border-gray-800 pt-2 grid grid-cols-1 gap-2.5 mt-2">
                                  <div>
                                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Estudios / Titulación Actual en curso:</span>
                                    <span className="text-gray-300 font-medium">{currentSimS.currentEducation || "Bacalauréat (Bachillerato)"}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block text-[9px] uppercase font-mono">Formación académica España interés:</span>
                                    <span className="text-emerald-400 font-medium">{currentSimS.academicGoal || "Universidad"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* SIMULATED SUB-TAB: SPANISH LESSONS */}
                          {selectedPreviewTab === "spanish" && (
                            <div className="space-y-3.5 animate-fade-in font-sans">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Módulos del Curso Homologado</h4>
                              <p className="text-[11px] text-gray-400 leading-normal">
                                Visualización del programa de preparación lingüística para superar el examen CCSE / DELE A2/B1 necesario para la obtención del visado.
                              </p>
                              <div className="space-y-2">
                                {[
                                  { unit: "Unidad 1", title: "Presentaciones, Saludos y verbos básicos del día a día", x: "100% Completado" },
                                  { unit: "Unidad 2", title: "Vocabulario de Extranjería, Trámites del NIE y Solicitud Consular", x: "85% En curso" },
                                  { unit: "Unidad 3", title: "Conversaciones aplicadas a buscar alojamiento y hablar con caseros", x: "Bloqueado" }
                                ].map((un, i) => (
                                  <div key={i} className="p-2.5 bg-[#0b1224] rounded-lg border border-gray-800 flex justify-between items-center">
                                    <div>
                                      <span className="text-[9px] text-amber-500 font-mono font-bold block">{un.unit}</span>
                                      <span className="text-[11px] font-bold text-gray-300">{un.title}</span>
                                    </div>
                                    <span className="text-[9px] bg-gray-900 border border-gray-800 font-mono text-gray-400 px-2 py-0.5 rounded-md">
                                      {un.x}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* SIMULATED SUB-TAB: TUTORS ACCREDITED */}
                          {selectedPreviewTab === "tutors" && (
                            <div className="space-y-3 animate-fade-in">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Tus Profesores Privados Asignados</h4>
                              <p className="text-[11px] text-gray-400">
                                Contacta con profesores de cualquier materia en España.
                              </p>
                              <div className="grid grid-cols-1 gap-2.5">
                                {(dbStats?.teachers || []).slice(0, 2).map((t, i) => (
                                  <div key={i} className="p-3 bg-[#0b1224] rounded-xl border border-gray-850 flex gap-3">
                                    <img 
                                      src={t.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"} 
                                      className="w-10 h-10 rounded-full object-cover shrink-0 border border-amber-500/30" 
                                      alt={t.name}
                                    />
                                    <div className="text-[11px]">
                                      <span className="font-bold text-gray-200 block">{t.name}</span>
                                      <span className="text-amber-500 block text-[10px] font-medium">{t.subject}</span>
                                      <span className="text-gray-500 block font-mono text-[9px]">{t.email}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>

                        {/* Simulated Browser Footer info */}
                        <div className="bg-[#0b101e] px-4 py-3 border-t border-gray-850 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                          <span>Study Portal Client Simulator</span>
                          <span className="text-amber-500 font-bold">★ Active Sync</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-gray-400 font-mono bg-[#070a13] rounded-2xl border border-gray-800">
                        No hay alumnos cargados en la base de datos para simular.
                      </div>
                    )}
                  </div>
                </div>

                {/* MODERATION CENTER & CONVERSATION REGULATOR CONTROL SWITCHBOARD (5 cols) */}
                <div className="xl:col-span-5 space-y-5">
                  
                  {/* Warning / Explanation Banner explaining bad word restriction warning alerts */}
                  <div className="bg-[#0a101f] border-2 border-red-500/15 p-5 rounded-3xl space-y-3">
                    <span className="bg-red-500/10 text-red-500 border border-red-500/30 text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded uppercase inline-block">
                      🛡️ Filtro Regularizador Automático de Chat Activado
                    </span>
                    <h4 className="text-xs font-bold text-white">Anomalías y Moderación de Diálogo</h4>
                    <p className="text-[11px] text-gray-300 leading-normal">
                      Cualquier mensaje en los foros que contenga términos inadecuados en español, árabe, francés o inglés es restringido de forma inmediata.
                      Como organizador, recibe las alertas aquí para proceder a bloquear o reestablecer cuentas.
                    </p>
                  </div>

                  {/* Active Alertas center representing inappropriate contents triggers "Decidir si bloquear" */}
                  <div className="bg-[#0b1224] border border-[#1b253b] p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-white flex items-center gap-2">
                      <span className="text-red-500 animate-pulse">⚠️</span>
                      Historial de Avisos por Infracción Lingüística
                    </h4>
                    
                    <div className="space-y-2.5 max-h-[160px] overflow-y-auto">
                      {alerts.filter(a => a.type === "warning" || a.title?.toLowerCase().includes("inadecuad") || a.title?.toLowerCase().includes("bad-words")).map((al, idx) => (
                        <div key={idx} className="p-3 bg-red-950/10 border border-red-500/25 rounded-xl space-y-2 text-left">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-xs text-red-400 font-bold block">{al.title}</span>
                            <span className="text-[8px] bg-red-500 text-white font-mono uppercase px-1.5 rounded font-bold shrink-0">Banned Trigger</span>
                          </div>
                          <p className="text-[10px] text-gray-300 leading-relaxed font-mono bg-black/30 p-1.5 rounded">
                            {al.message}
                          </p>
                          <div className="flex justify-between items-center text-[10px] pt-1 select-none">
                            <span className="text-gray-500 font-mono">{al.time || "Hace un momento"}</span>
                            <div className="flex gap-2">
                              {/* Decidir si bloquear a esta persona de la plataforma */}
                              <button
                                type="button"
                                onClick={() => {
                                  // Find offending student email if mentioned in message
                                  const offendingEmailStr = al.message.includes("(") ? al.message.split("(")[1].split(")")[0] : "";
                                  const foundS = students.find(s => s.email === offendingEmailStr || al.message.includes(s.email) || al.message.includes(s.name));
                                  if (foundS) {
                                    handleBlockStudent(foundS.email, true);
                                    alert(`Cuenta del alumno ${foundS.name} (${foundS.email}) bloqueada con éxito de la plataforma.`);
                                  } else {
                                    alert("No se pudo extraer de forma inequívoca el correo. Utilice la tabla de abajo para bloquear manualmente.");
                                  }
                                }}
                                className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-[9px] uppercase tracking-wider cursor-pointer"
                              >
                                🔴 Bloquear Sujeto
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {alerts.filter(a => a.type === "warning" || a.title?.toLowerCase().includes("inadecuad") || a.title?.toLowerCase().includes("bad-words")).length === 0 && (
                        <div className="text-center py-6 text-gray-500 text-[11px] font-mono select-none">
                          ✓ No hay avisos de lenguaje ofensivo pendientes de resolución.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Physical list of students with Manual Block/Unblock action trigger */}
                  <div className="bg-[#0b1224] border border-[#1b253b] p-4 rounded-2xl space-y-3">
                    <h4 className="text-xs font-black text-white">Manual Access Control (Estudiantes Registrados)</h4>
                    
                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      {students.map((st, i) => (
                        <div key={i} className="p-2.5 bg-black/25 border border-gray-850 rounded-xl flex items-center justify-between text-xs font-sans">
                          <div className="space-y-0.5 truncate mr-3">
                            <span className="text-white font-bold block truncate">{st.name} {st.lastName || ""}</span>
                            <span className="text-[10px] text-gray-400 block truncate">{st.email}</span>
                            <span className={`text-[9px] uppercase font-mono ${st.isBlocked ? 'text-red-500' : 'text-emerald-400'}`}>
                              {st.isBlocked ? "● Bloqueado (Sin Acceso)" : "● Acceso Concedido"}
                            </span>
                          </div>
                          
                          <div className="shrink-0">
                            {st.isBlocked ? (
                              <button
                                type="button"
                                onClick={() => handleBlockStudent(st.email, false)}
                                className="px-2.5 py-1.5 bg-emerald-600/30 hover:bg-emerald-600 text-emerald-400 hover:text-white font-bold rounded-lg text-[10px] uppercase transition-colors cursor-pointer"
                              >
                                🟢 Desbloquear
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleBlockStudent(st.email, true)}
                                className="px-2.5 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white font-bold rounded-lg text-[10px] uppercase transition-colors cursor-pointer"
                              >
                                🔴 Bloquear
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* List of Chat comments with Delete action: "Quitar un comentario en la conversación" */}
                  <div className="bg-[#0b1224] border border-[#1b253b] p-4 rounded-2xl space-y-3.5 text-left">
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>💬</span> Moderación de Foros en Tiempo Real
                    </h4>
                    
                    <div className="space-y-2 max-h-[200px] overflow-y-auto">
                      {communityMessages.map((msg, i) => (
                        <div key={msg.id || i} className="p-3 bg-black/35 border border-gray-850 rounded-xl space-y-2">
                          <div className="flex justify-between items-start gap-1">
                            <div>
                              <span className="text-[11px] font-bold text-gray-200 block">{msg.studentName}</span>
                              <span className="text-[9px] text-gray-500 block font-mono">{msg.studentEmail}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeletePost(msg.id)}
                              className="text-[10px] text-red-500 hover:text-white hover:bg-red-650 bg-red-500/10 p-1.5 rounded-lg border border-red-500/20 font-bold cursor-pointer transition-colors"
                              title="Borrar comentario del feed de la comunidad"
                            >
                              🗑️ Quitar Comentario
                            </button>
                          </div>
                          <p className="text-xs text-gray-300 leading-relaxed italic">
                            "{msg.message}"
                          </p>
                          <div className="text-[9px] text-gray-500 font-mono flex items-center justify-between">
                            <span>{msg.time || "Hace un momento"}</span>
                            <span>Score: {msg.studentXp || 0} XP</span>
                          </div>
                        </div>
                      ))}

                      {communityMessages.length === 0 && (
                        <div className="text-center py-6 text-gray-500 text-xs font-mono select-none">
                          No hay comentarios activos en los canales de la comunidad.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })()}

        {/* SECTION 17: CONTROL DE PROFESORES Y TUTORES HOMOLOGADOS */}
        {activeTab === "teachers_admin" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">17. Gestión de Profesores y Tutores Académicos</h3>
                <p className="text-xs text-gray-400">
                  Agrega, modifica o elimina perfiles de profesores de cualquier asignatura (Idioma, PCE, FP) para la guía escolar de los alumnos.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: CR-U-D FORM PANEL */}
              <div className="lg:col-span-5">
                <div className="bg-[#0b1224] border border-[#1c2e4f] p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl">
                  <div className="border-b border-gray-800 pb-2 flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">
                      {editingTeacherId ? "✏️ Modificar Registro de Profesor" : "➕ Dar de Alta Nuevo Profesor"}
                    </h3>
                    {editingTeacherId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTeacherId(null);
                          setTchName("");
                          setTchSubject("");
                          setTchEmail("");
                          setTchPhone("");
                          setTchBio("");
                          setTchPhotoUrl("");
                          setTchRating(5);
                        }}
                        className="text-[10px] bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white px-2 py-1 rounded"
                      >
                        Cancelar Modificación
                      </button>
                    )}
                  </div>

                  {teachActionError && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl font-sans">
                      ⚠️ {teachActionError}
                    </div>
                  )}

                  {teachActionSuccess && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl font-sans">
                      ✓ {teachActionSuccess}
                    </div>
                  )}

                  <form onSubmit={handleSaveTeacher} className="space-y-3.5 text-xs">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Nombre Completo:</label>
                      <input 
                        type="text"
                        placeholder="Ej: Prof. Antonio Gómez Ortiz"
                        value={tchName}
                        onChange={(e) => setTchName(e.target.value)}
                        className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400 font-sans"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Asignatura o Materia Docente:</label>
                      <input 
                        type="text"
                        placeholder="Ej: Lengua Española, Preparación PCE Selectividad"
                        value={tchSubject}
                        onChange={(e) => setTchSubject(e.target.value)}
                        className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400 font-sans"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Correo Electrónico:</label>
                        <input 
                          type="email"
                          placeholder="antonio@studyportal.net"
                          value={tchEmail}
                          onChange={(e) => setTchEmail(e.target.value)}
                          className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Teléfono:</label>
                        <input 
                          type="tel"
                          placeholder="+34 612345678"
                          value={tchPhone}
                          onChange={(e) => setTchPhone(e.target.value)}
                          className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Enlace a Foto de Perfil (URL):</label>
                      <input 
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={tchPhotoUrl}
                        onChange={(e) => setTchPhotoUrl(e.target.value)}
                        className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400 font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3 items-center">
                      <div className="col-span-2">
                        <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Calificación Estrellas (1-5):</label>
                        <input 
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          placeholder="4.9"
                          value={tchRating}
                          onChange={(e) => setTchRating(Number(e.target.value) || 5)}
                          className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-white outline-none"
                        />
                      </div>
                      <div className="text-center pt-4">
                        <span className="text-xl">⭐</span>
                        <span className="text-xs font-bold text-gray-300 font-mono ml-1">{tchRating} / 5</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Biografía o Presentación Corta:</label>
                      <textarea
                        rows={3}
                        placeholder="Presentación para los alumnos árabes, experiencia académica, etc..."
                        value={tchBio}
                        onChange={(e) => setTchBio(e.target.value)}
                        className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-white outline-none focus:border-amber-400 font-sans leading-normal"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={teachActionLoading}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black text-xs font-extrabold tracking-wider uppercase rounded-xl cursor-pointer transition-colors shadow-lg shadow-amber-500/10 mt-3"
                    >
                      {teachActionLoading ? "Guardando..." : editingTeacherId ? "💾 Guardar Profesor" : "🚀 Dar de Alta Profesor"}
                    </button>
                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN: ACTIVE LIST OF TEACHERS */}
              <div className="lg:col-span-7">
                <div className="bg-[#0b1224] border border-[#1b253b] p-5 rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">
                    📋 Listado de Profesores Activos en la Base de Datos (Arquetipo)
                  </h3>

                  <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto">
                    {(dbStats?.teachers || []).map((tch: any, idx: number) => (
                      <div key={tch.id || idx} className="p-4 bg-[#070a13] border border-gray-850 rounded-2xl space-y-3.5 hover:border-gray-800 transition-all font-sans">
                        <div className="flex gap-4">
                          <img 
                            src={tch.photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"} 
                            className="w-12 h-12 rounded-full object-cover border border-amber-500/20 shrink-0"
                            alt={tch.name}
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-white text-sm truncate">{tch.name}</h4>
                              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] px-1 rounded flex items-center gap-0.5 font-mono shrink-0">
                                ★ {tch.rating || 5.0}
                              </span>
                            </div>
                            <span className="text-xs text-amber-500 font-medium block">{tch.subject}</span>
                            <span className="text-[10px] text-gray-400 font-mono block select-all select-text">{tch.email}</span>
                            {tch.phone && <span className="text-[10px] text-gray-500 font-mono block select-all select-text">{tch.phone}</span>}
                          </div>
                        </div>

                        <p className="text-xs text-gray-300 leading-relaxed bg-black/25 p-2.5 rounded-xl border border-gray-850">
                          {tch.bio}
                        </p>

                        <div className="flex gap-2 justify-end select-none">
                          <button
                            type="button"
                            onClick={() => {
                              // Load into form to modify
                              setEditingTeacherId(tch.id);
                              setTchName(tch.name);
                              setTchSubject(tch.subject);
                              setTchEmail(tch.email);
                              setTchPhone(tch.phone || "");
                              setTchBio(tch.bio || "");
                              setTchPhotoUrl(tch.photoUrl || "");
                              setTchRating(tch.rating || 5);
                              
                              // Scroll into view or just inform the user
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-3 py-1.5 bg-[#121c32] hover:bg-[#1c2e4f] text-gray-300 hover:text-white font-semibold rounded-lg text-xs tracking-wide cursor-pointer transition-colors"
                          >
                            ✏️ Modificar Perfil
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTeacher(tch.id)}
                            className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white font-semibold rounded-lg text-xs tracking-wide cursor-pointer transition-colors"
                          >
                            🗑️ Dar de Baja Profesor
                          </button>
                        </div>
                      </div>
                    ))}

                    {(dbStats?.teachers || []).length === 0 && (
                      <div className="text-center py-8 text-xs text-gray-500 font-mono">
                        No hay profesores cargados en Atrévete a España. Rellene el formulario para añadir.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
        {activeTab === "collaborators_admin" && (
          <div className="space-y-6 animate-fade-in font-sans">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-white">18. Consola de Privilegios y Registro de Cuentas</h3>
                <p className="text-xs text-gray-400">Creación de perfiles autorizados para Anfitriones y registro de estudiantes con ID único aleatorio.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Add form ONLY for Master Admin sourllis8@gmail.com */}
              <div className="lg:col-span-1 bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <div className="flex bg-[#070a13] p-1.5 rounded-2xl border border-gray-800">
                  <button
                    type="button"
                    onClick={() => { setCreationType("anfitrion"); setCollabError(""); setCollabSuccess(""); }}
                    className={`flex-1 py-2 text-[11px] font-bold uppercase rounded-xl transition-all ${creationType === "anfitrion" ? "bg-amber-500 text-gray-900" : "text-gray-400 hover:text-white"}`}
                  >
                    Anfitrión
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCreationType("estudiante"); setCollabError(""); setCollabSuccess(""); }}
                    className={`flex-1 py-2 text-[11px] font-bold uppercase rounded-xl transition-all ${creationType === "estudiante" ? "bg-amber-500 text-gray-900" : "text-gray-500 hover:text-white"}`}
                  >
                    Estudiante
                  </button>
                </div>

                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                  <Plus size={14} />
                  <span>{creationType === "anfitrion" ? "Registrar Anfitrión" : "Registrar Estudiante con ID"}</span>
                </h4>
                
                {((localStorage.getItem("sp_admin_role") === "master") || (localStorage.getItem("sp_logged_email")?.toLowerCase() === "soullis8@gmail.com")) ? (
                  <form onSubmit={handleCreateAccount} className="space-y-4">
                    {collabError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-medium">
                        ⚠️ {collabError}
                      </div>
                    )}
                    {collabSuccess && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-medium">
                        ✨ {collabSuccess}
                      </div>
                    )}

                    {generatedStudCode && (
                      <div className="p-3.5 bg-yellow-500/10 border-2 border-dashed border-amber-500/40 rounded-xl text-center space-y-2">
                        <p className="text-[10px] text-amber-500 uppercase tracking-wider font-mono font-bold">Código Único Generado</p>
                        <p className="text-lg font-black text-white font-mono tracking-widest select-all bg-[#070a13] py-2.5 rounded border border-gray-800">{generatedStudCode}</p>
                        <p className="text-[9px] text-gray-400 leading-tight">El estudiante podrá ingresar inmediatamente usando este identificador único en la pantalla de inicio.</p>
                      </div>
                    )}

                    {creationType === "anfitrion" ? (
                      <>
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Nombre Completo</label>
                          <input 
                            type="text" 
                            placeholder="Ej: Mohamed Alami"
                            value={collabName}
                            onChange={(e) => setCollabName(e.target.value)}
                            className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Correo Anfitrión</label>
                          <input 
                            type="email" 
                            placeholder="ejemplo@estudiosespana.com"
                            value={collabEmail}
                            onChange={(e) => setCollabEmail(e.target.value)}
                            className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Contraseña de Acceso</label>
                          <input 
                            type="text" 
                            placeholder="Mínimo 8 caracteres..."
                            value={collabPassword}
                            onChange={(e) => setCollabPassword(e.target.value)}
                            className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                            required
                          />
                        </div>

                        <div className="pt-2">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={collabCanEdit}
                              onChange={(e) => setCollabCanEdit(e.target.checked)}
                              className="accent-amber-500 w-4 h-4"
                            />
                            <span className="text-xs font-semibold text-gray-300">Permitir editar Base de Datos (Editor)</span>
                          </label>
                          <p className="text-[9px] text-gray-500 mt-1">Habilita o deshabilita la facultad de re-escribir datos globales de la aplicación.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Nombre Completo</label>
                          <input 
                            type="text" 
                            placeholder="Ej: Karim"
                            value={studName}
                            onChange={(e) => setStudName(e.target.value)}
                            className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Apellidos (Opcional)</label>
                          <input 
                            type="text" 
                            placeholder="Ej: Benjelloun"
                            value={studLastName}
                            onChange={(e) => setStudLastName(e.target.value)}
                            className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">País de Residencia</label>
                          <select 
                            value={studCountry}
                            onChange={(e) => setStudCountry(e.target.value)}
                            className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400"
                          >
                            <option value="Morocco">🇲🇦 Marruecos</option>
                            <option value="Algeria">🇩🇿 Argelia</option>
                            <option value="Tunisia">🇹🇳 Túnez</option>
                            <option value="Egypt">🇪🇬 Egipto</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Ciudad Destino España</label>
                          <select 
                            value={studTargetCity}
                            onChange={(e) => setStudTargetCity(e.target.value)}
                            className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                          >
                            <option value="Madrid">Madrid</option>
                            <option value="Barcelona">Barcelona</option>
                            <option value="Sevilla">Sevilla</option>
                            <option value="Valencia">Valencia</option>
                            <option value="Zaragoza">Zaragoza</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Objetivo de Formación</label>
                          <select 
                            value={studGoal}
                            onChange={(e) => setStudGoal(e.target.value)}
                            className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                          >
                            <option value="FP Grado Superior">FP Grado Superior</option>
                            <option value="FP Grado Medio">FP Grado Medio</option>
                            <option value="Estudios de Grado Universitario">Grado Universitario</option>
                            <option value="Preparacion Selectividad">Preparación de Selectividad</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Nivel actual de Español</label>
                          <select 
                            value={studLevel}
                            onChange={(e) => setStudLevel(e.target.value)}
                            className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none"
                          >
                            <option value="A1">Nivel Inicial (A1)</option>
                            <option value="A2">Nivel Elemental (A2)</option>
                            <option value="B1">Nivel Intermedio (B1)</option>
                            <option value="B2">Nivel Avanzado (B2)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Correo Electrónico (Opcional)</label>
                          <input 
                            type="email" 
                            placeholder="Dejar vacío para autogestionar"
                            value={studEmailOpt}
                            onChange={(e) => setStudEmailOpt(e.target.value)}
                            className="w-full bg-[#070a13] border border-gray-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs tracking-widest uppercase rounded-xl transition-all shadow-md shadow-amber-500/10 cursor-pointer"
                    >
                      {creationType === "anfitrion" ? "Crear Anfitrión Pro ➔" : "Crear Alumno con ID Único ➔"}
                    </button>
                  </form>
                ) : (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl text-xs text-amber-300 leading-relaxed font-sans space-y-2">
                    <p className="font-bold">⚠️ Acceso Restringido para Creación</p>
                    <p>Su rol actual es colaborador. Solo el Administrador Maestro tiene los privilegios necesarios para añadir o retirar otros anfitriones y creadores de contenido.</p>
                  </div>
                )}
              </div>

              {/* Collaborators List */}
              <div className="lg:col-span-2 bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                    <Shield size={14} />
                    <span>Equipo Consolidado de Trabajo ({collabList.length})</span>
                  </h4>
                  <button 
                    onClick={fetchCollaborators}
                    className="text-gray-400 hover:text-amber-400 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Actualizar Lista"
                  >
                    <RefreshCw size={14} className={collabLoading ? "animate-spin" : ""} />
                  </button>
                </div>

                {collabLoading ? (
                  <div className="py-12 text-center text-xs text-gray-500 font-mono">
                    <RefreshCw className="animate-spin text-amber-500 mx-auto mb-2" size={20} />
                    Consultando registros de seguridad...
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {collabList.map((collab) => (
                      <div 
                        key={collab.email} 
                        className="p-4 bg-[#070b14] border border-[#182744] hover:border-amber-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-extrabold text-white">{collab.name}</span>
                            <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20`}>
                              {collab.role === 'master' ? 'Dueño Principal' : 'Anfitrión'}
                            </span>
                            {collab.role !== 'master' && (
                              <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-mono font-bold ${collab.canEditData ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                {collab.canEditData ? 'Permiso Edición' : 'Solo Lectura'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 font-mono">{collab.email}</p>
                          <p className="text-[10px] text-gray-500 font-mono">Clave asignada: {collab.password}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {((localStorage.getItem("sp_admin_role") === "master" || localStorage.getItem("sp_logged_email")?.toLowerCase() === "soullis8@gmail.com")) && collab.role !== "master" && (
                            <>
                              <button
                                onClick={() => handleToggleCollaboratorEdit(collab.email)}
                                className="px-2.5 py-1.5 bg-[#121c32] hover:bg-amber-500 hover:text-black font-semibold rounded-xl text-[10px] text-amber-400 uppercase tracking-wider cursor-pointer border border-[#1c2e4f] transition-all"
                                title="Cambiar permisos de edición"
                              >
                                🔄 Alternar Permisos
                              </button>

                              <button
                                onClick={() => handleDeleteCollaborator(collab.email)}
                                className="px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white font-bold rounded-xl text-[10px] uppercase tracking-wider cursor-pointer border border-red-500/20 transition-all flex items-center justify-center gap-1.5"
                              >
                                <Trash2 size={12} />
                                <span>Remover</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    {collabList.length === 0 && (
                      <div className="text-center py-12 text-xs text-gray-500 font-mono">
                        Cargando colaboradores de Atrévete a España...
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* SECTION 19: PUBLICIDAD & MARCAS */}
        {activeTab === "publicidad" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">19. Publicidad de Marcas & Traspaso en App</h3>
              <p className="text-xs text-gray-400">Gestiona la publicidad comercial que los alumnos visualizan mientras navegan por la aplicación.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form card */}
              <div className="bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">Crear Anuncio de Marca</h4>
                {adError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-mono">
                    ⚠️ {adError}
                  </div>
                )}
                {adSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-mono">
                    ✨ {adSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateAd} className="space-y-4 text-xs text-gray-300">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono block">Marca / Anunciante</label>
                    <input
                      type="text"
                      placeholder="Ej. Air Maroc, Spain Living, etc."
                      value={adBrand}
                      onChange={(e) => setAdBrand(e.target.value)}
                      className="w-full bg-[#070a13] border border-gray-800 p-2.5 rounded-xl text-white outline-none focus:border-amber-400 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono block">Título de la Campaña / Promocional</label>
                    <input
                      type="text"
                      placeholder="Ej. 20% Descuento por registrarte con nosotros"
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      className="w-full bg-[#070a13] border border-gray-800 p-2.5 rounded-xl text-white outline-none focus:border-amber-400 font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono block">Descripción Corta / Slogan</label>
                    <textarea
                      placeholder="Ej. Vuelos económicos de Casablanca a Madrid exclusivos para estudiantes universitarios y formación profesional."
                      value={adDesc}
                      onChange={(e) => setAdDesc(e.target.value)}
                      className="w-full h-16 bg-[#070a13] border border-gray-800 p-2.5 rounded-xl text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono block">URL de Imagen Publicitaria (Opcional)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={adImg}
                      onChange={(e) => setAdImg(e.target.value)}
                      className="w-full bg-[#070a13] border border-gray-805 p-2.5 rounded-xl text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono block">Enlace de Destino (Enlace Web)</label>
                    <input
                      type="url"
                      placeholder="https://marketing.com/promo"
                      value={adTargetUrl}
                      onChange={(e) => setAdTargetUrl(e.target.value)}
                      className="w-full bg-[#070a13] border border-gray-805 p-2.5 rounded-xl text-white outline-none focus:border-amber-400 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={adLoading}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold tracking-wider uppercase rounded-xl transition-all font-mono"
                  >
                    {adLoading ? "Creando Campaña..." : "Crear Anuncio y Lanzar ➔"}
                  </button>
                </form>
              </div>

              {/* List card */}
              <div className="lg:col-span-2 bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">Campañas Publicitarias en Curso ({adsList.length})</h4>
                  <button onClick={fetchAds} className="text-gray-400 hover:text-white"><RefreshCw size={14} /></button>
                </div>

                <div className="space-y-3">
                  {adsList.map((ad) => (
                    <div key={ad.id} className="p-4 bg-[#070b14] border border-[#1a2d4b] rounded-2xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between animate-fade-in">
                      <div className="flex items-center gap-3">
                        <img
                          src={ad.imageUrl}
                          alt={ad.title}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-800"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs bg-amber-500/10 text-amber-404 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-bold uppercase">{ad.brand}</span>
                            <strong className="text-xs text-white">{ad.title}</strong>
                          </div>
                          <p className="text-[11px] text-gray-400 font-sans mt-1">{ad.description}</p>
                          <p className="text-[9px] text-gray-500 font-mono mt-0.5">Destino: <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="text-amber-500 underline font-semibold">{ad.targetUrl}</a></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => downloadAdPDF(ad)}
                          className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 hover:text-black hover:scale-105 text-amber-400 font-bold font-mono text-[9px] rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                          title="Descargar Reporte PDF"
                        >
                          <ArrowDownToLine size={11} />
                          <span>PDF</span>
                        </button>

                        <button
                          onClick={() => handleToggleAdStatus(ad.id)}
                          className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold uppercase border tracking-wider transition-all cursor-pointer ${ad.status === "active" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"}`}
                        >
                          {ad.status === "active" ? "● Activo" : "○ Pausado"}
                        </button>

                        <button
                          onClick={() => handleDeleteAd(ad.id)}
                          className="p-1.5 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 rounded-lg transition-all border border-red-500/10 cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {adsList.length === 0 && (
                    <div className="text-center py-12 text-xs text-gray-400 font-mono border border-dashed border-gray-800 rounded-2xl">
                      📢 No hay campañas comerciales actualmente. Registra tu primera publicidad de marcas colaboradoras arriba.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 20: INFORMES DE AVANCE */}
        {activeTab === "informes_avance" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-lg font-black text-white">20. Informes Operativos & Avancistas del SaaS</h3>
              <p className="text-xs text-gray-400">Genera reseñas escritas y reportes con datos puntuales para diagnosticar y previsualizar cómo evoluciona Atrévete a España.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Card */}
              <div className="bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500">Redactar Informe Mensual o Semanal</h4>
                {repError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-mono">
                    ⚠️ {repError}
                  </div>
                )}
                {repSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 font-mono">
                    ✨ {repSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateReport} className="space-y-4 text-xs text-gray-300">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono block">Título de Informe o Hito</label>
                    <input
                      type="text"
                      placeholder="Ej. Reporte General de Estudiantes - Junio 2026"
                      value={repTitle}
                      onChange={(e) => setRepTitle(e.target.value)}
                      className="w-full bg-[#070a13] border border-gray-800 p-2.5 rounded-xl text-white outline-none focus:border-amber-400 font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase font-mono block">Tipo de Métrica</label>
                      <select
                        value={repType}
                        onChange={(e) => setRepType(e.target.value as any)}
                        className="w-full bg-[#070a13] border border-gray-800 p-2 rounded-lg text-white font-mono"
                      >
                        <option value="registros">Registros</option>
                        <option value="ingresos">Ingresos</option>
                        <option value="conversiones">Conversión</option>
                        <option value="soporte">Soporte</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase font-mono block">Tendencia</label>
                      <select
                        value={repTrend}
                        onChange={(e) => setRepTrend(e.target.value as any)}
                        className="w-full bg-[#070a13] border border-gray-800 p-2 rounded-lg text-white font-mono"
                      >
                        <option value="up">📈 Alza (Up)</option>
                        <option value="down">📉 Baja (Down)</option>
                        <option value="stable">➡️ Estable (Stable)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase font-mono block">Dato de Indicador (Opcional)</label>
                      <input
                        type="text"
                        placeholder="Ej. +25% u 8,500€"
                        value={repValue}
                        onChange={(e) => setRepValue(e.target.value)}
                        className="w-full bg-[#070a13] border border-gray-800 p-2.5 rounded-xl text-white outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase font-mono block">Redactor / Autor</label>
                      <input
                        type="text"
                        placeholder="Ej. Soullis"
                        value={repAuthor}
                        onChange={(e) => setRepAuthor(e.target.value)}
                        className="w-full bg-[#070a13] border border-gray-800 p-2.5 rounded-xl text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase font-mono block">Resumen Ejecutivo</label>
                    <textarea
                      placeholder="Redacte las actividades de avance, hitos cumplidos, estado migratorio, preparación de clases, o resolución de problemas..."
                      value={repSummary}
                      onChange={(e) => setRepSummary(e.target.value)}
                      className="w-full h-24 bg-[#070a13] border border-gray-800 p-2.5 rounded-xl text-white outline-none focus:border-amber-400 font-mono"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={repLoading}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold tracking-wider uppercase rounded-xl transition-all font-mono"
                  >
                    {repLoading ? "Publicando..." : "Redactar y Registrar Hito ➔"}
                  </button>
                </form>
              </div>

              {/* List Card */}
              <div className="lg:col-span-2 bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">Historial de Reportes Generados ({reportsList.length})</h4>
                  <button onClick={fetchReports} className="text-gray-400 hover:text-white"><RefreshCw size={14} /></button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {reportsList.map((rep) => (
                    <div key={rep.id} className="p-4 bg-[#070b14] border border-[#1a2c47] hover:border-amber-500/20 rounded-2xl flex flex-col md:flex-row justify-between gap-4 items-start md:items-center animate-fade-in text-xs">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[9px] uppercase px-2 py-0.5 rounded font-mono font-bold ${
                            rep.metricType === "registros" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                            rep.metricType === "ingresos" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                            rep.metricType === "conversiones" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                            "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          }`}>Métrica: {rep.metricType}</span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            rep.trend === "up" ? "bg-emerald-500/10 text-emerald-400" :
                            rep.trend === "down" ? "bg-red-500/10 text-red-400" :
                            "bg-gray-500/10 text-gray-400"
                          }`}>{rep.trend === "up" ? "📈 ALZA" : rep.trend === "down" ? "📉 BAJA" : "➡️ ESTABLE"}</span>
                          <span className="text-[10px] text-gray-500 font-mono">{rep.date}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{rep.title}</h4>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans">{rep.summary}</p>
                      </div>

                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="text-right bg-[#0d1629] p-3 rounded-xl border border-gray-800 text-center min-w-[90px]">
                          <span className="text-[9px] uppercase font-mono block text-gray-500">Valor</span>
                          <strong className="text-sm font-mono text-amber-400 font-black block mt-0.5">{rep.value}</strong>
                          <span className="text-[8px] text-gray-400 block mt-1 font-mono">Por: {rep.author}</span>
                        </div>
                        <button
                          onClick={() => downloadReportPDF(rep)}
                          className="w-full py-1 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 hover:text-black hover:scale-103 text-amber-400 font-bold font-mono text-[9px] rounded-lg uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                          title="Descargar Informe PDF"
                        >
                          <ArrowDownToLine size={11} />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {reportsList.length === 0 && (
                    <div className="text-center py-16 text-gray-500 font-mono border border-dashed border-gray-800 rounded-2xl">
                      📈 No hay informes registrados todavía. Empieza recopilando el estado y escribe el primer reporte de avance arriba.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 21: EDITOR DE INFORMACIÓN DYNAMIC SYSTEM */}
        {activeTab === "editor" && (() => {
          const isMaster = localStorage.getItem("sp_admin_role") === "master" || localStorage.getItem("sp_logged_email")?.toLowerCase() === "soullis8@gmail.com";
          const canEdit = isMaster || localStorage.getItem("sp_admin_can_edit") === "true";

          const currentFormations = dbStats?.customData?.formations || FORMATIONS;
          const currentHousing = dbStats?.customData?.housing || LOGEMENT;
          const currentStudentLife = dbStats?.customData?.studentLife || STUDENT_CITIES_GUIDE;
          const currentNavItems = dbStats?.customData?.navItems || NAV_ITEMS;

          const handleSaveNavItems = async (updatedData: any) => {
            if (!canEdit) {
              setEditorError("Error: No tienes privilegios de escritura.");
              return;
            }
            setEditorLoading(true);
            setEditorSuccess("");
            setEditorError("");
            try {
              const res = await fetch("/api/admin/save-custom-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "navItems", data: updatedData })
              });
              const resJson = await res.json();
              if (res.ok && resJson.success) {
                setEditorSuccess("¡Fabuloso! El menú de navegación (sidebar) se ha guardado e implementado.");
                onRefreshStats();
              } else {
                setEditorError(resJson.error || "No se pudo actualizar.");
              }
            } catch (err) {
              setEditorError("Fallo de red al guardar la barra lateral.");
            } finally {
              setEditorLoading(false);
            }
          };

          const handleSaveFormations = async (updatedData: any) => {
            if (!canEdit) {
              setEditorError("Error: No tienes privilegios de escritura.");
              return;
            }
            setEditorLoading(true);
            setEditorSuccess("");
            setEditorError("");
            try {
              const res = await fetch("/api/admin/save-custom-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "formations", data: updatedData })
              });
              const resJson = await res.json();
              if (res.ok && resJson.success) {
                setEditorSuccess("¡Enhorabuena! Grados formativos y especialidades académicas guardadas.");
                onRefreshStats();
              } else {
                setEditorError(resJson.error || "No se pudo actualizar en el servidor.");
              }
            } catch (err) {
              setEditorError("Fallo de red al guardar las formaciones.");
            } finally {
              setEditorLoading(false);
            }
          };

          const handleSaveHousing = async (updatedData: any) => {
            if (!canEdit) {
              setEditorError("Error: No tienes privilegios de escritura.");
              return;
            }
            setEditorLoading(true);
            setEditorSuccess("");
            setEditorError("");
            try {
              const res = await fetch("/api/admin/save-custom-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "housing", data: updatedData })
              });
              const resJson = await res.json();
              if (res.ok && resJson.success) {
                setEditorSuccess("¡Excelente! Listado de alojamientos actualizado de forma instantánea para alumnos.");
                onRefreshStats();
              } else {
                setEditorError(resJson.error || "No se pudo actualizar.");
              }
            } catch (err) {
              setEditorError("Fallo de red al interactuar con el servidor.");
            } finally {
              setEditorLoading(false);
            }
          };

          const handleSaveStudentLife = async (updatedData: any) => {
            if (!canEdit) {
              setEditorError("Error: No tienes privilegios de escritura.");
              return;
            }
            setEditorLoading(true);
            setEditorSuccess("");
            setEditorError("");
            try {
              const res = await fetch("/api/admin/save-custom-data", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key: "studentLife", data: updatedData })
              });
              const resJson = await res.json();
              if (res.ok && resJson.success) {
                setEditorSuccess("¡Fabuloso! Guías de vida estudiantil regional guardadas.");
                onRefreshStats();
              } else {
                setEditorError(resJson.error || "Error de respuesta.");
              }
            } catch (err) {
              setEditorError("Fallo de red.");
            } finally {
              setEditorLoading(false);
            }
          };

          return (
            <div className="space-y-6 animate-fade-in font-sans">
              
              {/* Header Title line */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0a1122] border border-[#1b253b] p-5 rounded-3xl shrink-0 shadow-lg select-none">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Edit3 className="text-amber-500" size={20} />
                    <span>21. Centro de Edición y Control de Contenidos</span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Modifique en tiempo real toda la información visible para el estudiante: especialidades académicas, alojamientos y guías regionales.
                  </p>
                </div>
                {!canEdit && (
                  <span className="bg-red-500/15 border border-red-500/20 text-red-400 text-xs py-1.5 px-3 rounded-xl font-mono flex items-center gap-1.5 shrink-0">
                    <Ban size={14} />
                    Modo Lectura
                  </span>
                )}
                {canEdit && (
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] py-1.5 px-3 rounded-xl font-mono flex items-center gap-1.5 shrink-0">
                    <CheckCircle className="animate-pulse" size={14} />
                    Edición Interactiva Activada
                  </span>
                )}
              </div>

              {/* Toast messages */}
              {editorSuccess && (
                <div className="p-4 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-xs text-emerald-400 font-semibold font-sans flex items-center gap-2 animate-bounce">
                  <span>✨</span>
                  <span>{editorSuccess}</span>
                </div>
              )}
              {editorError && (
                <div className="p-4 bg-red-500/15 border border-red-500/30 rounded-2xl text-xs text-red-400 font-semibold font-sans flex items-center gap-2 animate-pulse">
                  <span>⚠️</span>
                  <span>{editorError}</span>
                </div>
              )}

              {/* Sub-Tabs Selector */}
              <div className="flex gap-2 p-1.5 bg-[#090f1e] border border-[#17253f] rounded-2xl max-w-4xl select-none flex-wrap">
                {[
                  { key: "formations", label: "Cursos y Formaciones", icon: "🎓" },
                  { key: "housing", label: "Oferta de Alojamientos", icon: "🏠" },
                  { key: "studentLife", label: "Guías de Vida Estudiantil", icon: "🧭" },
                  { key: "navigation", label: "Menú Lateral (Sidebar)", icon: "📋" }
                ].map((sTab) => (
                  <button
                    key={sTab.key}
                    onClick={() => {
                      setEditorSubTab(sTab.key as any);
                      setEditorSuccess("");
                      setEditorError("");
                      // Reset minor parameters
                      setEditFormFamIdx(-1);
                      setEditingHousingId(null);
                    }}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      editorSubTab === sTab.key 
                        ? 'bg-amber-500 text-gray-900 shadow-md scale-102 font-extrabold' 
                        : 'text-gray-400 hover:text-white hover:bg-[#121c32]'
                    }`}
                  >
                    <span>{sTab.icon}</span>
                    <span>{sTab.label}</span>
                  </button>
                ))}
              </div>

              {/* 1. FORMATIONS SUB-TAB PANEL */}
              {editorSubTab === "formations" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Category Selection Left Side (4 columns) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4 shadow-md">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 font-mono">
                        A. Seleccionar Tipo de Estudios
                      </h4>
                      
                      <div className="flex flex-col gap-2">
                        {Object.keys(currentFormations).map((catKey) => {
                          const cat = currentFormations[catKey];
                          const isActive = editFormCategory === catKey;
                          return (
                            <button
                              key={catKey}
                              type="button"
                              onClick={() => {
                                setEditFormCategory(catKey);
                                setEditFormFamIdx(-1);
                              }}
                              className={`w-full text-left p-3.5 rounded-2xl flex items-center justify-between transition-all border ${
                                isActive 
                                  ? 'bg-amber-500/10 border-amber-500 text-white font-extrabold' 
                                  : 'bg-[#070a13] border-gray-800 text-gray-400 hover:text-white'
                              }`}
                            >
                              <div>
                                <span className="text-xs uppercase font-mono text-amber-400 block mb-0.5">{cat.tag || 'FP'}</span>
                                <span className="text-xs font-bold">{cat.es || catKey}</span>
                              </div>
                              <ChevronRight size={16} className={isActive ? "text-amber-400 translate-x-1 transition-transform" : "text-gray-600"} />
                            </button>
                          );
                        })}
                      </div>

                      {/* Header values for the Selected Category */}
                      {(() => {
                        const cat = currentFormations[editFormCategory];
                        if (!cat) return null;
                        return (
                          <div className="border-t border-gray-800/80 pt-4 space-y-3.5 text-xs font-sans">
                            <span className="text-[10px] text-amber-500 font-mono block uppercase font-bold">Parámetros Globales del Grado</span>
                            
                            {/* Título */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-400 block font-bold">Título o Nombre (ES / FR / AR)</label>
                              <input 
                                type="text"
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs block mb-1"
                                value={globalTitleEs}
                                placeholder="Ej: Formación Profesional de Grado Superior"
                                onChange={(e) => setGlobalTitleEs(e.target.value)}
                              />
                              <input 
                                type="text"
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs block mb-1"
                                value={globalTitleFr}
                                placeholder="Ej: Formation Professionnelle Supérieure"
                                onChange={(e) => setGlobalTitleFr(e.target.value)}
                              />
                              <input 
                                type="text"
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs block text-right font-mono"
                                value={globalTitleAr}
                                placeholder="Ej: التكوين المهني العالي"
                                onChange={(e) => setGlobalTitleAr(e.target.value)}
                              />
                            </div>

                            {/* Duración */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-400 block font-bold">Duración (ES / FR / AR)</label>
                              <input 
                                type="text"
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs block mb-1"
                                value={globalDurationEs}
                                placeholder="Ej: 2 años"
                                onChange={(e) => setGlobalDurationEs(e.target.value)}
                              />
                              <input 
                                type="text"
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs block mb-1"
                                value={globalDurationFr}
                                placeholder="Ej: 2 ans"
                                onChange={(e) => setGlobalDurationFr(e.target.value)}
                              />
                              <input 
                                type="text"
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs block text-right font-mono"
                                value={globalDurationAr}
                                placeholder="Ej: سنتان"
                                onChange={(e) => setGlobalDurationAr(e.target.value)}
                              />
                            </div>

                            {/* Costo */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-400 block font-bold">Costo Estimado (ES / FR / AR)</label>
                              <input 
                                type="text"
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs block mb-1"
                                value={globalCostEs}
                                placeholder="Ej: Público: 100€ | Privado: 2000€"
                                onChange={(e) => setGlobalCostEs(e.target.value)}
                              />
                              <input 
                                type="text"
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs block mb-1"
                                value={globalCostFr}
                                placeholder="Ej: Public: 100€ | Privé: 2000€"
                                onChange={(e) => setGlobalCostFr(e.target.value)}
                              />
                              <input 
                                type="text"
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs block text-right font-mono"
                                value={globalCostAr}
                                placeholder="Ej: عام: 100€ | خاص: 2000€"
                                onChange={(e) => setGlobalCostAr(e.target.value)}
                              />
                            </div>

                            {/* Requisitos de Acceso */}
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1 font-bold">Requisitos de Acceso (Uno por línea)</label>
                              <textarea 
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs h-24 font-mono block"
                                value={globalAccessesText}
                                placeholder="Título de Bachiller o equivalente&#10;Edad mínima 18 años"
                                onChange={(e) => setGlobalAccessesText(e.target.value)}
                              />
                            </div>

                            {/* Nota de Consejo */}
                            <div className="space-y-1">
                              <label className="text-[10px] text-gray-400 block font-bold">Nota / Consejo Especial (ES / FR / AR)</label>
                              <textarea 
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs h-16 block mb-1"
                                value={globalNoteEs}
                                placeholder="Ej: Acceso directo a Universidad..."
                                onChange={(e) => setGlobalNoteEs(e.target.value)}
                              />
                              <textarea 
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs h-16 block mb-1"
                                value={globalNoteFr}
                                placeholder="Ej: Accès direct à l'Université..."
                                onChange={(e) => setGlobalNoteFr(e.target.value)}
                              />
                              <textarea 
                                className="w-full bg-[#070a13] border border-gray-850 p-2 rounded-xl text-white text-xs h-16 block text-right font-mono"
                                value={globalNoteAr}
                                placeholder="Ej: مسار مباشر إلى الجامعة..."
                                onChange={(e) => setGlobalNoteAr(e.target.value)}
                              />
                            </div>

                            <button
                              onClick={() => {
                                const c = JSON.parse(JSON.stringify(currentFormations));
                                if (!c[editFormCategory]) c[editFormCategory] = {};
                                
                                c[editFormCategory].es = globalTitleEs;
                                c[editFormCategory].fr = globalTitleFr;
                                c[editFormCategory].ar = globalTitleAr;
                                
                                if (!c[editFormCategory].duration) c[editFormCategory].duration = {};
                                c[editFormCategory].duration.es = globalDurationEs;
                                c[editFormCategory].duration.fr = globalDurationFr;
                                c[editFormCategory].duration.ar = globalDurationAr;
                                
                                if (!c[editFormCategory].cost) c[editFormCategory].cost = {};
                                c[editFormCategory].cost.es = globalCostEs;
                                c[editFormCategory].cost.fr = globalCostFr;
                                c[editFormCategory].cost.ar = globalCostAr;
                                
                                c[editFormCategory].access = globalAccessesText.split("\n").map(l => l.trim()).filter(Boolean);
                                
                                if (!c[editFormCategory].note) c[editFormCategory].note = {};
                                c[editFormCategory].note.es = globalNoteEs;
                                c[editFormCategory].note.fr = globalNoteFr;
                                c[editFormCategory].note.ar = globalNoteAr;

                                handleSaveFormations(c);
                              }}
                              disabled={editorLoading || !canEdit}
                              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold uppercase rounded-xl tracking-wider text-[10px]"
                            >
                              Guardar Valores Globales
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Families List & Family Edit Form Right Side (8 columns) */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4 shadow-md">
                      <div className="flex justify-between items-center pb-2 border-b border-gray-800/80">
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 font-mono">
                          B. Especialidades y Familias Profesionales
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            const c = JSON.parse(JSON.stringify(currentFormations));
                            if (!c[editFormCategory].families) c[editFormCategory].families = [];
                            c[editFormCategory].families.push({
                              name: { es: "Nueva Familia Profesional", fr: "Nouvelle Famille", ar: "فرع جديد" },
                              salidas: { es: ["Salida 1"], fr: ["Salida 1"], ar: ["مهنة 1"] }
                            });
                            // Load this new family index immediately
                            const newIdx = c[editFormCategory].families.length - 1;
                            setEditFormFamIdx(newIdx);
                            setEditFormFamNameEs("Nueva Familia Profesional");
                            setEditFormFamNameFr("Nouvelle Famille");
                            setEditFormFamNameAr("فرع جديد");
                            setEditFormCyclesTextEs("Salida 1");
                            setEditFormCyclesTextFr("Salida 1");
                            setEditFormCyclesTextAr("مهنة 1");
                          }}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>Añadir Rama</span>
                        </button>
                      </div>

                      {/* Display current list of Families */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(currentFormations[editFormCategory]?.families || []).map((fam: any, fIdx: number) => {
                          const isActive = editFormFamIdx === fIdx;
                          return (
                            <div 
                              key={fIdx}
                              className={`p-3 rounded-2xl border transition-all flex justify-between items-start ${
                                isActive ? 'bg-[#121c32] border-amber-500 shadow-md' : 'bg-[#070a13] border-gray-850 hover:border-gray-800'
                              }`}
                            >
                              <div className="min-w-0 pr-1 space-y-1">
                                <strong className="text-xs text-white block truncate">{fam.name?.es || "Sin Nombre"}</strong>
                                <span className="text-[10px] text-gray-500 block font-mono truncate">{fam.name?.fr || "-"} | {fam.name?.ar || "-"}</span>
                                <span className="text-[9px] bg-amber-500/5 text-amber-400 border border-amber-500/10 px-1.5 py-0.5 rounded font-mono">
                                  {(fam.salidas?.es || []).length} salidas profes.
                                </span>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditFormFamIdx(fIdx);
                                    setEditFormFamNameEs(fam.name?.es || "");
                                    setEditFormFamNameFr(fam.name?.fr || "");
                                    setEditFormFamNameAr(fam.name?.ar || "");
                                    setEditFormCyclesTextEs((fam.salidas?.es || []).join(", "));
                                    setEditFormCyclesTextFr((fam.salidas?.fr || []).join(", "));
                                    setEditFormCyclesTextAr((fam.salidas?.ar || []).join(", "));
                                  }}
                                  className="p-1 px-1.5 bg-gray-800 hover:bg-amber-400 hover:text-black rounded text-[10px] transition-colors"
                                  title="Editar"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm("¿Seguro que deseas eliminar esta familia profesional?")) {
                                      const copyForm = JSON.parse(JSON.stringify(currentFormations));
                                      copyForm[editFormCategory].families.splice(fIdx, 1);
                                      setEditFormFamIdx(-1);
                                      handleSaveFormations(copyForm);
                                    }
                                  }}
                                  className="p-1 px-1.5 bg-red-650/15 hover:bg-red-600 text-red-400 hover:text-white rounded text-[10px] transition-colors"
                                  title="Eliminar"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Editing Active Family Form panel */}
                      {editFormFamIdx !== -1 && (
                        <div className="bg-[#070a13] border-2 border-dashed border-[#1c2e4f] p-4 rounded-2xl space-y-4">
                          <span className="text-[10px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono uppercase font-bold block w-fit">
                            MODIFICANDO RAMA SELECCIONADA (#{(editFormFamIdx + 1)})
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">Nombre (Español)</label>
                              <input 
                                type="text"
                                className="w-full bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-xs text-white"
                                value={editFormFamNameEs}
                                onChange={(e) => setEditFormFamNameEs(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">Nombre (Francés)</label>
                              <input 
                                type="text"
                                className="w-full bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-xs text-white"
                                value={editFormFamNameFr}
                                onChange={(e) => setEditFormFamNameFr(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">Nombre (Árabe / Arabic)</label>
                              <input 
                                type="text"
                                className="w-full bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-xs text-white font-mono text-right"
                                value={editFormFamNameAr}
                                onChange={(e) => setEditFormFamNameAr(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">Salidas Profesionales/Opciones ES (Separadas por comas)</label>
                              <textarea 
                                className="w-full bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white h-16 font-mono"
                                value={editFormCyclesTextEs}
                                onChange={(e) => setEditFormCyclesTextEs(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">Salidas Profesionales/Opciones FR (Separadas por comas)</label>
                              <textarea 
                                className="w-full bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white h-16 font-mono"
                                value={editFormCyclesTextFr}
                                onChange={(e) => setEditFormCyclesTextFr(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1">Salidas Profesionales/Opciones AR (Separadas por comas)</label>
                              <textarea 
                                className="w-full bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white h-16 font-mono text-right"
                                value={editFormCyclesTextAr}
                                onChange={(e) => setEditFormCyclesTextAr(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditFormFamIdx(-1)}
                              className="px-3 py-2 bg-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const copyForm = JSON.parse(JSON.stringify(currentFormations));
                                copyForm[editFormCategory].families[editFormFamIdx] = {
                                  name: {
                                    es: editFormFamNameEs.trim(),
                                    fr: editFormFamNameFr.trim(),
                                    ar: editFormFamNameAr.trim()
                                  },
                                  salidas: {
                                    es: editFormCyclesTextEs.split(",").map(s => s.trim()).filter(Boolean),
                                    fr: editFormCyclesTextFr.split(",").map(s => s.trim()).filter(Boolean),
                                    ar: editFormCyclesTextAr.split(",").map(s => s.trim()).filter(Boolean)
                                  }
                                };
                                handleSaveFormations(copyForm);
                              }}
                              className="px-4 py-2 bg-amber-500 text-black rounded-xl text-xs font-extrabold"
                            >
                              Confirmar Cambios ✔
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              )}

              {/* 2. HOUSING SUB-TAB PANEL */}
              {editorSubTab === "housing" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Housing Addition Form Card Left (5 columns) */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const copyH = JSON.parse(JSON.stringify(currentHousing));
                      
                      const newItem = {
                        type: {
                          es: houseTitleEs.trim() || "Piso compartido",
                          fr: houseTitleFr.trim() || houseTitleEs.trim(),
                          ar: houseTitleAr.trim() || houseTitleEs.trim()
                        },
                        name: {
                          es: houseTitleEs.trim() || "Habitación confortable",
                          fr: houseTitleFr.trim() || houseTitleEs.trim(),
                          ar: houseTitleAr.trim() || houseTitleEs.trim()
                        },
                        desc: {
                          es: houseContact.trim() || "Sin descripción proporcionada.",
                          fr: houseContact.trim() || "Pas de description.",
                          ar: houseContact.trim() || "لا يوجد وصف."
                        },
                        price: {
                          es: housePrice ? `${housePrice}€ / mes` : "Precios varían según zona",
                          fr: housePrice ? `${housePrice}€ / mois` : "Tarifs de colocation",
                          ar: housePrice ? `${housePrice} يورو في الشهر` : "الأسعار متغيرة"
                        }
                      };

                      if (editingHousingId !== null) {
                        copyH[Number(editingHousingId)] = newItem;
                      } else {
                        copyH.push(newItem);
                      }

                      handleSaveHousing(copyH);
                      
                      // RESET
                      setHouseTitleEs("");
                      setHouseTitleFr("");
                      setHouseTitleAr("");
                      setHouseContact("");
                      setHousePrice(400);
                      setEditingHousingId(null);
                    }}
                    className="lg:col-span-12 bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4 shadow-md"
                  >
                    <div className="pb-2 border-b border-gray-800/80">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 font-mono">
                        {editingHousingId !== null ? "📝 Modificar Alojamiento de Alumnos" : "🏠 Añadir Nuevo Alojamiento Frecuente"}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Título/Nombre (Español)</label>
                        <input 
                          type="text"
                          className="w-full bg-[#070a13] border border-gray-850 p-2.5 rounded-xl text-xs text-white"
                          placeholder="Ej: Habitación Individual cerca del campus"
                          value={houseTitleEs}
                          onChange={(e) => setHouseTitleEs(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Título/Nombre (Francés)</label>
                        <input 
                          type="text"
                          className="w-full bg-[#070a13] border border-gray-850 p-2.5 rounded-xl text-xs text-white"
                          placeholder="Chambre individuelle confortable"
                          value={houseTitleFr}
                          onChange={(e) => setHouseTitleFr(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Título/Nombre (Árabe / Arabic)</label>
                        <input 
                          type="text"
                          className="w-full bg-[#070a13] border border-gray-850 p-2.5 rounded-xl text-xs text-white font-mono text-right"
                          placeholder="غرفة فردية في سكن مشترك"
                          value={houseTitleAr}
                          onChange={(e) => setHouseTitleAr(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Precio Referencia (€ al mes)</label>
                        <input 
                          type="number"
                          className="w-full bg-[#070a13] border border-gray-850 p-2.5 rounded-xl text-xs text-white font-mono"
                          value={housePrice}
                          onChange={(e) => setHousePrice(Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-1">Ciudad Destino Principal</label>
                        <select 
                          className="w-full bg-[#070a13] border border-gray-850 p-2.5 rounded-xl text-xs text-white"
                          value={houseCity}
                          onChange={(e) => setHouseCity(e.target.value)}
                        >
                          <option value="Madrid">Madrid</option>
                          <option value="Barcelona">Barcelona</option>
                          <option value="Valencia">Valencia</option>
                          <option value="Sevilla">Sevilla</option>
                          <option value="Zaragoza">Zaragoza</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1">Descripción y Contacto (Se mostrará en todos los idiomas)</label>
                      <textarea 
                        className="w-full bg-[#070a13] border border-gray-850 p-2.5 h-24 rounded-xl text-xs text-white font-mono"
                        placeholder="Ej: Piso compartido de 3 habitaciones, ambiente escolar. Interesados contactar con tutor de Atrévete España o WhatsApp: +34 600..."
                        value={houseContact}
                        onChange={(e) => setHouseContact(e.target.value)}
                        required
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      {editingHousingId !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingHousingId(null);
                            setHouseTitleEs("");
                            setHouseTitleFr("");
                            setHouseTitleAr("");
                            setHouseContact("");
                          }}
                          className="px-3.5 py-2 bg-gray-850 text-gray-300 rounded-xl text-xs hover:text-white"
                        >
                          Cancelar Edición
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!canEdit}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-900 font-extrabold rounded-xl text-xs uppercase tracking-wider"
                      >
                        {editingHousingId !== null ? "Confirmar Alquiler ✔" : "Crear Tarjeta de Alquiler ➔"}
                      </button>
                    </div>
                  </form>

                  {/* Housing Card List (12 columns) */}
                  <div className="lg:col-span-12 space-y-4">
                    <div className="bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-4 shadow-md">
                      <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 font-mono">
                        Listado Actual de Alojamientos ({currentHousing.length})
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentHousing.map((item: any, idx: number) => (
                          <div 
                            key={idx} 
                            className="p-4 bg-[#070b14] border border-[#182744] rounded-2xl flex justify-between gap-4 text-xs font-sans hover:border-[#27406f] transition-all"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono uppercase">
                                {item.type?.es || item.type || "Piso compartido"}
                              </span>
                              <h5 className="font-bold text-white truncate">{item.name?.es || "S/N"}</h5>
                              <p className="text-[11px] text-gray-400 line-clamp-2">{item.desc?.es || item.desc || "-"}</p>
                              <strong className="text-xs text-amber-400 block font-mono">Precio: {item.price?.es || item.price || "€ varían"}</strong>
                            </div>

                            <div className="flex flex-col gap-2 justify-center select-none shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingHousingId(String(idx));
                                  setHouseTitleEs(item.name?.es || "");
                                  setHouseTitleFr(item.name?.fr || "");
                                  setHouseTitleAr(item.name?.ar || "");
                                  setHouseContact(item.desc?.es || item.desc || "");
                                  const prString = item.price?.es || "";
                                  const matches = prString.match(/\d+/);
                                  setHousePrice(matches ? Number(matches[0]) : 400);
                                }}
                                className="px-2.5 py-1 bg-gray-800 hover:bg-amber-500 hover:text-black font-semibold text-[10px] rounded"
                              >
                                Editar ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm("¿Seguro que deseas eliminar este alojamiento permanente de la lista?")) {
                                    const copyH = JSON.parse(JSON.stringify(currentHousing));
                                    copyH.splice(idx, 1);
                                    handleSaveHousing(copyH);
                                  }
                                }}
                                className="px-2.5 py-1 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white font-semibold text-[10px] rounded"
                              >
                                Eliminar 🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* 3. STUDENT LIFE SUB-TAB PANEL */}
              {editorSubTab === "studentLife" && (
                <div className="bg-[#0b1224] border border-[#1c2e4f] p-5 rounded-3xl space-y-5 shadow-md">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-800/80">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-500 font-mono">
                      Guías de Ciudades y Acompañamiento Local
                    </h4>
                    
                    {/* City Selector */}
                    <div className="flex items-center gap-2 select-none">
                      <span className="text-xs text-gray-400">Filtrar Guía de la Ciudad:</span>
                      <select 
                        className="bg-[#070a13] border border-gray-800 text-xs text-amber-400 p-1 px-3 rounded-lg font-bold"
                        value={editCityKey}
                        onChange={(e) => {
                          setEditCityKey(e.target.value);
                          // populate currently active values in state
                          const cityData = currentStudentLife.find((g: any) => g.city === e.target.value);
                          if (cityData) {
                            setCityEventsEs(cityData.events?.es || "");
                            setCityEventsFr(cityData.events?.fr || "");
                            setCityEventsAr(cityData.events?.ar || "");
                            
                            setCityFriendsEs(cityData.friends?.es || "");
                            setCityFriendsFr(cityData.friends?.fr || "");
                            setCityFriendsAr(cityData.friends?.ar || "");

                            setCityMarketTipsEs(cityData.supermarkets?.tips?.es || "");
                            setCityMarketTipsFr(cityData.supermarkets?.tips?.fr || "");
                            setCityMarketTipsAr(cityData.supermarkets?.tips?.ar || "");
                          }
                        }}
                      >
                        <option value="Madrid">Madrid 🇪🇸</option>
                        <option value="Barcelona">Barcelona 🇪🇸</option>
                        <option value="Valencia">Valencia 🇪🇸</option>
                        <option value="Sevilla">Sevilla 🇪🇸</option>
                        <option value="Málaga">Málaga 🇪🇸</option>
                        <option value="Granada">Granada 🇪🇸</option>
                      </select>
                    </div>
                  </div>

                  {/* Guide textareas */}
                  <div className="space-y-4">
                    
                    {/* Block A: Events & meetups */}
                    <div className="p-4 bg-[#070a13] rounded-2xl border border-gray-850 space-y-3">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-2 font-mono uppercase">
                        <span>🎉</span> Eventos e Integración Académica ({editCityKey})
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1">Español (ES)</label>
                          <textarea 
                            className="w-full h-24 bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                            value={cityEventsEs || (currentStudentLife.find((g: any) => g.city === editCityKey)?.events?.es || "")}
                            onChange={(e) => setCityEventsEs(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1">Francés (FR)</label>
                          <textarea 
                            className="w-full h-24 bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                            value={cityEventsFr || (currentStudentLife.find((g: any) => g.city === editCityKey)?.events?.fr || "")}
                            onChange={(e) => setCityEventsFr(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1 font-mono">Arabe (AR)</label>
                          <textarea 
                            className="w-full h-24 bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white font-mono text-right"
                            value={cityEventsAr || (currentStudentLife.find((g: any) => g.city === editCityKey)?.events?.ar || "")}
                            onChange={(e) => setCityEventsAr(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Block B: How to make friends */}
                    <div className="p-4 bg-[#070a13] rounded-2xl border border-gray-850 space-y-3">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-2 font-mono uppercase">
                        <span>🤝</span> ¿Cómo hacer amigos y conocer gente? ({editCityKey})
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1">Español (ES)</label>
                          <textarea 
                            className="w-full h-24 bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                            value={cityFriendsEs || (currentStudentLife.find((g: any) => g.city === editCityKey)?.friends?.es || "")}
                            onChange={(e) => setCityFriendsEs(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1 font-mono">Francés (FR)</label>
                          <textarea 
                            className="w-full h-24 bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                            value={cityFriendsFr || (currentStudentLife.find((g: any) => g.city === editCityKey)?.friends?.fr || "")}
                            onChange={(e) => setCityFriendsFr(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1 font-mono">Árabe (AR)</label>
                          <textarea 
                            className="w-full h-24 bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white font-mono text-right"
                            value={cityFriendsAr || (currentStudentLife.find((g: any) => g.city === editCityKey)?.friends?.ar || "")}
                            onChange={(e) => setCityFriendsAr(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Block C: Supermarket smart budget tips */}
                    <div className="p-4 bg-[#070a13] rounded-2xl border border-gray-850 space-y-3">
                      <span className="text-xs font-bold text-blue-400 flex items-center gap-2 font-mono uppercase">
                        <span>🛒</span> Supermercados y Consejos de Ahorro para Estudiantes ({editCityKey})
                      </span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1">Español (ES)</label>
                          <textarea 
                            className="w-full h-24 bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                            value={cityMarketTipsEs || (currentStudentLife.find((g: any) => g.city === editCityKey)?.supermarkets?.tips?.es || "")}
                            onChange={(e) => setCityMarketTipsEs(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1 font-mono">Francés (FR)</label>
                          <textarea 
                            className="w-full h-24 bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white font-mono"
                            value={cityMarketTipsFr || (currentStudentLife.find((g: any) => g.city === editCityKey)?.supermarkets?.tips?.fr || "")}
                            onChange={(e) => setCityMarketTipsFr(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-500 block mb-1 font-mono">Árabe (AR)</label>
                          <textarea 
                            className="w-full h-24 bg-[#0a1122] border border-gray-800 p-2.5 rounded-xl text-white font-mono text-right"
                            value={cityMarketTipsAr || (currentStudentLife.find((g: any) => g.city === editCityKey)?.supermarkets?.tips?.ar || "")}
                            onChange={(e) => setCityMarketTipsAr(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end pt-2 select-none">
                    <button
                      type="button"
                      disabled={!canEdit}
                      onClick={() => {
                        const copyLife = JSON.parse(JSON.stringify(currentStudentLife));
                        const targetCityObj = copyLife.find((g: any) => g.city === editCityKey);
                        
                        if (targetCityObj) {
                          targetCityObj.events = {
                            es: cityEventsEs.trim() || targetCityObj.events.es,
                            fr: cityEventsFr.trim() || targetCityObj.events.fr,
                            ar: cityEventsAr.trim() || targetCityObj.events.ar
                          };
                          targetCityObj.friends = {
                            es: cityFriendsEs.trim() || targetCityObj.friends.es,
                            fr: cityFriendsFr.trim() || targetCityObj.friends.fr,
                            ar: cityFriendsAr.trim() || targetCityObj.friends.ar
                          };
                          targetCityObj.supermarkets.tips = {
                            es: cityMarketTipsEs.trim() || targetCityObj.supermarkets.tips.es,
                            fr: cityMarketTipsFr.trim() || targetCityObj.supermarkets.tips.fr,
                            ar: cityMarketTipsAr.trim() || targetCityObj.supermarkets.tips.ar
                          };
                        }

                        handleSaveStudentLife(copyLife);
                      }}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-[#070b14] font-black uppercase tracking-wider rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Save size={14} />
                      <span>Guardar Guía de {editCityKey} en Servidor ➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. NAVIGATION SUB-TAB PANEL */}
              {editorSubTab === "navigation" && (
                <div className="bg-[#0b1224] border border-[#1c2e4f] p-6 rounded-3xl space-y-6 shadow-md">
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wider text-amber-500 font-mono flex items-center gap-2">
                      <span>📋</span>
                      <span>D. Control del Menú Lateral de Navegación (Sidebar)</span>
                    </h4>
                    <p className="text-xs text-gray-400 mt-1 font-sans">
                      Personalice las etiquetas, traducciones y emojis de acceso directo correspondientes a todas las categorías del portal estudiantil.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lista de Navegación actual */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-300 uppercase tracking-widest font-mono">Elementos de Navegación Pasivos / Activos</label>
                      <div className="space-y-2 max-h-[480px] overflow-y-auto pr-2 bg-[#070a13] p-3 rounded-2xl border border-gray-850">
                        {currentNavItems.map((nItem: any, index: number) => {
                          const isEditingThis = editMenuIdx === index;
                          return (
                            <div 
                              key={index}
                              className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                                isEditingThis ? 'bg-[#121c32] border-amber-500 shadow-md' : 'bg-[#0b1224] border-gray-800 hover:border-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg bg-gray-900/40 w-8 h-8 rounded-lg flex items-center justify-center border border-gray-800 font-mono">{nItem.icon}</span>
                                <div className="space-y-0.5">
                                  <div className="text-xs font-bold text-white flex items-center gap-2">
                                    <span>{nItem.es}</span>
                                    <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1 rounded uppercase font-mono">{nItem.key}</span>
                                  </div>
                                  <div className="text-[10px] text-gray-500 font-mono">
                                    FR: {nItem.fr} | AR: {nItem.ar}
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditMenuIdx(index);
                                  setEditMenuIcon(nItem.icon || "");
                                  setEditMenuEs(nItem.es || "");
                                  setEditMenuFr(nItem.fr || "");
                                  setEditMenuAr(nItem.ar || "");
                                  setEditMenuEn(nItem.en || "");
                                }}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-[#070a13] font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                              >
                                Editar ✏️
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Formulario de Edición del item seleccionado */}
                    <div className="space-y-4">
                      {editMenuIdx !== -1 ? (
                        <div className="bg-[#070a13] border border-gray-850 p-5 rounded-2xl space-y-4">
                          <h5 className="text-xs font-black uppercase text-amber-500 font-mono">
                            Modificando Elemento de Menú #{editMenuIdx + 1} ({currentNavItems[editMenuIdx]?.key})
                          </h5>

                          <div>
                            <label className="text-[10px] text-gray-400 block mb-1 font-bold font-sans uppercase">Icono o Emoji representativo</label>
                            <input 
                              type="text"
                              className="w-full bg-[#0b1224] border border-gray-800 p-2 rounded-xl text-white text-xs block"
                              value={editMenuIcon}
                              onChange={(e) => setEditMenuIcon(e.target.value)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1 font-bold font-sans uppercase">Nombre (Español)</label>
                              <input 
                                type="text"
                                className="w-full bg-[#0b1224] border border-gray-800 p-2 rounded-xl text-white text-xs block"
                                value={editMenuEs}
                                onChange={(e) => setEditMenuEs(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1 font-bold font-sans uppercase">Nombre (Francés)</label>
                              <input 
                                type="text"
                                className="w-full bg-[#0b1224] border border-gray-800 p-2 rounded-xl text-white text-xs block"
                                value={editMenuFr}
                                onChange={(e) => setEditMenuFr(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1 font-bold font-sans uppercase">Nombre (Árabe / Arabic)</label>
                              <input 
                                type="text"
                                className="w-full bg-[#0b1224] border border-gray-800 p-2 rounded-xl text-white text-xs font-mono text-right block"
                                value={editMenuAr}
                                onChange={(e) => setEditMenuAr(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-400 block mb-1 font-bold font-sans uppercase">Nombre (Inglés / English)</label>
                              <input 
                                type="text"
                                className="w-full bg-[#0b1224] border border-gray-800 p-2 rounded-xl text-white text-xs block"
                                value={editMenuEn}
                                onChange={(e) => setEditMenuEn(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end pt-2 select-none">
                            <button
                              type="button"
                              onClick={() => setEditMenuIdx(-1)}
                              className="px-3 py-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-lg text-xs cursor-pointer font-bold uppercase tracking-wider"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              disabled={!canEdit || editorLoading}
                              onClick={() => {
                                const updated = JSON.parse(JSON.stringify(currentNavItems));
                                updated[editMenuIdx] = {
                                  ...updated[editMenuIdx],
                                  icon: editMenuIcon.trim(),
                                  es: editMenuEs.trim(),
                                  fr: editMenuFr.trim(),
                                  ar: editMenuAr.trim(),
                                  en: editMenuEn.trim()
                                };
                                handleSaveNavItems(updated);
                                setEditMenuIdx(-1);
                              }}
                              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-black font-extrabold uppercase text-[10px] rounded-lg tracking-wider cursor-pointer"
                            >
                              Confirmar Cambios ✔
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-800 rounded-2xl bg-[#070a13] text-gray-500 select-none">
                          <span className="text-xl">📋</span>
                          <span className="text-xs mt-2 font-mono">Seleccione un elemento de menú de la lista de la izquierda para comenzar a personalizar sus etiquetas y traducciones en el portal.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        })()}

      </main>
    </div>
  );
}
