"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Shield,
  ShieldCheck,
  Loader2,
  UserCog,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  createdAt: string;
  lastSignInTime: string;
  isAdmin: boolean;
}

export default function AdminUsersPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();

  const [users, setUsers] = useState<FirebaseUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<FirebaseUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/admin");
    }
  }, [authLoading, isAdmin, router]);

  // Fetch users
  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users");
        if (!response.ok) {
          throw new Error("Error al cargar usuarios");
        }
        const data = await response.json();
        setUsers(data.users);
        setFilteredUsers(data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        showToast("Error al cargar los usuarios", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, isAdmin, showToast]);

  // Filter users based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.email?.toLowerCase().includes(term) ||
        u.displayName?.toLowerCase().includes(term) ||
        u.uid.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleToggleAdmin = async (userUid: string, currentIsAdmin: boolean) => {
    if (!confirm(
      currentIsAdmin
        ? "¿Estás seguro de que deseas revocar los permisos de administrador?"
        : "¿Estás seguro de que deseas otorgar permisos de administrador?"
    )) {
      return;
    }

    setUpdatingUser(userUid);
    try {
      const response = await fetch("/api/admin/users/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: userUid,
          role: currentIsAdmin ? null : "admin",
          adminEmail: user?.email,
          adminUid: user?.uid,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al actualizar el rol");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === userUid ? { ...u, isAdmin: !currentIsAdmin } : u
        )
      );

      showToast(
        currentIsAdmin
          ? "Permisos de administrador revocados"
          : "Usuario promovido a administrador",
        "success"
      );
    } catch (error) {
      console.error("Error updating user role:", error);
      showToast(
        error instanceof Error ? error.message : "Error al actualizar el rol del usuario",
        "error"
      );
    } finally {
      setUpdatingUser(null);
    }
  };

  if (authLoading || !user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-100 via-gray-50 to-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-100 via-gray-50 to-slate-50 py-8">
      <ToastContainer />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-2xl border-4 border-black bg-linear-to-r from-cyan-500 to-cyan-600 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <Link
            href="/admin"
            className="mb-4 inline-flex items-center gap-2 rounded-xl border-2 border-white bg-white px-4 py-2 font-bold text-cyan-700 transition hover:bg-cyan-50"
          >
            <ArrowLeft className="h-5 w-5" />
            Volver al Panel
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white">
              <UserCog className="h-8 w-8 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.3)] sm:text-4xl">
                Gestión de Usuarios
              </h1>
              <p className="mt-1 font-semibold text-cyan-100">
                Administrar permisos de acceso
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 rounded-xl border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por email, nombre o UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 bg-gray-50 py-3 pl-12 pr-4 font-semibold text-gray-900 transition focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border-4 border-black bg-blue-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <div className="rounded-full border-2 border-blue-500 bg-blue-100 p-3">
                <UserCog className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-black text-blue-700">{users.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-4 border-black bg-purple-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <div className="rounded-full border-2 border-purple-500 bg-purple-100 p-3">
                <ShieldCheck className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600">Administradores</p>
                <p className="text-2xl font-black text-purple-700">
                  {users.filter((u) => u.isAdmin).length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border-4 border-black bg-green-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-3">
              <div className="rounded-full border-2 border-green-500 bg-green-100 p-3">
                <CheckCircle className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-600">Verificados</p>
                <p className="text-2xl font-black text-green-700">
                  {users.filter((u) => u.emailVerified).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-cyan-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-xl border-4 border-black bg-orange-50 p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-orange-600" />
            <p className="text-xl font-bold text-gray-900">
              {searchTerm
                ? "No se encontraron usuarios"
                : "No hay usuarios registrados"}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b-4 border-black bg-linear-to-r from-cyan-100 to-cyan-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wide text-gray-900">
                      Usuario
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wide text-gray-900">
                      Email
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-black uppercase tracking-wide text-gray-900">
                      Verificado
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-black uppercase tracking-wide text-gray-900">
                      Rol
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wide text-gray-900">
                      Registro
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-black uppercase tracking-wide text-gray-900">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-200">
                  {filteredUsers.map((u) => (
                    <tr
                      key={u.uid}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100">
                            <UserCog className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {u.displayName || "Sin nombre"}
                            </p>
                            <p className="text-xs font-medium text-gray-500">
                              {u.uid.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-gray-700">
                            {u.email || "Sin email"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {u.emailVerified ? (
                          <CheckCircle className="mx-auto h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="mx-auto h-5 w-5 text-red-600" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-full border-2 border-purple-500 bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
                            <ShieldCheck className="h-4 w-4" />
                            ADMIN
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border-2 border-gray-400 bg-gray-100 px-3 py-1 text-xs font-black text-gray-700">
                            <Shield className="h-4 w-4" />
                            USER
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-600">
                            {new Date(u.createdAt).toLocaleDateString("es-ES")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleAdmin(u.uid, u.isAdmin)}
                          disabled={updatingUser === u.uid || u.uid === user?.uid}
                          className={`inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                            u.isAdmin
                              ? "border-orange-500 bg-orange-100 text-orange-700 hover:bg-orange-200"
                              : "border-purple-500 bg-purple-100 text-purple-700 hover:bg-purple-200"
                          }`}
                          title={
                            u.uid === user?.uid
                              ? "No puedes modificar tu propio rol"
                              : undefined
                          }
                        >
                          {updatingUser === u.uid ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Actualizando...
                            </>
                          ) : u.isAdmin ? (
                            <>
                              <XCircle className="h-4 w-4" />
                              Revocar Admin
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4" />
                              Hacer Admin
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 rounded-xl border-4 border-black bg-blue-50 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex gap-4">
            <AlertCircle className="h-6 w-6 shrink-0 text-blue-600" />
            <div className="text-sm font-medium text-gray-700">
              <p className="mb-2 font-bold text-gray-900">⚠️ Información importante:</p>
              <ul className="list-inside list-disc space-y-1">
                <li>Los usuarios deben cerrar sesión y volver a iniciar para que los cambios surtan efecto.</li>
                <li>No puedes modificar tu propio rol de administrador.</li>
                <li>Los administradores tienen acceso completo al panel y pueden modificar cualquier contenido.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
