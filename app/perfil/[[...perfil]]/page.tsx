'use client';

import React, { useState, useEffect, useReducer, useRef } from 'react';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useUserCampus } from '@/app/hooks/useUserCampus';
import { m } from 'framer-motion';
import { FontStyles } from '../../components/FontStyles';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import {
  GraduationCap, BookOpen, Award, Crown, Check, ArrowRight, Sparkles,
  ExternalLink, Loader2, CreditCard, Play, Mail, AlertCircle, Pencil,
  Save, Shield, User, Lock, Calendar, Trophy, PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import CourseProgressCard from '../../components/CourseProgressCard';
import type { UserCourseData } from '@/lib/strapi/types';
import { getMaxymiaCourses, getCourseMeta } from '@/app/maxymia/data/queries';
import { buildCourseLink } from '@/lib/courseLink';

// ─── User Info Section ───────────────────────────────────────────────
const UserInfoSection = () => {
  const { user, isLoaded } = useUser();
  const { hasPro, isTrialing } = useUserCampus();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const initializedRef = useRef(false);

  // Course stats are derived from /api/user/courses (the same endpoint that
  // feeds "Mis Cursos") rather than the raw enrollments/courseProgress rows.
  // That endpoint drops enrollments whose course no longer exists in Strapi or
  // Maxymia, so the counters here stay in sync with the courses actually shown
  // — otherwise orphaned rows from deleted courses inflate the totals.
  const [courseStats, setCourseStats] = useState<{
    owned: number;
    inProgress: number;
    completedLessons: number;
  } | null>(null);

  // Initialize form fields once when user data first loads
  useEffect(() => {
    if (user && !initializedRef.current) {
      initializedRef.current = true;
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  useEffect(() => {
    const abortController = new AbortController();
    fetch('/api/user/courses', { signal: abortController.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const courses: UserCourseData[] = data.courses || [];
        setCourseStats({
          owned: courses.filter((c) => c.purchased).length,
          inProgress: courses.filter(
            (c) => (c.progress?.completedLessons?.length ?? 0) > 0
          ).length,
          completedLessons: courses.reduce(
            (sum, c) => sum + (c.progress?.completedLessons?.length ?? 0),
            0
          ),
        });
      })
      .catch(() => {
        /* leave courseStats null — counters fall back to 0 */
      });
    return () => abortController.abort();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await user.update({ firstName, lastName });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-mx-orange animate-spin" size={32} />
      </div>
    );
  }

  if (!user) return null;

  const hasFullName = user.firstName && user.lastName;
  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      })
    : null;
  const totalCompletedLessons = courseStats?.completedLessons ?? 0;
  const coursesInProgress = courseStats?.inProgress ?? 0;
  const ownedCourses = courseStats?.owned ?? 0;

  return (
    <div className="space-y-6">
      {/* Alert: no name registered */}
      {!hasFullName && !isEditing && (
        <m.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-mx-orange/5 border border-mx-orange/20 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertCircle className="text-mx-orange mt-0.5 shrink-0" size={18} />
          <div className="flex-1">
            <p className="font-semibold text-mx-text text-body-sm mb-0.5">
              No has registrado tu nombre completo
            </p>
            <p className="text-mx-text-muted text-label-md">
              Lo necesitamos para emitir tus certificados.{' '}
              <button
                onClick={() => setIsEditing(true)}
                className="text-mx-orange font-semibold hover:underline"
              >
                Registrarlo ahora
              </button>
            </p>
          </div>
        </m.div>
      )}

      {/* Hero card */}
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-mx-orange/10 via-mx-bg to-white border border-mx-border p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="relative shrink-0">
            {hasPro ? (
              <div
                className="p-[3px] rounded-full bg-[conic-gradient(from_140deg,#f59e0b,#fbbf24,#f59e0b,#fcd34d,#f59e0b)] shadow-[0_0_24px_rgba(245,158,11,0.35)]"
                title={isTrialing ? 'Pro · Prueba activa' : 'Suscripción Pro activa'}
              >
                <Image
                  src={user.imageUrl}
                  alt={user.fullName || 'Avatar'}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white object-cover"
                  width={96}
                  height={96}
                  unoptimized
                />
              </div>
            ) : (
              <Image
                src={user.imageUrl}
                alt={user.fullName || 'Avatar'}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-md object-cover"
                width={96}
                height={96}
                unoptimized
              />
            )}
            {hasPro && (
              <span
                className="absolute -top-1 -right-1 flex items-center justify-center w-7 h-7 bg-white text-mx-orange rounded-full shadow-md ring-2 ring-mx-orange"
                aria-label={isTrialing ? 'Suscripción Pro en prueba' : 'Suscripción Pro'}
              >
                <Crown size={13} fill="currentColor" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Nombre"
                    className="flex-1 bg-white border-2 border-mx-border text-mx-text px-3 py-2 rounded-lg focus:border-mx-orange focus:outline-none text-body-sm"
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Apellidos"
                    className="flex-1 bg-white border-2 border-mx-border text-mx-text px-3 py-2 rounded-lg focus:border-mx-orange focus:outline-none text-body-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 bg-mx-orange hover:bg-mx-orange-dark text-white px-4 py-2 rounded-lg text-body-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFirstName(user.firstName || '');
                      setLastName(user.lastName || '');
                    }}
                    className="text-mx-text-muted hover:text-mx-text px-4 py-2 rounded-lg text-body-sm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-heading-sm font-black text-mx-text">
                    {user.fullName || 'Sin nombre'}
                  </h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-mx-text-muted hover:text-mx-orange transition-colors p-1"
                    aria-label="Editar nombre"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-mx-text-muted text-body-sm mb-1">
                  <Mail size={13} className="shrink-0" />
                  <span className="truncate">{user.primaryEmailAddress?.emailAddress}</span>
                </div>
                {memberSince && (
                  <div className="flex items-center gap-2 text-mx-text-muted text-label-md">
                    <Calendar size={12} className="shrink-0" />
                    <span>Miembro desde {memberSince}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </m.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: BookOpen,
            label: 'Cursos',
            value: hasPro ? '∞' : ownedCourses.toString(),
            sub: hasPro ? 'Acceso Pro' : ownedCourses === 1 ? 'comprado' : 'comprados',
          },
          {
            icon: PlayCircle,
            label: 'En progreso',
            value: coursesInProgress.toString(),
            sub: coursesInProgress === 1 ? 'curso' : 'cursos',
          },
          {
            icon: Trophy,
            label: 'Lecciones',
            value: totalCompletedLessons.toString(),
            sub: 'completadas',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-mx-border rounded-xl p-3 sm:p-4 flex flex-col gap-1"
          >
            <div className="flex items-center gap-2 text-mx-text-muted">
              <stat.icon size={14} className="text-mx-orange" />
              <span className="text-label-md font-semibold uppercase tracking-wider truncate">
                {stat.label}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-auto">
              <span className="text-heading-md sm:text-display-sm font-black text-mx-text leading-none">
                {stat.value}
              </span>
              <span className="text-label-md text-mx-text-muted font-light truncate">
                {stat.sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Connected Accounts */}
      {user.externalAccounts && user.externalAccounts.length > 0 && (
        <div>
          <p className="text-label-md font-semibold text-mx-text-muted uppercase tracking-wider mb-2">
            Cuentas conectadas
          </p>
          <div className="space-y-2">
            {user.externalAccounts.map((account) => (
              <div key={account.id} className="flex items-center gap-3 p-3 bg-white border border-mx-border rounded-xl">
                {account.imageUrl ? (
                  <Image src={account.imageUrl} alt={account.provider} className="w-7 h-7 rounded-full" width={28} height={28} unoptimized />
                ) : (
                  <div className="w-7 h-7 bg-mx-border rounded-full flex items-center justify-center">
                    <Shield size={12} className="text-mx-text-muted" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-mx-text capitalize">
                    {account.provider === 'google' ? 'Google' : account.provider}
                  </p>
                  <p className="text-label-md text-mx-text-muted truncate">
                    {account.emailAddress || 'Conectado'}
                  </p>
                </div>
                <Check size={14} className="text-green-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Mis Cursos State ───────────────────────────────────────────────
interface CoursesState {
  courses: UserCourseData[];
  isLoading: boolean;
  error: string | null;
  hasProAccess: boolean;
}

type CoursesAction =
  | { type: 'FETCH_SUCCESS'; courses: UserCourseData[]; hasProAccess: boolean }
  | { type: 'FETCH_ERROR'; error: string };

const initialCoursesState: CoursesState = {
  courses: [],
  isLoading: true,
  error: null,
  hasProAccess: false,
};

function coursesReducer(state: CoursesState, action: CoursesAction): CoursesState {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return { ...state, courses: action.courses, hasProAccess: action.hasProAccess, isLoading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, error: action.error, isLoading: false };
    default:
      return state;
  }
}

// ─── Mis Cursos Section ──────────────────────────────────────────────
const MisCursosSection = () => {
  const [state, dispatch] = useReducer(coursesReducer, initialCoursesState);
  const { courses, isLoading, error, hasProAccess } = state;

  useEffect(() => {
    const abortController = new AbortController();

    async function fetchCourses() {
      try {
        const response = await fetch('/api/user/courses', {
          signal: abortController.signal,
        });
        if (!response.ok) throw new Error('Failed to fetch courses');
        const data = await response.json();
        dispatch({
          type: 'FETCH_SUCCESS',
          courses: data.courses || [],
          hasProAccess: data.hasProAccess || false,
        });
      } catch (err) {
        if (abortController.signal.aborted) return;
        dispatch({
          type: 'FETCH_ERROR',
          error: err instanceof Error ? err.message : 'Error loading courses',
        });
      }
    }
    fetchCourses();

    return () => { abortController.abort(); };
  }, []);

  const inProgressCourse = courses.find(
    (c) => c.progress && c.progress.progressPercent > 0 && c.progress.progressPercent < 100
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-mx-orange animate-spin" size={32} />
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-body-sm">{error}</p>;
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 mx-auto mb-4 bg-mx-orange/10 rounded-full flex items-center justify-center">
          <BookOpen className="text-mx-orange" size={24} />
        </div>
        <h3 className="text-mx-text font-semibold mb-1">No tienes cursos aún</h3>
        <p className="text-mx-text-muted text-body-sm mb-5">
          {hasProAccess
            ? 'Tu suscripción Pro te da acceso a todos los cursos premium.'
            : 'Explora nuestro catálogo y empieza tu formación hoy.'}
        </p>
        <Link
          href="/programas"
          className="inline-flex items-center gap-2 bg-mx-orange hover:bg-mx-orange-dark text-white px-5 py-2.5 rounded-full font-medium text-body-sm transition-colors"
        >
          Explorar cursos
          <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Continue Learning */}
      {inProgressCourse && (
        <div className="mb-6 p-4 bg-mx-orange/5 border border-mx-orange/20 rounded-xl">
          <p className="text-mx-orange text-body-sm font-medium mb-3">Continuar donde lo dejaste</p>
          <div className="flex items-center gap-4">
            <Image
              src={inProgressCourse.program.image}
              alt={inProgressCourse.program.title}
              className="w-20 h-14 object-cover rounded-lg"
              width={80}
              height={56}
              unoptimized
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-mx-text font-medium truncate">{inProgressCourse.program.title}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-mx-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-mx-orange rounded-full"
                    style={{ width: `${inProgressCourse.progress?.progressPercent || 0}%` }}
                  />
                </div>
                <span className="text-mx-orange text-label-md font-medium">
                  {inProgressCourse.progress?.progressPercent || 0}%
                </span>
              </div>
            </div>
            <Link
              href={buildCourseLink(
                inProgressCourse.program,
                inProgressCourse.progress?.currentLessonId
              )}
              className="hidden sm:flex items-center gap-2 bg-mx-orange hover:bg-mx-orange-dark text-white px-4 py-2 rounded-full font-medium text-body-sm transition-colors"
            >
              <Play size={14} fill="currentColor" />
              Continuar
            </Link>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((courseData, index) => (
          <CourseProgressCard key={courseData.program.id} courseData={courseData} index={index} />
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/programas"
          className="text-mx-orange hover:text-mx-orange-dark text-body-sm font-medium transition-colors"
        >
          Ver más cursos →
        </Link>
      </div>
    </>
  );
};

// ─── Certificados Section ────────────────────────────────────────────
// ─── Maxymia Section ─────────────────────────────────────────────────
const MaxymiaSection = () => {
  const { courseProgress, enrollments } = useUserCampus();
  const maxymiaCourses = React.useMemo(() => {
    const courses = getMaxymiaCourses();
    return courses.map((course) => ({
      ...course,
      meta: getCourseMeta(course),
    }));
  }, []);

  // Show every Maxymia course the user has actually purchased. Progress
  // (courseProgress) is informational — appears as % filled when present —
  // but presence in this list is decided by enrollment, not progress, so a
  // freshly-bought course shows up even before the user opens it.
  const enrolledIds = new Set(enrollments.map((e) => e.programDocumentId));
  const ownedMaxymiaCourses = maxymiaCourses.filter((c) => enrolledIds.has(c.id));

  if (ownedMaxymiaCourses.length === 0) {
    return (
      <div className="text-center py-8">
        <Sparkles className="text-mx-orange mx-auto mb-3" size={32} />
        <h3 className="text-mx-text font-medium mb-1">Campus Maxymia</h3>
        <p className="text-mx-text-muted text-body-sm mb-4">
          Explora cursos de IA aplicada a ciencias
        </p>
        <Link
          href="/maxymia/campus"
          className="inline-flex items-center gap-2 bg-mx-orange text-white px-5 py-2.5 rounded-lg text-body-sm font-medium hover:bg-mx-orange-dark transition-colors"
        >
          Ir al Campus
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ownedMaxymiaCourses.map((course) => {
        const progress = courseProgress[course.id];
        const completedCount = progress?.completedLessons.length ?? 0;
        const pct = course.meta.totalLessons > 0
          ? Math.round((completedCount / course.meta.totalLessons) * 100)
          : 0;

        return (
          <Link
            key={course.id}
            href={`/maxymia/campus/${course.slug}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-mx-border hover:border-mx-orange/30 transition-colors"
          >
            <div className="w-12 h-12 bg-mx-orange/10 rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="text-mx-orange" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-mx-text font-medium text-body-sm truncate">{course.title.es}</h4>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-mx-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-mx-orange rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-mx-text-muted text-label-md">{pct}%</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-mx-text-muted shrink-0" />
          </Link>
        );
      })}

      <div className="pt-2">
        <Link
          href="/maxymia/campus"
          className="text-mx-orange text-body-sm hover:underline"
        >
          Ver todos los cursos →
        </Link>
      </div>
    </div>
  );
};

const CertificadosSection = () => (
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-mx-orange/10 rounded-xl flex items-center justify-center shrink-0">
      <Award className="text-mx-orange" size={22} />
    </div>
    <div>
      <h3 className="text-mx-text font-medium">Sin certificados aún</h3>
      <p className="text-mx-text-muted text-body-sm">Completa un curso para obtener tu certificado</p>
    </div>
  </div>
);

// ─── Mi Plan Section ─────────────────────────────────────────────────
const MiPlanSection = () => {
  const { isSignedIn } = useUser();
  const { hasPro, isTrialing, subscription } = useUserCampus();
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const isPro = isSignedIn && hasPro;
  const subscribedAt = subscription?.startedAt;
  const subscriptionStatus = subscription?.status;
  const stripeCustomerId = subscription?.stripeCustomerId;
  const trialEnd = subscription?.trialEnd;

  const handleOpenBillingPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch('/api/billing-portal', { method: 'POST' });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Error al acceder al portal de facturación');
      }
    } catch (error) {
      console.error('Billing portal error:', error);
      alert('Error al acceder al portal de facturación');
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const freeFeatures = [
    'Acceso a cursos gratuitos',
    'Blog y recursos educativos',
    'Soporte por email',
  ];

  const proFeatures = [
    'Todo lo del plan Free',
    'Cursos exclusivos premium',
    'Certificados descargables',
    'Soporte prioritario 24/7',
    'Recursos descargables',
    'Sesiones de mentoría',
  ];

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Current Plan */}
      <div className={`p-4 sm:p-6 rounded-xl border ${
        isPro ? 'bg-mx-orange/5 border-mx-orange/30' : 'bg-mx-bg border-mx-border'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isPro ? 'bg-mx-orange/15' : 'bg-mx-border'
            }`}>
              {isPro ? (
                <Crown className="text-mx-orange" size={20} />
              ) : (
                <Sparkles className="text-mx-text-muted" size={20} />
              )}
            </div>
            <div>
              <h3 className="text-body-lg font-bold text-mx-text">
                Plan {isPro ? 'Pro' : 'Free'}
              </h3>
              <p className="text-mx-text-muted text-body-sm">
                {isPro ? 'Acceso completo a todo el contenido' : 'Plan básico gratuito'}
              </p>
            </div>
          </div>
          {isPro && (
            <span className={`px-3 py-1 text-white text-label-md font-bold rounded-full ${
              isTrialing ? 'bg-amber-500' : 'bg-mx-orange'
            }`}>
              {isTrialing ? 'PRUEBA' : 'ACTIVO'}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-5">
          {(isPro ? proFeatures : freeFeatures).map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <Check className={isPro ? 'text-mx-orange' : 'text-mx-text-muted'} size={15} />
              <span className="text-mx-text text-body-sm">{feature}</span>
            </div>
          ))}
        </div>

        {!isPro && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-mx-orange hover:bg-mx-orange-dark text-white px-5 py-2.5 rounded-full font-bold text-body-sm transition-colors"
          >
            <Crown size={16} />
            Actualizar a Pro
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* Billing (Pro) or Benefits (Free) */}
      <div>
        {isPro ? (
          <div className="p-4 sm:p-6 bg-mx-bg border border-mx-border rounded-xl">
            <h3 className="text-body-lg font-bold text-mx-text mb-4">Información de suscripción</h3>
            <div className="space-y-3 text-body-sm">
              <div className="flex justify-between">
                <span className="text-mx-text-muted">Estado:</span>
                <span className={`font-medium ${
                  subscriptionStatus === 'active' ? 'text-green-600'
                    : subscriptionStatus === 'trialing' ? 'text-amber-500'
                    : 'text-mx-orange'
                }`}>
                  {subscriptionStatus === 'active' ? 'Activa'
                    : subscriptionStatus === 'trialing' ? 'Prueba'
                    : subscriptionStatus || 'Activa'}
                </span>
              </div>
              {isTrialing && trialEnd && (
                <div className="flex justify-between">
                  <span className="text-mx-text-muted">La prueba termina el:</span>
                  <span className="text-mx-text font-medium">
                    {new Date(trialEnd).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {subscribedAt && (
                <div className="flex justify-between">
                  <span className="text-mx-text-muted">{isTrialing ? 'Prueba iniciada:' : 'Suscrito desde:'}</span>
                  <span className="text-mx-text">
                    {new Date(subscribedAt).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {isTrialing && (
                <div className="mt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-mx-text text-label-md">
                    Después de la prueba, tu suscripción se renovará automáticamente. Puedes cancelar en cualquier momento desde el portal de facturación.
                  </p>
                </div>
              )}
            </div>

            {stripeCustomerId && (
              <div className="mt-6 pt-4 border-t border-mx-border">
                <button
                  onClick={handleOpenBillingPortal}
                  disabled={isLoadingPortal}
                  className="w-full flex items-center justify-center gap-2 bg-mx-bg hover:bg-mx-border/50 text-mx-text border border-mx-border px-4 py-3 rounded-lg font-medium text-body-sm transition-colors disabled:opacity-50 disabled:cursor-wait"
                >
                  {isLoadingPortal ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      Gestionar facturación
                      <ExternalLink size={12} className="opacity-60" />
                    </>
                  )}
                </button>
                <p className="text-mx-text-muted text-label-md text-center mt-3">
                  Ver facturas, actualizar método de pago o cancelar suscripción.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 sm:p-6 bg-mx-orange/5 border border-mx-orange/15 rounded-xl">
            <h3 className="text-body-lg font-bold text-mx-text mb-4 flex items-center gap-2">
              <Crown className="text-mx-orange" size={18} />
              Beneficios de Pro
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {[
                'Cursos exclusivos',
                'Certificados',
                'Soporte 24/7',
                'Mentoría grupal',
                'Recursos premium',
                'Acceso anticipado',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <Check className="text-mx-orange" size={14} />
                  <span className="text-mx-text-muted text-body-sm">{benefit}</span>
                </div>
              ))}
            </div>
            <p className="text-mx-orange text-body-sm mt-4 font-medium">
              Desde €18/mes · Cancela cuando quieras
            </p>
          </div>
        )}

        {/* Billing portal access for non-Pro users who have bought at
            least one course. The Pro branch above already surfaces
            this button inside the subscription card; for course-only
            buyers we render it as a standalone box so they can still
            download invoices and update their payment method. */}
        {!isPro && stripeCustomerId && (
          <div className="mt-4 p-4 sm:p-6 bg-mx-bg border border-mx-border rounded-xl">
            <h3 className="text-body-lg font-bold text-mx-text mb-2 flex items-center gap-2">
              <CreditCard className="text-mx-orange" size={18} />
              Tus facturas
            </h3>
            <p className="text-mx-text-muted text-body-sm mb-4">
              Descarga las facturas de tus cursos y actualiza tu método de pago.
            </p>
            <button
              onClick={handleOpenBillingPortal}
              disabled={isLoadingPortal}
              className="w-full flex items-center justify-center gap-2 bg-mx-bg hover:bg-mx-border/50 text-mx-text border border-mx-border px-4 py-3 rounded-lg font-medium text-body-sm transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isLoadingPortal ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Ver facturas
                  <ExternalLink size={12} className="opacity-60" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Seguridad Section ───────────────────────────────────────────────
const SeguridadSection = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-mx-orange animate-spin" size={32} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Email addresses */}
      <div>
        <h3 className="text-body-sm font-semibold text-mx-text mb-3">Correos electrónicos</h3>
        <div className="space-y-2">
          {user.emailAddresses.map((email) => (
            <div key={email.id} className="flex items-center gap-3 p-3 bg-mx-bg border border-mx-border rounded-xl">
              <Mail size={16} className="text-mx-text-muted shrink-0" />
              <span className="text-body-sm text-mx-text flex-1 truncate">{email.emailAddress}</span>
              {email.id === user.primaryEmailAddressId && (
                <span className="text-label-md font-medium text-mx-orange bg-mx-orange/10 px-2 py-0.5 rounded-full">
                  Primario
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Connected accounts */}
      <div>
        <h3 className="text-body-sm font-semibold text-mx-text mb-3">Cuentas conectadas</h3>
        {user.externalAccounts && user.externalAccounts.length > 0 ? (
          <div className="space-y-2">
            {user.externalAccounts.map((account) => (
              <div key={account.id} className="flex items-center gap-3 p-3 bg-mx-bg border border-mx-border rounded-xl">
                {account.imageUrl ? (
                  <Image src={account.imageUrl} alt={account.provider} className="w-6 h-6 rounded-full" width={24} height={24} unoptimized />
                ) : (
                  <Shield size={16} className="text-mx-text-muted" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-body-sm font-medium text-mx-text capitalize">
                    {account.provider === 'google' ? 'Google' : account.provider}
                  </span>
                  {account.emailAddress && (
                    <span className="text-label-md text-mx-text-muted ml-2">{account.emailAddress}</span>
                  )}
                </div>
                <Check size={14} className="text-green-500 shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-mx-text-muted">No hay cuentas conectadas.</p>
        )}
      </div>

      {/* Active sessions info */}
      <div>
        <h3 className="text-body-sm font-semibold text-mx-text mb-3">Sesión actual</h3>
        <div className="p-3 bg-mx-bg border border-mx-border rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Check size={14} className="text-green-600" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-mx-text">Sesión activa</p>
              <p className="text-label-md text-mx-text-muted">
                Último acceso: {new Date().toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Nav items config ────────────────────────────────────────────────
type SectionKey = 'perfil' | 'seguridad' | 'plan' | 'cursos' | 'maxymia' | 'certificados';

const navItems: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: 'perfil', label: 'Perfil', icon: <User size={18} /> },
  { key: 'seguridad', label: 'Seguridad', icon: <Lock size={18} /> },
  { key: 'plan', label: 'Mi Plan', icon: <Crown size={18} /> },
  { key: 'cursos', label: 'Mis Cursos', icon: <GraduationCap size={18} /> },
  { key: 'maxymia', label: 'Maxymia', icon: <Sparkles size={18} /> },
  { key: 'certificados', label: 'Certificados', icon: <Award size={18} /> },
];

// ─── Main Page ───────────────────────────────────────────────────────
export default function PerfilPage() {
  // The route is an optional catch-all (`/perfil`, `/perfil/cursos`, …) so the
  // Header shortcut and bookmarks can land directly on a section.
  const routeParams = useParams();
  const segment = Array.isArray(routeParams?.perfil) ? routeParams.perfil[0] : undefined;
  const initialSection: SectionKey = navItems.some((i) => i.key === segment)
    ? (segment as SectionKey)
    : 'perfil';
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>(initialSection);

  const sectionTitles: Record<SectionKey, string> = {
    perfil: 'Información de usuario',
    seguridad: 'Seguridad',
    plan: 'Plan y Facturación',
    cursos: 'Mis Cursos',
    maxymia: 'Campus Maxymia',
    certificados: 'Mis Certificados',
  };

  return (
    <div className="bg-mx-bg min-h-screen text-mx-text overflow-x-hidden">
      <FontStyles />

      <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

      <main className="relative z-10 pt-20 sm:pt-28 md:pt-32 pb-16 sm:pb-24 md:pb-32">
        {/* Profile Layout */}
        <section className="px-3 sm:px-6 md:px-12">
          <div className="max-w-5xl mx-auto">
            <m.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white border border-mx-border rounded-xl sm:rounded-2xl overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:min-h-[500px]">
                {/* ─── Sidebar Nav ─── */}
                <nav className="md:w-56 lg:w-64 shrink-0 border-b md:border-b-0 md:border-r border-mx-border bg-mx-bg/50">
                  {/* Mobile: horizontal scroll */}
                  <div className="flex md:hidden overflow-x-auto no-scrollbar p-1.5 gap-0.5">
                    {navItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setActiveSection(item.key)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-label-md font-medium whitespace-nowrap transition-colors ${
                          activeSection === item.key
                            ? 'bg-mx-orange/10 text-mx-orange'
                            : 'text-mx-text-muted hover:text-mx-text hover:bg-mx-border/30'
                        }`}
                      >
                        <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{item.icon}</span>
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Desktop: vertical nav */}
                  <div className="hidden md:flex flex-col p-3 gap-1">
                    {navItems.map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setActiveSection(item.key)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-body-sm font-medium transition-colors text-left ${
                          activeSection === item.key
                            ? 'bg-mx-orange/10 text-mx-orange'
                            : 'text-mx-text-muted hover:text-mx-text hover:bg-mx-border/30'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}

                    {/* Internal link: Maxymia campus */}
                    <div className="border-t border-mx-border mt-2 pt-2">
                      <Link
                        href="/maxymia/campus"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-body-sm font-medium text-mx-text-muted hover:text-mx-text hover:bg-mx-border/30 transition-colors"
                      >
                        <BookOpen size={18} />
                        Ir al Campus
                      </Link>
                    </div>
                  </div>
                </nav>

                {/* ─── Content Area ─── */}
                <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden overflow-y-auto">
                  <h2 className="text-body-lg sm:text-heading-sm font-bold text-mx-text mb-4 sm:mb-6">
                    {sectionTitles[activeSection]}
                  </h2>

                  {activeSection === 'perfil' && <UserInfoSection />}
                  {activeSection === 'seguridad' && <SeguridadSection />}
                  {activeSection === 'plan' && <MiPlanSection />}
                  {activeSection === 'cursos' && <MisCursosSection />}
                  {activeSection === 'maxymia' && <MaxymiaSection />}
                  {activeSection === 'certificados' && <CertificadosSection />}
                </div>
              </div>
            </m.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
